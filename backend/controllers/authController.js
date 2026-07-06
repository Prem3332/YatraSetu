const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP, hashOTP } = require("../utils/otpUtils");
const { sendVerificationEmail } = require("../services/emailService");

/**
 * Generate a signed JWT for the given user.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

/**
 * Return a safe user object (no passwordHash).
 * Maps Prisma `id` → `_id` so the frontend doesn't break.
 */
const sanitizeUser = (user) => {
  const { passwordHash, otpHash, otpExpires, otpAttempts, id, ...rest } = user;
  return { _id: id, ...rest };
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const {
      name: nameRaw,
      fullName,
      phone: phoneRaw,
      mobile,
      email,
      password,
      gender,
      age,
      role,
      isAccessible,
      language,
    } = req.body;

    // Support alternative field names from frontend
    const name = nameRaw || fullName;
    const phone = phoneRaw || mobile;

    // ── Validation ─────────────────────────────────────────
    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and password are required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for verification",
      });
    }

    const allowedRoles = ["devotee", "temple_admin", "police", "medical"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed: ${allowedRoles.join(", ")}`,
      });
    }

    // ── Duplicate checks ───────────────────────────────────
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone already registered",
      });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // ── Hash password ──────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 10);

    // ── Generate & hash OTP ────────────────────────────────
    const otp = generateOTP();
    const otpHashed = hashOTP(otp);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // ── Create user (unverified) ───────────────────────────
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        passwordHash,
        gender: gender || undefined,
        age: age ? parseInt(age, 10) : undefined,
        role: role || "devotee",
        isAccessible: isAccessible || false,
        language: language || "gu",
        isVerified: false,
        otpHash: otpHashed,
        otpExpires,
        otpAttempts: 0,
      },
    });

    // ── Send OTP email ─────────────────────────────────────
    try {
      await sendVerificationEmail(email, name, otp);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr.message);
      // Clean up the created user if email fails
      await prisma.user.delete({ where: { id: user.id } });
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/verify-email
// ────────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Validate OTP format (exactly 6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be exactly 6 digits",
      });
    }

    // ── Find user ──────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // ── Check OTP exists ───────────────────────────────────
    if (!user.otpHash || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    // ── Check OTP expiration ───────────────────────────────
    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // ── Check max attempts ─────────────────────────────────
    if (user.otpAttempts >= 3) {
      // Invalidate OTP
      await prisma.user.update({
        where: { id: user.id },
        data: { otpHash: null, otpExpires: null, otpAttempts: 0 },
      });

      return res.status(400).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // ── Compare hashes ─────────────────────────────────────
    const incomingHash = hashOTP(otp);

    if (incomingHash !== user.otpHash) {
      // Increment attempts
      const newAttempts = user.otpAttempts + 1;
      const updateData = { otpAttempts: newAttempts };

      // If this was the 3rd failed attempt, invalidate OTP
      if (newAttempts >= 3) {
        updateData.otpHash = null;
        updateData.otpExpires = null;
        updateData.otpAttempts = 0;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      const remaining = 3 - newAttempts;
      return res.status(400).json({
        success: false,
        message:
          remaining > 0
            ? `Incorrect OTP. ${remaining} attempt(s) remaining.`
            : "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // ── Success — verify user ──────────────────────────────
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpHash: null,
        otpExpires: null,
        otpAttempts: 0,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/resend-otp
// ────────────────────────────────────────────────────────────
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // ── Find user ──────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // ── Rate limit: 60-second cooldown ─────────────────────
    if (user.otpExpires) {
      const lastSentAt = new Date(user.otpExpires.getTime() - 5 * 60 * 1000);
      const cooldownEnd = new Date(lastSentAt.getTime() + 60 * 1000);

      if (new Date() < cooldownEnd) {
        const waitSeconds = Math.ceil((cooldownEnd - new Date()) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} second(s) before requesting another OTP.`,
        });
      }
    }

    // ── Generate new OTP ───────────────────────────────────
    const otp = generateOTP();
    const otpHashed = hashOTP(otp);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpHash: otpHashed,
        otpExpires,
        otpAttempts: 0,
      },
    });

    // ── Send email ─────────────────────────────────────────
    try {
      await sendVerificationEmail(email, user.name, otp);
    } catch (emailErr) {
      console.error("Failed to resend verification email:", emailErr.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "New OTP sent to your email successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    if (!password || (!phone && !email)) {
      return res.status(400).json({
        success: false,
        message: "Phone or email, and password are required",
      });
    }

    // ── Find user by phone OR email ────────────────────────
    const user = phone
      ? await prisma.user.findUnique({ where: { phone } })
      : await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ── Verify password ────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ── Check email verification ───────────────────────────
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        email: user.email,
      });
    }

    // ── JWT ────────────────────────────────────────────────
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ────────────────────────────────────────────────────────────
// GET /api/auth/me
// ────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { register, login, getMe, logout, verifyEmail, resendOtp };

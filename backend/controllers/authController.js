const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
  const { passwordHash, id, ...rest } = user;
  return { _id: id, ...rest };
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, phone, email, password, role, isAccessible, language } =
      req.body;

    // ── Validation ─────────────────────────────────────────
    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and password are required",
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

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    // ── Hash password ──────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 10);

    // ── Create user ────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email: email || undefined,
        passwordHash,
        role: role || "devotee",
        isAccessible: isAccessible || false,
        language: language || "gu",
      },
    });

    // ── JWT ────────────────────────────────────────────────
    const token = generateToken(user);

    return res.status(201).json({
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

module.exports = { register, login, getMe, logout };

const express = require("express");
const router = express.Router();

const { register, login, getMe, logout, verifyEmail, resendOtp } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// POST /api/auth/register — Create a new user account
router.post("/register", register);

// POST /api/auth/login — Authenticate with phone/email + password
router.post("/login", login);

// POST /api/auth/verify-email — Verify email with OTP
router.post("/verify-email", verifyEmail);

// POST /api/auth/resend-otp — Resend verification OTP
router.post("/resend-otp", resendOtp);

// GET  /api/auth/me — Get current authenticated user's profile
router.get("/me", authenticate, getMe);

// POST /api/auth/logout — Client-side logout (stateless JWT)
router.post("/logout", authenticate, logout);

module.exports = router;

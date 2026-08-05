const express = require("express");
const router = express.Router();

const { register, login, getMe, logout, verifyEmail, resendOtp, forgotPassword, verifyResetOtp, resetPassword } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// POST /api/auth/register — Create a new user account
router.post("/register", register);

// POST /api/auth/login — Authenticate with phone/email + password
router.post("/login", login);

// POST /api/auth/verify-email — Verify email with OTP
router.post("/verify-email", verifyEmail);

// POST /api/auth/resend-otp — Resend verification OTP
router.post("/resend-otp", resendOtp);

// POST /api/auth/forgot-password — Send OTP to email for password reset
router.post("/forgot-password", forgotPassword);

// POST /api/auth/verify-reset-otp — Verify OTP for password reset
router.post("/verify-reset-otp", verifyResetOtp);

// POST /api/auth/reset-password — Reset password with reset token
router.post("/reset-password", resetPassword);

// GET  /api/auth/me — Get current authenticated user's profile
router.get("/me", authenticate, getMe);

// POST /api/auth/logout — Client-side logout (stateless JWT)
router.post("/logout", authenticate, logout);

module.exports = router;


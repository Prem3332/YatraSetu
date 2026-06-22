const express = require("express");
const router = express.Router();

const { register, login, getMe, logout } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// POST /api/auth/register — Create a new user account
router.post("/register", register);

// POST /api/auth/login — Authenticate with phone/email + password
router.post("/login", login);

// GET  /api/auth/me — Get current authenticated user's profile
router.get("/me", authenticate, getMe);

// POST /api/auth/logout — Client-side logout (stateless JWT)
router.post("/logout", authenticate, logout);

module.exports = router;

/**
 * PilgrimSafe — OTP Utilities
 *
 * Generates cryptographically secure 6-digit OTPs
 * and hashes them with SHA-256 before storage.
 */

const crypto = require("crypto");

/**
 * Generate a cryptographically secure 6-digit OTP.
 * Uses crypto.randomInt instead of Math.random for security.
 * @returns {string} 6-digit OTP string
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash an OTP string using SHA-256.
 * @param {string} otp - The plaintext OTP
 * @returns {string} Hex-encoded SHA-256 hash
 */
const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

module.exports = { generateOTP, hashOTP };

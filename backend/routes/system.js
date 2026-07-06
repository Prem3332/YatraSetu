const express = require("express");
const router = express.Router();

const {
  getSystemSettings,
  updateSystemSettings,
} = require("../controllers/systemController");
const { authenticate, requireRole } = require("../middleware/auth");

// GET  /api/system/settings — Public (devotee app fetches this without auth)
router.get("/settings", getSystemSettings);

// PUT  /api/system/settings — temple_admin only
router.put("/settings", authenticate, requireRole("temple_admin"), updateSystemSettings);

module.exports = router;

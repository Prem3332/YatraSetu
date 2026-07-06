const express = require("express");
const router = express.Router();

const {
  getTemples,
  getTempleBySlug,
  createTemple,
  updateTemple,
  deleteTemple,
} = require("../controllers/templeController");
const { authenticate, requireRole } = require("../middleware/auth");

// GET    /api/temples         — List all temples (public)
router.get("/", getTemples);

// GET    /api/temples/:slug   — Get one temple by slug (public)
router.get("/:slug", getTempleBySlug);

// POST   /api/temples         — Create a new temple (temple_admin only)
router.post("/", authenticate, requireRole("temple_admin"), createTemple);

// PUT    /api/temples/:id     — Update a temple (temple_admin only)
router.put("/:id", authenticate, requireRole("temple_admin"), updateTemple);

// DELETE /api/temples/:id     — Delete a temple by Mongo _id (temple_admin only)
router.delete("/:id", authenticate, requireRole("temple_admin"), deleteTemple);

module.exports = router;

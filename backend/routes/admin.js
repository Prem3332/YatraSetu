const express = require("express");
const router = express.Router();

const {
  getQueues,
  getQueueSlots,
  getBookings,
  updateSlotStatus,
  getQueueStatistics,
  deleteSlot,
} = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/auth");

// ── All admin routes require authentication + temple_admin role ──
router.use(authenticate, requireRole("temple_admin"));

// GET  /api/admin/queues                — List all queues with temple info
router.get("/queues", getQueues);

// GET  /api/admin/queues/:queueId/slots — Get all bookings for a specific queue
router.get("/queues/:queueId/slots", getQueueSlots);

// GET  /api/admin/bookings              — Paginated booking list with filters
router.get("/bookings", getBookings);

// PATCH /api/admin/slots/:slotId/status — Update a booking's status
router.patch("/slots/:slotId/status", updateSlotStatus);

// GET  /api/admin/statistics            — Today's live dashboard statistics
router.get("/statistics", getQueueStatistics);

// DELETE /api/admin/slots/:slotId       — Delete a booking completely
router.delete("/slots/:slotId", deleteSlot);

module.exports = router;

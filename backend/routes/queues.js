const express = require("express");
const router = express.Router();
const queueController = require("../controllers/queueController");
const { authenticate } = require("../middleware/auth");

// GET /api/queues/monthly-availability?templeId=XXX&year=YYYY&month=MM
router.get("/monthly-availability", queueController.getMonthlyAvailability);

// GET /api/queues/today-traffic
router.get("/today-traffic", queueController.getTodayTraffic);

// GET /api/queues/availability?templeId=XXX&date=YYYY-MM-DD
router.get("/availability", queueController.getAvailability);

// POST /api/queues/book — requires authentication so bookings are linked to real users
router.post("/book", authenticate, queueController.bookSlot);

// GET /api/queues/my-active-booking — get current user's latest active booking
router.get("/my-active-booking", authenticate, queueController.getMyActiveBooking);

// GET /api/queues/my-booking/:slotId — get a specific booking with live position
router.get("/my-booking/:slotId", authenticate, queueController.getMyBooking);

// DELETE /api/queues/booking/:slotId — cancel a booking
router.delete("/booking/:slotId", authenticate, queueController.cancelBooking);

module.exports = router;

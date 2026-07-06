const express = require("express");
const router = express.Router();
const queueController = require("../controllers/queueController");

// GET /api/queues/availability?templeId=XXX&date=YYYY-MM-DD
router.get("/availability", queueController.getAvailability);

// POST /api/queues/book
router.post("/book", queueController.bookSlot);

module.exports = router;

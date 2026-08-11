const prisma = require("../config/db");

// ════════════════════════════════════════════════════════════
// Admin Dashboard Controller
// All handlers assume req.user exists and has role "temple_admin"
// (enforced by authenticate + requireRole middleware on routes).
// ════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
// GET /api/admin/queues
// Returns all queues with temple info, capacity, and live counts.
// Optional filters: templeId, date, status
// ────────────────────────────────────────────────────────────
const getQueues = async (req, res) => {
  try {
    const { templeId, date, status } = req.query;

    // Build dynamic where clause
    const where = {};
    if (templeId) where.templeId = templeId;
    if (date) where.date = new Date(`${date}T00:00:00.000Z`);
    if (status) where.status = status;

    const queues = await prisma.queue.findMany({
      where,
      include: {
        temple: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ date: "desc" }, { timeSlot: "asc" }],
    });

    const formatted = queues.map((q) => ({
      id: q.id,
      temple: q.temple,
      date: q.date.toISOString().slice(0, 10),
      timeSlot: q.timeSlot,
      totalCapacity: q.totalCapacity,
      bookedCount: q.bookedCount,
      availableSlots: Math.max(0, q.totalCapacity - q.bookedCount),
      currentToken: q.currentToken,
      status: q.status,
    }));

    return res.json({ success: true, queues: formatted });
  } catch (error) {
    console.error("Error in getQueues:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ────────────────────────────────────────────────────────────
// GET /api/admin/queues/:queueId/slots
// Returns all individual bookings (slots) for a given queue.
// Includes user name and phone for each booking.
// ────────────────────────────────────────────────────────────
const getQueueSlots = async (req, res) => {
  try {
    const { queueId } = req.params;

    // Verify queue exists
    const queue = await prisma.queue.findUnique({
      where: { id: queueId },
      select: { id: true, timeSlot: true, date: true, totalCapacity: true },
    });

    if (!queue) {
      return res.status(404).json({ success: false, message: "Queue not found" });
    }

    const slots = await prisma.slot.findMany({
      where: { queueId },
      include: {
        user: {
          select: { name: true, phone: true },
        },
      },
      orderBy: { tokenNumber: "asc" },
    });

    const formatted = slots.map((s) => ({
      id: s.id,
      tokenNumber: s.tokenNumber,
      userName: s.user.name,
      userPhone: s.user.phone,
      peopleCount: s.peopleCount,
      status: s.status,
      bookingTime: s.bookingTime,
    }));

    return res.json({ success: true, queue, slots: formatted });
  } catch (error) {
    console.error("Error in getQueueSlots:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ────────────────────────────────────────────────────────────
// GET /api/admin/bookings
// Paginated booking list with database-level filtering and search.
//
// Query params:
//   temple  — filter by templeId
//   date    — filter by slot date (YYYY-MM-DD)
//   status  — filter by booking status
//   slot    — filter by time slot string
//   page    — page number (default 1)
//   limit   — items per page (default 20, max 100)
//   search  — search across user name, phone, or token number
//   sort    — field to sort by (default "bookingTime")
//   order   — asc or desc (default "desc")
// ────────────────────────────────────────────────────────────
const getBookings = async (req, res) => {
  try {
    const {
      temple,
      date,
      status,
      slot,
      search,
      sort = "bookingTime",
      order = "desc",
    } = req.query;

    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 20;
    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    // ── Build where clause ─────────────────────────────────
    const where = {};
    if (temple) where.templeId = temple;
    
    if (date) {
      where.slotDate = new Date(`${date}T00:00:00.000Z`);
    } else {
      // Hide past dates by default
      const now = new Date();
      const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      where.slotDate = { gte: todayUTC };
    }
    if (status) where.status = status;
    if (slot) where.slotTime = slot;

    // Search across user name, phone, or token number
    if (search) {
      const searchTrimmed = search.trim();
      const tokenAsNumber = parseInt(searchTrimmed, 10);

      where.OR = [
        { user: { name: { contains: searchTrimmed, mode: "insensitive" } } },
        { user: { phone: { contains: searchTrimmed, mode: "insensitive" } } },
      ];

      // If the search term is a valid number, also match by token number
      if (!isNaN(tokenAsNumber)) {
        where.OR.push({ tokenNumber: tokenAsNumber });
      }
    }

    // ── Build orderBy ──────────────────────────────────────
    const allowedSortFields = ["bookingTime", "tokenNumber", "slotDate", "status", "peopleCount"];
    const sortField = allowedSortFields.includes(sort) ? sort : "bookingTime";
    const sortOrder = order === "asc" ? "asc" : "desc";

    // ── Execute query + count in parallel ──────────────────
    const [bookings, total] = await Promise.all([
      prisma.slot.findMany({
        where,
        include: {
          user: { select: { name: true, phone: true } },
          temple: { select: { id: true, name: true } },
          queue: { select: { id: true, timeSlot: true, currentToken: true } },
        },
        orderBy: { [sortField]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.slot.count({ where }),
    ]);

    const formatted = bookings.map((s) => ({
      id: s.id,
      tokenNumber: s.tokenNumber,
      userName: s.user.name,
      userPhone: s.user.phone,
      peopleCount: s.peopleCount,
      status: s.status,
      bookingTime: s.bookingTime,
      templeName: s.temple.name,
      templeId: s.temple.id,
      slotTime: s.slotTime,
      slotDate: s.slotDate,
      queueId: s.queue.id,
      currentToken: s.queue.currentToken,
    }));

    return res.json({
      success: true,
      bookings: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getBookings:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ────────────────────────────────────────────────────────────
// PATCH /api/admin/slots/:slotId/status
// Update booking status with atomic queue counter management.
//
// Body: { status: "booked" | "serving" | "completed" | "cancelled" }
//
// Side effects (inside transaction):
//   - cancelled: decrements bookedCount, restores availableSpots,
//                reopens queue if it was full
//   - completed: advances currentToken to the next active token
// ────────────────────────────────────────────────────────────
const updateSlotStatus = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = ["booked", "serving", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    // Fetch the slot with its queue
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { queue: true },
    });

    if (!slot) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Prevent no-op updates
    if (slot.status === status) {
      return res.status(400).json({
        success: false,
        message: `Booking is already in "${status}" status`,
      });
    }

    // Perform atomic update inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the slot status
      const updatedSlot = await tx.slot.update({
        where: { id: slotId },
        data: { status },
        include: {
          user: { select: { name: true, phone: true } },
          temple: { select: { id: true, name: true } },
          queue: { select: { id: true, timeSlot: true, currentToken: true, totalCapacity: true, bookedCount: true, status: true } },
        },
      });

      // 2. Handle queue counter side effects
      if (status === "cancelled" && slot.status !== "cancelled") {
        // Restore capacity on the queue
        const newBookedCount = Math.max(0, slot.queue.bookedCount - slot.peopleCount);
        const newQueueStatus = slot.queue.status === "full" ? "open" : slot.queue.status;

        await tx.queue.update({
          where: { id: slot.queueId },
          data: {
            bookedCount: newBookedCount,
            availableSpots: slot.queue.totalCapacity - newBookedCount,
            status: newQueueStatus,
          },
        });
      }

      if (status === "completed") {
        // Advance currentToken: find the next booked slot after the current one
        const nextSlot = await tx.slot.findFirst({
          where: {
            queueId: slot.queueId,
            status: "booked",
            tokenNumber: { gt: slot.tokenNumber },
          },
          orderBy: { tokenNumber: "asc" },
          select: { tokenNumber: true },
        });

        await tx.queue.update({
          where: { id: slot.queueId },
          data: {
            currentToken: nextSlot ? nextSlot.tokenNumber : slot.tokenNumber,
          },
        });
      }

      return updatedSlot;
    });

    const io = req.app.get("io");
    if (io) io.emit("QUEUE_UPDATED", { templeId: result.temple.id });

    return res.json({
      success: true,
      message: `Booking status updated to "${status}"`,
      booking: {
        id: result.id,
        tokenNumber: result.tokenNumber,
        userName: result.user.name,
        userPhone: result.user.phone,
        peopleCount: result.peopleCount,
        status: result.status,
        bookingTime: result.bookingTime,
        templeName: result.temple.name,
        slotTime: result.slotTime,
        slotDate: result.slotDate,
        queue: result.queue,
      },
    });
  } catch (error) {
    console.error("Error in updateSlotStatus:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ────────────────────────────────────────────────────────────
// GET /api/admin/statistics
// Returns today's live dashboard statistics from the database.
// Optional filter: templeId
// ────────────────────────────────────────────────────────────
const getQueueStatistics = async (req, res) => {
  try {
    const { templeId } = req.query;

    // Today's date at midnight UTC
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // ── Queue-level where clause ───────────────────────────
    const queueWhere = { date: todayUTC };
    if (templeId) queueWhere.templeId = templeId;

    // ── Slot-level where clause ────────────────────────────
    const slotWhere = { slotDate: todayUTC };
    if (templeId) slotWhere.templeId = templeId;

    // ── Run all aggregations in parallel ───────────────────
    const [
      queueAggregates,
      todaysBookings,
      completedCount,
      cancelledCount,
      servingCount,
      nextTokenSlot,
    ] = await Promise.all([
      // Aggregate totalCapacity and bookedCount from queues
      prisma.queue.aggregate({
        where: queueWhere,
        _sum: {
          totalCapacity: true,
          bookedCount: true,
        },
        _max: {
          currentToken: true,
        },
      }),

      // Total bookings today (all statuses except cancelled)
      prisma.slot.count({
        where: { ...slotWhere, status: { not: "cancelled" } },
      }),

      // Completed bookings today
      prisma.slot.count({
        where: { ...slotWhere, status: "completed" },
      }),

      // Cancelled bookings today
      prisma.slot.count({
        where: { ...slotWhere, status: "cancelled" },
      }),

      // Currently serving
      prisma.slot.count({
        where: { ...slotWhere, status: "serving" },
      }),

      // Next token: first "booked" slot ordered by token number
      prisma.slot.findFirst({
        where: { ...slotWhere, status: "booked" },
        orderBy: { tokenNumber: "asc" },
        select: { tokenNumber: true },
      }),
    ]);

    const totalCapacity = queueAggregates._sum.totalCapacity || 0;
    const bookedCount = queueAggregates._sum.bookedCount || 0;
    const currentToken = queueAggregates._max.currentToken || 0;

    return res.json({
      success: true,
      statistics: {
        todaysBookings,
        totalCapacity,
        availableSlots: Math.max(0, totalCapacity - bookedCount),
        completed: completedCount,
        cancelled: cancelledCount,
        serving: servingCount,
        currentToken,
        nextToken: nextTokenSlot ? nextTokenSlot.tokenNumber : null,
      },
    });
  } catch (error) {
    console.error("Error in getQueueStatistics:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ────────────────────────────────────────────────────────────
// DELETE /api/admin/slots/:slotId
// Deletes a specific slot from the database entirely.
// ────────────────────────────────────────────────────────────
const deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { queue: true },
    });

    if (!slot) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    await prisma.slot.delete({
      where: { id: slotId },
    });

    // Broadcast the update so dashboards refresh
    const io = req.app.get("io");
    if (io) io.emit("QUEUE_UPDATED", { templeId: slot.templeId });

    return res.json({ success: true, message: "Booking successfully deleted" });
  } catch (error) {
    console.error("Error in deleteSlot:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getQueues,
  getQueueSlots,
  getBookings,
  updateSlotStatus,
  getQueueStatistics,
  deleteSlot,
};

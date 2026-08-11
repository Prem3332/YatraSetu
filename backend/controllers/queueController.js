const prisma = require("../config/db");

/**
 * Get slot availability for a specific temple and date.
 * Validates against the temple's base slotConfigurations and current Queue bookings.
 */
exports.getAvailability = async (req, res) => {
  try {
    const { templeId, date } = req.query;

    if (!templeId || !date) {
      return res.status(400).json({ success: false, message: "templeId and date are required" });
    }

    // 1. Fetch temple configuration
    const temple = await prisma.temple.findUnique({
      where: { id: templeId },
      select: { slotConfigurations: true }
    });

    if (!temple) {
      return res.status(404).json({ success: false, message: "Temple not found" });
    }

    const configs = temple.slotConfigurations || [];
    if (configs.length === 0) {
      return res.json({ success: true, slots: [] });
    }

    // 2. Fetch existing queue records for this date
    // Convert date string (YYYY-MM-DD) to ISO Date object for Prisma @db.Date
    const searchDate = new Date(`${date}T00:00:00.000Z`);

    const existingQueues = await prisma.queue.findMany({
      where: {
        templeId,
        date: searchDate,
      }
    });

    // 3. Map configs to current availability
    const slots = configs.map(config => {
      const timeSlotStr = `${config.startTime} - ${config.endTime}`;
      const queueRecord = existingQueues.find(q => q.timeSlot === timeSlotStr);
      
      const capacity = config.capacity || 0;
      const booked = queueRecord ? queueRecord.bookedCount : 0;
      const available = Math.max(0, capacity - booked);

      return {
        time: timeSlotStr,
        capacity,
        booked,
        available,
        status: available === 0 ? "full" : "open"
      };
    });

    res.json({ success: true, slots });

  } catch (error) {
    console.error("Error in getAvailability:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get aggregated daily traffic for an entire month.
 * Returns totalCapacity, totalBooked, totalAvailable per date.
 * Query params: templeId, year, month (1-indexed)
 */
exports.getMonthlyAvailability = async (req, res) => {
  try {
    const { templeId, year, month } = req.query;

    if (!templeId || !year || !month) {
      return res.status(400).json({ success: false, message: "templeId, year, and month are required" });
    }

    const y = parseInt(year, 10);
    const m = parseInt(month, 10); // 1-indexed

    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return res.status(400).json({ success: false, message: "Invalid year or month" });
    }

    // 1. Fetch temple slot configurations for total daily capacity
    const temple = await prisma.temple.findUnique({
      where: { id: templeId },
      select: { slotConfigurations: true }
    });

    if (!temple) {
      return res.status(404).json({ success: false, message: "Temple not found" });
    }

    const configs = temple.slotConfigurations || [];
    const totalCapacity = configs.reduce((sum, c) => sum + (c.capacity || 0), 0);

    if (totalCapacity === 0) {
      return res.json({ success: true, dailyTraffic: {} });
    }

    // 2. Date range: first and last day of the month (UTC)
    const startDate = new Date(Date.UTC(y, m - 1, 1));
    const endDate = new Date(Date.UTC(y, m, 0)); // last day of month

    // 3. Fetch all Queue records for this temple within the month
    const queues = await prisma.queue.findMany({
      where: {
        templeId,
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      select: {
        date: true,
        bookedCount: true,
      }
    });

    // 4. Aggregate booked counts by date
    const bookedByDate = {};
    for (const q of queues) {
      const dateKey = q.date.toISOString().slice(0, 10); // "YYYY-MM-DD"
      bookedByDate[dateKey] = (bookedByDate[dateKey] || 0) + q.bookedCount;
    }

    // 5. Build response for every day in the month
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const dailyTraffic = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const totalBooked = bookedByDate[dateKey] || 0;
      dailyTraffic[dateKey] = {
        totalCapacity,
        totalBooked,
        totalAvailable: Math.max(0, totalCapacity - totalBooked),
      };
    }

    res.json({ success: true, dailyTraffic });

  } catch (error) {
    console.error("Error in getMonthlyAvailability:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get today's traffic for all temples in a single request.
 * Returns a map of templeId to DailyTraffic.
 */
exports.getTodayTraffic = async (req, res) => {
  try {
    const today = new Date();
    // Use UTC date strictly matching the DB's date format (midnight UTC)
    const searchDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    // 1. Fetch all temples to get their total capacities
    const temples = await prisma.temple.findMany({
      select: { id: true, slotConfigurations: true }
    });

    const capacities = {};
    for (const temple of temples) {
      const configs = temple.slotConfigurations || [];
      const totalCapacity = configs.reduce((sum, c) => sum + (c.capacity || 0), 0);
      capacities[temple.id] = totalCapacity;
    }

    // 2. Fetch all Queue records for today
    const queues = await prisma.queue.findMany({
      where: {
        date: searchDate,
      },
      select: {
        templeId: true,
        bookedCount: true,
      }
    });

    // 3. Aggregate booked counts by temple
    const bookedByTemple = {};
    for (const q of queues) {
      bookedByTemple[q.templeId] = (bookedByTemple[q.templeId] || 0) + q.bookedCount;
    }

    // 4. Build response map
    const todayTraffic = {};
    for (const temple of temples) {
      const totalCapacity = capacities[temple.id] || 0;
      const totalBooked = bookedByTemple[temple.id] || 0;
      todayTraffic[temple.id] = {
        totalCapacity,
        totalBooked,
        totalAvailable: Math.max(0, totalCapacity - totalBooked),
      };
    }

    res.json({ success: true, todayTraffic });

  } catch (error) {
    console.error("Error in getTodayTraffic:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Book a slot for a user.
 * Expects: templeId, date, timeSlot, peopleCount
 */
exports.bookSlot = async (req, res) => {
  try {
    const { templeId, date, timeSlot, peopleCount, name, phone } = req.body;
    
    // Auth middleware guarantees req.user exists (dev mode falls back to dev-admin-id)
    const userId = req.user.id;

    if (!templeId || !date || !timeSlot || !peopleCount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Reject bookings for today or any past date — earliest allowed is tomorrow
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    const now = new Date();
    const tomorrowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    if (parsedDate < tomorrowUTC) {
      return res.status(400).json({ success: false, message: "Bookings can only be made from tomorrow onward. Today and past dates are not allowed." });
    }

    // 1. Verify Temple and Capacity limits
    const temple = await prisma.temple.findUnique({
      where: { id: templeId },
      select: { slotConfigurations: true }
    });

    if (!temple) {
      return res.status(404).json({ success: false, message: "Temple not found" });
    }

    const config = (temple.slotConfigurations || []).find(
      c => `${c.startTime} - ${c.endTime}` === timeSlot
    );

    if (!config) {
      return res.status(400).json({ success: false, message: "Invalid time slot for this temple" });
    }

    const maxCapacity = config.capacity || 0;

    // 2. Perform transactional booking
    const result = await prisma.$transaction(async (tx) => {
      // Find or create Queue record for the day/slot
      let queue = await tx.queue.findFirst({
        where: { templeId, date: parsedDate, timeSlot }
      });

      if (!queue) {
        queue = await tx.queue.create({
          data: {
            templeId,
            date: parsedDate,
            timeSlot,
            totalCapacity: maxCapacity,
            bookedCount: 0,
            availableSpots: maxCapacity,
            status: "open"
          }
        });
      }

      // Check capacity
      if (queue.bookedCount + peopleCount > maxCapacity) {
        throw new Error("CAPACITY_EXCEEDED");
      }

      // Update Queue
      const updatedQueue = await tx.queue.update({
        where: { id: queue.id },
        data: {
          bookedCount: { increment: peopleCount },
          availableSpots: { decrement: peopleCount },
          status: (queue.bookedCount + peopleCount) >= maxCapacity ? "full" : "open"
        }
      });

      // Create or update User with dynamic name and phone from the booking form
      let user = await tx.user.findUnique({ where: { id: userId } });
      
      const dynamicName = name || (user ? user.name : "Devotee User");
      const dynamicPhone = phone || (user ? user.phone : "+91" + Math.floor(1000000000 + Math.random() * 9000000000));

      if (!user) {
        user = await tx.user.create({
          data: {
            id: userId,
            name: dynamicName,
            phone: dynamicPhone,
            passwordHash: "mock",
            role: "devotee"
          }
        });
      } else if (name || phone) {
        // If the user already exists, update their name and phone to match the latest booking details
        user = await tx.user.update({
          where: { id: userId },
          data: {
            name: dynamicName,
            phone: dynamicPhone,
          }
        });
      }

      // Create Slot (booking record)
      const newSlot = await tx.slot.create({
        data: {
          userId: user.id,
          queueId: queue.id,
          templeId,
          tokenNumber: updatedQueue.bookedCount, // sequential token based on count
          peopleCount,
          slotDate: parsedDate,
          slotTime: timeSlot,
          status: "booked"
        }
      });

      return newSlot;
    });

    const io = req.app.get("io");
    if (io) io.emit("QUEUE_UPDATED", { templeId });

    res.json({ success: true, message: "Booking confirmed", booking: result });

  } catch (error) {
    if (error.message === "CAPACITY_EXCEEDED") {
      return res.status(400).json({ success: false, message: "Selected slot is no longer available or not enough seats." });
    }
    console.error("Error in bookSlot:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get a specific booking by its Slot ID, with live queue position and nearby tokens.
 * Calculates all dynamic values (position, wait, availability) at request time.
 */
exports.getMyBooking = async (req, res) => {
  try {
    const { slotId } = req.params;
    const userId = req.user.id;

    // 1. Fetch the slot with its queue and temple
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: {
        queue: true,
        temple: {
          select: { id: true, name: true, city: true, state: true }
        }
      }
    });

    if (!slot) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // 2. Verify ownership
    if (slot.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // 3. Check if booking is expired (slot date is in the past)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(slot.slotDate);
    slotDate.setHours(0, 0, 0, 0);
    const isExpired = slotDate < today && slot.status === "booked";

    // 4. Calculate position dynamically: count of active bookings ahead of this token
    let position = 0;
    if (slot.status === "booked" || slot.status === "serving") {
      position = await prisma.slot.count({
        where: {
          queueId: slot.queueId,
          tokenNumber: { lt: slot.tokenNumber },
          status: { in: ["booked", "serving"] }
        }
      });
    }

    // 5. Estimated wait: position × 3 minutes (average service time per token)
    const estimatedWaitMinutes = position * 3;

    // 6. Fetch nearby tokens (3 before + self + 3 after)
    const nearbySlots = await prisma.slot.findMany({
      where: {
        queueId: slot.queueId,
        tokenNumber: {
          gte: Math.max(1, slot.tokenNumber - 3),
          lte: slot.tokenNumber + 3
        },
        status: { not: "cancelled" }
      },
      orderBy: { tokenNumber: "asc" },
      select: { tokenNumber: true, status: true, userId: true }
    });

    const nearbyTokens = nearbySlots.map(s => ({
      tokenNumber: s.tokenNumber,
      status: s.status,
      isYou: s.userId === userId && s.tokenNumber === slot.tokenNumber
    }));

    // 7. Calculate dynamic availability for the queue
    const dynamicAvailable = Math.max(0, slot.queue.totalCapacity - slot.queue.bookedCount);

    res.json({
      success: true,
      booking: {
        id: slot.id,
        tokenNumber: slot.tokenNumber,
        peopleCount: slot.peopleCount,
        status: isExpired ? "expired" : slot.status,
        slotDate: slot.slotDate,
        slotTime: slot.slotTime,
        bookingTime: slot.bookingTime,
        temple: slot.temple,
        queue: {
          id: slot.queue.id,
          totalCapacity: slot.queue.totalCapacity,
          bookedCount: slot.queue.bookedCount,
          availableSpots: dynamicAvailable,
          currentToken: slot.queue.currentToken,
          status: slot.queue.status
        }
      },
      position,
      estimatedWaitMinutes,
      nearbyTokens
    });

  } catch (error) {
    console.error("Error in getMyBooking:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get the current user's latest active booking (status = booked or serving).
 * This enables the Live Queue Screen to restore itself after page refresh
 * without depending on React state or localStorage.
 */
exports.getMyActiveBooking = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the most recent active booking for this user
    const slot = await prisma.slot.findFirst({
      where: {
        userId,
        status: { in: ["booked", "serving"] }
      },
      orderBy: { bookingTime: "desc" },
      include: {
        queue: true,
        temple: {
          select: { id: true, name: true, city: true, state: true }
        }
      }
    });

    if (!slot) {
      return res.json({ success: true, booking: null });
    }

    // Check if expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(slot.slotDate);
    slotDate.setHours(0, 0, 0, 0);
    const isExpired = slotDate < today;

    // Calculate position dynamically
    let position = 0;
    if (!isExpired) {
      position = await prisma.slot.count({
        where: {
          queueId: slot.queueId,
          tokenNumber: { lt: slot.tokenNumber },
          status: { in: ["booked", "serving"] }
        }
      });
    }

    const estimatedWaitMinutes = position * 3;

    // Nearby tokens
    const nearbySlots = await prisma.slot.findMany({
      where: {
        queueId: slot.queueId,
        tokenNumber: {
          gte: Math.max(1, slot.tokenNumber - 3),
          lte: slot.tokenNumber + 3
        },
        status: { not: "cancelled" }
      },
      orderBy: { tokenNumber: "asc" },
      select: { tokenNumber: true, status: true, userId: true }
    });

    const nearbyTokens = nearbySlots.map(s => ({
      tokenNumber: s.tokenNumber,
      status: s.status,
      isYou: s.userId === userId && s.tokenNumber === slot.tokenNumber
    }));

    const dynamicAvailable = Math.max(0, slot.queue.totalCapacity - slot.queue.bookedCount);

    res.json({
      success: true,
      booking: {
        id: slot.id,
        tokenNumber: slot.tokenNumber,
        peopleCount: slot.peopleCount,
        status: isExpired ? "expired" : slot.status,
        slotDate: slot.slotDate,
        slotTime: slot.slotTime,
        bookingTime: slot.bookingTime,
        temple: slot.temple,
        queue: {
          id: slot.queue.id,
          totalCapacity: slot.queue.totalCapacity,
          bookedCount: slot.queue.bookedCount,
          availableSpots: dynamicAvailable,
          currentToken: slot.queue.currentToken,
          status: slot.queue.status
        }
      },
      position,
      estimatedWaitMinutes,
      nearbyTokens
    });

  } catch (error) {
    console.error("Error in getMyActiveBooking:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Cancel a booking. Uses a Prisma transaction to atomically:
 * 1. Validate ownership and cancellability
 * 2. Update Slot status to "cancelled"
 * 3. Decrement Queue bookedCount and restore capacity
 *
 * Does NOT delete the Slot record — preserves audit history.
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { slotId } = req.params;
    const userId = req.user.id;

    // 1. Fetch the slot
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { queue: true }
    });

    if (!slot) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // 2. Verify ownership
    if (slot.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // 3. Verify the booking is cancellable
    if (slot.status !== "booked") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status "${slot.status}". Only "booked" bookings can be cancelled.`
      });
    }

    // 4. Perform transactional cancellation
    await prisma.$transaction(async (tx) => {
      // Mark slot as cancelled
      await tx.slot.update({
        where: { id: slot.id },
        data: { status: "cancelled" }
      });

      // Restore capacity on the queue
      const newBookedCount = Math.max(0, slot.queue.bookedCount - slot.peopleCount);
      const newStatus = slot.queue.status === "full" ? "open" : slot.queue.status;

      await tx.queue.update({
        where: { id: slot.queueId },
        data: {
          bookedCount: newBookedCount,
          availableSpots: slot.queue.totalCapacity - newBookedCount,
          status: newStatus
        }
      });
    });

    const io = req.app.get("io");
    if (io) io.emit("QUEUE_UPDATED", { templeId: slot.templeId });

    res.json({ success: true, message: "Booking cancelled successfully" });

  } catch (error) {
    console.error("Error in cancelBooking:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

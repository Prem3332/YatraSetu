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
 * Book a slot for a user.
 * Expects: templeId, date, timeSlot, peopleCount
 */
exports.bookSlot = async (req, res) => {
  try {
    const { templeId, date, timeSlot, peopleCount } = req.body;
    
    // For now, if no auth token is present, we mock a user ID. 
    // In production, this would use req.user.id from auth middleware.
    const userId = req.user ? req.user.id : "dev-user-id";

    if (!templeId || !date || !timeSlot || !peopleCount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

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

      // Create User if doesn't exist for dev mock
      let user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        user = await tx.user.create({
          data: {
            id: userId,
            name: "Devotee User",
            phone: "+91" + Math.floor(1000000000 + Math.random() * 9000000000),
            passwordHash: "mock",
            role: "devotee"
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

    res.json({ success: true, message: "Booking confirmed", booking: result });

  } catch (error) {
    if (error.message === "CAPACITY_EXCEEDED") {
      return res.status(400).json({ success: false, message: "Selected slot is no longer available or not enough seats." });
    }
    console.error("Error in bookSlot:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

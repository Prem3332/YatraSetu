const prisma = require("../config/db");

/**
 * Map a Prisma temple record to the response shape the frontend expects.
 * Prisma uses `id`; the frontend expects `_id`.
 * Zones array is mapped to an array of zone IDs (strings) to match Mongoose.
 */
const formatTemple = (temple) => {
  const { id, zones, ...rest } = temple;
  return {
    _id: id,
    ...rest,
    zones: zones ? zones.map((z) => z.id) : [],
  };
};

// ────────────────────────────────────────────────────────────
// GET /api/temples
// ────────────────────────────────────────────────────────────
const getTemples = async (req, res) => {
  try {
    const temples = await prisma.temple.findMany({
      orderBy: { createdAt: "desc" },
      include: { zones: true },
    });

    return res.status(200).json({
      success: true,
      temples: temples.map(formatTemple),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ────────────────────────────────────────────────────────────
// GET /api/temples/:slug
// ────────────────────────────────────────────────────────────
const getTempleBySlug = async (req, res) => {
  try {
    const temple = await prisma.temple.findUnique({
      where: { slug: req.params.slug },
      include: { zones: true },
    });

    if (!temple) {
      return res.status(404).json({
        success: false,
        message: "Temple not found",
      });
    }

    return res.status(200).json({
      success: true,
      temple: formatTemple(temple),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ────────────────────────────────────────────────────────────
// POST /api/temples
// ────────────────────────────────────────────────────────────
const createTemple = async (req, res) => {
  try {
    const { name, slug, city, state, lat, lng, totalCapacity, timings, slotConfigurations } =
      req.body;

    // ── Validation ─────────────────────────────────────────
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Temple name and slug are required",
      });
    }

    // ── Slugify defensively ────────────────────────────────
    const normalizedSlug = slug.toLowerCase().trim();

    // ── Duplicate check ────────────────────────────────────
    const existing = await prisma.temple.findUnique({
      where: { slug: normalizedSlug },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A temple with this slug already exists",
      });
    }

    // ── Create temple ──────────────────────────────────────
    const temple = await prisma.temple.create({
      data: {
        name,
        slug: normalizedSlug,
        city,
        state,
        lat,
        lng,
        totalCapacity,
        timings: timings || undefined,
        slotConfigurations: slotConfigurations || undefined,
      },
      include: { zones: true },
    });

    return res.status(201).json({
      success: true,
      temple: formatTemple(temple),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ────────────────────────────────────────────────────────────
// DELETE /api/temples/:id
// ────────────────────────────────────────────────────────────
const deleteTemple = async (req, res) => {
  try {
    const temple = await prisma.temple.findUnique({
      where: { id: req.params.id },
    });

    if (!temple) {
      return res.status(404).json({
        success: false,
        message: "Temple not found",
      });
    }

    // Prisma onDelete: Cascade handles zone cleanup automatically
    await prisma.temple.delete({
      where: { id: req.params.id },
    });

    return res.status(200).json({
      success: true,
      message: "Temple deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getTemples, getTempleBySlug, createTemple, deleteTemple };

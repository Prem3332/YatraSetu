const prisma = require("../config/db");

const GLOBAL_ID = "global";

// Default settings returned when no row exists yet
const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  maintenanceMessage: "We are performing scheduled maintenance.",
  estimatedCompletion: null,
};

// ────────────────────────────────────────────────────────────
// GET /api/system/settings
// Public — the devotee app needs this without authentication.
// ────────────────────────────────────────────────────────────
const getSystemSettings = async (_req, res) => {
  try {
    const settings = await prisma.systemSetting.findUnique({
      where: { id: GLOBAL_ID },
    });

    return res.status(200).json({
      success: true,
      settings: settings
        ? {
            maintenanceMode: settings.maintenanceMode,
            maintenanceMessage: settings.maintenanceMessage,
            estimatedCompletion: settings.estimatedCompletion,
            updatedAt: settings.updatedAt,
          }
        : { ...DEFAULT_SETTINGS, updatedAt: null },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ────────────────────────────────────────────────────────────
// PUT /api/system/settings
// temple_admin only — create-or-update the singleton row.
// ────────────────────────────────────────────────────────────
const updateSystemSettings = async (req, res) => {
  try {
    const { maintenanceMode, maintenanceMessage, estimatedCompletion } = req.body;

    // Build the data object from only the fields that were sent
    const data = {};
    if (typeof maintenanceMode === "boolean") data.maintenanceMode = maintenanceMode;
    if (typeof maintenanceMessage === "string") data.maintenanceMessage = maintenanceMessage;
    if (estimatedCompletion !== undefined) {
      data.estimatedCompletion = estimatedCompletion ? new Date(estimatedCompletion) : null;
    }

    const settings = await prisma.systemSetting.upsert({
      where: { id: GLOBAL_ID },
      create: {
        id: GLOBAL_ID,
        ...DEFAULT_SETTINGS,
        ...data,
      },
      update: data,
    });

    return res.status(200).json({
      success: true,
      settings: {
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        estimatedCompletion: settings.estimatedCompletion,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getSystemSettings, updateSystemSettings };

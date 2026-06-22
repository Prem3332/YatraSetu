const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const prisma = require("./config/db");

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/temples", require("./routes/temples"));

// TODO: Mount future route modules
// app.use("/api/queues",  require("./routes/queues"));
// app.use("/api/slots",   require("./routes/slots"));
// app.use("/api/alerts",  require("./routes/alerts"));
// app.use("/api/sensors", require("./routes/sensors"));

// ── HTTP + Socket.io Server ────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── Start (verify DB connection before listening) ─────────
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Verify Prisma can connect to PostgreSQL
    await prisma.$connect();
    console.log("✅ PostgreSQL Connected (Prisma)");
  } catch (err) {
    console.error(`❌ PostgreSQL Connection Error: ${err.message}`);
    process.exit(1);
  }

  // Auto-seed if the temples table is empty
  try {
    const count = await prisma.temple.count();
    if (count === 0) {
      console.log("🌱 Database is empty — auto-seeding temples...");
      const autoSeed = require("./scripts/autoSeed");
      await autoSeed();
    }
  } catch (seedErr) {
    console.warn(`⚠️  Auto-seed skipped: ${seedErr.message}`);
  }

  server.listen(PORT, () => {
    console.log(`🚀 PilgrimSafe server running on port ${PORT}`);
  });
})();

module.exports = { app, io };

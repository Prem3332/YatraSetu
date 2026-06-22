/**
 * PilgrimSafe — Database Seed Script (Prisma / PostgreSQL)
 *
 * Inserts the 4 Gujarat temples and their zones into PostgreSQL via Prisma.
 * Zone data matches CrowdMonitor.tsx and TempleMapScreen.tsx exactly.
 *
 * Usage:
 *   1. Ensure DATABASE_URL is set in backend/.env
 *   2. Run: node backend/scripts/seed.js
 *
 * This script is idempotent — it clears existing data before inserting.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const prisma = require("../config/db");

/**
 * Zone data for Somnath Temple
 * Coordinates (x, y, w, h) match CrowdMonitor.tsx zones array.
 * Capacities match CrowdMonitor.tsx zone.capacity values.
 */
const somnathZones = [
  { zoneId: "entry",     label: "Entry Gate",      capacity: 200, coordinateX: 60,  coordinateY: 260, coordinateW: 120, coordinateH: 60,  isAccessible: true  },
  { zoneId: "shrine",    label: "Main Shrine",     capacity: 500, coordinateX: 220, coordinateY: 130, coordinateW: 160, coordinateH: 120, isAccessible: false },
  { zoneId: "prasad",    label: "Prasad Counter",  capacity: 150, coordinateX: 400, coordinateY: 180, coordinateW: 110, coordinateH: 80,  isAccessible: true  },
  { zoneId: "corridor1", label: "East Corridor",   capacity: 300, coordinateX: 220, coordinateY: 270, coordinateW: 160, coordinateH: 60,  isAccessible: true  },
  { zoneId: "restroom",  label: "Restrooms",       capacity: 80,  coordinateX: 60,  coordinateY: 170, coordinateW: 90,  coordinateH: 60,  isAccessible: true  },
  { zoneId: "parking",   label: "Parking Zone",    capacity: 400, coordinateX: 60,  coordinateY: 350, coordinateW: 180, coordinateH: 80,  isAccessible: true  },
  { zoneId: "firstaid",  label: "First Aid Post",  capacity: 30,  coordinateX: 400, coordinateY: 80,  coordinateW: 90,  coordinateH: 60,  isAccessible: true  },
];

/**
 * Temple seed data — the 4 Gujarat pilgrimage sites.
 * Names and slugs match HomeScreen.tsx temple cards.
 * GPS coords are real locations of each temple.
 */
const temples = [
  {
    name: "Somnath Temple",
    slug: "somnath",
    city: "Veraval",
    state: "Gujarat",
    lat: 20.8880,
    lng: 70.4012,
    totalCapacity: 1660,
    timings: [{ day: "All", open: "6:00 AM", close: "9:30 PM" }],
    zones: somnathZones,
  },
  {
    name: "Dwarkadheesh Temple",
    slug: "dwarka",
    city: "Dwarka",
    state: "Gujarat",
    lat: 22.2376,
    lng: 68.9674,
    totalCapacity: 1500,
    timings: [{ day: "All", open: "6:30 AM", close: "8:00 PM" }],
    zones: [
      { zoneId: "entry",     label: "Entry Gate",      capacity: 180, coordinateX: 60,  coordinateY: 260, coordinateW: 120, coordinateH: 60,  isAccessible: true  },
      { zoneId: "shrine",    label: "Main Shrine",     capacity: 450, coordinateX: 220, coordinateY: 130, coordinateW: 160, coordinateH: 120, isAccessible: false },
      { zoneId: "prasad",    label: "Prasad Counter",  capacity: 120, coordinateX: 400, coordinateY: 180, coordinateW: 110, coordinateH: 80,  isAccessible: true  },
      { zoneId: "corridor1", label: "East Corridor",   capacity: 250, coordinateX: 220, coordinateY: 270, coordinateW: 160, coordinateH: 60,  isAccessible: true  },
      { zoneId: "restroom",  label: "Restrooms",       capacity: 70,  coordinateX: 60,  coordinateY: 170, coordinateW: 90,  coordinateH: 60,  isAccessible: true  },
      { zoneId: "parking",   label: "Parking Zone",    capacity: 380, coordinateX: 60,  coordinateY: 350, coordinateW: 180, coordinateH: 80,  isAccessible: true  },
      { zoneId: "firstaid",  label: "First Aid Post",  capacity: 50,  coordinateX: 400, coordinateY: 80,  coordinateW: 90,  coordinateH: 60,  isAccessible: true  },
    ],
  },
  {
    name: "Ambaji Temple",
    slug: "ambaji",
    city: "Ambaji",
    state: "Gujarat",
    lat: 24.3333,
    lng: 72.8500,
    totalCapacity: 1200,
    timings: [{ day: "All", open: "7:00 AM", close: "9:00 PM" }],
    zones: [
      { zoneId: "entry",     label: "Entry Gate",      capacity: 150, coordinateX: 60,  coordinateY: 260, coordinateW: 120, coordinateH: 60,  isAccessible: true  },
      { zoneId: "shrine",    label: "Main Shrine",     capacity: 400, coordinateX: 220, coordinateY: 130, coordinateW: 160, coordinateH: 120, isAccessible: false },
      { zoneId: "prasad",    label: "Prasad Counter",  capacity: 100, coordinateX: 400, coordinateY: 180, coordinateW: 110, coordinateH: 80,  isAccessible: true  },
      { zoneId: "corridor1", label: "East Corridor",   capacity: 200, coordinateX: 220, coordinateY: 270, coordinateW: 160, coordinateH: 60,  isAccessible: true  },
      { zoneId: "restroom",  label: "Restrooms",       capacity: 60,  coordinateX: 60,  coordinateY: 170, coordinateW: 90,  coordinateH: 60,  isAccessible: true  },
      { zoneId: "parking",   label: "Parking Zone",    capacity: 260, coordinateX: 60,  coordinateY: 350, coordinateW: 180, coordinateH: 80,  isAccessible: true  },
      { zoneId: "firstaid",  label: "First Aid Post",  capacity: 30,  coordinateX: 400, coordinateY: 80,  coordinateW: 90,  coordinateH: 60,  isAccessible: true  },
    ],
  },
  {
    name: "Pavagadh Temple",
    slug: "pavagadh",
    city: "Champaner",
    state: "Gujarat",
    lat: 22.4700,
    lng: 73.5400,
    totalCapacity: 1000,
    timings: [{ day: "All", open: "7:00 AM", close: "7:00 PM" }],
    zones: [
      { zoneId: "entry",     label: "Entry Gate",      capacity: 120, coordinateX: 60,  coordinateY: 260, coordinateW: 120, coordinateH: 60,  isAccessible: true  },
      { zoneId: "shrine",    label: "Main Shrine",     capacity: 350, coordinateX: 220, coordinateY: 130, coordinateW: 160, coordinateH: 120, isAccessible: false },
      { zoneId: "prasad",    label: "Prasad Counter",  capacity: 80,  coordinateX: 400, coordinateY: 180, coordinateW: 110, coordinateH: 80,  isAccessible: true  },
      { zoneId: "corridor1", label: "East Corridor",   capacity: 150, coordinateX: 220, coordinateY: 270, coordinateW: 160, coordinateH: 60,  isAccessible: true  },
      { zoneId: "restroom",  label: "Restrooms",       capacity: 50,  coordinateX: 60,  coordinateY: 170, coordinateW: 90,  coordinateH: 60,  isAccessible: true  },
      { zoneId: "parking",   label: "Parking Zone",    capacity: 220, coordinateX: 60,  coordinateY: 350, coordinateW: 180, coordinateH: 80,  isAccessible: true  },
      { zoneId: "firstaid",  label: "First Aid Post",  capacity: 30,  coordinateX: 400, coordinateY: 80,  coordinateW: 90,  coordinateH: 60,  isAccessible: true  },
    ],
  },
];

async function seed() {
  console.log("🗑️  Clearing existing data...");
  // Delete in dependency order (children first)
  await prisma.sensor.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.queue.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.user.deleteMany();
  await prisma.temple.deleteMany();

  console.log("🛕 Seeding temples and zones...\n");

  for (const templeData of temples) {
    const { zones: zoneDataList, ...templeFields } = templeData;

    // Create the temple
    const temple = await prisma.temple.create({
      data: templeFields,
    });
    console.log(`  ✅ Temple: ${temple.name} (${temple.slug})`);

    // Create zones for this temple
    for (const zd of zoneDataList) {
      const zone = await prisma.zone.create({
        data: { ...zd, templeId: temple.id },
      });
      console.log(`     📍 Zone: ${zone.label} (capacity: ${zone.capacity})`);
    }
  }

  const templeCount = await prisma.temple.count();
  const zoneCount = await prisma.zone.count();
  console.log(`\n🎉 Seed complete! Inserted ${templeCount} temples and ${zoneCount} zones.`);

  await prisma.$disconnect();
  console.log("🔌 Database connection closed.");
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("❌ Seed failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});

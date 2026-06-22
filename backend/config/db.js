/**
 * PilgrimSafe — Database Client (Prisma)
 *
 * Exports a singleton PrismaClient instance.
 * All controllers import this instead of the old Mongoose connection.
 *
 * Usage:
 *   const prisma = require("./config/db");
 *   const temples = await prisma.temple.findMany();
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = prisma;

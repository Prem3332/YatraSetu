-- CreateEnum
CREATE TYPE "Role" AS ENUM ('devotee', 'temple_admin', 'police', 'medical');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en', 'gu', 'hi');

-- CreateEnum
CREATE TYPE "SlotBookingStatus" AS ENUM ('booked', 'serving', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('open', 'full', 'closed');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('stampede', 'medical', 'fire', 'sos', 'general');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('low', 'moderate', 'critical');

-- CreateEnum
CREATE TYPE "SensorStatus" AS ENUM ('low', 'moderate', 'high');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'devotee',
    "templeAssigned" TEXT,
    "isAccessible" BOOLEAN NOT NULL DEFAULT false,
    "language" "Language" NOT NULL DEFAULT 'gu',
    "fcmToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temples" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT DEFAULT 'Gujarat',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "totalCapacity" INTEGER,
    "timings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "coordinateX" DOUBLE PRECISION,
    "coordinateY" DOUBLE PRECISION,
    "coordinateW" DOUBLE PRECISION,
    "coordinateH" DOUBLE PRECISION,
    "latLngLat" DOUBLE PRECISION,
    "latLngLng" DOUBLE PRECISION,
    "isAccessible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queues" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "totalCapacity" INTEGER NOT NULL,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "availableSpots" INTEGER,
    "status" "QueueStatus" NOT NULL DEFAULT 'open',
    "currentToken" INTEGER NOT NULL DEFAULT 0,
    "estimatedWait" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "tokenNumber" INTEGER NOT NULL,
    "peopleCount" INTEGER NOT NULL DEFAULT 1,
    "isAccessible" BOOLEAN NOT NULL DEFAULT false,
    "status" "SlotBookingStatus" NOT NULL DEFAULT 'booked',
    "bookingTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slotDate" DATE NOT NULL,
    "slotTime" TEXT NOT NULL,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "triggeredById" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'moderate',
    "message" TEXT NOT NULL,
    "affectedZone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "nearestAidPoints" JSONB,
    "exitRoutes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "currentCount" INTEGER NOT NULL,
    "density" DOUBLE PRECISION NOT NULL,
    "status" "SensorStatus" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSynthetic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "temples_slug_key" ON "temples"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "zones_templeId_zoneId_key" ON "zones"("templeId", "zoneId");

-- CreateIndex
CREATE INDEX "queues_templeId_idx" ON "queues"("templeId");

-- CreateIndex
CREATE UNIQUE INDEX "queues_templeId_date_timeSlot_key" ON "queues"("templeId", "date", "timeSlot");

-- CreateIndex
CREATE INDEX "slots_userId_slotDate_idx" ON "slots"("userId", "slotDate");

-- CreateIndex
CREATE INDEX "slots_queueId_status_tokenNumber_idx" ON "slots"("queueId", "status", "tokenNumber");

-- CreateIndex
CREATE INDEX "alerts_templeId_isActive_idx" ON "alerts"("templeId", "isActive");

-- CreateIndex
CREATE INDEX "sensors_zoneId_timestamp_idx" ON "sensors"("zoneId", "timestamp");

-- CreateIndex
CREATE INDEX "sensors_templeId_zoneId_timestamp_idx" ON "sensors"("templeId", "zoneId", "timestamp");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_templeAssigned_fkey" FOREIGN KEY ("templeAssigned") REFERENCES "temples"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "temples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "temples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "queues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "temples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "temples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "temples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

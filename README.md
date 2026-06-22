# PilgrimSafe — Gujarat Pilgrimage Crowd Management System

Smart crowd management system for Hindu pilgrimage sites in Gujarat, offering live queue booking, crowd density monitoring, emergency alerts, and accessible navigation.

## 🛕 Temples in Scope

| Temple | City | Coordinates |
|--------|------|-------------|
| Somnath Temple | Veraval | 20.8880°N, 70.4012°E |
| Dwarkadheesh Temple | Dwarka | 22.2376°N, 68.9674°E |
| Ambaji Temple | Ambaji | 24.3333°N, 72.8500°E |
| Pavagadh Temple | Champaner | 22.4700°N, 73.5400°E |

## 📁 Project Structure

```
yatrasetu/
├── src/                          # Frontend (React + TypeScript + Tailwind)
│   ├── app/
│   │   ├── App.tsx               # Root component — mode switcher + routing
│   │   └── components/
│   │       ├── pilgrim/          # Devotee screens (Home, Queue, Live, Map, SOS)
│   │       ├── admin/            # Admin dashboard (Crowd, Queue Control, Emergency)
│   │       ├── figma/            # Figma asset helpers
│   │       └── ui/               # Shadcn/ui components
│   ├── styles/                   # CSS (Tailwind v4, theme, fonts)
│   └── main.tsx                  # App entry point
│
├── backend/                      # Backend (Node.js + Express + PostgreSQL)
│   ├── prisma/
│   │   └── schema.prisma         # Prisma schema (all models + relations)
│   ├── config/
│   │   └── db.js                 # Prisma client singleton
│   ├── controllers/
│   │   ├── authController.js     # JWT register/login/me/logout
│   │   └── templeController.js   # CRUD temples
│   ├── middleware/
│   │   └── auth.js               # JWT auth + role-based access
│   ├── routes/
│   │   ├── auth.js               # /api/auth/* routes
│   │   └── temples.js            # /api/temples/* routes
│   ├── scripts/
│   │   ├── seed.js               # Insert 4 temples + 28 zones (standalone)
│   │   └── autoSeed.js           # Auto-seed on empty DB (in-process)
│   ├── .env.example              # Environment variable template
│   └── server.js                 # Express + Socket.io entry point
│
├── ml/                           # Machine Learning
│   └── data/
│       ├── generate_dataset.py   # Footfall dataset generator
│       └── footfall_dataset.csv  # 2920 rows (2 years × 4 temples)
│
├── postman/
│   └── PilgrimSafe.postman_collection.json  # Full API specification
│
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite + React + Tailwind config
└── package.json                  # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+ (for ML dataset generation)
- PostgreSQL database (Railway free tier or local)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your Railway PostgreSQL connection string:
# DATABASE_URL="postgresql://postgres:<PASSWORD>@<HOST>.proxy.rlwy.net:<PORT>/railway"

# Install backend dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migration (creates all tables)
npx prisma migrate dev --name init

# (Optional) Seed the database manually — auto-seed runs on first start
node scripts/seed.js

# Start the backend server
npm start
```

### Railway PostgreSQL Setup

1. Go to [railway.app](https://railway.app) — create a new project
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Click the PostgreSQL service → **"Connect"** tab
4. Copy the **"Postgres Connection URL"** (starts with `postgresql://`)
5. Paste it as `DATABASE_URL` in `backend/.env`
6. Run `npx prisma migrate dev --name init` to create the schema

### ML Dataset

```bash
cd ml/data

# Generate synthetic footfall data (2920 rows)
python generate_dataset.py

# Output: footfall_dataset.csv
```

## 📡 API Endpoints

Import `postman/PilgrimSafe.postman_collection.json` into Postman for the complete API specification.

| Folder | Endpoints | Description |
|--------|-----------|-------------|
| Auth | 4 | Register, Login, Profile, Logout |
| Queue | 5 | Book slot, Status, My bookings, Cancel, Availability |
| Sensor | 3 | Latest data, Push reading, History |
| Alert | 5 | Trigger, Broadcast, Active alerts, Resolve, SOS |
| ML Prediction | 2 | 7-day forecast, Surge flag |
| Analytics | 3 | Footfall stats, Peak days, Export |

## 🗃️ Database Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `temples` | 4 Gujarat pilgrimage sites | name, slug, lat/lng, capacity |
| `users` | Devotees + staff | name, phone, role, isAccessible |
| `queues` | Time slots per temple/day | timeSlot, totalCapacity, currentToken |
| `slots` | Individual bookings | tokenNumber, peopleCount, status |
| `alerts` | Emergency broadcasts | type, severity, isActive |
| `zones` | Temple map zones | zoneId, label, capacity |
| `sensors` | IoT crowd readings | density, status, currentCount |

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------:|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 |
| UI Components | Shadcn/ui + Lucide Icons + Recharts |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Railway) + Prisma ORM |
| Caching | Redis |
| Real-time | Socket.io |
| Auth | JWT (JSON Web Tokens) |
| ML | Python (scikit-learn / XGBoost) |

## 📄 License

This project is for educational purposes — Gujarat Pilgrimage Crowd Management System.
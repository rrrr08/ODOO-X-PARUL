# Traveloop 🌍
**A Premium, Database-Driven Travel Planning Platform**

Traveloop is a production-grade travel itinerary builder designed for seamless trip planning, community sharing, and financial tracking. Built with **Next.js 15**, **FastAPI (AI Engine)**, and **Prisma**, it delivers a highly dynamic and interactive user experience.

---

## ✨ Key Features

### 📅 Advanced Itinerary Builder
- **Daily Breakdown**: Automatic day-by-day activity grouping (Day 1, Day 2, etc.).
- **Smart Filtering**: Geographic awareness ensures activities are only added to relevant city stops.
- **DND Organization**: Drag-and-drop stop reordering for flexible planning.

### 💰 Financial & Physical Tracking
- **Budgeting per Section**: Set budgets for specific cities/stops.
- **Actual Expense Tracking**: Log expenses against your budget in real-time.
- **Intensity Mapping**: Categorize activities by physical effort (Low, Medium, High).

### 🚀 Smart Dashboard
- **Trip Categorization**: Automated grouping into **Ongoing**, **Upcoming**, and **Completed** trips.
- **Shared Itineraries**: Publicly shareable trips with unique share links for the community.
- **Admin Analytics**: Real-time stats on users, trips, and top destinations.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Next.js API Routes & FastAPI (Microservices Ready).
- **Database**: PostgreSQL 16 with Prisma ORM.
- **Auth**: NextAuth.js (JWT Strategy).
- **State Management**: TanStack Query (React Query) v5.

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 16 instance

### 2. Environment Setup
Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/traveloop"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-secret"
```

### 3. Installation & Database Sync
```bash
# Install dependencies
npm install

# Push schema to DB
npx prisma db push

# Seed initial data (Cities, Activities, Test Users)
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 🧪 Testing & Quality
- **Linting**: `npm run lint`
- **Build Validation**: `npm run build`
- **Security**: Environment variables protected via `.env`.

---

## 📸 Design Alignment
The UI is strictly aligned with the professional **Excalidraw Design System**, featuring:
- Premium Dark/Indigo color palette.
- Glassmorphic UI elements.
- Responsive, mobile-first layouts.

---

Generated with 💜 by **Antigravity AI**

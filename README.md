# 📦 Lockbox | Indian Stock Market Research & Portfolio OS

Lockbox is a high-performance, real-time research platform for Indian retail investors. It provides institutional-grade analytics, portfolio tracking, and market monitoring across **NSE and BSE**.

---

## 🚀 Key Features

*   **Real-time Market Ticker**: Live price updates for NSE and BSE stocks via Supabase Realtime.
*   **Portfolio Management**: Comprehensive tracking of holdings, P&L, and performance analytics.
*   **Advanced Screener**: Filter thousands of Indian stocks using fundamentals, technicals, and AI-powered natural language queries.
*   **Research Dashboard**: Track promoter buying, institutional moves (Whales), capex announcements, and mergers.
*   **AI Analyst**: Integrated AI analysis for stock deep-dives and portfolio health checks.
*   **Macro & Raw Materials**: Monitor global indicators and raw material prices impacting Indian sectors.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite) + TypeScript + TanStack Query + Zustand + Tailwind CSS.
*   **Backend**: Node.js + Express + Supabase (Auth & Postgres).
*   **Realtime**: Supabase Realtime + Socket.io.
*   **Deployment**: Vercel (Frontend) + Railway/Render (Backend).

---

## 📋 Infrastructure & Database Setup

The platform has migrated to a **Supabase-native architecture** for high availability and low latency.

### 1. Database Configuration
Before running the app, you MUST configure your Supabase instance:
*   Follow the **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** guide.
*   Run the **[SUPABASE_PRODUCTION_SCHEMA.sql](./SUPABASE_PRODUCTION_SCHEMA.sql)** in your SQL Editor.

### 2. Environment Variables
Ensure you have the following in your `.env` files:

#### Frontend (`/client/.env`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:4000
```

#### Backend (`/server/.env`)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=4000
```

---

## 🏗️ Getting Started

### 1. Install Dependencies
```bash
npm install          # Install monorepo dependencies
cd client && npm install
cd ../server && npm install
```

### 2. Run Development Servers
**Start Backend:**
```bash
cd server
npm run dev
```

**Start Frontend:**
```bash
cd client
npm run dev
```

---

## 📱 Mobile & Desktop
The UI is fully responsive, optimized for both 4K monitors and mobile research workflows.

## 📄 License
MIT © Lockbox Markets

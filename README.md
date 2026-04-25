# Lockbox Markets

Full-stack Indian Stock Market Research and Portfolio Tracking application inspired by Tijori-style workflows.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind + TanStack Query + Zustand + Recharts
- Backend: Node.js + Express + PostgreSQL + Redis + JWT + Socket.io
- Payments: Razorpay subscription hooks (API scaffold)

## Project Structure

- `client` React frontend
- `server` Express backend
- `server/sql` database schema and migrations

## Quick Start

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

### 3. Run database migrations

```bash
cd server
npm run migrate
```

### 4. Start development servers

```bash
cd client
npm run dev
```

```bash
cd server
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

## Implemented API Surface

- Auth: signup, login, refresh rotation, logout, me, OTP endpoints
- Stocks: search, overview, prices, financials, shareholding, peers, news, results
- Market: indices, gainers, losers, most-active, heatmap
- Screener: filter, popular queries, saved queries (premium)
- Portfolio: CRUD, holdings, performance
- Watchlist: CRUD, stock add/remove
- Alerts: CRUD, toggle
- Ideas: promoter buying, whale buying, capex, mergers, fundamentals
- Macro & Raw Materials
- Timeline feed with pagination filters
- Billing: Razorpay subscription + webhook routes

## Notes

- Backend supports database mode via `DATABASE_URL` and Redis via `REDIS_URL`.
- If DB/Redis are not configured, the app falls back to in-memory/sample datasets for local development.
- WebSocket live prices are emitted on `price:update` every 5 seconds.

## Deployment Targets

- Frontend: Vercel / Netlify
- Backend: Railway / Render / AWS EC2
- Database: Supabase Postgres
- Cache: Upstash Redis

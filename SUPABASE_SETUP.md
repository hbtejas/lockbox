# 🛠️ Supabase Setup & Configuration Guide

This guide ensures your Supabase instance is correctly configured to support the **Lockbox** real-time stock research platform.

---

## 1. Database Schema (MANDATORY)

The application depends on a specific Postgres schema for Realtime price streaming and Auth profiles.

1.  Open your [Supabase Dashboard](https://app.supabase.com/).
2.  Go to the **SQL Editor** in the left sidebar.
3.  Create a **New Query**.
4.  Copy the entire content of the file: `SUPABASE_PRODUCTION_SCHEMA.sql` (located in the root of this project).
5.  Paste it into the editor and click **Run**.

> [!IMPORTANT]
> This script is idempotent. You can run it multiple times safely. It will create tables, enable Row Level Security (RLS), and seed the initial Nifty 50 data.

---

## 2. Enable Realtime Replication

The app uses Supabase Realtime to stream stock prices directly to the UI without refreshing.

1.  Go to **Database** -> **Replication**.
2.  Click the **'supabase_realtime'** publication.
3.  Ensure the following tables are enabled (toggled **ON**):
    *   `live_prices`
    *   `portfolio_holdings`
    *   `watchlist_items`
    *   `alerts`

---

## 3. Authentication Configuration

To allow users to log in and stay logged in:

1.  Go to **Auth** -> **URL Configuration**.
2.  **Site URL:** Set to `https://lockbox-nine.vercel.app` (or your custom domain).
3.  **Redirect URLs:** Add the following:
    *   `http://localhost:5173/**` (for local development)
    *   `https://lockbox-nine.vercel.app/**`

---

## 4. Environment Variables

Ensure your `.env` files are updated with your Supabase credentials.

### Frontend (`client/.env`)
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend-api.railway.app
```

### Backend (`server/.env`)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLIENT_URL=https://lockbox-nine.vercel.app
```

---

## 5. Row Level Security (RLS)

All user data (Portfolios, Watchlists) is protected by RLS. 
*   **Public Tables:** `companies`, `live_prices`, `stock_prices` (anyone can read).
*   **Private Tables:** `portfolios`, `watchlists`, `alerts` (users can only see/edit their own data).

If you cannot see your portfolio after adding a stock, ensure you are logged in and that the `user_id` in the table matches your Auth UUID.

---

## 6. Real-time Price Ticker (NSE/BSE)

The backend service `LiveMarketService` periodically updates the `live_prices` table.
*   The frontend uses the `useLivePrice` hook to listen for changes on specific symbols.
*   To add more stocks (BSE or Midcaps), simply add a row to the `companies` table and the backend will automatically start "ticking" it.

---

### 🚀 Troubleshooting
*   **Blank Market Table?** Ensure the `live_prices` table has data. Run the Seed section of the SQL script.
*   **404 on Refresh?** This is handled by `vercel.json` rewrites. If running locally, ensure you are using `react-router-dom`.
*   **Realtime not working?** Check the Browser Console. If you see a "WebSocket connection failed" error, verify that you enabled replication for the `live_prices` table in Step 2.

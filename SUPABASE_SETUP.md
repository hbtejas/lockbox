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

## 🚀 The "Master Fix" Prompt
If you are starting from a blank project or a broken state, copy this prompt and give it to an AI agent (like Cursor, Claude, or ChatGPT) with your repo open:

> "I need to initialize my Supabase backend for the Lockbox platform. Please execute the `SUPABASE_PRODUCTION_SCHEMA.sql` script to create the tables for Profiles, Portfolios, Watchlists, and Live Prices. Ensure that Row Level Security (RLS) is enabled for user tables and that Realtime replication is enabled for the `live_prices` and `portfolio_holdings` tables. Finally, verify that the `handle_new_user` trigger is active so that auth signups automatically create database profiles."

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

---

## 🛠️ Essential Fix Queries (SQL snippets)

If you encounter specific errors, run these targeted queries in the SQL Editor:

### Fix A: Reset & Re-enable RLS (If access is denied)
```sql
-- Disable and Re-enable RLS to clear any "sticky" policies
ALTER TABLE public.portfolios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Ensure "Select" policy is correct
CREATE POLICY "Users can see their own portfolios" 
ON public.portfolios FOR SELECT 
USING (auth.uid() = user_id);
```

### Fix B: Force Realtime Activation
```sql
-- Manually add a table to the realtime publication if it's not showing updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_prices;
```

### Fix C: Sync Auth Users (If signups aren't creating profiles)
```sql
-- Manually sync any missing users from auth.users to public.profiles
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

---

## 📋 Complete DB Checklist
1. [ ] **Tables Created**: `profiles`, `companies`, `live_prices`, `portfolios`, `watchlists`, `alerts`.
2. [ ] **Triggers Active**: `handle_new_user` (check under Database -> Triggers).
3. [ ] **RLS Enabled**: Check the lock icon next to tables in the Table Editor.
4. [ ] **Publication Configured**: `supabase_realtime` contains all 4 required tables.
5. [ ] **API Access**: `anon` role has `SELECT` permission on `live_prices` and `companies`.

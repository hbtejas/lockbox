# Supabase Dashboard Configuration Checklist

Follow these steps in your [Supabase Dashboard](https://supabase.com/dashboard/projects) to ensure the platform functions correctly.

### 1. Database Initialization
- [ ] **SQL Editor**: Create a new query, paste the contents of `SUPABASE_MASTER_SCHEMA.sql` and click **Run**.
- [ ] **Verification**: Go to **Table Editor** and verify you see `profiles`, `companies`, `portfolios`, and `stock_prices` tables.

### 2. Authentication Settings
- [ ] **Providers**: Go to **Authentication > Providers** and ensure **Email** is enabled.
- [ ] **Confirm Email**: (Optional for Dev/Testing) Go to **Authentication > Settings** and toggle **Confirm email** to OFF if you want users to log in immediately after signup without checking their inbox.
- [ ] **Site URL**: In **Authentication > Settings**, update the **Site URL** to your Vercel production URL (e.g., `https://lockbox-app.vercel.app`).

### 3. API & Security (Secrets)
- [ ] **Service Role Key**: Go to **Project Settings > API**. 
    - Copy the `service_role` key (secret). 
    - **Do NOT** share this. Put it in your **Backend (Server)** `.env` as `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] **Anon Key**: Copy the `anon` (public) key. Put it in your **Client (Vercel)** environment variables as `VITE_SUPABASE_ANON_KEY`.

### 4. Enable Realtime (Optional)
- [ ] Go to **Database > Replication**.
- [ ] Click on the **'supabase_realtime'** publication.
- [ ] Toggle the switch for the `companies` and `news_feed` tables to **ON**.

### 5. Storage (For Logos)
- [ ] Go to **Storage**.
- [ ] Create a new bucket named `company-logos`.
- [ ] Set the bucket to **Public**.

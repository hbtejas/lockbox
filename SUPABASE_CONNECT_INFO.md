# Supabase Connection details Needed

To fully connect the application, please provide or fill in the following values in your `.env` files:

### 1. Frontend (.env.local)
These are used for Client-side authentication.
- **VITE_SUPABASE_URL**: `https://vzzknsmzcfprjbogzite.supabase.co` (Already set)
- **VITE_SUPABASE_ANON_KEY**: `sb_publishable_Dq17vesHl5hIfCdle0cSQg_quwtB4o6` (Already set)

### 2. Backend (.env)
These are used for Database connection and Admin tasks.
- **SUPABASE_URL**: `https://vzzknsmzcfprjbogzite.supabase.co`
- **SUPABASE_SERVICE_ROLE_KEY**: Obtain this from *Settings > API* in your Supabase Dashboard.
- **DATABASE_URL**: Format: `postgres://postgres:[YOUR-PASSWORD]@db.vzzknsmzcfprjbogzite.supabase.co:5432/postgres`

### 3. Supabase Dashboard Configuration
- [ ] **Enable Email Auth**: Go to *Authentication > Providers* and ensure **Email** is enabled.
- [ ] **Database Tables**: Ensure you have the following tables in the `public` schema:
    - `users`
    - `portfolios`
    - `holdings`
- [ ] **RLS Policies**: If you enable Row Level Security, ensure users can only read/write their own data.

> [!NOTE]
> I have already refactored the code to use these connection strings. Once you update the secrets, the app will be fully live.

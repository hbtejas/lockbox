# Supabase Integration Checklist — Lockbox Platform

To connect Lockbox with Supabase for Database and Authentication, follow this systematic integration list.

## 1. Setup & Configuration
- [x] **Install Dependencies**: `npm install @supabase/supabase-js` (Done in client/server)
- [x] **Client Environment Variables**: Created `client/.env.local` with your Supabase credentials.
- [x] **Server Environment Variables**: Configured `server/.env` with placeholders for DB URL and Service Role Key.

## 2. Frontend Integration (Vite + React)
- [x] **Supabase Client Initialization**: Created `client/src/lib/supabase.ts`.
- [x] **Auth Refactoring**:
    - [x] Replaced custom `authApi.ts` calls with `supabase.auth` SDK methods.
    - [x] Updated `authStore.ts` (Zustand) to automatically sync via `onAuthStateChange`.
- [x] **UI Polish**: Overhauled `LoginPage` and `SignupPage` to use the new auth flow with a premium look.

## 3. Backend Integration (Express + Node.js)
- [x] **Database Link**: `DATABASE_URL` structure updated in `.env` to point to Supabase.
- [x] **Auth Middleware**: Refactored `server/src/middleware/auth.js` to verify Supabase JWTs.
- [ ] **Schema Check**: User must confirm/create tables (`users`, `portfolios`) in the Supabase public schema.

## 4. Verification
- [ ] **Auth Flow**: Register a new user and see them appear in the Supabase Dashboard.
- [ ] **Data Flow**: Verify database access through Express.

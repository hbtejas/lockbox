# Deployment Guide — Lockbox Platform

This document outlines how to deploy the Lockbox platform to production using Vercel (Frontend) and Render/Railway (Backend).

## 1. Frontend (Vercel)
Vercel is optimized for the React/Vite frontend.

### Steps to Deploy:
1.  **Connect GitHub**: Connect your `hbtejas/lockbox` repository to Vercel.
2.  **Root Directory**: Set the root directory to `client` OR keep it at the root and set the **Build Command** to `npm run build:client` (from the root package.json).
3.  **Environment Variables**:
    - `VITE_SUPABASE_URL`: Your Supabase URL.
    - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
    - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://lockbox-api.onrender.com/api`).
4.  **Framework Preset**: Select **Vite**.

## 2. Backend (Render / Railway)
Since the backend uses **WebSockets (Socket.io)** and **Express**, Vercel Serverless is not recommended. Use Render or Railway for a "serverful" experience.

### Steps to Deploy:
1.  **Connect GitHub**: Connect the repository.
2.  **Root Directory**: Set to `server`.
3.  **Build Command**: `npm install`.
4.  **Start Command**: `npm start`.
5.  **Environment Variables**:
    - `DATABASE_URL`: Your Supabase PostgreSQL string.
    - `SUPABASE_URL`: Your Supabase URL.
    - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Secret Key.
    - `JWT_ACCESS_SECRET`: A secure random string.
    - `CLIENT_URL`: Your Vercel frontend URL (e.g., `https://lockbox.vercel.app`).
    - `ANTHROPIC_API_KEY`: Your Claude AI key.

## 3. Configuration Sync
Ensure the `CLIENT_URL` in the backend matches the Vercel URL to allow CORS (Cross-Origin Resource Sharing).

---

### Why not deploy Backend on Vercel?
Vercel functions have a 10s-60s timeout and **do not support WebSockets**. For real-time price tickers to work, the backend must be hosted on a platform that supports persistent connections.

-- =========================================================
-- LOCKBOX — COMPLETE SUPABASE SCHEMA (PRODUCTION-READY)
-- Run this in Supabase SQL Editor.
-- It is idempotent: safe to re-run on an existing DB.
-- =========================================================

-- ─── EXTENSIONS ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. PROFILES (extends Supabase Auth) ─────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name         VARCHAR(100),
  email        VARCHAR(255) UNIQUE NOT NULL,
  plan         VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'elite')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 2. COMPANIES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.companies (
  id                   SERIAL PRIMARY KEY,
  symbol               VARCHAR(20) UNIQUE NOT NULL,
  name                 VARCHAR(200) NOT NULL,
  exchange             VARCHAR(10) DEFAULT 'NSE',
  sector               VARCHAR(100),
  industry             VARCHAR(100),
  market_cap_category  VARCHAR(20) CHECK (market_cap_category IN ('largecap', 'midcap', 'smallcap')),
  isin                 VARCHAR(20),
  logo_url             TEXT,
  is_active            BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. STOCK PRICES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stock_prices (
  id         BIGSERIAL PRIMARY KEY,
  symbol     VARCHAR(20) REFERENCES public.companies(symbol) ON DELETE CASCADE,
  date       DATE NOT NULL,
  open       NUMERIC(14,4),
  high       NUMERIC(14,4),
  low        NUMERIC(14,4),
  close      NUMERIC(14,4),
  volume     BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol, date)
);

-- ─── 4. LIVE PRICES (for Realtime) ────────────────────────
-- This table drives Supabase Realtime streaming to the frontend.
-- Your backend (or a cron job) UPSERTS into this table every few seconds.
CREATE TABLE IF NOT EXISTS public.live_prices (
  symbol       VARCHAR(20) PRIMARY KEY REFERENCES public.companies(symbol) ON DELETE CASCADE,
  price        NUMERIC(14,4) NOT NULL,
  change       NUMERIC(10,4),
  change_pct   NUMERIC(8,4),
  volume       BIGINT,
  high         NUMERIC(14,4),
  low          NUMERIC(14,4),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. PORTFOLIOS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolios (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL DEFAULT 'My Portfolio',
  is_default   BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_portfolios_updated_at ON public.portfolios;
CREATE TRIGGER set_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ─── 6. PORTFOLIO HOLDINGS ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id             SERIAL PRIMARY KEY,
  portfolio_id   UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol         VARCHAR(20) NOT NULL REFERENCES public.companies(symbol),
  quantity       NUMERIC(14,4) NOT NULL,
  avg_buy_price  NUMERIC(14,4) NOT NULL,
  buy_date       DATE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_holdings_updated_at ON public.portfolio_holdings;
CREATE TRIGGER set_holdings_updated_at
  BEFORE UPDATE ON public.portfolio_holdings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ─── 7. WATCHLISTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.watchlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL DEFAULT 'My Watchlist',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_watchlists_updated_at ON public.watchlists;
CREATE TRIGGER set_watchlists_updated_at
  BEFORE UPDATE ON public.watchlists
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id           SERIAL PRIMARY KEY,
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol       VARCHAR(20) NOT NULL REFERENCES public.companies(symbol),
  added_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(watchlist_id, symbol)
);

-- ─── 8. ALERTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol        VARCHAR(20) NOT NULL,
  alert_type    VARCHAR(30) NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'change_pct')),
  trigger_value NUMERIC(14,4) NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  triggered_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_alerts_updated_at ON public.alerts;
CREATE TRIGGER set_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ─── 9. RESULTS CALENDAR ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.results_calendar (
  id           SERIAL PRIMARY KEY,
  symbol       VARCHAR(20),
  result_date  DATE,
  period       VARCHAR(20),
  result_type  VARCHAR(20),
  has_concall  BOOLEAN DEFAULT false,
  concall_time TIMESTAMPTZ
);

-- ─── 10. AI TABLES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE SET NULL,
  symbol       VARCHAR(20),
  type         VARCHAR(50) NOT NULL,
  result       TEXT NOT NULL,
  tokens_used  INT NOT NULL DEFAULT 0,
  model        VARCHAR(120) NOT NULL DEFAULT 'claude-sonnet-4-6',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FIXED: portfolio_id is now nullable (was NOT NULL which crashed on new users)
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,  -- nullable!
  role         VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 11. INDEXES ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_email              ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_companies_symbol            ON public.companies(symbol);
CREATE INDEX IF NOT EXISTS idx_companies_sector            ON public.companies(sector);
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_date    ON public.stock_prices(symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_live_prices_updated_at      ON public.live_prices(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id          ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id       ON public.portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_symbol             ON public.portfolio_holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id          ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist   ON public.watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id              ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_symbol               ON public.alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user            ON public.ai_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_user_portfolio      ON public.ai_chat_messages(user_id, portfolio_id);

-- ─── 12. ROW LEVEL SECURITY (RLS) ─────────────────────────
-- Enable RLS on all user-owned tables
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages   ENABLE ROW LEVEL SECURITY;

-- Companies and stock prices are public read
ALTER TABLE public.companies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_prices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_prices       ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (safe re-run)
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- profiles: users can read/update only their own
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- portfolios
CREATE POLICY "portfolios_all_own" ON public.portfolios FOR ALL USING (auth.uid() = user_id);

-- portfolio_holdings (access via portfolio ownership)
CREATE POLICY "holdings_all_own" ON public.portfolio_holdings FOR ALL
  USING (portfolio_id IN (SELECT id FROM public.portfolios WHERE user_id = auth.uid()));

-- watchlists
CREATE POLICY "watchlists_all_own" ON public.watchlists FOR ALL USING (auth.uid() = user_id);

-- watchlist_items (access via watchlist ownership)
CREATE POLICY "watchlist_items_all_own" ON public.watchlist_items FOR ALL
  USING (watchlist_id IN (SELECT id FROM public.watchlists WHERE user_id = auth.uid()));

-- alerts
CREATE POLICY "alerts_all_own" ON public.alerts FOR ALL USING (auth.uid() = user_id);

-- ai tables
CREATE POLICY "ai_analyses_all_own"      ON public.ai_analyses      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "ai_chat_messages_all_own" ON public.ai_chat_messages  FOR ALL USING (auth.uid() = user_id);

-- companies/prices: publicly readable
CREATE POLICY "companies_public_read"    ON public.companies    FOR SELECT USING (true);
CREATE POLICY "stock_prices_public_read" ON public.stock_prices FOR SELECT USING (true);
CREATE POLICY "live_prices_public_read"  ON public.live_prices  FOR SELECT USING (true);

-- ─── 13. REALTIME SETUP ───────────────────────────────────
-- Enable REPLICA IDENTITY FULL for realtime to receive full row data on UPDATE/DELETE
ALTER TABLE public.live_prices       REPLICA IDENTITY FULL;
ALTER TABLE public.portfolio_holdings REPLICA IDENTITY FULL;
ALTER TABLE public.watchlist_items   REPLICA IDENTITY FULL;
ALTER TABLE public.alerts            REPLICA IDENTITY FULL;

-- Add tables to the Supabase Realtime publication
-- (Supabase creates this publication by default; we just add tables to it)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'live_prices'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_prices;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'portfolio_holdings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_holdings;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
  END IF;
END $$;

-- ─── 14. SEED DATA — NIFTY 50 COMPANIES ──────────────────
-- Without this, the app shows blank data everywhere.
INSERT INTO public.companies (symbol, name, exchange, sector, industry, market_cap_category) VALUES
  ('RELIANCE',   'Reliance Industries Ltd',          'NSE', 'Energy',              'Oil & Gas Refining',       'largecap'),
  ('TCS',        'Tata Consultancy Services Ltd',     'NSE', 'Information Technology','IT Services & Consulting','largecap'),
  ('HDFCBANK',   'HDFC Bank Ltd',                    'NSE', 'Financial Services',  'Private Sector Bank',      'largecap'),
  ('INFY',       'Infosys Ltd',                      'NSE', 'Information Technology','IT Services & Consulting','largecap'),
  ('ICICIBANK',  'ICICI Bank Ltd',                   'NSE', 'Financial Services',  'Private Sector Bank',      'largecap'),
  ('HINDUNILVR', 'Hindustan Unilever Ltd',           'NSE', 'FMCG',               'Personal Products',        'largecap'),
  ('ITC',        'ITC Ltd',                          'NSE', 'FMCG',               'Cigarettes & Tobacco',     'largecap'),
  ('SBIN',       'State Bank of India',              'NSE', 'Financial Services',  'Public Sector Bank',       'largecap'),
  ('BHARTIARTL', 'Bharti Airtel Ltd',                'NSE', 'Communication',       'Telecom',                  'largecap'),
  ('KOTAKBANK',  'Kotak Mahindra Bank Ltd',          'NSE', 'Financial Services',  'Private Sector Bank',      'largecap'),
  ('LT',         'Larsen & Toubro Ltd',              'NSE', 'Industrials',         'Construction & Engineering','largecap'),
  ('AXISBANK',   'Axis Bank Ltd',                    'NSE', 'Financial Services',  'Private Sector Bank',      'largecap'),
  ('ASIANPAINT', 'Asian Paints Ltd',                 'NSE', 'Materials',           'Paints',                   'largecap'),
  ('MARUTI',     'Maruti Suzuki India Ltd',          'NSE', 'Consumer Discretionary','Automobiles',            'largecap'),
  ('SUNPHARMA',  'Sun Pharmaceutical Industries Ltd','NSE', 'Healthcare',          'Pharmaceuticals',          'largecap'),
  ('TITAN',      'Titan Company Ltd',                'NSE', 'Consumer Discretionary','Watches & Accessories',  'largecap'),
  ('ULTRACEMCO', 'UltraTech Cement Ltd',             'NSE', 'Materials',           'Cement',                   'largecap'),
  ('BAJFINANCE', 'Bajaj Finance Ltd',                'NSE', 'Financial Services',  'NBFC',                     'largecap'),
  ('WIPRO',      'Wipro Ltd',                        'NSE', 'Information Technology','IT Services & Consulting','largecap'),
  ('HCLTECH',    'HCL Technologies Ltd',             'NSE', 'Information Technology','IT Services & Consulting','largecap'),
  ('NTPC',       'NTPC Ltd',                         'NSE', 'Utilities',           'Power Generation',         'largecap'),
  ('POWERGRID',  'Power Grid Corporation of India',  'NSE', 'Utilities',           'Power Transmission',       'largecap'),
  ('ONGC',       'Oil and Natural Gas Corporation',  'NSE', 'Energy',              'Oil & Gas Exploration',    'largecap'),
  ('NESTLEIND',  'Nestle India Ltd',                 'NSE', 'FMCG',               'Packaged Foods',            'largecap'),
  ('TATAMOTORS', 'Tata Motors Ltd',                  'NSE', 'Consumer Discretionary','Automobiles',            'largecap'),
  ('TATASTEEL',  'Tata Steel Ltd',                   'NSE', 'Materials',           'Steel',                    'largecap'),
  ('ADANIENT',   'Adani Enterprises Ltd',            'NSE', 'Industrials',         'Diversified',              'largecap'),
  ('ADANIPORTS', 'Adani Ports & SEZ Ltd',            'NSE', 'Industrials',         'Ports & Logistics',        'largecap'),
  ('TECHM',      'Tech Mahindra Ltd',                'NSE', 'Information Technology','IT Services & Consulting','largecap'),
  ('JSWSTEEL',   'JSW Steel Ltd',                    'NSE', 'Materials',           'Steel',                    'largecap'),
  ('HDFCLIFE',   'HDFC Life Insurance Company Ltd',  'NSE', 'Financial Services',  'Life Insurance',           'largecap'),
  ('BAJAJFINSV', 'Bajaj Finserv Ltd',                'NSE', 'Financial Services',  'Diversified Financial',    'largecap'),
  ('CIPLA',      'Cipla Ltd',                        'NSE', 'Healthcare',          'Pharmaceuticals',          'largecap'),
  ('DRREDDY',    'Dr Reddys Laboratories Ltd',       'NSE', 'Healthcare',          'Pharmaceuticals',          'largecap'),
  ('GRASIM',     'Grasim Industries Ltd',            'NSE', 'Materials',           'Diversified',              'largecap'),
  ('DIVISLAB',   'Divi Laboratories Ltd',            'NSE', 'Healthcare',          'Pharmaceuticals',          'largecap'),
  ('EICHERMOT',  'Eicher Motors Ltd',                'NSE', 'Consumer Discretionary','Two Wheelers',           'largecap'),
  ('APOLLOHOSP', 'Apollo Hospitals Enterprise Ltd',  'NSE', 'Healthcare',          'Hospitals',                'largecap'),
  ('COALINDIA',  'Coal India Ltd',                   'NSE', 'Energy',              'Coal Mining',              'largecap'),
  ('INDUSINDBK', 'IndusInd Bank Ltd',                'NSE', 'Financial Services',  'Private Sector Bank',      'largecap'),
  ('SBILIFE',    'SBI Life Insurance Company Ltd',   'NSE', 'Financial Services',  'Life Insurance',           'largecap'),
  ('TATACONSUM', 'Tata Consumer Products Ltd',       'NSE', 'FMCG',               'Beverages',                'largecap'),
  ('HINDALCO',   'Hindalco Industries Ltd',          'NSE', 'Materials',           'Aluminum',                 'largecap'),
  ('VEDL',       'Vedanta Ltd',                      'NSE', 'Materials',           'Diversified Metals',       'largecap'),
  ('ZYDUSLIFE',  'Zydus Lifesciences Ltd',           'NSE', 'Healthcare',          'Pharmaceuticals',          'largecap'),
  ('BPCL',       'Bharat Petroleum Corporation Ltd', 'NSE', 'Energy',              'Oil Marketing',            'largecap'),
  ('BRITANNIA',  'Britannia Industries Ltd',         'NSE', 'FMCG',               'Packaged Foods',            'largecap'),
  ('HEROMOTOCO', 'Hero MotoCorp Ltd',                'NSE', 'Consumer Discretionary','Two Wheelers',           'largecap'),
  ('PIDILITIND', 'Pidilite Industries Ltd',          'NSE', 'Materials',           'Adhesives',                'largecap'),
  ('SHREECEM',   'Shree Cement Ltd',                 'NSE', 'Materials',           'Cement',                   'largecap')
ON CONFLICT (symbol) DO NOTHING;

-- Seed mock live_prices so the market overview page is not blank
INSERT INTO public.live_prices (symbol, price, change, change_pct, volume) VALUES
  ('RELIANCE',   2450.75,  12.30,  0.50, 8521430),
  ('TCS',        3780.50, -22.10, -0.58, 2341200),
  ('HDFCBANK',   1680.25,   8.90,  0.53, 5612300),
  ('INFY',       1450.80,  -5.60, -0.38, 3421000),
  ('ICICIBANK',  1120.30,  15.40,  1.39, 7832100),
  ('SBIN',        620.45,   3.20,  0.52, 12341000),
  ('BHARTIARTL', 1890.60,  25.30,  1.36, 4123400),
  ('KOTAKBANK',  1740.20,  -8.70, -0.50, 1923100),
  ('LT',         3450.90,  18.60,  0.54, 1234500),
  ('AXISBANK',   1145.30,  12.80,  1.13, 6234100)
ON CONFLICT (symbol) DO UPDATE SET
  price      = EXCLUDED.price,
  change     = EXCLUDED.change,
  change_pct = EXCLUDED.change_pct,
  volume     = EXCLUDED.volume,
  updated_at = NOW();

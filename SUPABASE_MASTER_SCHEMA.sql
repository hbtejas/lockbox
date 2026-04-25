-- =========================================================
-- LOCKBOX SUPABASE MASTER SCHEMA
-- Paste this script into the Supabase SQL Editor to initialize your database.
-- =========================================================

-- 1. Create a "profiles" table to extend Supabase Auth Users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Logic to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Core Platform Tables
CREATE TABLE public.companies (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  exchange VARCHAR(10),
  sector VARCHAR(100),
  industry VARCHAR(100),
  market_cap_category VARCHAR(20),
  isin VARCHAR(20),
  logo_url TEXT
);

CREATE TABLE public.stock_prices (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(20) REFERENCES public.companies(symbol),
  date DATE NOT NULL,
  open DECIMAL(12,2),
  high DECIMAL(12,2),
  low DECIMAL(12,2),
  close DECIMAL(12,2),
  volume BIGINT,
  UNIQUE(symbol, date)
);

CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(100),
  is_default BOOLEAN DEFAULT false
);

CREATE TABLE public.portfolio_holdings (
  id SERIAL PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol VARCHAR(20),
  quantity DECIMAL(10,2),
  avg_buy_price DECIMAL(12,2),
  buy_date DATE
);

CREATE TABLE public.watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(100)
);

CREATE TABLE public.watchlist_items (
  id SERIAL PRIMARY KEY,
  watchlist_id UUID REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol VARCHAR(20),
  added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE public.alerts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol VARCHAR(20),
  alert_type VARCHAR(20),
  trigger_value DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMP
);

CREATE TABLE public.results_calendar (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20),
  result_date DATE,
  period VARCHAR(20),
  result_type VARCHAR(20),
  has_concall BOOLEAN DEFAULT false,
  concall_time TIMESTAMP
);

-- 4. AI & Analytics Tables
CREATE TABLE public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE SET NULL,
  symbol VARCHAR(20),
  type VARCHAR(50) NOT NULL,
  result TEXT NOT NULL,
  tokens_used INT NOT NULL DEFAULT 0,
  model VARCHAR(120) NOT NULL DEFAULT 'claude-3-sonnet',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Indexes for Performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_companies_symbol ON public.companies(symbol);
CREATE INDEX idx_stock_prices_symbol_date ON public.stock_prices(symbol, date DESC);
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_portfolio_holdings_portfolio_id ON public.portfolio_holdings(portfolio_id);
CREATE INDEX idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX idx_ai_analyses_user_id ON public.ai_analyses(user_id);
CREATE INDEX idx_ai_chat_messages_user_portfolio ON public.ai_chat_messages(user_id, portfolio_id);

-- Enable RLS (Optional but recommended for Production)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
-- ... add policies ...

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  plan VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
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

CREATE TABLE IF NOT EXISTS stock_prices (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(20) REFERENCES companies(symbol),
  date DATE NOT NULL,
  open DECIMAL(12,2),
  high DECIMAL(12,2),
  low DECIMAL(12,2),
  close DECIMAL(12,2),
  volume BIGINT,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS financials (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20),
  period_type VARCHAR(10),
  period_end DATE,
  revenue DECIMAL(20,2),
  net_profit DECIMAL(20,2),
  ebitda DECIMAL(20,2),
  eps DECIMAL(10,2),
  gross_margin DECIMAL(8,4),
  net_margin DECIMAL(8,4),
  roce DECIMAL(8,4),
  roe DECIMAL(8,4),
  debt_to_equity DECIMAL(8,4),
  operating_cash_flow DECIMAL(20,2),
  capex DECIMAL(20,2),
  free_cash_flow DECIMAL(20,2)
);

CREATE TABLE IF NOT EXISTS shareholding (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20),
  quarter DATE,
  promoter_holding DECIMAL(8,4),
  fii_holding DECIMAL(8,4),
  dii_holding DECIMAL(8,4),
  mutual_fund_holding DECIMAL(8,4),
  retail_holding DECIMAL(8,4)
);

CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(100),
  is_default BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id SERIAL PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id),
  symbol VARCHAR(20),
  quantity DECIMAL(10,2),
  avg_buy_price DECIMAL(12,2),
  buy_date DATE
);

CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id SERIAL PRIMARY KEY,
  watchlist_id UUID REFERENCES watchlists(id),
  symbol VARCHAR(20),
  added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  symbol VARCHAR(20),
  alert_type VARCHAR(20),
  trigger_value DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sector_indices (
  id SERIAL PRIMARY KEY,
  index_name VARCHAR(100),
  sector VARCHAR(100),
  date DATE,
  value DECIMAL(12,2),
  change_1d DECIMAL(8,4),
  change_6m DECIMAL(8,4),
  change_1y DECIMAL(8,4)
);

CREATE TABLE IF NOT EXISTS raw_materials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  unit VARCHAR(20),
  date DATE,
  price DECIMAL(12,2),
  change_percent DECIMAL(8,4)
);

CREATE TABLE IF NOT EXISTS macro_indicators (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  date DATE,
  value DECIMAL(12,4),
  unit VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS results_calendar (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20),
  result_date DATE,
  period VARCHAR(20),
  result_type VARCHAR(20),
  has_concall BOOLEAN DEFAULT false,
  concall_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_feed (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(20),
  title TEXT,
  summary TEXT,
  source VARCHAR(100),
  url TEXT,
  type VARCHAR(50),
  published_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS screener_saved_queries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(30) NOT NULL,
  provider_subscription_id VARCHAR(120) NOT NULL,
  status VARCHAR(30) NOT NULL,
  plan VARCHAR(20) NOT NULL,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_invoice_id VARCHAR(120),
  amount DECIMAL(12,2),
  currency VARCHAR(10),
  status VARCHAR(20),
  invoice_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_symbol ON companies(symbol);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_date ON stock_prices(symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_financials_symbol_period ON financials(symbol, period_type, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_shareholding_symbol_quarter ON shareholding(symbol, quarter DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_id ON portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_symbol_active ON alerts(symbol, is_active);
CREATE INDEX IF NOT EXISTS idx_sector_indices_sector_date ON sector_indices(sector, date DESC);
CREATE INDEX IF NOT EXISTS idx_macro_indicators_category_date ON macro_indicators(category, date DESC);
CREATE INDEX IF NOT EXISTS idx_results_calendar_symbol_date ON results_calendar(symbol, result_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_feed_symbol_published_at ON news_feed(symbol, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_feed_type_published_at ON news_feed(type, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_screener_saved_queries_user_id ON screener_saved_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);

CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
  symbol VARCHAR(20),
  type VARCHAR(50) NOT NULL,
  result TEXT NOT NULL,
  tokens_used INT NOT NULL DEFAULT 0,
  model VARCHAR(120) NOT NULL DEFAULT 'claude-sonnet-4-20250514',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_portfolio_id ON ai_analyses(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_portfolio ON ai_chat_messages(user_id, portfolio_id);

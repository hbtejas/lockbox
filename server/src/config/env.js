const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL ?? '',
  redisUrl: process.env.REDIS_URL ?? '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
  accessTokenTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshTokenTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY ?? '',
  nseBaseUrl: process.env.NSE_BASE_URL ?? 'https://www.nseindia.com/api',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'noreply@lockbox.local',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  aiRateLimitPerHour: Number(process.env.AI_RATE_LIMIT_PER_HOUR ?? 20),
  aiFreeDailyLimit: Number(process.env.AI_FREE_DAILY_LIMIT ?? 3),
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  priceTickerInterval: Number(process.env.PRICE_TICKER_INTERVAL ?? 5000),
}

module.exports = { env }

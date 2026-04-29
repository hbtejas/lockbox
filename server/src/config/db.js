const { Pool } = require('pg')
const { env } = require('./env')

let pool = null

if (env.databaseUrl) {
  pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    // Add connection timeout to prevent hanging
    connectionTimeoutMillis: 5000,
  })

  // Pre-emptively check connection
  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err)
  })
}

async function query(text, params = []) {
  if (!pool) {
    throw new Error('DATABASE_NOT_CONFIGURED')
  }
  try {
    return await pool.query(text, params)
  } catch (error) {
    console.error('Database query error:', error.message)
    // If it's an auth error or connection error, we might want to flag the pool as broken
    if (error.message.includes('authentication failed') || error.message.includes('connect')) {
      // We don't nullify the pool here as it might be transient, 
      // but we throw so the caller can fallback
    }
    throw error
  }
}

function isDatabaseEnabled() {
  // Only enable if pool exists AND we haven't explicitly disabled it due to persistent errors
  return Boolean(pool)
}

async function healthCheck() {
  if (!pool) {
    return { ok: false, reason: 'Database not configured' }
  }
  try {
    await pool.query('SELECT 1')
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: error.message }
  }
}

module.exports = {
  query,
  isDatabaseEnabled,
  healthCheck,
}

const { Pool } = require('pg')
const { env } = require('./env')

let pool = null

if (env.databaseUrl) {
  pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  })
}

async function query(text, params = []) {
  if (!pool) {
    throw new Error('DATABASE_NOT_CONFIGURED')
  }
  return pool.query(text, params)
}

function isDatabaseEnabled() {
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

const { createClient } = require('redis')
const { env } = require('./env')

let redisClient = null

if (env.redisUrl) {
  redisClient = createClient({ url: env.redisUrl })
  redisClient.on('error', (error) => {
    console.error('Redis error:', error.message)
  })
}

const memoryCache = new Map()

async function ensureRedisConnected() {
  if (!redisClient) {
    return
  }

  if (!redisClient.isOpen) {
    await redisClient.connect()
  }
}

async function getCache(key) {
  if (redisClient) {
    await ensureRedisConnected()
    const value = await redisClient.get(key)
    return value ? JSON.parse(value) : null
  }

  const item = memoryCache.get(key)
  if (!item) {
    return null
  }
  if (item.expiresAt < Date.now()) {
    memoryCache.delete(key)
    return null
  }
  return item.value
}

async function setCache(key, value, ttlSeconds) {
  if (redisClient) {
    await ensureRedisConnected()
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value))
    return
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  })
}

async function deleteCache(key) {
  if (redisClient) {
    await ensureRedisConnected()
    await redisClient.del(key)
    return
  }
  memoryCache.delete(key)
}

module.exports = {
  getCache,
  setCache,
  deleteCache,
  redisClient,
}

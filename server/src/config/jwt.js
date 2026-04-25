const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { env } = require('./env')

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl })
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.refreshTokenTtl })
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret)
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret)
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
}

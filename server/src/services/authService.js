const { v4: uuidv4 } = require('uuid')
const { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt')
const { inMemoryStore } = require('../data/inMemoryStore')
const { HttpError } = require('../utils/httpError')

const REFRESH_COOKIE_NAME = 'refreshToken'

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    createdAt: user.created_at ?? user.createdAt,
  }
}

function createTokens(user) {
  const sessionId = uuidv4()

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    plan: user.plan,
  })

  const refreshToken = signRefreshToken({
    sub: user.id,
    sid: sessionId,
  })

  inMemoryStore.sessions.push({
    sessionId,
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    createdAt: Date.now(),
  })

  return {
    accessToken,
    refreshToken,
  }
}

function rotateRefreshToken(currentRefreshToken) {
  const decoded = verifyRefreshToken(currentRefreshToken)
  const session = inMemoryStore.sessions.find((entry) => entry.sessionId === decoded.sid)

  if (!session || session.tokenHash !== hashToken(currentRefreshToken)) {
    throw new HttpError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN')
  }

  inMemoryStore.sessions = inMemoryStore.sessions.filter((entry) => entry.sessionId !== decoded.sid)

  const accessToken = signAccessToken({
    sub: decoded.sub,
    email: decoded.email,
    plan: decoded.plan,
  })

  const nextSessionId = uuidv4()
  const nextRefreshToken = signRefreshToken({
    sub: decoded.sub,
    sid: nextSessionId,
  })

  inMemoryStore.sessions.push({
    sessionId: nextSessionId,
    userId: decoded.sub,
    tokenHash: hashToken(nextRefreshToken),
    createdAt: Date.now(),
  })

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    userId: decoded.sub,
  }
}

function revokeRefreshToken(token) {
  try {
    const decoded = verifyRefreshToken(token)
    inMemoryStore.sessions = inMemoryStore.sessions.filter((entry) => entry.sessionId !== decoded.sid)
  } catch {
    inMemoryStore.sessions = inMemoryStore.sessions.filter((entry) => entry.tokenHash !== hashToken(token))
  }
}

module.exports = {
  REFRESH_COOKIE_NAME,
  sanitizeUser,
  createTokens,
  rotateRefreshToken,
  revokeRefreshToken,
}

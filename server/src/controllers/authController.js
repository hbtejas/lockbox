const bcrypt = require('bcryptjs')
const { z } = require('zod')
const UserModel = require('../models/User')
const { errorResponse, successResponse } = require('../utils/response')
const {
  REFRESH_COOKIE_NAME,
  createTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  sanitizeUser,
} = require('../services/authService')
const { env } = require('../config/env')

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

async function signup(req, res) {
  try {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) {
      return errorResponse(res, parsed.error.issues[0]?.message ?? 'Invalid signup payload', 400)
    }

    const existingUser = await UserModel.findByEmail(parsed.data.email)
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 409)
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)
    const user = await UserModel.createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    })

    const normalizedUser = sanitizeUser(user)
    const { accessToken, refreshToken } = createTokens(normalizedUser)

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions())

    return successResponse(res, { accessToken, user: normalizedUser }, 201)
  } catch (error) {
    return errorResponse(res, error.message)
  }
}

async function login(req, res) {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return errorResponse(res, parsed.error.issues[0]?.message ?? 'Invalid login payload', 400)
    }

    const user = await UserModel.findByEmail(parsed.data.email)
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401)
    }

    const isPasswordValid = await bcrypt.compare(parsed.data.password, user.passwordHash)
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401)
    }

    const normalizedUser = sanitizeUser(user)
    const { accessToken, refreshToken } = createTokens(normalizedUser)

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions())
    return successResponse(res, { accessToken, user: normalizedUser })
  } catch (error) {
    return errorResponse(res, error.message)
  }
}

async function refresh(req, res) {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME] ?? req.body.refreshToken
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token missing', 401)
    }

    const { accessToken, refreshToken: rotatedRefreshToken } = rotateRefreshToken(refreshToken)
    res.cookie(REFRESH_COOKIE_NAME, rotatedRefreshToken, getRefreshCookieOptions())
    return successResponse(res, { accessToken })
  } catch (error) {
    return errorResponse(res, error.message || 'Invalid refresh token', 401)
  }
}

async function logout(req, res) {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME] ?? req.body.refreshToken
  if (refreshToken) {
    revokeRefreshToken(refreshToken)
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' })
  return successResponse(res, { loggedOut: true })
}

async function me(req, res) {
  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }
    return successResponse(res, { user: sanitizeUser(user) })
  } catch (error) {
    return errorResponse(res, error.message)
  }
}

module.exports = {
  signup,
  login,
  refresh,
  logout,
  me,
}

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

const otpStore = new Map()

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
  const parsed = signupSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, parsed.error.issues[0]?.message ?? 'Invalid signup payload', 400, 'VALIDATION_ERROR')
  }

  const existingUser = await UserModel.findByEmail(parsed.data.email)
  if (existingUser) {
    return errorResponse(res, 'Email already registered', 409, 'EMAIL_EXISTS')
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

  return successResponse(
    res,
    {
      accessToken,
      user: normalizedUser,
    },
    201,
  )
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, parsed.error.issues[0]?.message ?? 'Invalid login payload', 400, 'VALIDATION_ERROR')
  }

  const user = await UserModel.findByEmail(parsed.data.email)
  if (!user) {
    return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS')
  }

  const isPasswordValid = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS')
  }

  const normalizedUser = sanitizeUser(user)
  const { accessToken, refreshToken } = createTokens(normalizedUser)

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions())
  return successResponse(res, { accessToken, user: normalizedUser })
}

function refresh(req, res) {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME] ?? req.body.refreshToken
  if (!refreshToken) {
    return errorResponse(res, 'Refresh token missing', 401, 'REFRESH_TOKEN_MISSING')
  }

  try {
    const { accessToken, refreshToken: rotatedRefreshToken } = rotateRefreshToken(refreshToken)
    res.cookie(REFRESH_COOKIE_NAME, rotatedRefreshToken, getRefreshCookieOptions())
    return successResponse(res, { accessToken })
  } catch {
    return errorResponse(res, 'Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN')
  }
}

function logout(req, res) {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME] ?? req.body.refreshToken
  if (refreshToken) {
    revokeRefreshToken(refreshToken)
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' })
  return successResponse(res, { loggedOut: true })
}

async function me(req, res) {
  const user = await UserModel.findById(req.user.id)
  if (!user) {
    return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND')
  }

  return successResponse(res, {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    createdAt: user.created_at,
  })
}

function requestOtp(req, res) {
  const schema = z.object({ email: z.string().email() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Valid email is required', 400, 'VALIDATION_ERROR')
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000))
  otpStore.set(parsed.data.email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  })

  return successResponse(res, {
    message: 'OTP sent to email',
    otp: env.nodeEnv === 'development' ? otp : undefined,
  })
}

async function verifyOtp(req, res) {
  const schema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Invalid OTP request', 400, 'VALIDATION_ERROR')
  }

  const key = parsed.data.email.toLowerCase()
  const payload = otpStore.get(key)
  if (!payload || payload.otp !== parsed.data.otp || payload.expiresAt < Date.now()) {
    return errorResponse(res, 'Invalid or expired OTP', 401, 'INVALID_OTP')
  }

  let user = await UserModel.findByEmail(parsed.data.email)
  if (!user) {
    const passwordHash = await bcrypt.hash(`otp_${Date.now()}`, 12)
    user = await UserModel.createUser({
      name: parsed.data.email.split('@')[0],
      email: parsed.data.email,
      passwordHash,
    })
  }

  const normalizedUser = sanitizeUser(user)
  const { accessToken, refreshToken } = createTokens(normalizedUser)

  otpStore.delete(key)
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions())

  return successResponse(res, { accessToken, user: normalizedUser })
}

function googleOAuth(req, res) {
  const redirectUrl = `${env.clientUrl}/login?provider=google&status=not-configured`
  return successResponse(res, {
    message: 'Google OAuth wiring placeholder. Configure OAuth client in production.',
    redirectUrl,
  })
}

module.exports = {
  signup,
  login,
  refresh,
  logout,
  me,
  requestOtp,
  verifyOtp,
  googleOAuth,
}

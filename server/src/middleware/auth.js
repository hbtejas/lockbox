const { getSupabase } = require('../lib/supabase')
const { verifyAccessToken } = require('../config/jwt')
const { errorResponse } = require('../utils/response')

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization ?? ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return errorResponse(res, 'Missing access token', 401, 'UNAUTHORIZED')
  }

  try {
    const supabase = getSupabase()

    if (supabase) {
      // Use Supabase auth when configured
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error || !user) {
        return errorResponse(res, 'Invalid or expired access token', 401, 'UNAUTHORIZED')
      }

      req.user = {
        id: user.id,
        email: user.email,
        plan: user.user_metadata?.plan ?? 'free',
      }
      return next()
    }

    // Fallback: use local JWT verification when Supabase is not configured
    const decoded = verifyAccessToken(token)
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      plan: decoded.plan ?? 'free',
    }
    return next()
  } catch {
    return errorResponse(res, 'Authorization check failed', 401, 'UNAUTHORIZED')
  }
}

async function optionalAuthenticate(req, _res, next) {
  const authHeader = req.headers.authorization ?? ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme === 'Bearer' && token) {
    try {
      const supabase = getSupabase()

      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser(token)
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            plan: user.user_metadata?.plan ?? 'free',
          }
        } else {
          req.user = null
        }
      } else {
        // Fallback: use local JWT verification
        const decoded = verifyAccessToken(token)
        req.user = {
          id: decoded.sub,
          email: decoded.email,
          plan: decoded.plan ?? 'free',
        }
      }
    } catch {
      req.user = null
    }
  } else {
    req.user = null
  }

  next()
}

module.exports = {
  authenticate,
  optionalAuthenticate,
}

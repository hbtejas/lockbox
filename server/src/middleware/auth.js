const { supabase } = require('../lib/supabase')
const { errorResponse } = require('../utils/response')

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization ?? ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return errorResponse(res, 'Missing access token', 401, 'UNAUTHORIZED')
  }

  try {
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
  } catch {
    return errorResponse(res, 'Authorization check failed', 401, 'UNAUTHORIZED')
  }
}

async function optionalAuthenticate(req, _res, next) {
  const authHeader = req.headers.authorization ?? ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme === 'Bearer' && token) {
    try {
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

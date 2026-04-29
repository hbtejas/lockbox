const { createClient } = require('@supabase/supabase-js')
const { env } = require('../config/env')

let _supabase = null

function getSupabase() {
  if (_supabase) {
    return _supabase
  }

  if (!env.supabaseUrl || !env.supabaseKey || env.supabaseKey.includes('placeholder')) {
    return null
  }

  _supabase = createClient(env.supabaseUrl, env.supabaseKey)
  return _supabase
}

module.exports = { getSupabase }

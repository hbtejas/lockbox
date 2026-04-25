const { createClient } = require('@supabase/supabase-js')
const { env } = require('../config/env')

const supabase = createClient(env.supabaseUrl, env.supabaseKey)

module.exports = { supabase }

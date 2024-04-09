
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://bisopefzjpudvfyedxtd.supabase.co'
const supabaseKey = process.env.SUPABASE_PRIVATE_KEY || ''
export const dbClient = createClient(supabaseUrl, supabaseKey)
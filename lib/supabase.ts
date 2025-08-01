
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY || 'default_key';
const supabase = createClient(supabaseUrl, supabaseKey)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'IL_TUO_URL_SUPABASE';
const supabaseAnonKey = 'LA_TUA_CHIAVE_ANON_SUPABASE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
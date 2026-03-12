import { createClient } from '@supabase/supabase-js';

// Usiamo il tuo URL reale e la tua chiave reale
const supabaseUrl = 'https://zjqgwkttdnvkfxnjumzg.supabase.co';
const supabaseAnonKey = 'sb_publishable_hIfO1IjMRxbvnXk5H63Kdw_wIFT0Oj6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
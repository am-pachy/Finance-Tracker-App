import { createClient } from '@supabase/supabase-js';

// URL del tuo progetto (già inserito)
const supabaseUrl = 'https://zjqgwkttdnvkfxnjumzg.supabase.co';

// Qui devi incollare la tua chiave "anon public" 
// La trovi in Supabase sotto: Settings (ingranaggio) > API
const supabaseAnonKey = 'INCOLLA_QUI_LA_TUA_CHIAVE_ANON_PUBLIC';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

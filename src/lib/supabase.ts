import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Configure them before starting the application.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function subscribeToNewsletter(email: string) {
  const { data, error } = await supabase
    .from('subscribers')
    .insert([{ email, subscribed_at: new Date().toISOString() }]);

  if (error) throw error;
  return { success: true, data, method: 'supabase', message: 'Thank you for subscribing!' };
}

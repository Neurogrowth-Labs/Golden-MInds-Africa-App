import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This inert client is never used when configuration is absent: App renders the
// configuration screen first. It only prevents an import-time exception that
// previously produced a blank/dark page with no actionable error.
export const supabase = createClient(
  supabaseUrl || 'https://unconfigured.supabase.co',
  supabaseAnonKey || 'unconfigured-anon-key',
);

export async function subscribeToNewsletter(email: string) {
  const { data, error } = await supabase
    .from('subscribers')
    .insert([{ email, subscribed_at: new Date().toISOString() }]);

  if (error) throw error;
  return { success: true, data, method: 'supabase', message: 'Thank you for subscribing!' };
}

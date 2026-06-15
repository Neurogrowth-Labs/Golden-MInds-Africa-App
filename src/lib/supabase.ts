import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xstbuiishcldznuusshw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdGJ1aWlzaGNsZHpudXVzc2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzA3NjgsImV4cCI6MjA5MTA0Njc2OH0.xJK1X4rysfuVJznCDJaWZyWkeYeKrCXjfwHTGt8FWbI';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

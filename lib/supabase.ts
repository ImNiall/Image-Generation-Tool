import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

// Safely access env to avoid runtime errors if import.meta.env is undefined.
const env = (import.meta as any)?.env;

const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. The application will use placeholder values, and authentication will not work.');
}

// Use placeholder values if the environment variables are missing to prevent a crash.
// The app will not function correctly without real credentials, but it will load.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholderkey'
);

export type { User };
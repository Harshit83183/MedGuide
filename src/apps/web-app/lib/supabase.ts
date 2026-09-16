import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

/**
 * The app should still open before the owner connects a Supabase project.
 * Demo/phone mode works without Supabase; Google OAuth and database-backed
 * features become available as soon as real environment values are supplied.
 */
export const isSupabaseConfigured = Boolean(
  url &&
  anon &&
  !url.includes('YOUR_PROJECT_REF') &&
  !anon.includes('YOUR_SUPABASE_')
);

// createClient requires non-empty values at module load time. These local-only
// placeholders prevent a startup crash when the project has not been connected
// to Supabase yet. Network auth calls are guarded by isSupabaseConfigured.
const supabase = createClient(
  isSupabaseConfigured ? url! : 'http://127.0.0.1:54321',
  isSupabaseConfigured ? anon! : 'local-development-placeholder-key',
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured,
    },
  }
);

export default supabase;


import supabase, { isSupabaseConfigured } from './supabase';

export async function signInWithGoogle(_appName = 'MedGuide') {
  if (!isSupabaseConfigured) {
    console.error('[google-auth] Supabase is not configured');
    return false;
  }

  const redirectTo = `${window.location.origin}/login`;

  console.log('[google-auth] Redirect URL:', redirectTo);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account'
      }
    }
  });

  if (error) {
    console.error('[google-auth] Login failed:', error.message);
    return false;
  }

  return true;
}

export async function handleGoogleRedirect() {
  return;
}
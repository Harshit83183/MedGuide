import supabase, { isSupabaseConfigured } from './supabase';

export async function signInWithGoogle(_appName = 'MedGuide') {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/login',
      queryParams: { prompt: 'select_account' },
    },
  });

  if (error) {
    console.error('[google-auth] signInWithOAuth failed:', error.message);
    return false;
  }
  return true;
}

export async function handleGoogleRedirect() {
  // Supabase handles the OAuth callback/session from the redirected URL.
  // Kept for compatibility with the existing app flow.
  return;
}

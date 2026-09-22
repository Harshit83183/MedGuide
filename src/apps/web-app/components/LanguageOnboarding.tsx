import { useEffect, useState } from 'react';
import { Languages, ArrowRight, Loader2 } from 'lucide-react';
import { LANGUAGES, useLanguage, type Lang } from '../lib/language';
import supabase, { isSupabaseConfigured } from '../lib/supabase';
import type { SessionUser } from '../lib/api';

const valid = (value: unknown): value is Lang =>
  typeof value === 'string' && LANGUAGES.some(item => item.code === value);

const keyFor = (user: SessionUser) =>
  `medguide_preferred_language_${user.id}`;

export default function LanguageOnboarding({ user }: { user: SessionUser }) {
  const { setLang } = useLanguage();
  const [ready, setReady] = useState(false);
  const [needed, setNeeded] = useState(false);
  const [selected, setSelected] = useState<Lang | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setReady(false);
    setNeeded(false);
    setSelected(null);

    async function initialize() {
      const local = localStorage.getItem(keyFor(user));
      if (valid(local)) {
        if (active) {
          setLang(local);
          window.dispatchEvent(new Event('medguide-language-selected'));
          setNeeded(false);
          setReady(true);
        }
        return;
      }

      if (isSupabaseConfigured && (user.provider === 'google' || user.provider === 'password')) {
        const { data, error: authError } = await supabase.auth.getUser();
        if (!active) return;
        if (!authError && data.user) {
          const saved = data.user.user_metadata?.preferred_language;
          if (valid(saved)) {
            localStorage.setItem(keyFor(user), saved);
            setLang(saved);
            window.dispatchEvent(new Event('medguide-language-selected'));
            setNeeded(false);
            setReady(true);
            return;
          }
        }
      }

      if (active) {
        setNeeded(true);
        setReady(true);
      }
    }

    void initialize();
    return () => { active = false; };
  }, [user.id, user.provider, setLang]);

  async function continueWithLanguage() {
    if (!selected || saving) return;
    setSaving(true);
    setError('');
    try {
      if (isSupabaseConfigured && (user.provider === 'google' || user.provider === 'password')) {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError || !data.user) {
          throw new Error('Please sign in again to save your language.');
        }
        const { error: updateError } = await supabase.auth.updateUser({
          data: { preferred_language: selected }
        });
        if (updateError) throw updateError;
      }
      localStorage.setItem(keyFor(user), selected);
      setLang(selected);
      setNeeded(false);
      window.dispatchEvent(new Event('medguide-language-selected'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save language. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (ready && !needed) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[30px] bg-white p-6 shadow-2xl sm:p-9" role="dialog" aria-modal="true" aria-label="Choose your language">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-[#0B3D91]">
          {ready ? <Languages size={32} /> : <Loader2 size={30} className="animate-spin" />}
        </div>
        <h1 className="text-center text-2xl font-extrabold text-[#0B1F3A]">Choose your language</h1>
        <p className="mt-2 text-center text-sm text-slate-500">अपनी भाषा चुनें · Select your preferred language</p>
        {!ready ? (
          <p className="mt-8 text-center text-sm text-slate-500">Loading your preference...</p>
        ) : (
          <>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {LANGUAGES.map(item => (
                <button
                  type="button"
                  key={item.code}
                  onClick={() => setSelected(item.code)}
                  aria-pressed={selected === item.code}
                  className={'rounded-2xl border-2 px-3 py-5 text-center font-extrabold transition ' +
                    (selected === item.code
                      ? 'border-[#0B3D91] bg-blue-50 text-[#0B3D91] shadow-md'
                      : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50')}
                >
                  <span className="block text-lg">{item.native}</span>
                  <span className="mt-1 block text-xs font-medium text-slate-500">{item.label}</span>
                </button>
              ))}
            </div>
            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button
              type="button"
              disabled={!selected || saving}
              onClick={() => void continueWithLanguage()}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-5 py-4 text-sm font-extrabold text-white hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              Continue <ArrowRight size={18} />
            </button>
            <p className="mt-4 text-center text-xs text-slate-400">Your language is saved to your account and used automatically next time.</p>
          </>
        )}
      </div>
    </div>
  );
}

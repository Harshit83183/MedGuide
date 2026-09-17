import { Languages } from 'lucide-react';
import { LANGUAGES, useLanguage, type Lang } from '../lib/language';

export default function LanguageSelector({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  const { lang, setLang } = useLanguage();
  return (
    <label className={'inline-flex items-center gap-2 rounded-xl border px-2.5 py-2 ' + (dark ? 'border-white/20 bg-white/10 text-white' : 'border-slate-200 bg-white text-slate-700') }>
      <Languages size={16} className={dark ? 'text-cyan-200' : 'text-[#1D6FF2]'} />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        aria-label="Select language"
        className={'cursor-pointer bg-transparent text-xs font-bold outline-none ' + (dark ? 'text-white [&>option]:text-slate-900' : 'text-slate-700')}
      >
        {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{compact ? l.native : l.native}</option>)}
      </select>
    </label>
  );
}

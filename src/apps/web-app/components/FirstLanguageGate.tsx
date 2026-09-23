import { useState } from 'react';
import { Languages, ArrowRight } from 'lucide-react';
import { LANGUAGES, type Lang } from '../lib/language';

export default function FirstLanguageGate({ onDone }: { onDone: (language: Lang) => void }) {
  const [selected, setSelected] = useState<Lang | null>(null);
  return <main className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-gradient-to-br from-[#081426] via-[#0B3D91] to-[#0B1F3A] p-4">
    <section className="w-full max-w-xl rounded-3xl bg-white p-7 shadow-2xl sm:p-10" aria-label="Choose language">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-800"><Languages size={32}/></div>
      <h1 className="mt-5 text-center text-2xl font-extrabold text-slate-900">Choose your language</h1>
      <p className="mt-2 text-center text-slate-600">अपनी भाषा चुनें · Select your preferred language</p>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LANGUAGES.map(item => <button type="button" key={item.code} onClick={() => setSelected(item.code)} aria-pressed={selected === item.code}
          className={'rounded-2xl border-2 p-4 text-center transition ' + (selected === item.code ? 'border-blue-700 bg-blue-50' : 'border-slate-200 hover:border-blue-300')}>
          <span className="block text-lg font-bold text-slate-900">{item.native}</span><span className="text-sm text-slate-500">{item.label}</span>
        </button>)}
      </div>
      <button type="button" disabled={!selected} onClick={() => selected && onDone(selected)} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 p-4 font-bold text-white disabled:opacity-40">Continue <ArrowRight size={18}/></button>
    </section>
  </main>;
}

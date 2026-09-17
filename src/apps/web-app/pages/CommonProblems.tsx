import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, ChevronLeft, ArrowRight, Thermometer, Brain, Wind, Cookie, AudioWaveform, PersonStanding, Sparkles, Flame, Loader2 } from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import { COMMON_PROBLEMS } from '../../../ai-service/common-problems';
import { RED_FLAGS, triage } from '../../../ai-service/triage-engine';
import { api, type SessionUser } from '../lib/api';
import { useLanguage } from '../lib/language';

const ICONS: Record<string, typeof Thermometer> = { Thermometer, Brain, Wind, Cookie, AudioWaveform, PersonStanding, Sparkles, Flame };
const DAY_OPTS = ['Aaj se', '2-3 din', '4-7 din', '1-2 hafte', '2+ hafte'];
const DAY_NUM = [0, 2, 5, 10, 20];

export default function CommonProblems({ user }: { user: SessionUser }) {
  const nav = useNavigate();
  const { lang, tr } = useLanguage();
  const [sel, setSel] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [days, setDays] = useState(2);
  const [severity, setSeverity] = useState(4);
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const p = COMMON_PROBLEMS.find((x) => x.key === sel);

  const toggleFlag = (k: string) => setFlags((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));

  const finish = async () => {
    if (!p) return;
    setSaving(true);
    try {
      const r = triage({ days, severity, flags, problemKey: p.key });
      const rec = await api<{ id: number }>('/api/health-records', {
        method: 'POST',
        body: { user_id: user.id, title: p.title + ' — ' + days + ' din, ' + severity + '/10', issue: p.title + ' (' + p.titleHi + '). Pattern: ' + (pattern || 'n/a') + '. Flags: ' + (flags.join(', ') || 'none'), triage: r.level, severity, days: String(days), language: lang, advice: r.reasons.join(' | '), source: 'common-problems' },
      });
      sessionStorage.setItem('medguide_intake', JSON.stringify({ recordId: rec.id, text: p.title + ' — ' + pattern, lang, days, severity, flags, problemKey: p.key }));
      nav('/triage');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save fail');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHero icon={<LayoutGrid size={28} />} kicker="Quick Help · Bina AI ke" title="Common Problems" sub="Roz-marra ki takleefon ke liye guided sawal-jawab — kitne din se hai, 1-10 tak kitni takleef — bas 30 second me sahi salah." />
      <AnimatePresence mode="wait">
        {!p ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMMON_PROBLEMS.map((c, i) => {
              const Icon = ICONS[c.icon] || Sparkles;
              return (
                <Reveal key={c.key} delay={(i % 4) * 0.07}>
                  <motion.button whileHover={{ y: -6 }} whileTap={{ scale: 0.97 }} onClick={() => { setSel(c.key); setStep(0); setFlags([]); setPattern(''); }} className="group block w-full rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:shadow-xl hover:ring-teal-100">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-lg"><Icon size={24} /></span>
                    <p className="mt-3 font-extrabold text-[#0B1F3A]">{tr(c.title)}</p>
                    <p className="mt-1 min-h-[36px] text-[13px] text-slate-500">{tr(c.tagline)}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-teal-700">Start <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
                  </motion.button>
                </Reveal>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="flow" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="mx-auto max-w-2xl">
            <button onClick={() => setSel(null)} className="mb-3 flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-[#0B3D91]"><ChevronLeft size={16} /> Saari problems</button>
            <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600">{tr(p.title)}</p>
              <div className="mt-2 flex gap-1.5">
                {[0, 1, 2, 3].map((s) => (
                  <div key={s} className={'h-1.5 flex-1 rounded-full transition ' + (s <= step ? 'bg-teal-500' : 'bg-slate-200')} />
                ))}
              </div>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="pt-5">
                    <h3 className="text-lg font-extrabold text-[#0B1F3A]">{tr(p.questions[0].q)}</h3>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {DAY_OPTS.map((d, i) => (
                        <motion.button key={d} whileTap={{ scale: 0.95 }} onClick={() => setDays(DAY_NUM[i])} className={'rounded-2xl border-2 py-3 text-sm font-bold transition ' + (days === DAY_NUM[i] ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600 hover:border-teal-300')}>{d}</motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="pt-5">
                    <h3 className="text-lg font-extrabold text-[#0B1F3A]">Takleef 1 se 10 tak kitni hai?</h3>
                    <p className="text-sm text-slate-500">1 = halki, 10 = asahaniya. Slider ghumayein.</p>
                    <div className="mt-6 text-center">
                      <motion.p key={severity} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className={'text-6xl font-extrabold ' + (severity <= 3 ? 'text-emerald-500' : severity <= 6 ? 'text-amber-500' : severity <= 8 ? 'text-orange-500' : 'text-red-600')}>{severity}</motion.p>
                      <input type="range" min={1} max={10} value={severity} onChange={(e) => setSeverity(Number(e.target.value))} className="mt-4 w-full accent-teal-600" />
                      <div className="mt-1 flex justify-between text-[11px] font-bold text-slate-400"><span>1 · Halki</span><span>5 · Medium</span><span>10 · Bahut tez</span></div>
                    </div>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="pt-5">
                    <h3 className="text-lg font-extrabold text-[#0B1F3A]">{tr(p.questions[2].q)}</h3>
                    <div className="mt-4 grid gap-2">
                      {(p.questions[2].choices || []).map((c) => (
                        <motion.button key={c} whileTap={{ scale: 0.98 }} onClick={() => setPattern(c)} className={'rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition ' + (pattern === c ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600 hover:border-teal-300')}>{tr(c)}</motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="pt-5">
                    <h3 className="text-lg font-extrabold text-[#0B1F3A]">Koi <span className="text-red-600">khatre wali nishani</span> to nahi?</h3>
                    <p className="text-sm text-slate-500">Ho to zaroor tick karein — yeh sabse important step hai.</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {RED_FLAGS.map((f) => (
                        <button key={f.key} onClick={() => toggleFlag(f.key)} className={'rounded-2xl border-2 px-3 py-2.5 text-left text-[13px] font-bold transition ' + (flags.includes(f.key) ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600 hover:border-red-300')}>
                          {flags.includes(f.key) ? '☑ ' : '☐ '}{tr(f.label)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-6 flex gap-2">
                {step > 0 && <button onClick={() => setStep(step - 1)} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200">Peeche</button>}
                {step < 3 ? (
                  <button onClick={() => setStep(step + 1)} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 py-3 text-sm font-bold text-white shadow-lg">Aage <ArrowRight size={16} /></button>
                ) : (
                  <button onClick={finish} disabled={saving} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Result ban raha hai...</> : <>Mera Result Dekhein <ArrowRight size={16} /></>}
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4"><Disclaimer compact /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

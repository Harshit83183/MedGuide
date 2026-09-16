import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderHeart, Trash2, Sparkles, CalendarDays, Paperclip, Plus, X, Loader2, TrendingUp } from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import { api, type SessionUser } from '../lib/api';
import type { TriageLevel } from '../../../ai-service/triage-engine';

interface Rec { id: number; title: string; issue: string; triage: string; severity: number; days: string; language: string; advice: string; attachment_url: string; source: string; created_at?: string; }

const DOT: Record<string, string> = { green: 'bg-emerald-500', yellow: 'bg-amber-500', red: 'bg-red-600' };
const PILL: Record<string, string> = { green: 'bg-emerald-50 text-emerald-700 ring-emerald-200', yellow: 'bg-amber-50 text-amber-700 ring-amber-200', red: 'bg-red-50 text-red-700 ring-red-200' };

function futureAdvice(recs: Rec[]): string[] {
  const out: string[] = [];
  const reds = recs.filter((r) => r.triage === 'red').length;
  const yellows = recs.filter((r) => r.triage === 'yellow').length;
  const fevers = recs.filter((r) => (r.title + r.issue).toLowerCase().includes('bukhar') || (r.title + r.issue).toLowerCase().includes('fever')).length;
  const stomach = recs.filter((r) => /stomach|pet|acidity|gas|loose|vomit/i.test(r.title + r.issue)).length;
  if (reds >= 2) out.push('🚨 Aapke ' + reds + ' emergency-level records hain — ek baar full-body checkup + doctor follow-up zaroor karayein.');
  if (yellows >= 3) out.push('📋 Lagatar doctor-visit wale issues (' + yellows + ') — ek family physician fix karke regular follow-up rakhein.');
  if (fevers >= 3) out.push('🌡E Baar-baar bukhar (' + fevers + ' baar) — CBC + thyroid + vitamin D test par doctor se salah lein; immunity routine banayein.');
  if (stomach >= 3) out.push('🥗 Pet ki dikkat baar-baar (' + stomach + ' baar) — khaane ka time fix karein, bahar ka khana kam karein, gastro consult sochein.');
  const hiSev = recs.filter((r) => r.severity >= 8).length;
  if (hiSev >= 2) out.push('⚠ ' + hiSev + ' baar tez dard (8+/10) record hua — pain diary banayein aur specialist ko dikhayein.');
  out.push('💧 Roz 8–10 glass paani + 30 min walk — har record ke saath recovery tez hogi.');
  out.push('💊 Saare purane reports ek folder me rakhein; agli visit par doctor ko timeline dikhayein.');
  return out.slice(0, 6);
}

export default function Records({ user }: { user: SessionUser }) {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'' | TriageLevel>('');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [issue, setIssue] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const d = await api<Rec[]>('/api/health-records?user_id=' + user.id);
      setRecs(d);
    } catch { setRecs([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchRecs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => (filter ? recs.filter((r) => r.triage === filter) : recs), [recs, filter]);
  const advice = useMemo(() => futureAdvice(recs), [recs]);
  const counts = useMemo(() => ({ green: recs.filter((r) => r.triage === 'green').length, yellow: recs.filter((r) => r.triage === 'yellow').length, red: recs.filter((r) => r.triage === 'red').length }), [recs]);

  const add = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api('/api/health-records', { method: 'POST', body: { user_id: user.id, title: title.trim(), issue: issue.trim(), triage: 'green', severity: 2, days: '', language: 'hinglish', advice: 'Manual entry', source: 'manual' } });
      setTitle('');
      setIssue('');
      setShowAdd(false);
      fetchRecs();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save fail');
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm('Yeh record delete karein?')) return;
    await api('/api/health-records?id=' + id, { method: 'DELETE' });
    fetchRecs();
  };

  return (
    <div>
      <PageHero icon={<FolderHeart size={28} />} kicker="Personal Health Timeline" title="Mere Health Records" sub="Aaj tak ki saari takleefen, triage results aur reports — ek surakshit timeline me. Isi pattern se future advice milti hai." />
      <div className="mb-4 grid grid-cols-4 gap-2 sm:gap-3">
        {[['', 'Sabhi', recs.length, 'bg-[#0B3D91]'], ['green', 'Green', counts.green, 'bg-emerald-500'], ['yellow', 'Yellow', counts.yellow, 'bg-amber-500'], ['red', 'Red', counts.red, 'bg-red-600']].map(([v, label, n, bg]) => (
          <button key={v as string} onClick={() => setFilter(v as '' | TriageLevel)} className={'rounded-2xl p-3 text-center ring-2 transition ' + (filter === v ? 'bg-white ring-offset-1 ' + (bg as string).replace('bg-', 'ring-') : 'bg-white ring-slate-100')}>
            <p className={'mx-auto flex h-9 w-9 items-center justify-center rounded-full text-lg font-extrabold text-white ' + bg}>{n}</p>
            <p className="mt-1 text-xs font-bold text-slate-600">{label}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-extrabold text-[#0B1F3A]">📅 Timeline ({list.length})</p>
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 rounded-full bg-[#0B3D91] px-4 py-2 text-[13px] font-bold text-white">{showAdd ? <X size={15} /> : <Plus size={15} />} {showAdd ? 'Band karein' : 'Manual Entry'}</button>
          </div>
          {showAdd && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 rounded-3xl bg-white p-4 ring-1 ring-slate-200">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title: e.g. Gala kharab, 2 din" className="w-full rounded-2xl border-2 border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#1D6FF2]" />
              <textarea value={issue} onChange={(e) => setIssue(e.target.value)} rows={2} placeholder="Detail (optional)..." className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#1D6FF2]" />
              <button onClick={add} disabled={busy || !title.trim()} className="mt-2 w-full rounded-2xl bg-emerald-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Saving...' : 'Save Record'}</button>
            </motion.div>
          )}
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-white" />)}</div>
          ) : list.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center">
              <FolderHeart size={40} className="mx-auto text-slate-300" />
              <p className="mt-2 font-extrabold text-[#0B1F3A]">Abhi koi record nahi</p>
              <p className="text-sm text-slate-500">Symptom Checker ya Common Problems use karein — har checkup yahan save hoga.</p>
            </div>
          ) : (
            <div className="relative space-y-4 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-0.5 before:bg-slate-200">
              {list.map((r, i) => (
                <Reveal key={r.id} delay={Math.min(i, 5) * 0.05}>
                  <div className="relative flex gap-3 pl-1">
                    <span className={'z-10 mt-1 h-8 w-8 shrink-0 rounded-full ring-4 ring-[#F6F9FC] ' + (DOT[r.triage] || 'bg-slate-400')} />
                    <div className="flex-1 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-extrabold text-[#0B1F3A]">{r.title}</p>
                          <p className="flex items-center gap-2 text-[11px] font-semibold text-slate-400"><span className="inline-flex items-center gap-1"><CalendarDays size={11} /> {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</span><span>·</span><span>{r.source}</span><span>·</span><span>Dard: {r.severity}/10</span></p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className={'rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ' + (PILL[r.triage] || 'bg-slate-100 text-slate-600')}>{r.triage.toUpperCase()}</span>
                          <button onClick={() => del(r.id)} className="rounded-full p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                        </div>
                      </div>
                      {r.issue && <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{r.issue}</p>}
                      {r.advice && <p className="mt-1.5 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 ring-1 ring-slate-100">💡 {r.advice}</p>}
                      {r.attachment_url && <p className="mt-1.5 flex items-center gap-1 text-xs font-bold text-[#1D6FF2]"><Paperclip size={12} /> {r.attachment_url.split(',').length} attachment(s) linked</p>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
        <div>
          <Reveal delay={0.1}>
            <div className="rounded-3xl bg-gradient-to-br from-[#0B1F3A] to-[#4c1d95] p-5 text-white shadow-xl lg:sticky lg:top-20">
              <p className="flex items-center gap-1.5 text-sm font-extrabold"><Sparkles size={16} className="text-amber-300" /> Future Advice <span className="text-[11px] font-medium text-white/60">(aapke pattern se)</span></p>
              {recs.length === 0 ? (
                <p className="mt-2 text-[13px] text-white/70">Pehla checkup karte hi yahan personalized salah dikhegi.</p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {advice.map((a, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="rounded-2xl bg-white/10 p-3 text-[13px] leading-relaxed ring-1 ring-white/15">{a}</motion.li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 p-3 text-xs ring-1 ring-white/15">
                <TrendingUp size={18} className="shrink-0 text-emerald-300" />
                <span className="text-white/80">Pattern-guidance educational hai. Final salah hamesha aapke doctor ki hogi.</span>
              </div>
            </div>
          </Reveal>
          <div className="mt-4"><Disclaimer compact /></div>
        </div>
      </div>
    </div>
  );
}

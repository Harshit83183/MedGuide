import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Video, BadgeCheck, Star, Clock, CalendarCheck, X, Loader2, Crown, Check, PhoneCall } from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import { api, inr, type SessionUser } from '../lib/api';

interface Doctor { id: number; clinic_id: number; name: string; specialty: string; qualification: string; exp_years: number; rating: number; consult_fee: number; video_fee: number; available_days: string; }
interface Sub { id: number; user_id: string; plan: string; price: number; total: number; used: number; status: string; expires_at: string; }
interface VC { id: number; user_id: string; doctor_id: number | null; topic: string; scheduled_at: string; duration_min: number; status: string; link: string; notes: string; }

const PLANS = [
  { id: 'single', name: 'Single Consult', price: 199, total: 1, desc: '1 video meeting × 10 min', tag: '' },
  { id: 'pack3', name: 'Family Pack ⭐', price: 400, total: 3, desc: '3 video meetings × 10 min · 30 din valid', tag: 'MOST POPULAR' },
  { id: 'pack6', name: 'Care Plus', price: 699, total: 6, desc: '6 video meetings × 10 min · 60 din valid', tag: 'BEST VALUE' },
];

export default function VideoConsult({ user }: { user: SessionUser }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [consults, setConsults] = useState<VC[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState('');
  const [selDoc, setSelDoc] = useState<Doctor | null>(null);
  const [topic, setTopic] = useState('');
  const [when, setWhen] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [err, setErr] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, s, c] = await Promise.all([
        api<Doctor[]>('/api/doctors?video=1'),
        api<Sub[]>('/api/subscriptions?user_id=' + user.id),
        api<VC[]>('/api/video-consults?user_id=' + user.id),
      ]);
      setDoctors(d);
      setSubs(s);
      setConsults(c);
    } catch { /* noop */ } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const active = useMemo(() => subs.find((s) => s.status === 'active' && s.used < s.total), [subs]);
  const left = active ? active.total - active.used : 0;

  const buy = async (planId: string) => {
    const plan = PLANS.find((p) => p.id === planId)!;
    setBuying(planId);
    setErr('');
    try {
      const exp = new Date();
      exp.setDate(exp.getDate() + (plan.id === 'pack6' ? 60 : 30));
      await api('/api/subscriptions', { method: 'POST', body: { user_id: user.id, plan: plan.name, price: plan.price, total: plan.total, expires_at: exp.toISOString().slice(0, 10) } });
      const s = await api<Sub[]>('/api/subscriptions?user_id=' + user.id);
      setSubs(s);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Purchase fail');
    } finally {
      setBuying('');
    }
  };

  const schedule = async () => {
    setErr('');
    if (!selDoc || !topic.trim() || !when) {
      setErr('Doctor, vishay aur samay — teeno chunein.');
      return;
    }
    if (!active) {
      setErr('Pehle subscription pack lein — phir meeting schedule hogi.');
      return;
    }
    setScheduling(true);
    try {
      const link = 'https://meet.medguide.in/room-' + Math.random().toString(36).slice(2, 8);
      await api('/api/video-consults', { method: 'POST', body: { user_id: user.id, doctor_id: selDoc.id, topic: topic.trim(), scheduled_at: when, duration_min: 10, link } });
      await api('/api/subscriptions', { method: 'PUT', body: { id: active.id, used: active.used + 1, status: active.used + 1 >= active.total ? 'exhausted' : 'active' } });
      const [s, c] = await Promise.all([api<Sub[]>('/api/subscriptions?user_id=' + user.id), api<VC[]>('/api/video-consults?user_id=' + user.id)]);
      setSubs(s);
      setConsults(c);
      setSelDoc(null);
      setTopic('');
      setWhen('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Scheduling fail');
    } finally {
      setScheduling(false);
    }
  };

  const markDone = async (id: number) => {
    await api('/api/video-consults', { method: 'PUT', body: { id, status: 'completed' } });
    const c = await api<VC[]>('/api/video-consults?user_id=' + user.id);
    setConsults(c);
  };

  return (
    <div>
      <PageHero icon={<Video size={28} />} kicker="Telemedicine · Ghar baithe Doctor" title="Video Consultation" sub="Registered doctors se 10-minute video meetings — subscription pack par bhaari bachat. NMC Telemedicine Guidelines ka paalan." />
      <Reveal>
        <div className={'mb-6 flex flex-col items-center justify-between gap-3 rounded-3xl p-5 sm:flex-row sm:p-6 ' + (active ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl' : 'bg-white ring-1 ring-slate-200')}>
          <div className="flex items-center gap-3">
            <span className={'flex h-12 w-12 items-center justify-center rounded-2xl ' + (active ? 'bg-white/20' : 'bg-amber-100 text-amber-700')}><Crown size={24} /></span>
            <div>
              {active ? (
                <><p className="font-extrabold">Active Pack: {active.plan}</p><p className="text-sm text-emerald-100">{left} / {active.total} meetings bachi · valid till {active.expires_at}</p></>
              ) : (
                <><p className="font-extrabold text-[#0B1F3A]">Koi active pack nahi</p><p className="text-sm text-slate-500">Neeche se pack lein — phir doctor book karein.</p></>
              )}
            </div>
          </div>
          {active && (
            <div className="flex gap-1.5">
              {Array.from({ length: active.total }).map((_, i) => (
                <span key={i} className={'h-3 w-10 rounded-full ' + (i < active.used ? 'bg-white/40' : 'bg-white')} />
              ))}
            </div>
          )}
        </div>
      </Reveal>

      <p className="mb-3 text-sm font-extrabold text-[#0B1F3A]">💳 Subscription Packs</p>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {PLANS.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <motion.div whileHover={{ y: -5 }} className={'relative rounded-3xl bg-white p-6 text-center shadow-sm ring-2 ' + (p.id === 'pack3' ? 'ring-[#0B3D91] shadow-xl' : 'ring-slate-100')}>
              {p.tag && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0B3D91] px-3 py-1 text-[10px] font-extrabold text-white">{p.tag}</span>}
              <p className="font-extrabold text-[#0B1F3A]">{p.name}</p>
              <p className="mt-1 text-4xl font-extrabold text-[#0B3D91]">{inr(p.price)}</p>
              <p className="mt-1 text-[13px] text-slate-500">{p.desc}</p>
              <p className="text-[12px] font-bold text-emerald-600">≈ {inr(Math.round(p.price / p.total))} / meeting</p>
              <button onClick={() => buy(p.id)} disabled={buying === p.id} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60">
                {buying === p.id ? <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</span> : 'Buy Pack'}
              </button>
              <p className="mt-2 text-[11px] text-slate-400">Demo payment · UPI / Card / Netbanking</p>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-extrabold text-[#0B1F3A]">🩺 Video Doctors ({loading ? '...' : doctors.length})</p>
          {loading ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />)}</div> : (
            <div className="space-y-2.5">
              {doctors.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-lg font-extrabold text-white">{d.name.replace('Dr. ', '').charAt(0)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-sm font-extrabold text-[#0B1F3A]">{d.name} <BadgeCheck size={14} className="text-sky-500" /></p>
                    <p className="truncate text-xs text-slate-500">{d.specialty} · {d.qualification} · {d.exp_years} yrs exp</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs font-bold"><span className="inline-flex items-center gap-0.5 text-amber-600"><Star size={11} className="fill-amber-400 text-amber-400" />{Number(d.rating).toFixed(1)}</span><span className="text-slate-400">{d.available_days}</span></p>
                  </div>
                  <button onClick={() => setSelDoc(d)} className="shrink-0 rounded-xl bg-[#0B3D91] px-4 py-2 text-[13px] font-bold text-white">Book</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="mb-3 text-sm font-extrabold text-[#0B1F3A]">📅 Meri Meetings ({consults.length})</p>
          {consults.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center">
              <Video size={36} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm font-bold text-slate-500">Abhi koi meeting nahi</p>
              <p className="text-xs text-slate-400">Pack lein → doctor chunein → samay fix karein</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {consults.map((c) => (
                <div key={c.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-[#0B1F3A]">{c.topic}</p>
                    <span className={'rounded-full px-2.5 py-0.5 text-[11px] font-bold ' + (c.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : c.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700')}>{c.status}</span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><Clock size={12} /> {c.scheduled_at} · {c.duration_min} min</p>
                  <div className="mt-2 flex gap-2">
                    {c.status === 'scheduled' && (
                      <>
                        <a href={c.link} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-[13px] font-bold text-white"><PhoneCall size={14} /> Join Meeting</a>
                        <button onClick={() => markDone(c.id)} className="rounded-xl bg-slate-100 px-3 py-2 text-[13px] font-bold text-slate-600"><Check size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4"><Disclaimer compact /></div>
        </div>
      </div>

      <AnimatePresence>
        {selDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-2 backdrop-blur-sm sm:items-center" onClick={() => setSelDoc(null)}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-pink-600">Book Video Meeting</p>
                  <h3 className="text-lg font-extrabold text-[#0B1F3A]">{selDoc.name}</h3>
                  <p className="text-[13px] text-slate-500">{selDoc.specialty} · {inr(selDoc.video_fee || 199)} value · pack se 1 credit katega</p>
                </div>
                <button onClick={() => setSelDoc(null)} className="rounded-full bg-slate-100 p-2"><X size={16} /></button>
              </div>
              <label className="mb-1 mt-4 block text-[13px] font-bold text-slate-600">Kis baare me baat karni hai?</label>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. 3 din se bukhar, report samajhni hai" className="w-full rounded-2xl border-2 border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-pink-400" />
              <label className="mb-1 mt-3 flex items-center gap-1 text-[13px] font-bold text-slate-600"><CalendarCheck size={14} /> Din + samay</label>
              <input type="datetime-local" value={when} min={new Date().toISOString().slice(0, 16)} onChange={(e) => setWhen(e.target.value)} className="w-full rounded-2xl border-2 border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-pink-400" />
              {!active && <p className="mt-2 rounded-xl bg-amber-50 p-2.5 text-xs font-bold text-amber-700">⚠ Active pack nahi hai — pehle upar se pack lein.</p>}
              {err && <p className="mt-2 rounded-xl bg-red-50 p-2.5 text-center text-[13px] font-semibold text-red-600">{err}</p>}
              <button onClick={schedule} disabled={scheduling} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60">
                {scheduling ? <><Loader2 size={16} className="animate-spin" /> Scheduling...</> : <><CalendarCheck size={16} /> Confirm Meeting (1 credit)</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, Phone, MapPin, UserPlus, X, Loader2, CheckCircle2, Navigation } from 'lucide-react';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { EMERGENCY_NUMBERS, ER_STEPS, sosMessage } from '../../../ai-service/emergency-protocols';
import { api, type SessionUser } from '../lib/api';

interface Contact { id: number; name: string; phone: string; relation: string; }
interface Alert { id: number; status: string; address_text: string; note: string; created_at?: string; }

export default function SOS({ user }: { user: SessionUser }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loc, setLoc] = useState<{ lat: string; lng: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [nm, setNm] = useState('');
  const [ph, setPh] = useState('');
  const [rel, setRel] = useState('Family');
  const [err, setErr] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([
        api<Contact[]>('/api/sos-contacts?user_id=' + user.id),
        api<Alert[]>('/api/sos-alerts?user_id=' + user.id),
      ]);
      setContacts(c);
      setAlerts(a);
    } catch { /* noop */ } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getLoc = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLoc({ lat: String(p.coords.latitude.toFixed(6)), lng: String(p.coords.longitude.toFixed(6)) });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const addContact = async () => {
    setErr('');
    if (!nm.trim() || !/^[6-9]\d{9}$/.test(ph.trim())) {
      setErr('Naam + sahi 10-digit number likhein.');
      return;
    }
    await api('/api/sos-contacts', { method: 'POST', body: { user_id: user.id, name: nm.trim(), phone: ph.trim(), relation: rel } });
    setNm('');
    setPh('');
    setShowAdd(false);
    fetchAll();
  };

  const delContact = async (id: number) => {
    await api('/api/sos-contacts?id=' + id, { method: 'DELETE' });
    fetchAll();
  };

  const triggerSOS = async () => {
    if (!confirm('EMERGENCY SOS bhejein? Aapke contacts ko turant alert jayega.')) return;
    setSending(true);
    try {
      await api('/api/sos-alerts', { method: 'POST', body: { user_id: user.id, lat: loc?.lat || '', lng: loc?.lng || '', address_text: loc ? 'GPS: ' + loc.lat + ', ' + loc.lng : 'GPS unavailable', note: note.trim() } });
      const a = await api<Alert[]>('/api/sos-alerts?user_id=' + user.id);
      setAlerts(a);
      setSent(true);
      setTimeout(() => setSent(false), 6000);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'SOS fail');
    } finally {
      setSending(false);
    }
  };

  const resolveAlert = async (id: number) => {
    await api('/api/sos-alerts', { method: 'PUT', body: { id, status: 'resolved' } });
    fetchAll();
  };

  const waLinks = contacts.map((c) => ({
    ...c,
    wa: 'https://wa.me/91' + c.phone + '?text=' + encodeURIComponent(sosMessage(loc?.lat || '', loc?.lng || '', user.name)),
  }));

  return (
    <div>
      <PageHero icon={<Siren size={28} />} kicker="1-Tap Emergency" title="SOS & ER Dispatcher" sub="Ek tap me contacts ko GPS alert + 108/112 direct dial + hospital pahunchne tak first-aid steps." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-red-600 via-rose-600 to-[#7f1d1d] p-6 text-center text-white shadow-2xl sm:p-10">
              <motion.div className="absolute inset-0 bg-white/5" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
              <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-red-200">Emergency? Darro mat — dabao</p>
              <div className="relative mx-auto mt-5 w-fit">
                <motion.span className="absolute inset-0 rounded-full bg-white/30" animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={triggerSOS} disabled={sending} className="relative flex h-44 w-44 items-center justify-center rounded-full bg-white text-4xl font-extrabold text-red-600 shadow-2xl disabled:opacity-70 sm:h-52 sm:w-52">
                  {sending ? <Loader2 size={44} className="animate-spin" /> : 'SOS'}
                </motion.button>
              </div>
              <AnimatePresence>
                {sent && (
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative mx-auto mt-4 flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-700">
                    <CheckCircle2 size={16} /> SOS Alert bhej diya gaya! Madad aa rahi hai.
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="relative mx-auto mt-5 max-w-md">
                <button onClick={getLoc} disabled={locating} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 py-2.5 text-sm font-bold ring-1 ring-white/30 hover:bg-white/25 disabled:opacity-60">
                  {locating ? <><Loader2 size={15} className="animate-spin" /> Location le rahe hain...</> : loc ? <><MapPin size={15} className="text-emerald-300" /> GPS Locked: {loc.lat}, {loc.lng}</> : <><Navigation size={15} /> Step 1: Apni Location ON karein</>}
                </button>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional): e.g. Seene me dard, 2nd floor, Sharma Niwas" className="mt-2 w-full rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/30 placeholder:text-red-200 focus:outline-none focus:ring-2 focus:ring-white/60" />
              </div>
              <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {EMERGENCY_NUMBERS.map((n) => (
                  <a key={n.number} href={'tel:' + n.number} className="rounded-2xl bg-white px-2 py-3 text-center shadow transition hover:bg-red-50">
                    <p className="flex items-center justify-center gap-1 text-lg font-extrabold text-red-600"><Phone size={15} /> {n.number}</p>
                    <p className="text-[11px] font-bold text-slate-600">{n.label}</p>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-4 rounded-3xl bg-white p-5 ring-1 ring-slate-100 sm:p-6">
              <p className="text-sm font-extrabold text-[#0B1F3A]">🏥 Ambulance aane tak — ER First-Aid Steps</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {ER_STEPS.map((s, i) => (
                  <div key={s.title} className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-100">
                    <p className="text-[13px] font-extrabold text-[#0B1F3A]">{i + 1}. {s.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <div className="space-y-4">
          <Reveal delay={0.05}>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-[#0B1F3A]">👥 Emergency Contacts ({loading ? '...' : contacts.length})</p>
                <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"><UserPlus size={13} /> Add</button>
              </div>
              {showAdd && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <input value={nm} onChange={(e) => setNm(e.target.value)} placeholder="Naam (e.g. Papa)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
                  <div className="flex gap-2">
                    <input value={ph} onChange={(e) => setPh(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" inputMode="numeric" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
                    <select value={rel} onChange={(e) => setRel(e.target.value)} className="rounded-xl border border-slate-200 px-2 py-2 text-sm">
                      {['Family', 'Friend', 'Neighbour', 'Doctor'].map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  {err && <p className="text-xs font-bold text-red-600">{err}</p>}
                  <button onClick={addContact} className="w-full rounded-xl bg-emerald-600 py-2 text-sm font-bold text-white">Save Contact</button>
                </motion.div>
              )}
              <div className="mt-3 space-y-2">
                {contacts.length === 0 && <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-[13px] text-slate-400">Koi contact nahi. Upar Add dabakar 2-3 contacts zaroor jodein.</p>}
                {waLinks.map((c) => (
                  <div key={c.id} className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-2.5 ring-1 ring-slate-100">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1D6FF2] to-[#0B3D91] text-sm font-extrabold text-white">{c.name.charAt(0)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-extrabold text-slate-700">{c.name} <span className="font-medium text-slate-400">· {c.relation}</span></p>
                      <p className="text-xs text-slate-500">+91 {c.phone}</p>
                    </div>
                    <a href={'tel:' + c.phone} className="rounded-full bg-white p-2 text-emerald-600 shadow-sm ring-1 ring-slate-200"><Phone size={15} /></a>
                    <a href={c.wa} target="_blank" rel="noreferrer" title="WhatsApp SOS" className="rounded-full bg-emerald-500 p-2 text-white shadow-sm"><Navigation size={15} /></a>
                    <button onClick={() => delContact(c.id)} className="rounded-full p-1.5 text-slate-300 hover:text-red-500"><X size={15} /></button>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-100">
              <p className="text-sm font-extrabold text-[#0B1F3A]">🚨 Mere SOS Alerts ({alerts.length})</p>
              <div className="mt-2 max-h-56 space-y-2 overflow-y-auto">
                {alerts.length === 0 && <p className="text-[13px] text-slate-400">Abhi tak koi SOS nahi bheja. Surakshit rahein! 🙏</p>}
                {alerts.map((a) => (
                  <div key={a.id} className="rounded-2xl bg-red-50/60 p-3 ring-1 ring-red-100">
                    <p className="flex items-center justify-between text-[13px] font-bold text-red-800">
                      {a.created_at ? new Date(a.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'SOS'}
                      <span className={'rounded-full px-2 py-0.5 text-[11px] ' + (a.status === 'active' ? 'bg-red-600 text-white' : 'bg-emerald-100 text-emerald-700')}>{a.status}</span>
                    </p>
                    <p className="truncate text-xs text-red-700/80">{a.address_text} {a.note ? '· ' + a.note : ''}</p>
                    {a.status === 'active' && <button onClick={() => resolveAlert(a.id)} className="mt-1.5 rounded-lg bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">Main surakshit hun — Resolve</button>}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Hospital, Search, MapPin, Star, BadgeCheck, Clock, Pill, CalendarCheck, X, Loader2, Phone, Stethoscope, MessageSquarePlus } from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import { api, inr, type SessionUser } from '../lib/api';

interface Clinic { id: number; name: string; type: string; address: string; city: string; distance_km: number; rating: number; reviews_count: number; verified: boolean; open_hours: string; phone: string; specialties: string[]; fee_from: number; emergency_24x7: boolean; }
interface Doctor { id: number; clinic_id: number; name: string; specialty: string; qualification: string; exp_years: number; rating: number; consult_fee: number; video_fee: number; available_days: string; }
interface Stock { id: number; clinic_id: number; medicine: string; composition: string; price: number; in_stock: boolean; qty: number; }
interface CReview { id: number; clinic_id: number; user_name: string; rating: number; comment: string; }

const SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'];

const nextDays = (n: number) => {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
};

const pretty = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export default function Clinics({ user }: { user: SessionUser }) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState<'rating' | 'distance' | 'fee'>('rating');
  const [onlyER, setOnlyER] = useState(false);
  const [sel, setSel] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [reviews, setReviews] = useState<CReview[]>([]);
  const [loadingDet, setLoadingDet] = useState(false);
  const [day, setDay] = useState(nextDays(7)[0]);
  const [slot, setSlot] = useState('');
  const [docId, setDocId] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [rName, setRName] = useState(user.name);
  const [rRating, setRRating] = useState(5);
  const [rText, setRText] = useState('');
  const [rBusy, setRBusy] = useState(false);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const data = await api<Clinic[]>('/api/clinics');
      setClinics(data);
    } catch { setClinics([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchClinics(); }, []);

  const cities = useMemo(() => Array.from(new Set(clinics.map((c) => c.city))).sort(), [clinics]);

  const list = useMemo(() => {
    let rows = [...clinics];
    if (city) rows = rows.filter((c) => c.city === city);
    if (onlyER) rows = rows.filter((c) => c.emergency_24x7);
    if (q.trim()) {
      const n = q.trim().toLowerCase();
      rows = rows.filter((c) => [c.name, c.address, c.city, (c.specialties || []).join(' ')].join(' ').toLowerCase().includes(n));
    }
    rows.sort((a, b) => (sort === 'rating' ? b.rating - a.rating : sort === 'distance' ? a.distance_km - b.distance_km : a.fee_from - b.fee_from));
    return rows;
  }, [clinics, q, city, sort, onlyER]);

  const openClinic = async (c: Clinic) => {
    setSel(c);
    setBooked(false);
    setSlot('');
    setDocId(null);
    setLoadingDet(true);
    try {
      const [d, s, r] = await Promise.all([
        api<Doctor[]>('/api/doctors?clinic_id=' + c.id),
        api<Stock[]>('/api/pharmacy-stock?clinic_id=' + c.id),
        api<CReview[]>('/api/clinic-reviews?clinic_id=' + c.id),
      ]);
      setDoctors(d);
      setStock(s);
      setReviews(r);
    } catch {
      setDoctors([]);
      setStock([]);
      setReviews([]);
    } finally {
      setLoadingDet(false);
    }
  };

  const book = async () => {
    if (!sel || !slot) return;
    setBooking(true);
    try {
      await api('/api/appointments', { method: 'POST', body: { user_id: user.id, user_name: user.name, phone: user.phone || '', clinic_id: sel.id, doctor_id: docId, date: day, slot } });
      setBooked(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Booking fail');
    } finally {
      setBooking(false);
    }
  };

  const addReview = async () => {
    if (!sel || !rName.trim() || !rText.trim()) return;
    setRBusy(true);
    try {
      const r = await api<CReview>('/api/clinic-reviews', { method: 'POST', body: { clinic_id: sel.id, user_name: rName.trim(), rating: rRating, comment: rText.trim() } });
      setReviews((p) => [r, ...p]);
      setRText('');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Review fail');
    } finally {
      setRBusy(false);
    }
  };

  return (
    <div>
      <PageHero icon={<Hospital size={28} />} kicker="Verified Network" title="Clinics & Specialists" sub="Verified clinics — distance, rating/feedback, booking time aur dawa ki uplabdhta + daam, sab transparent." />
      <Reveal>
        <div className="mb-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border-2 border-slate-200 px-4 py-2.5 focus-within:border-[#1D6FF2]">
              <Search size={18} className="text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: clinic, doctor, specialty, area... (e.g. child, skin, Lucknow)" className="w-full bg-transparent text-sm font-medium outline-none" />
            </div>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-2xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 outline-none">
              <option value="">All Cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-2xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 outline-none">
              <option value="rating">Top Rated</option>
              <option value="distance">Nearest First</option>
              <option value="fee">Lowest Fee</option>
            </select>
            <button onClick={() => setOnlyER(!onlyER)} className={'rounded-2xl px-4 py-2.5 text-sm font-bold transition ' + (onlyER ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600')}>24×7 ER</button>
          </div>
        </div>
      </Reveal>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-slate-100">
          <p className="text-lg font-extrabold text-[#0B1F3A]">Koi clinic nahi mili</p>
          <p className="text-sm text-slate-500">Search ya filter badal kar dekhein.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 0.07}>
              <motion.div whileHover={{ y: -5 }} className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-xl">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow"><Hospital size={24} /></span>
                  <div className="flex flex-col items-end gap-1">
                    {c.verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200"><BadgeCheck size={12} /> Verified</span>}
                    {c.emergency_24x7 && <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 ring-1 ring-red-200">24×7 ER</span>}
                  </div>
                </div>
                <p className="mt-3 font-extrabold text-[#0B1F3A]">{c.name}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} /> {c.address}, {c.city} · {c.distance_km} km</p>
                <div className="mt-2 flex items-center gap-2 text-xs font-bold">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 ring-1 ring-amber-200"><Star size={12} className="fill-amber-400 text-amber-400" /> {Number(c.rating).toFixed(1)}</span>
                  <span className="text-slate-400">({c.reviews_count} reviews)</span>
                  <span className="ml-auto text-[#0B3D91]">Fee {inr(c.fee_from)}+</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(c.specialties || []).slice(0, 3).map((s) => <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{s}</span>)}
                </div>
                <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-400"><Clock size={12} /> {c.open_hours}</p>
                <button onClick={() => openClinic(c)} className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] py-2.5 text-sm font-bold text-white shadow hover:opacity-95">Details + Book Slot</button>
              </motion.div>
            </Reveal>
          ))}
        </div>
      )}
      <div className="mt-6"><Disclaimer compact /></div>

      <AnimatePresence>
        {sel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-2 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setSel(null)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">{sel.type} {sel.verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 ring-1 ring-emerald-200"><BadgeCheck size={11} /> MedGuide Verified</span>}</p>
                  <h3 className="mt-1 text-xl font-extrabold text-[#0B1F3A] sm:text-2xl">{sel.name}</h3>
                  <p className="flex items-center gap-1 text-[13px] text-slate-500"><MapPin size={13} /> {sel.address}, {sel.city} · {sel.distance_km} km away · {sel.open_hours}</p>
                </div>
                <button onClick={() => setSel(null)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200"><X size={18} /></button>
              </div>
              {loadingDet ? (
                <p className="flex items-center justify-center gap-2 py-10 text-sm font-bold text-[#1D6FF2]"><Loader2 size={18} className="animate-spin" /> Details load ho rahe hain...</p>
              ) : booked ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-5 rounded-3xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-200">
                  <p className="text-4xl">🎉</p>
                  <p className="mt-2 text-lg font-extrabold text-emerald-800">Slot Booked!</p>
                  <p className="text-sm text-emerald-700">{sel.name} · {pretty(day)} · {slot}</p>
                  <p className="mt-1 text-xs text-emerald-600">SMS/WhatsApp confirmation jald milega. Samay par pahuchein + reports saath rakhein.</p>
                  <button onClick={() => setSel(null)} className="mt-4 rounded-2xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white">Done</button>
                </motion.div>
              ) : (
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-[#0B1F3A]"><Stethoscope size={16} className="text-violet-600" /> Doctors ({doctors.length})</p>
                    {doctors.length === 0 ? <p className="text-[13px] text-slate-400">Doctor list jald update hogi.</p> : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {doctors.map((d) => (
                          <button key={d.id} onClick={() => setDocId(docId === d.id ? null : d.id)} className={'rounded-2xl border-2 p-3 text-left transition ' + (docId === d.id ? 'border-violet-500 bg-violet-50' : 'border-slate-100 hover:border-violet-200')}>
                            <p className="text-sm font-extrabold text-[#0B1F3A]">{d.name}</p>
                            <p className="text-xs text-slate-500">{d.specialty} · {d.qualification} · {d.exp_years} yrs</p>
                            <p className="mt-1 flex items-center gap-2 text-xs font-bold"><span className="inline-flex items-center gap-0.5 text-amber-600"><Star size={11} className="fill-amber-400 text-amber-400" />{Number(d.rating).toFixed(1)}</span><span className="text-slate-500">{inr(d.consult_fee)} visit</span></p>
                            <p className="text-[11px] text-slate-400">{d.available_days}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-[#0B1F3A]"><CalendarCheck size={16} className="text-[#1D6FF2]" /> Booking Time — din aur slot chunein</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {nextDays(7).map((d) => (
                        <button key={d} onClick={() => setDay(d)} className={'shrink-0 rounded-2xl border-2 px-3 py-2 text-xs font-bold ' + (day === d ? 'border-[#1D6FF2] bg-blue-50 text-[#0B3D91]' : 'border-slate-200 text-slate-500')}>{pretty(d)}</button>
                      ))}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {SLOTS.map((s) => (
                        <button key={s} onClick={() => setSlot(s)} className={'rounded-xl border-2 py-2 text-xs font-bold ' + (slot === s ? 'border-[#1D6FF2] bg-[#0B3D91] text-white' : 'border-slate-200 text-slate-600')}>{s}</button>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <button onClick={book} disabled={!slot || booking} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50">
                        {booking ? <><Loader2 size={16} className="animate-spin" /> Booking...</> : <><CalendarCheck size={16} /> Confirm Booking {slot ? '(' + slot + ')' : ''}</>}
                      </button>
                      <a href={'tel:' + sel.phone} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700"><Phone size={16} /> {sel.phone}</a>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-[#0B1F3A]"><Pill size={16} className="text-amber-600" /> Pharmacy — dawa available? Kaun si, kitne ki? ({stock.length})</p>
                    {stock.length === 0 ? <p className="text-[13px] text-slate-400">Stock info uplabdh nahi.</p> : (
                      <div className="max-h-44 overflow-y-auto rounded-2xl ring-1 ring-slate-200">
                        {stock.map((s) => (
                          <div key={s.id} className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 text-[13px] last:border-0">
                            <div className="min-w-0"><p className="truncate font-bold text-slate-700">{s.medicine}</p><p className="truncate text-[11px] text-slate-400">{s.composition}</p></div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="font-extrabold text-[#0B3D91]">{inr(s.price)}</span>
                              {s.in_stock ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">✓ In stock ({s.qty})</span> : <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">Out of stock</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-[#0B1F3A]"><MessageSquarePlus size={16} className="text-teal-600" /> Patient Feedback ({reviews.length})</p>
                    <div className="max-h-36 space-y-2 overflow-y-auto">
                      {reviews.length === 0 && <p className="text-[13px] text-slate-400">Abhi koi review nahi — pehle aap likhein!</p>}
                      {reviews.map((r) => (
                        <div key={r.id} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                          <p className="flex items-center justify-between text-[13px] font-bold text-slate-700">{r.user_name}<span className="inline-flex items-center gap-0.5 text-amber-600"><Star size={12} className="fill-amber-400 text-amber-400" />{r.rating}</span></p>
                          <p className="text-[13px] text-slate-600">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 rounded-2xl bg-blue-50/60 p-3 ring-1 ring-blue-100">
                      <div className="flex gap-2">
                        <input value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Aapka naam" className="w-32 rounded-xl border border-slate-200 px-2.5 py-2 text-[13px] outline-none" />
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRRating(n)}><Star size={17} className={n <= rRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} /></button>)}
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input value={rText} onChange={(e) => setRText(e.target.value)} placeholder="Apna anubhav likhein..." className="flex-1 rounded-xl border border-slate-200 px-2.5 py-2 text-[13px] outline-none" />
                        <button onClick={addReview} disabled={rBusy || !rText.trim()} className="rounded-xl bg-[#0B3D91] px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50">{rBusy ? '...' : 'Post'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

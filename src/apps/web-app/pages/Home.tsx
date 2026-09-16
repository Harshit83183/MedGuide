import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquareText, LayoutGrid, Activity, Hospital, Pill, Video, FolderHeart, Siren, Users, ArrowRight, Sparkles, ShieldCheck, Languages } from 'lucide-react';
import Reveal from '../components/Reveal';
import Disclaimer from '../components/Disclaimer';
import type { SessionUser } from '../lib/api';

const CARDS = [
  { to: '/symptom-checker', icon: MessageSquareText, c1: '#1D6FF2', c2: '#0B3D91', t: 'Symptom Checker', d: 'Free-text, photo ya voice note se apni takleef batayein — 6 bhashaon me.', tag: '6 Languages' },
  { to: '/common-problems', icon: LayoutGrid, c1: '#0EA5A4', c2: '#0B6B5E', t: 'Common Problems', d: 'Bukhar, sir-dard, sardi... basic sawalon se turant sahi salah.', tag: 'No AI needed' },
  { to: '/triage', icon: Activity, c1: '#22C55E', c2: '#15803D', t: 'Smart Triage', d: 'Green (self-care), Yellow (doctor), Red (emergency) — turant sort.', tag: 'G / Y / R' },
  { to: '/clinics', icon: Hospital, c1: '#8B5CF6', c2: '#5B21B6', t: 'Verified Clinics', d: 'Distance, rating, booking time + dawa uplabdhta aur daam.', tag: 'Verified ✓' },
  { to: '/medicines', icon: Pill, c1: '#F59E0B', c2: '#B45309', t: 'Save on Medicines', d: 'Jan Aushadhi vs brand — same composition, kitni bachat? Calculator.', tag: 'Up to 90% off' },
  { to: '/video-consult', icon: Video, c1: '#EC4899', c2: '#9D174D', t: 'Video Consultation', d: '₹400 me 3 meetings × 10 min — ghar baithe doctor se baat.', tag: '₹400 pack' },
  { to: '/records', icon: FolderHeart, c1: '#0EA5E9', c2: '#0C4A6E', t: 'Health Records', d: 'Purani saari problems ka record + future advice, ek jagah.', tag: 'Timeline' },
  { to: '/family', icon: Users, c1: '#64748B', c2: '#1E293B', t: 'Family Profiles', d: 'Maa, papa, bachche — poore parivaar ka health hub.', tag: 'Parivaar' },
];

export default function Home({ user }: { user: SessionUser }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Suprabhat' : hour < 17 ? 'Namaste' : 'Shubh Sandhya';
  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B3D91] via-[#1a5fd0] to-[#0B1F3A] p-6 text-white shadow-2xl sm:p-10">
        <motion.div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" animate={{ scale: [1, 1.35, 1], rotate: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} />
        <motion.div className="absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" animate={{ scale: [1.3, 1, 1.3] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-6 top-6 hidden text-[90px] opacity-20 md:block">🩺</motion.div>
        <div className="relative">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/25">
            <Sparkles size={13} /> {greet}, {user.name.split(' ')[0]}!
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
            Aaj aapki sehat me <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">kaise madad</span> kar sakte hain?
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 max-w-xl text-sm text-blue-100 sm:text-[15px]">
            Apni bhasha me takleef batayein, turant triage payein, verified doctor book karein aur dawaiyon par bachat karein.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 flex flex-wrap gap-3">
            <Link to="/symptom-checker" className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-[#0B3D91] shadow-xl transition hover:bg-blue-50">
              Takleef Batayein <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <Link to="/sos" className="flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-red-900/40 transition hover:bg-red-500">
              <Siren size={18} /> Emergency SOS
            </Link>
          </motion.div>
          <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold">
            {['Hindi', 'English', 'Hinglish', 'Marathi', 'Tamil', 'Bengali'].map((l) => (
              <span key={l} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/20"><Languages size={11} /> {l}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c, i) => (
          <Reveal key={c.to} delay={(i % 4) * 0.08}>
            <Link to={c.to} className="group relative block h-full overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-xl hover:ring-blue-100">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-10 transition group-hover:scale-150" style={{ background: 'linear-gradient(135deg,' + c.c1 + ',' + c.c2 + ')' }} />
              <motion.span whileHover={{ rotate: -10, scale: 1.1 }} className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: 'linear-gradient(135deg,' + c.c1 + ',' + c.c2 + ')' }}>
                <c.icon size={24} />
              </motion.span>
              <p className="mt-3 font-extrabold text-[#0B1F3A]">{c.t}</p>
              <p className="mt-1 min-h-[40px] text-[13px] leading-snug text-slate-500">{c.d}</p>
              <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 group-hover:bg-blue-50 group-hover:text-[#0B3D91]">{c.tag}</span>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mb-8 grid gap-4 rounded-[28px] bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white shadow-xl sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-200"><Siren size={16} /> 1-Tap Emergency SOS</p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Emergency? Ek tap me madad.</h2>
            <p className="mt-1 text-sm text-red-100">Location + contacts ko turant alert · 108 / 112 direct dial · ER first-aid steps</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/sos" className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white text-xl font-extrabold text-red-600 shadow-2xl">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
              <span className="relative">SOS</span>
            </Link>
          </motion.div>
        </div>
      </Reveal>

      <Reveal>
        <div className="mb-6 grid gap-4 rounded-[28px] bg-white p-6 ring-1 ring-slate-100 sm:grid-cols-3 sm:p-8">
          {[['🛡️', 'DPDP Act 2023', 'Aapka data, aapka haq. Bina permission kuch share nahi.'], ['🔒', '256-bit Encrypted', 'Bank-jaisi security har photo, voice aur record par.'], ['✅', 'Verified Network', 'Licensed clinics aur registered doctors hi listed.']].map(([e, t, d]) => (
            <div key={t as string} className="flex gap-3">
              <span className="text-3xl">{e}</span>
              <div><p className="font-extrabold text-[#0B1F3A]">{t}</p><p className="text-[13px] text-slate-500">{d}</p></div>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal><Disclaimer /></Reveal>
      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400"><ShieldCheck size={13} /> MedGuide health guidance deta hai — diagnosis/prescription ka vikalp nahi.</p>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Star, ShieldCheck, Lock, Quote, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { MedGuideMark } from './MedIcons';

interface Tst { id: number; name: string; city: string; rating: number; message: string; tag: string; }

export default function Footer() {
  const [items, setItems] = useState<Tst[]>([]);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    api<Tst[]>('/api/testimonials').then(setItems).catch(() => undefined);
  }, []);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);
  const cur = items[idx];
  return (
    <footer className="mt-16">
      <div className="border-y border-slate-200 bg-gradient-to-br from-slate-50 via-blue-50/60 to-teal-50/50">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8 text-center">
            <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0B3D91] shadow-sm ring-1 ring-blue-100">
              <BadgeCheck size={14} /> Patient Testimonials
            </p>
            <h3 className="text-2xl font-extrabold text-[#0B1F3A] sm:text-3xl">Log kya kehte hain MedGuide ke baare me</h3>
            <p className="mt-1 text-sm text-slate-500">Real experiences, real savings, real care.</p>
          </div>
          <div className="relative mx-auto min-h-[190px] max-w-3xl">
            <AnimatePresence mode="wait">
              {cur && (
                <motion.figure
                  key={cur.id}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-3xl bg-white p-6 shadow-xl shadow-blue-100/60 ring-1 ring-slate-100 sm:p-8"
                >
                  <Quote size={30} className="mb-3 text-blue-200" />
                  <blockquote className="text-[15px] leading-relaxed text-slate-700">&ldquo;{cur.message}&rdquo;</blockquote>
                  <figcaption className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0B1F3A]">{cur.name} <span className="font-medium text-slate-400">&middot; {cur.city}</span></p>
                      <p className="text-xs text-slate-500">{cur.tag}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={15} className={i < cur.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                      ))}
                    </div>
                  </figcaption>
                </motion.figure>
              )}
            </AnimatePresence>
            {items.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button onClick={() => setIdx((idx - 1 + items.length) % items.length)} className="rounded-full bg-white p-2 shadow ring-1 ring-slate-200 hover:bg-slate-50"><ChevronLeft size={18} /></button>
                <div className="flex gap-1.5">
                  {items.slice(0, 8).map((_, i) => (
                    <button key={i} onClick={() => setIdx(i % items.length)} className={'h-2 rounded-full transition-all ' + (i % items.length === idx ? 'w-6 bg-[#0B3D91]' : 'w-2 bg-slate-300')} />
                  ))}
                </div>
                <button onClick={() => setIdx((idx + 1) % items.length)} className="rounded-full bg-white p-2 shadow ring-1 ring-slate-200 hover:bg-slate-50"><ChevronRight size={18} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-[#0B1F3A] text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <MedGuideMark size={36} />
              <div>
                <p className="text-lg font-extrabold text-white">MedGuide</p>
                <p className="text-[11px] text-slate-400">Sehat ka Smart Saathi</p>
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-400">MedGuide health guidance, verified clinics aur affordable dawaiyon tak pahunch aasaan banata hai — rural aur urban Bharat, dono ke liye.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1"><ShieldCheck size={12} className="text-emerald-300" /> Data Safe</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1"><Lock size={12} className="text-sky-300" /> 256-bit Encrypted</span>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Features</p>
            <ul className="space-y-2 text-[13px]">
              <li><Link className="hover:text-white" to="/symptom-checker">Symptom Checker</Link></li>
              <li><Link className="hover:text-white" to="/common-problems">Common Problems</Link></li>
              <li><Link className="hover:text-white" to="/clinics">Verified Clinics</Link></li>
              <li><Link className="hover:text-white" to="/medicines">Jan Aushadhi Savings</Link></li>
              <li><Link className="hover:text-white" to="/video-consult">Video Consultation</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Account</p>
            <ul className="space-y-2 text-[13px]">
              <li><Link className="hover:text-white" to="/records">My Health Records</Link></li>
              <li><Link className="hover:text-white" to="/family">Family Profiles</Link></li>
              <li><Link className="hover:text-white" to="/sos">Emergency SOS</Link></li>
              <li><Link className="hover:text-white" to="/privacy">Privacy Policy</Link></li>
              <li><Link className="hover:text-white" to="/legal">Medical Disclaimer</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Emergency</p>
            <div className="space-y-2">
              <a href="tel:108" className="block rounded-xl bg-red-600/20 px-3 py-2 text-center text-sm font-bold text-red-200 ring-1 ring-red-500/40 hover:bg-red-600/30">🚨 Call 108 — Ambulance</a>
              <a href="tel:112" className="block rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/15">Call 112 — Emergency</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-[11px] text-slate-400 sm:flex-row">
            <p>© 2026 MedGuide. Health guidance only — not a substitute for professional medical advice.</p>
            <p className="inline-flex items-center gap-1"><Lock size={12} /> 256-bit Encrypted · DPDP Act 2023 Compliant</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

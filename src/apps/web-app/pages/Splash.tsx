import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Stethoscope, HeartPulse, Pill, Video } from 'lucide-react';
import { MedGuideMark } from '../components/MedIcons';

export default function Splash({ onDone, name }: { onDone: () => void; name: string }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1400);
    const t2 = setTimeout(() => setStage(2), 2600);
    const t3 = setTimeout(onDone, 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#081426] via-[#0B3D91] to-[#0B1F3A] text-white">
      <motion.div className="absolute h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-[120px]" animate={{ scale: [1, 1.3, 1], rotate: [0, 40, 0] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute h-[380px] w-[380px] rounded-full bg-teal-400/15 blur-[110px]" animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 7, repeat: Infinity }} />
      {[Stethoscope, HeartPulse, Pill, Video].map((Icon, i) => (
        <motion.span key={i} className="absolute text-white/15" style={{ left: 8 + i * 24 + '%', top: '12%' }} animate={{ y: [0, 420, 0], rotate: [0, 25, 0], opacity: [0.15, 0.4, 0.15] }} transition={{ duration: 9 + i * 2, repeat: Infinity, ease: 'easeInOut' }}>
          <Icon size={54} />
        </motion.span>
      ))}
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div key="s0" exit={{ opacity: 0, scale: 0.85 }} className="relative flex flex-col items-center">
            <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 13 }} className="relative">
              <motion.div className="absolute -inset-5 rounded-[28px] border-2 border-white/30" animate={{ rotate: 360 }} transition={{ duration: 3.4, repeat: Infinity, ease: 'linear' }} style={{ borderTopColor: '#7DD3FC', borderRightColor: 'transparent' }} />
              <MedGuideMark size={104} />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              MedGuide
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-2 text-sm font-medium tracking-[0.3em] text-sky-200">SEHAT KA SMART SAATHI</motion.p>
          </motion.div>
        )}
        {stage === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="relative flex flex-col items-center px-6 text-center">
            <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-2xl font-bold sm:text-3xl">Namaste, {name.split(' ')[0] || 'Dost'}! 🙏</motion.p>
            <p className="mt-2 max-w-md text-[15px] text-blue-100">Aapka personal health companion taiyaar hai — symptoms, doctors, dawai-bachat aur emergency, sab ek jagah.</p>
            <div className="mt-6 flex gap-3">
              {[0, 1, 2].map((d) => (
                <motion.span key={d} className="h-2.5 w-2.5 rounded-full bg-sky-300" animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.18 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative flex flex-col items-center gap-3 px-6 text-center">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold ring-1 ring-white/25 backdrop-blur">
              <ShieldCheck size={18} className="text-emerald-300" /> Your data is safe with MedGuide
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold ring-1 ring-white/25 backdrop-blur">
              <Lock size={16} className="text-sky-300" /> 256-bit Encrypted Data Privacy
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-10 h-1 w-52 overflow-hidden rounded-full bg-white/15">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-emerald-300" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3.5, ease: 'easeInOut' }} />
      </div>
    </div>
  );
}

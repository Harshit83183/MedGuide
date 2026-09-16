import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export default function PageHero({ icon, kicker, title, sub }: { icon: ReactNode; kicker: string; title: string; sub: string }) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3D91] via-[#1559c7] to-[#0B1F3A] p-6 text-white shadow-xl sm:p-8">
      <motion.div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" animate={{ scale: [1, 1.25, 1], x: [0, -18, 0] }} transition={{ duration: 9, repeat: Infinity }} />
      <motion.div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-teal-300/20 blur-2xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 7, repeat: Infinity }} />
      <div className="relative flex items-start gap-4">
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/25">
          {icon}
        </motion.div>
        <div>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-200">{kicker}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-1 text-2xl font-extrabold sm:text-3xl">{title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }} className="mt-1 max-w-2xl text-[13px] text-blue-100 sm:text-sm">{sub}</motion.p>
        </div>
      </div>
    </div>
  );
}

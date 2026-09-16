import { ShieldCheck, Lock, FileCheck2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrustBar({ slim = false }: { slim?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full bg-gradient-to-r from-[#0B1F3A] via-[#10407c] to-[#0B1F3A] text-white"
    >
      <div className={`mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-1 px-4 text-center ${slim ? 'py-1.5 text-[11px]' : 'py-2 text-xs sm:text-[13px]'}`}>
        <span className="inline-flex items-center gap-1.5 font-medium tracking-wide">
          <ShieldCheck size={15} className="text-emerald-300" /> Your data is safe with MedGuide
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium tracking-wide">
          <Lock size={14} className="text-sky-300" /> 256-bit Encrypted Data Privacy
        </span>
        <span className="hidden items-center gap-1.5 font-medium tracking-wide md:inline-flex">
          <FileCheck2 size={14} className="text-teal-300" /> DPDP Act 2023 Compliant
        </span>
      </div>
    </motion.div>
  );
}

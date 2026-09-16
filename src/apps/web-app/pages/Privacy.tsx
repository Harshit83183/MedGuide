import { ShieldCheck, Lock, EyeOff, FileCheck2, Trash2, Bell } from 'lucide-react';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';

const CARDS = [
  { icon: Lock, t: '256-bit Encryption', d: 'Aapki har photo, voice note aur health record bank-grade 256-bit encryption se surakshit hai — transfer me bhi, storage me bhi.' },
  { icon: EyeOff, t: 'Aapka Data, Aapka Haq', d: 'DPDP Act 2023 ke tahat aapka data bina aapki saaf permission ke kabhi share, becha ya misuse nahi hoga.' },
  { icon: FileCheck2, t: 'Minimum Data, Maximum Care', d: 'Hum sirf utna data lete hain jitna aapki madad ke liye zaroori hai. Koi hidden tracking nahi.' },
  { icon: Trash2, t: 'Delete Anytime', d: 'Koi bhi record ya poora account ek request par permanently delete — no questions, no delay.' },
  { icon: Bell, t: 'Transparent Alerts', d: 'Jab bhi aapka data access ho (jaise SOS par), aapko turant suchna milegi.' },
  { icon: ShieldCheck, t: 'Verified Partners Only', d: 'Clinics aur doctors ko list karne se pehle license + registration verify hota hai.' },
];

export default function Privacy() {
  return (
    <div>
      <PageHero icon={<ShieldCheck size={28} />} kicker="Trust & Safety" title="Privacy Policy" sub="Seedhi-saadi bhasha me — aapka data kaise surakshit hai, kaun dekhta hai, aur aapke adhikaar kya hain." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c, i) => (
          <Reveal key={c.t} delay={(i % 3) * 0.07}>
            <div className="h-full rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1D6FF2] to-[#0B3D91] text-white shadow"><c.icon size={22} /></span>
              <p className="mt-3 font-extrabold text-[#0B1F3A]">{c.t}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{c.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <div className="mt-6 rounded-3xl bg-[#0B1F3A] p-6 text-white sm:p-8">
          <h3 className="text-lg font-extrabold">Aapke Adhikaar (DPDP Act 2023)</h3>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <li>✓ Apna saara data dekhne ka haq (Right to Access)</li>
            <li>✓ Galat data sudharne ka haq (Right to Correction)</li>
            <li>✓ Data delete karwane ka haq (Right to Erasure)</li>
            <li>✓ Permission wapas lene ka haq (Withdraw Consent)</li>
            <li>✓ Shikayat karne ka haq (Grievance: care@medguide.in)</li>
            <li>✓ Data breach par suchna ka haq (72 hrs)</li>
          </ul>
        </div>
      </Reveal>
    </div>
  );
}

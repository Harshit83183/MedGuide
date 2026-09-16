import { Scale, Stethoscope, Pill, Video, AlertTriangle } from 'lucide-react';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import Disclaimer from '../components/Disclaimer';

export default function Legal() {
  return (
    <div>
      <PageHero icon={<Scale size={28} />} kicker="Legal & Compliance" title="Medical Disclaimer" sub="MedGuide kya hai, kya nahi — aur kaun se kanoon hum follow karte hain. Kripya dhyaan se padhein." />
      <Reveal><Disclaimer /></Reveal>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-slate-100">
            <p className="flex items-center gap-2 font-extrabold text-[#0B1F3A]"><Stethoscope size={18} className="text-[#1D6FF2]" /> MedGuide kya HAI</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li>✓ General health <b>guidance & triage support</b> tool</li>
              <li>✓ Verified clinics/doctors tak pahunch ka <b>directory + booking</b> platform</li>
              <li>✓ Dawa price <b>comparison & savings</b> calculator</li>
              <li>✓ Registered doctors se <b>telemedicine</b> suvidha</li>
              <li>✓ Emergency me <b>SOS alert + helpline</b> dispatcher</li>
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.07}>
          <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-slate-100">
            <p className="flex items-center gap-2 font-extrabold text-[#0B1F3A]"><AlertTriangle size={18} className="text-red-500" /> MedGuide kya NAHI hai</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li>✗ Yeh <b>diagnosis nahi</b> deta (bimari ka naam pakka nahi batata)</li>
              <li>✗ Yeh <b>dawa prescribe nahi</b> karta — koi antibiotic/dose salah nahi</li>
              <li>✗ Yeh doctor, ambulance ya hospital ka <b>vikalp nahi</b></li>
              <li>✗ Emergency me app par <b>bharosa karke wait na karein</b> — 108/112 call karein</li>
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-slate-100">
            <p className="flex items-center gap-2 font-extrabold text-[#0B1F3A]"><Pill size={18} className="text-amber-600" /> Dawaon par Niyam</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li>• Prices <b>indicative</b> hain; store/MRP par confirm karein</li>
              <li>• Brand switch se pehle <b>doctor/pharmacist</b> se salah lein</li>
              <li>• Schedule H/H1/X dawaiyan <b>bina prescription nahi</b></li>
              <li>• Drugs & Cosmetics Rules ka paalan; koi online sale nahi</li>
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.07}>
          <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-slate-100">
            <p className="flex items-center gap-2 font-extrabold text-[#0B1F3A]"><Video size={18} className="text-pink-600" /> Telemedicine Niyam</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li>• Sirf <b>registered medical practitioners</b> consult dete hain</li>
              <li>• <b>NMC Telemedicine Practice Guidelines 2020</b> laagu</li>
              <li>• Prohibited medicines ka e-prescription <b>allowed nahi</b></li>
              <li>• Emergency cases me video consult ke bajay <b>ER refer</b> kiya jata hai</li>
            </ul>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.1}>
        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-[13px] leading-relaxed text-slate-600">
          <p className="font-extrabold text-[#0B1F3A]">Kanooni Dhyan (Legal Boundaries)</p>
          <p className="mt-1">MedGuide Information Technology Act 2000 (Intermediary), DPDP Act 2023, Drugs & Cosmetics Rules 1945, aur NMC Telemedicine Guidelines 2020 ke dayre me kaam karta hai. Platform koi medical diagnosis/prescription jaari nahi karta; saare clinical faisle licensed doctors lete hain. Kisi bhi takleef par antim nirnay aapke treating doctor ka hoga. Emergency: <b>108 (Ambulance) / 112 (National Emergency)</b>.</p>
        </div>
      </Reveal>
    </div>
  );
}

import type { ReactNode } from 'react';
import { useLanguage } from '../lib/language';

export type ReportTab = 'overview' | 'care' | 'medicines' | 'clinics';

const labels = {
  en: ['Overview', 'Care Plan', 'Medicines', 'Clinics'],
  hi: ['सारांश', 'देखभाल योजना', 'दवाइयाँ', 'क्लिनिक'],
  hinglish: ['Overview', 'Care Plan', 'Medicines', 'Clinics'],
  mr: ['आढावा', 'काळजी योजना', 'औषधे', 'दवाखाने'],
  ta: ['சுருக்கம்', 'பராமரிப்புத் திட்டம்', 'மருந்துகள்', 'மருத்துவமனைகள்'],
  bn: ['সারাংশ', 'যত্ন পরিকল্পনা', 'ওষুধ', 'ক্লিনিক']
};
const ids: ReportTab[] = ['overview', 'care', 'medicines', 'clinics'];

export default function ReportTabs({ active, onChange, children }: {
  active: ReportTab;
  onChange: (tab: ReportTab) => void;
  children?: ReactNode;
}) {
  const { lang } = useLanguage();
  const names = labels[lang as keyof typeof labels] || labels.en;
  return <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
    <div role="tablist" aria-label="Health report sections" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ids.map((id, index) => <button key={id} type="button" role="tab" aria-selected={active === id}
        onClick={() => onChange(id)}
        className={`rounded-xl px-3 py-3 text-sm font-extrabold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${active === id ? 'bg-[#0B3D91] text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-800'}`}>
        {names[index]}
      </button>)}
    </div>
    {children}
  </div>;
}

import { AlertTriangle } from 'lucide-react';

export default function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={'rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 ' + (compact ? 'p-3 text-xs' : 'p-4 text-[13px]')}>
      <p className="flex items-start gap-2">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <span><b>Medical Disclaimer:</b> MedGuide sirf general health <b>guidance</b> deta hai — yeh <b>diagnosis ya prescription nahi</b> hai. Koi bhi dawa doctor/pharmacist ki salah ke bina na lein. Emergency me turant <b>108 / 112</b> par call karein.</span>
      </p>
    </div>
  );
}

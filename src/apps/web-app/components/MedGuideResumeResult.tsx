import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileHeart } from 'lucide-react';
export default function MedGuideResumeResult({storageKey,resultPath}:{storageKey:string;resultPath:string}) {
  const [available] = useState(() => {try {return Boolean(sessionStorage.getItem(storageKey));} catch {return false;}});
  if (!available) return null;
  return <Link to={resultPath} className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900 shadow-sm"><span className="flex items-center gap-2 font-bold"><FileHeart size={22}/> Your previous result is still available</span><span className="shrink-0 rounded-xl bg-blue-800 px-3 py-2 text-sm font-bold text-white">View result →</span></Link>;
}

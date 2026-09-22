import { useEffect, useState } from 'react';
import { MapPin, ShieldCheck, Loader2 } from 'lucide-react';
import { useLanguage } from '../lib/language';
import type { SessionUser } from '../lib/api';
import { getCareLocation, requestCareLocation, saveCareLocation } from '../lib/careLocation';

const words = {
  en: ['Location access required', 'MedGuide needs your current location to show relevant nearby care. Allow location to continue. Your browser controls this permission; you can revoke it in browser settings.', 'Allow current location', 'Checking location...', 'Location is blocked or unavailable. Enable location for this site in browser settings, then retry.', 'Your location is used for nearby searches, not for diagnosing conditions.'],
  hi: ['लोकेशन की अनुमति ज़रूरी है', 'नज़दीकी क्लिनिक दिखाने के लिए वर्तमान लोकेशन की अनुमति दें। ब्राउज़र सेटिंग में यह अनुमति बदली जा सकती है।', 'लोकेशन की अनुमति दें', 'लोकेशन जाँच रहे हैं...', 'लोकेशन बंद है। ब्राउज़र सेटिंग में इस साइट के लिए अनुमति दें और फिर कोशिश करें।', 'लोकेशन का उपयोग नज़दीकी सेवाएँ खोजने के लिए होगा, रोग का निदान करने के लिए नहीं।'],
  hinglish: ['Location access zaroori hai', 'Nearby clinics dikhane ke liye current location allow karein. Browser settings se permission kabhi bhi badal sakte hain.', 'Location allow karein', 'Location check ho rahi hai...', 'Location blocked hai. Browser settings mein site ko allow karke retry karein.', 'Location sirf nearby search ke liye hai, diagnosis ke liye nahi.'],
  mr: ['स्थानाची परवानगी आवश्यक', 'जवळील दवाखाने शोधण्यासाठी सध्याचे स्थान वापरण्याची परवानगी द्या.', 'स्थानाची परवानगी द्या', 'स्थान तपासत आहोत...', 'स्थान उपलब्ध नाही. ब्राउझर सेटिंगमध्ये परवानगी देऊन पुन्हा प्रयत्न करा.', 'स्थान फक्त जवळील सेवा शोधण्यासाठी वापरले जाते.'],
  ta: ['இருப்பிட அனுமதி தேவை', 'அருகிலுள்ள மருத்துவ மையங்களைக் கண்டறிய தற்போதைய இருப்பிடத்தை அனுமதிக்கவும்.', 'இருப்பிடத்தை அனுமதி', 'இருப்பிடத்தைச் சரிபார்க்கிறது...', 'இருப்பிடம் கிடைக்கவில்லை. உலாவி அமைப்பில் அனுமதித்து மீண்டும் முயலவும்.', 'இருப்பிடம் அருகிலுள்ள சேவைகளைத் தேட மட்டுமே பயன்படும்.'],
  bn: ['অবস্থানের অনুমতি প্রয়োজন', 'কাছাকাছি চিকিৎসাকেন্দ্র খুঁজতে বর্তমান অবস্থানের অনুমতি দিন।', 'অবস্থান অনুমোদন করুন', 'অবস্থান যাচাই করা হচ্ছে...', 'অবস্থান পাওয়া যায়নি। ব্রাউজার সেটিংসে অনুমতি দিয়ে আবার চেষ্টা করুন।', 'অবস্থান শুধু কাছাকাছি পরিষেবা খোঁজার জন্য ব্যবহৃত হয়।']
};

export default function LocationOnboarding({ user }: { user: SessionUser }) {
  const { lang } = useLanguage();
  const t = words[lang as keyof typeof words] || words.en;
  const [blocked, setBlocked] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    const update = () => setLanguageReady(!!localStorage.getItem(`medguide_preferred_language_${user.id}`));
    update();
    window.addEventListener('medguide-language-selected', update);
    return () => window.removeEventListener('medguide-language-selected', update);
  }, [user.id]);

  useEffect(() => {
    if (!languageReady) return;
    let alive = true;
    const verify = async () => {
      try {
        if (!navigator.permissions) { if (alive) setBlocked(true); return; }
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted') {
          try {
            const position = await requestCareLocation();
            if (alive) {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              const saved = getCareLocation(user.id);
              const label = saved?.source === 'device' && Math.abs(saved.lat - lat) < 0.002 && Math.abs(saved.lon - lon) < 0.002 ? saved.label : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
              saveCareLocation(user.id, { lat, lon, label, source: 'device' });
              setBlocked(false);
            }
          } catch { if (alive) setBlocked(true); }
        } else if (alive) setBlocked(true);
        permission.onchange = () => {
          if (permission.state !== 'granted') {
            if (alive) setBlocked(true);
          } else if (alive && getCareLocation(user.id)?.source === 'device') {
            setBlocked(false);
          }
        };
      } catch { if (alive) setBlocked(true); }
    };
    void verify();
    const onFocus = () => void verify();
    window.addEventListener('focus', onFocus);
    return () => { alive = false; window.removeEventListener('focus', onFocus); };
  }, [languageReady, user.id]);

  const locate = async () => {
    setBusy(true); setError('');
    try {
      const position = await requestCareLocation();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      let label = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      try {
        const response = await fetch(`/api/reverse-location?lat=${lat}&lon=${lon}`);
        if (response.ok) {
          const data = await response.json() as { label?: string };
          if (data.label) label = data.label;
        }
      } catch { }
      saveCareLocation(user.id, { lat, lon, label, source: 'device' });
      setBlocked(false);
    } catch { setBlocked(true); setError(t[4]); }
    finally { setBusy(false); }
  };

  if (!languageReady || !blocked) return null;
  return <div className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto bg-slate-950/90 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-label={t[0]} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-9">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-800"><MapPin size={28}/></div>
    <h2 className="mt-5 text-center text-2xl font-extrabold text-slate-900">{t[0]}</h2>
    <p className="mt-3 text-center text-sm leading-6 text-slate-600">{t[1]}</p>
    <p className="mt-5 flex gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900"><ShieldCheck size={18} className="shrink-0"/>{t[5]}</p>
    <button type="button" disabled={busy} onClick={() => void locate()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? <Loader2 className="animate-spin" size={18}/> : <MapPin size={18}/>} {busy ? t[3] : t[2]}</button>
    {error && <p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    <p className="mt-4 text-center text-xs text-slate-500">Location requires HTTPS or localhost. If denied, enable location in your browser's site settings.</p>
  </section></div>;
}


import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, ShieldCheck, Loader2 } from 'lucide-react';
import { useLanguage } from '../lib/language';
import type { SessionUser } from '../lib/api';
import {
  getCareLocation,
  requestCareLocation,
  saveCareLocation
} from '../lib/careLocation';

const words = {
  en: [
    'Location access required',
    'MedGuide needs your current location to show nearby care. Allow location to continue.',
    'Allow current location',
    'Checking location...',
    'Location is blocked or unavailable. Enable location for this site in browser settings, then retry.',
    'Your location is used for nearby searches, not for diagnosing conditions.'
  ],
  hi: [
    'लोकेशन की अनुमति ज़रूरी है',
    'नज़दीकी क्लिनिक दिखाने के लिए अपनी वर्तमान लोकेशन की अनुमति दें।',
    'लोकेशन की अनुमति दें',
    'लोकेशन जाँच रहे हैं...',
    'लोकेशन उपलब्ध नहीं है। ब्राउज़र सेटिंग में इस साइट के लिए अनुमति दें और फिर कोशिश करें।',
    'लोकेशन का उपयोग नज़दीकी सेवाएँ खोजने के लिए होगा, रोग का निदान करने के लिए नहीं।'
  ],
  hinglish: [
    'Location access zaroori hai',
    'Nearby clinics dikhane ke liye current location allow karein.',
    'Location allow karein',
    'Location check ho rahi hai...',
    'Location blocked hai. Browser settings mein permission allow karke retry karein.',
    'Location sirf nearby care search ke liye hai, diagnosis ke liye nahi.'
  ],
  mr: [
    'स्थानाची परवानगी आवश्यक',
    'जवळील दवाखाने शोधण्यासाठी सध्याचे स्थान वापरण्याची परवानगी द्या.',
    'स्थानाची परवानगी द्या',
    'स्थान तपासत आहोत...',
    'स्थान उपलब्ध नाही. ब्राउझर सेटिंगमध्ये परवानगी देऊन पुन्हा प्रयत्न करा.',
    'स्थान फक्त जवळील सेवा शोधण्यासाठी वापरले जाते.'
  ],
  ta: [
    'இருப்பிட அனுமதி தேவை',
    'அருகிலுள்ள மருத்துவ மையங்களைக் கண்டறிய தற்போதைய இருப்பிடத்தை அனுமதிக்கவும்.',
    'இருப்பிடத்தை அனுமதி',
    'இருப்பிடத்தைச் சரிபார்க்கிறது...',
    'இருப்பிடம் கிடைக்கவில்லை. உலாவி அமைப்பில் அனுமதித்து மீண்டும் முயலவும்.',
    'இருப்பிடம் அருகிலுள்ள சேவைகளைத் தேட மட்டுமே பயன்படும்.'
  ],
  bn: [
    'অবস্থানের অনুমতি প্রয়োজন',
    'কাছাকাছি চিকিৎসাকেন্দ্র খুঁজতে বর্তমান অবস্থানের অনুমতি দিন।',
    'অবস্থান অনুমোদন করুন',
    'অবস্থান যাচাই করা হচ্ছে...',
    'অবস্থান পাওয়া যায়নি। ব্রাউজার সেটিংসে অনুমতি দিয়ে আবার চেষ্টা করুন।',
    'অবস্থান শুধু কাছাকাছি পরিষেবা খোঁজার জন্য ব্যবহৃত হয়।'
  ]
};

type Props = {
  user: SessionUser;
  onGranted: () => void;
};

export default function LocationOnboarding({
  user,
  onGranted
}: Props) {
  const { lang } = useLanguage();
  const t = words[lang as keyof typeof words] || words.en;

  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  const activeRef = useRef(true);
  const runningRef = useRef(false);

  const storePosition = useCallback(
    (position: GeolocationPosition, labelOverride?: string) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const previous = getCareLocation(user.id);

      const label =
        labelOverride ||
        (
          previous?.source === 'device' &&
          Math.abs(previous.lat - lat) < 0.002 &&
          Math.abs(previous.lon - lon) < 0.002
            ? previous.label
            : `${lat.toFixed(4)}, ${lon.toFixed(4)}`
        );

      saveCareLocation(user.id, {
        lat,
        lon,
        label,
        source: 'device'
      });

      onGranted();
    },
    [user.id, onGranted]
  );

  useEffect(() => {
    activeRef.current = true;

    const verifyExistingAccess = async () => {
      if (runningRef.current) return;

      runningRef.current = true;
      setChecking(true);

      try {
        if (!navigator.geolocation) {
          throw new Error('Geolocation unavailable');
        }

        if (navigator.permissions) {
          const permission = await navigator.permissions.query({
            name: 'geolocation'
          });

          if (!activeRef.current) return;

          if (permission.state !== 'granted') return;
        } else {
          return;
        }

        const position = await requestCareLocation();

        if (activeRef.current) {
          storePosition(position);
        }
      } catch {
        if (activeRef.current) setError('');
      } finally {
        runningRef.current = false;

        if (activeRef.current) {
          setChecking(false);
        }
      }
    };

    void verifyExistingAccess();

    return () => {
      activeRef.current = false;
    };
  }, [storePosition]);

  const allowLocation = async () => {
    if (runningRef.current) return;

    runningRef.current = true;
    setBusy(true);
    setError('');

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation unavailable');
      }

      const position = await requestCareLocation();

      if (!activeRef.current) return;

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      let label = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

      try {
        const response = await fetch(
          `/api/reverse-location?lat=${lat}&lon=${lon}`
        );

        if (response.ok) {
          const data = (await response.json()) as {
            label?: string;
          };

          if (data.label) {
            label = data.label;
          }
        }
      } catch {
      }

      if (activeRef.current) {
        storePosition(position, label);
      }
    } catch {
      if (activeRef.current) {
        setError(t[4]);
      }
    } finally {
      runningRef.current = false;

      if (activeRef.current) {
        setBusy(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto bg-slate-950/90 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={t[0]}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-9"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
          <MapPin size={28} />
        </div>

        <h2 className="mt-5 text-center text-2xl font-extrabold text-slate-900">
          {t[0]}
        </h2>

        <p className="mt-3 text-center text-sm leading-6 text-slate-600">
          {t[1]}
        </p>

        <p className="mt-5 flex gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">
          <ShieldCheck size={18} className="shrink-0" />
          {t[5]}
        </p>

        <button
          type="button"
          disabled={busy || checking}
          onClick={() => void allowLocation()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3 font-bold text-white disabled:opacity-60"
        >
          {busy || checking ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <MapPin size={18} />
          )}

          {busy || checking ? t[3] : t[2]}
        </button>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
          >
            {error}
          </p>
        )}

        <p className="mt-4 text-center text-xs text-slate-500">
          Location requires HTTPS or localhost. If blocked, enable
          location in your browser settings and retry.
        </p>
      </section>
    </div>
  );
}
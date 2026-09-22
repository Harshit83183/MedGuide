
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  HeartPulse,
  Home,
  Hospital,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
  TriangleAlert
} from 'lucide-react';
import Disclaimer from '../components/Disclaimer';
import RecommendedCare from '../components/RecommendedCare';
import ReportTabs, { type ReportTab } from '../components/ReportTabs';
import { useLanguage } from '../lib/language';
import { api, type SessionUser } from '../lib/api';

type Lang = 'en' | 'hi' | 'hinglish' | 'mr' | 'ta' | 'bn';
type Urgency = 'green' | 'yellow' | 'red';

type TriageResult = {
  urgency: Urgency;
  urgencyTitle: string;
  summary: string;
  possibleCauses: {
    name: string;
    relevance: 'low' | 'moderate' | 'strong';
    reason: string;
  }[];
  detectedSymptoms: string[];
  importantContext: string[];
  redFlags: string[];
  recommendations: string[];
  selfCare: string[];
  doctorAdvice: string[];
  emergencyAdvice: string[];
  followUpQuestions: string[];
  needsMoreInformation: boolean;
  disclaimer: string;
};

type StoredResult = {
  source: 'common-problems';
  lang: string;
  problemKey: string;
  problemTitle: string;
  problemHindi?: string;
  duration: string;
  days: number;
  severity: number;
  pattern: string;
  warningSigns: string[];
  result: TriageResult;
};

const words = {
  en: {
    back: 'Common Problems',
    quick: 'Quick Health Guidance',
    green: 'Start with home care',
    yellow: 'Consult a doctor',
    red: 'Seek urgent medical help',
    greenShort: 'Home Care',
    yellowShort: 'Doctor Advice',
    redShort: 'Urgent Help',
    greenDescription: 'No major emergency warning signs were reported in your answers.',
    yellowDescription: 'Your answers suggest that a medical assessment may be useful.',
    redDescription: 'Your answers include warning signs that need urgent attention.',
    reported: 'What you reported',
    duration: 'Duration',
    severity: 'Severity',
    pattern: 'Pattern',
    warnings: 'Warning signs you selected',
    noWarnings: 'You did not select any of the listed emergency warning signs.',
    summary: 'Simple Summary',
    meaning: 'What does this mean?',
    emergency: 'What to do right now',
    next: 'What to do next',
    selfCare: 'What you can do at home',
    doctor: 'When to see a doctor',
    nextStep: 'Next Step',
    choice: 'What would you like to do?',
    clinics: 'Nearby Clinics',
    again: 'Check Another Problem',
    translating: 'Translating your saved medical guidance...',
    error: 'Translation is unavailable. Your previous medical guidance has been preserved.',
    fallback: 'Monitor your symptoms. Contact a healthcare professional if they continue or worsen.',
    days: 'days'
  },
  hi: {
    back: 'सामान्य स्वास्थ्य समस्याएं',
    quick: 'त्वरित स्वास्थ्य मार्गदर्शन',
    green: 'घर पर देखभाल से शुरुआत करें',
    yellow: 'डॉक्टर से परामर्श लें',
    red: 'तुरंत चिकित्सा सहायता लें',
    greenShort: 'घरेलू देखभाल',
    yellowShort: 'डॉक्टर की सलाह',
    redShort: 'तत्काल सहायता',
    greenDescription: 'आपके जवाबों में फिलहाल कोई बड़ा आपातकालीन चेतावनी संकेत नहीं बताया गया है।',
    yellowDescription: 'आपके जवाबों के आधार पर चिकित्सकीय जांच उपयोगी हो सकती है।',
    redDescription: 'आपके जवाबों में ऐसे चेतावनी संकेत हैं जिन पर तुरंत ध्यान देना जरूरी है।',
    reported: 'आपने क्या बताया',
    duration: 'कब से',
    severity: 'तकलीफ की तीव्रता',
    pattern: 'लक्षणों का स्वरूप',
    warnings: 'आपके चुने हुए चेतावनी संकेत',
    noWarnings: 'आपने सूची में दिए गए आपातकालीन चेतावनी संकेतों में से कोई नहीं चुना।',
    summary: 'संक्षिप्त जानकारी',
    meaning: 'इसका क्या मतलब है?',
    emergency: 'अभी क्या करें',
    next: 'आगे क्या करें',
    selfCare: 'घर पर क्या कर सकते हैं',
    doctor: 'डॉक्टर को कब दिखाएं',
    nextStep: 'अगला कदम',
    choice: 'आप क्या करना चाहेंगे?',
    clinics: 'नजदीकी क्लिनिक',
    again: 'दूसरी समस्या जांचें',
    translating: 'आपके पिछले स्वास्थ्य मार्गदर्शन का अनुवाद किया जा रहा है...',
    error: 'अनुवाद उपलब्ध नहीं है। आपका पिछला स्वास्थ्य मार्गदर्शन सुरक्षित है।',
    fallback: 'अपने लक्षणों पर नजर रखें। समस्या बनी रहे या बढ़े तो स्वास्थ्य विशेषज्ञ से संपर्क करें।',
    days: 'दिन'
  },
  hinglish: {
    back: 'Common Problems',
    quick: 'Quick Health Guidance',
    green: 'Ghar par care se shuru karein',
    yellow: 'Doctor se baat karein',
    red: 'Turant medical help lein',
    greenShort: 'Home Care',
    yellowShort: 'Doctor Advice',
    redShort: 'Urgent Help',
    greenDescription: 'Aapke answers mein abhi koi major emergency warning sign report nahi hua.',
    yellowDescription: 'Aapke answers ke basis par medical assessment useful ho sakta hai.',
    redDescription: 'Aapke answers mein aise warning signs hain jin par turant dhyan dena zaroori hai.',
    reported: 'Aapne kya bataya',
    duration: 'Kab se',
    severity: 'Takleef',
    pattern: 'Pattern',
    warnings: 'Aapke selected warning signs',
    noWarnings: 'Aapne listed emergency warning signs mein se koi select nahi kiya.',
    summary: 'Simple Summary',
    meaning: 'Iska matlab kya hai?',
    emergency: 'Abhi kya karein',
    next: 'Ab kya karein',
    selfCare: 'Ghar par kya kar sakte hain',
    doctor: 'Doctor kab dikhayein',
    nextStep: 'Next Step',
    choice: 'Aap kya karna chahenge?',
    clinics: 'Nearby Clinics',
    again: 'Check Another Problem',
    translating: 'Aapke saved medical guidance ka translation ho raha hai...',
    error: 'Translation available nahi hai. Aapka purana medical guidance safe hai.',
    fallback: 'Symptoms monitor karein. Problem continue ya worse ho to healthcare professional se baat karein.',
    days: 'din'
  },
  mr: {
    back: 'सामान्य आरोग्य समस्या',
    quick: 'त्वरित आरोग्य मार्गदर्शन',
    green: 'घरगुती काळजीपासून सुरुवात करा',
    yellow: 'डॉक्टरांचा सल्ला घ्या',
    red: 'तातडीने वैद्यकीय मदत घ्या',
    greenShort: 'घरगुती काळजी',
    yellowShort: 'डॉक्टरांचा सल्ला',
    redShort: 'तातडीची मदत',
    greenDescription: 'तुमच्या उत्तरांमध्ये सध्या कोणतीही मोठी आपत्कालीन धोक्याची लक्षणे नोंदवलेली नाहीत.',
    yellowDescription: 'तुमच्या उत्तरांनुसार वैद्यकीय तपासणी उपयुक्त ठरू शकते.',
    redDescription: 'तुमच्या उत्तरांमध्ये तातडीने लक्ष देण्याची गरज असलेली धोक्याची लक्षणे आहेत.',
    reported: 'तुम्ही दिलेली माहिती',
    duration: 'किती दिवसांपासून',
    severity: 'त्रासाची तीव्रता',
    pattern: 'लक्षणांचे स्वरूप',
    warnings: 'तुम्ही निवडलेली धोक्याची लक्षणे',
    noWarnings: 'तुम्ही दिलेल्या यादीतील कोणतीही आपत्कालीन धोक्याची लक्षणे निवडलेली नाहीत.',
    summary: 'थोडक्यात माहिती',
    meaning: 'याचा अर्थ काय?',
    emergency: 'आत्ता काय करावे',
    next: 'पुढे काय करावे',
    selfCare: 'घरी काय करू शकता',
    doctor: 'डॉक्टरांना कधी भेटावे',
    nextStep: 'पुढील पाऊल',
    choice: 'तुम्हाला पुढे काय करायचे आहे?',
    clinics: 'जवळील दवाखाने',
    again: 'दुसरी समस्या तपासा',
    translating: 'तुमच्या मागील आरोग्य मार्गदर्शनाचे भाषांतर होत आहे...',
    error: 'भाषांतर उपलब्ध नाही. तुमचे मागील आरोग्य मार्गदर्शन सुरक्षित आहे.',
    fallback: 'तुमच्या लक्षणांवर लक्ष ठेवा. त्रास कायम राहिल्यास किंवा वाढल्यास आरोग्यतज्ज्ञांशी संपर्क साधा.',
    days: 'दिवस'
  },
  ta: {
    back: 'பொதுவான உடல்நலப் பிரச்சினைகள்',
    quick: 'விரைவான உடல்நல வழிகாட்டுதல்',
    green: 'வீட்டிலேயே பராமரிப்பைத் தொடங்குங்கள்',
    yellow: 'மருத்துவரை அணுகுங்கள்',
    red: 'உடனடியாக மருத்துவ உதவி பெறுங்கள்',
    greenShort: 'வீட்டுப் பராமரிப்பு',
    yellowShort: 'மருத்துவர் ஆலோசனை',
    redShort: 'அவசர உதவி',
    greenDescription: 'உங்கள் பதில்களில் தற்போது முக்கிய அவசர எச்சரிக்கை அறிகுறிகள் எதுவும் தெரிவிக்கப்படவில்லை.',
    yellowDescription: 'உங்கள் பதில்களின் அடிப்படையில் மருத்துவப் பரிசோதனை பயனுள்ளதாக இருக்கலாம்.',
    redDescription: 'உங்கள் பதில்களில் உடனடி கவனம் தேவைப்படும் எச்சரிக்கை அறிகுறிகள் உள்ளன.',
    reported: 'நீங்கள் தெரிவித்தவை',
    duration: 'எவ்வளவு காலமாக',
    severity: 'பாதிப்பின் தீவிரம்',
    pattern: 'அறிகுறிகளின் தன்மை',
    warnings: 'நீங்கள் தேர்ந்தெடுத்த எச்சரிக்கை அறிகுறிகள்',
    noWarnings: 'பட்டியலிடப்பட்ட அவசர எச்சரிக்கை அறிகுறிகளில் எதையும் நீங்கள் தேர்ந்தெடுக்கவில்லை.',
    summary: 'சுருக்கமான தகவல்',
    meaning: 'இதன் பொருள் என்ன?',
    emergency: 'இப்போது என்ன செய்ய வேண்டும்',
    next: 'அடுத்து என்ன செய்ய வேண்டும்',
    selfCare: 'வீட்டில் என்ன செய்யலாம்',
    doctor: 'மருத்துவரை எப்போது அணுக வேண்டும்',
    nextStep: 'அடுத்த படி',
    choice: 'நீங்கள் அடுத்து என்ன செய்ய விரும்புகிறீர்கள்?',
    clinics: 'அருகிலுள்ள மருத்துவமனைகள்',
    again: 'மற்றொரு பிரச்சினையைச் சரிபார்க்கவும்',
    translating: 'உங்கள் முந்தைய மருத்துவ வழிகாட்டுதல் மொழிபெயர்க்கப்படுகிறது...',
    error: 'மொழிபெயர்ப்பு கிடைக்கவில்லை. உங்கள் முந்தைய மருத்துவ வழிகாட்டுதல் பாதுகாக்கப்பட்டுள்ளது.',
    fallback: 'உங்கள் அறிகுறிகளைக் கவனியுங்கள். அவை தொடர்ந்தாலோ மோசமடைந்தாலோ மருத்துவ நிபுணரை அணுகுங்கள்.',
    days: 'நாட்கள்'
  },
  bn: {
    back: 'সাধারণ স্বাস্থ্য সমস্যা',
    quick: 'দ্রুত স্বাস্থ্য নির্দেশনা',
    green: 'বাড়িতে যত্ন নেওয়া শুরু করুন',
    yellow: 'চিকিৎসকের পরামর্শ নিন',
    red: 'অবিলম্বে চিকিৎসা সহায়তা নিন',
    greenShort: 'বাড়িতে যত্ন',
    yellowShort: 'চিকিৎসকের পরামর্শ',
    redShort: 'জরুরি সহায়তা',
    greenDescription: 'আপনার উত্তরে বর্তমানে কোনো বড় জরুরি সতর্কতামূলক লক্ষণ জানানো হয়নি।',
    yellowDescription: 'আপনার উত্তরের ভিত্তিতে চিকিৎসা পরীক্ষা উপকারী হতে পারে।',
    redDescription: 'আপনার উত্তরে এমন সতর্কতামূলক লক্ষণ রয়েছে যেগুলোর প্রতি দ্রুত মনোযোগ দেওয়া জরুরি।',
    reported: 'আপনি যা জানিয়েছেন',
    duration: 'কত দিন ধরে',
    severity: 'সমস্যার তীব্রতা',
    pattern: 'লক্ষণের ধরন',
    warnings: 'আপনার নির্বাচিত সতর্কতামূলক লক্ষণ',
    noWarnings: 'আপনি তালিকাভুক্ত জরুরি সতর্কতামূলক লক্ষণগুলোর কোনোটিই নির্বাচন করেননি।',
    summary: 'সংক্ষিপ্ত তথ্য',
    meaning: 'এর অর্থ কী?',
    emergency: 'এখন কী করবেন',
    next: 'এরপর কী করবেন',
    selfCare: 'বাড়িতে কী করতে পারেন',
    doctor: 'কখন চিকিৎসক দেখাবেন',
    nextStep: 'পরবর্তী পদক্ষেপ',
    choice: 'আপনি এরপর কী করতে চান?',
    clinics: 'কাছাকাছি ক্লিনিক',
    again: 'অন্য সমস্যা পরীক্ষা করুন',
    translating: 'আপনার আগের স্বাস্থ্য নির্দেশনা অনুবাদ করা হচ্ছে...',
    error: 'অনুবাদ পাওয়া যাচ্ছে না। আপনার আগের স্বাস্থ্য নির্দেশনা সংরক্ষিত আছে।',
    fallback: 'আপনার লক্ষণ পর্যবেক্ষণ করুন। সমস্যা চলতে থাকলে বা বাড়লে স্বাস্থ্য বিশেষজ্ঞের সঙ্গে যোগাযোগ করুন।',
    days: 'দিন'
  }
};

function cleanItems(primary?: string[], fallback?: string[], limit = 4) {
  return [...new Set((primary?.length ? primary : fallback || [])
    .map(item => String(item).trim())
    .filter(Boolean))].slice(0, limit);
}

export default function CommonProblemResult({ user }: { user: SessionUser }) {
  const navigate = useNavigate();
  const { lang, tr } = useLanguage();
  const currentLang = (lang in words ? lang : 'en') as Lang;
  const t = words[currentLang];

  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [stored, setStored] = useState<StoredResult | null | undefined>();
  const [translated, setTranslated] = useState<TriageResult | null>(null);
  const [translatedLang, setTranslatedLang] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(false);
  const [recordStatus, setRecordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [recordError, setRecordError] = useState('');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('medguide_common_problem_result');

      if (!raw) {
        setStored(null);
        return;
      }

      const data = JSON.parse(raw) as StoredResult;

      if (
        data.source !== 'common-problems' ||
        !data.result ||
        !['green', 'yellow', 'red'].includes(data.result.urgency)
      ) {
        setStored(null);
        return;
      }

      setStored(data);
    } catch {
      setStored(null);
    }
  }, []);

  useEffect(() => {
    if (!stored || !user.id) return;
    const recordKey = `medguide_saved_common_${user.id}`;
    const signature = JSON.stringify(stored);
    if (sessionStorage.getItem(recordKey) === signature) {
      setRecordStatus('saved');
      return;
    }
    let cancelled = false;
    setRecordStatus('saving');
    const result = stored.result;
    const advice = [result.summary,
      result.possibleCauses.map(c => `${c.name}: ${c.reason}`).join(' | '),
      result.recommendations.join(' | '), result.selfCare.join(' | '),
      result.doctorAdvice.join(' | '), result.emergencyAdvice.join(' | ')
    ].filter(Boolean).join(' || ');
    api('/api/health-records', { method: 'POST', body: {
      user_id: user.id, title: `Common Problem: ${stored.problemTitle}`,
      issue: [stored.problemTitle, stored.duration, stored.pattern,
        stored.warningSigns.join(', ')].filter(Boolean).join(' | '),
      triage: result.urgency, severity: stored.severity || (result.urgency === 'red' ? 10 : result.urgency === 'yellow' ? 6 : 3),
      days: String(stored.days || ''), language: stored.lang || 'en',
      advice, source: 'common-problems'
    }}).then(() => {
      sessionStorage.setItem(recordKey, signature);
      if (!cancelled) setRecordStatus('saved');
    }).catch(error => {
      if (!cancelled) {
        setRecordError(error instanceof Error ? error.message : 'Record could not be saved');
        setRecordStatus('error');
      }
    });
    return () => { cancelled = true; };
  }, [stored, user.id]);

  useEffect(() => {
    if (!stored) return;

    if (stored.lang === lang) {
      setTranslated(null);
      setTranslatedLang('');
      setTranslating(false);
      setTranslationError(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    setTranslating(true);
    setTranslationError(false);
    setTranslated(null);
    setTranslatedLang('');

    const cacheKey = `medguide_translation_${lang}_${JSON.stringify(stored.result)}`;

    try {
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        const result = JSON.parse(cached) as TriageResult;

        if (result.urgency === stored.result.urgency) {
          setTranslated(result);
          setTranslatedLang(lang);
          setTranslating(false);
          return () => controller.abort();
        }
      }
    } catch {
      sessionStorage.removeItem(cacheKey);
    }

    fetch('/api/ai-triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'translate',
        language: lang,
        result: stored.result
      }),
      signal: controller.signal
    })
      .then(async response => {
        const data = await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.result ||
          data.result.urgency !== stored.result.urgency
        ) {
          throw new Error('Translation failed');
        }

        if (cancelled) return;

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data.result));
        } catch {
          sessionStorage.removeItem(cacheKey);
        }

        setTranslated(data.result);
        setTranslatedLang(lang);
      })
      .catch(error => {
        if (!cancelled && error?.name !== 'AbortError') {
          setTranslationError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setTranslating(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lang, stored]);

  if (stored === undefined) return null;

  if (!stored) {
    return <Navigate to="/common-problems" replace />;
  }

  const result =
    translated && translatedLang === lang
      ? translated
      : stored.result;

  const isRed = result.urgency === 'red';

  const config = {
    green: {
      label: t.green,
      short: t.greenShort,
      description: t.greenDescription,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-600'
    },
    yellow: {
      label: t.yellow,
      short: t.yellowShort,
      description: t.yellowDescription,
      icon: CircleAlert,
      gradient: 'from-amber-500 to-orange-500'
    },
    red: {
      label: t.red,
      short: t.redShort,
      description: t.redDescription,
      icon: TriangleAlert,
      gradient: 'from-red-600 to-rose-700'
    }
  }[result.urgency];

  const StatusIcon = config.icon;

  const whatToDo = cleanItems(
    result.recommendations,
    result.doctorAdvice
  );

  const selfCare = cleanItems(
    result.selfCare,
    result.recommendations
  );

  const doctorAdvice = cleanItems(
    result.doctorAdvice,
    result.recommendations
  );

  const emergencyAdvice = cleanItems(
    result.emergencyAdvice,
    result.redFlags
  );

  const checkAgain = () => {
    sessionStorage.removeItem('medguide_common_problem_result');
    sessionStorage.removeItem(`medguide_saved_common_${user.id}`);
    navigate('/common-problems');
  };

  const Card = ({
    title,
    items,
    tone
  }: {
    title: string;
    items: string[];
    tone: 'blue' | 'green' | 'amber' | 'red';
  }) => {
    const styles = {
      blue: 'bg-white text-slate-700',
      green: 'bg-emerald-50 text-emerald-900',
      amber: 'bg-amber-50 text-amber-900',
      red: 'bg-red-50 text-red-900'
    };

    return (
      <section className={`rounded-3xl p-5 shadow-sm sm:p-6 ${styles[tone]}`}>
        <h2 className="text-lg font-extrabold">{title}</h2>
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-3">
              <span className="font-extrabold">{index + 1}.</span>
              <p className="text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1560px] space-y-4">
      {recordStatus === 'error' && <div role="alert" className="mx-auto my-3 max-w-5xl rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Your report could not be saved to My Records: {recordError}. Reopen this result to retry.</div>}

      <button
        type="button"
        onClick={() => navigate('/common-problems')}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft size={17} />
        {t.back}
      </button>

      {translating && (
        <div role="status" className="rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-900">
          {t.translating}
        </div>
      )}

      {translationError && (
        <div role="alert" className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          {t.error}
        </div>
      )}

      <section className={`rounded-3xl bg-gradient-to-r ${config.gradient} p-6 text-white shadow-xl sm:p-8`}>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-white/20 p-4">
            <StatusIcon size={30} />
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-white/80">
              {t.quick}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              {config.label}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              {config.description}
            </p>
          </div>
        </div>
      </section>

      <ReportTabs active={activeTab} onChange={setActiveTab} />
      {isRed && emergencyAdvice.length > 0 && (
        <div className="mb-4"><Card title={t.emergency} items={emergencyAdvice} tone="red" /></div>
      )}
      {activeTab === 'overview' && (
        <div role="tabpanel" className="grid grid-flow-row-dense auto-rows-min items-start gap-3 lg:grid-cols-12">
          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:col-span-5">
            <h2 className="text-lg font-extrabold text-slate-900">{t.summary}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{result.summary}</p>
            <h3 className="mt-4 font-bold text-slate-900">{t.reported}</h3>
            <p className="mt-1 text-sm font-semibold">{tr(stored.problemTitle)}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">{t.duration}</p><p className="mt-1 font-bold">{stored.days} {t.days}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">{t.severity}</p><p className="mt-1 font-bold">{stored.severity}/10</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">{t.pattern}</p><p className="mt-1 font-bold">{tr(stored.pattern)}</p></div>
            </div>
          </section>
          <div className="space-y-3 lg:col-span-7">
            {result.possibleCauses?.length > 0 && <section className="rounded-2xl bg-white p-4 shadow-sm"><h2 className="font-extrabold text-slate-900">{t.meaning}</h2><div className="mt-2 grid gap-2 md:grid-cols-2">{result.possibleCauses.map((cause, index) => <div key={index} className="rounded-xl bg-blue-50 p-3 text-sm"><p className="font-bold">{cause.name}</p><p className="mt-1 text-slate-600">{cause.reason}</p></div>)}</div></section>}
            {stored.warningSigns.length > 0 && <Card title={t.warnings} items={stored.warningSigns.map(item => tr(item))} tone="red" />}
            <button type="button" onClick={() => setActiveTab('clinics')} className="w-full rounded-xl bg-emerald-50 p-4 text-left text-sm font-bold text-emerald-900 ring-1 ring-emerald-100">{t.clinics} →</button>
          </div>
        </div>
      )}
      {activeTab === 'care' && <div role="tabpanel" className="grid gap-4 md:grid-cols-2">
        {!isRed && <Card title={t.next} items={whatToDo.length ? whatToDo : [t.fallback]} tone="blue" />}
        {!isRed && selfCare.length > 0 && <Card title={t.selfCare} items={selfCare} tone="green" />}
        {!isRed && doctorAdvice.length > 0 && <Card title={t.doctor} items={doctorAdvice} tone="amber" />}
        {isRed && <Card title={t.emergency} items={emergencyAdvice} tone="red" />}
      </div>}
      <div role="tabpanel" className={activeTab === 'medicines' ? '' : 'hidden'}><RecommendedCare assessment={result} sourceText={stored.problemTitle} view="medicines" /></div>
      <div role="tabpanel" className={activeTab === 'clinics' ? '' : 'hidden'}><RecommendedCare assessment={result} sourceText={stored.problemTitle} view="clinics" /></div>
      <div className="mt-4 flex justify-end"><button type="button" onClick={checkAgain} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"><RefreshCw size={16}/>{t.again}</button></div>

      <Disclaimer compact />
    </div>
  );
}
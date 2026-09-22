
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Hospital,
  MapPin,
  Stethoscope,
  HeartPulse,
  Cross,
  LocateFixed,
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import { useLanguage } from '../lib/language';
import type { SessionUser } from '../lib/api';
import { loadSession } from '../lib/api';
import { getCareLocation, type CareLocation } from '../lib/careLocation';

type LocationState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'error';

const translations = {
  en: {
    kicker: 'LOCATION-BASED HEALTHCARE',
    title: 'Clinics & Hospitals Near You',
    subtitle: 'Find nearby clinics, hospitals, doctors and emergency healthcare services using Google Maps.',
    location: 'Your Location',
    locationHelp: 'Allow location access to find nearby healthcare services.',
    detected: 'Location successfully detected',
    accuracy: 'Approximate accuracy',
    metres: 'metres',
    detecting: 'Detecting...',
    refresh: 'Refresh Location',
    useLocation: 'Use My Location',
    viewLocation: 'View My Location',
    denied: 'Location permission is blocked. Allow location access in your browser settings and try again.',
    unavailable: 'Your current location could not be detected.',
    timeout: 'Location detection took too long. Please try again.',
    error: 'An error occurred while detecting your location. Please try again.',
    searchTitle: 'Search Healthcare',
    placeholder: 'Search: eye hospital, skin doctor, child clinic...',
    search: 'Search Nearby',
    radius: 'Preferred Search Radius',
    radiusNote: 'Google Maps determines nearby results using your location and available place information. This radius is only a preference and does not enforce an exact search boundary.',
    clinics: 'Nearby Clinics',
    clinicsDesc: 'Find clinics around your location.',
    hospitals: 'Nearby Hospitals',
    hospitalsDesc: 'Explore nearby hospitals and healthcare centres.',
    doctors: 'Doctors Near Me',
    doctorsDesc: 'Search for doctors in your area.',
    dental: 'Dental Clinics',
    dentalDesc: 'Find nearby dentists and dental clinics.',
    emergency: 'Emergency Hospitals',
    emergencyDesc: 'Find nearby hospitals with emergency services.',
    find: 'Find Near Me',
    realInfo: 'Real place information',
    realInfoDesc: 'MedGuide does not invent clinic ratings, fees, availability, reviews or verification status. Check the information shown directly on Google Maps.'
  },
  hi: {
    kicker: 'स्थान आधारित स्वास्थ्य सेवाएं',
    title: 'आपके नजदीकी क्लिनिक और अस्पताल',
    subtitle: 'Google Maps की मदद से अपने आसपास के क्लिनिक, अस्पताल, डॉक्टर और आपातकालीन स्वास्थ्य सेवाएं खोजें।',
    location: 'आपकी लोकेशन',
    locationHelp: 'नजदीकी स्वास्थ्य सेवाएं खोजने के लिए लोकेशन की अनुमति दें।',
    detected: 'आपकी लोकेशन मिल गई है',
    accuracy: 'अनुमानित सटीकता',
    metres: 'मीटर',
    detecting: 'लोकेशन खोजी जा रही है...',
    refresh: 'लोकेशन दोबारा खोजें',
    useLocation: 'मेरी लोकेशन इस्तेमाल करें',
    viewLocation: 'मेरी लोकेशन देखें',
    denied: 'लोकेशन की अनुमति बंद है। ब्राउज़र की सेटिंग में अनुमति देकर दोबारा कोशिश करें।',
    unavailable: 'आपकी वर्तमान लोकेशन नहीं मिल पा रही है।',
    timeout: 'लोकेशन खोजने में अधिक समय लग गया। दोबारा कोशिश करें।',
    error: 'लोकेशन खोजते समय समस्या हुई। दोबारा कोशिश करें।',
    searchTitle: 'स्वास्थ्य सेवाएं खोजें',
    placeholder: 'खोजें: आंखों का अस्पताल, त्वचा विशेषज्ञ, बच्चों का क्लिनिक...',
    search: 'आसपास खोजें',
    radius: 'पसंदीदा खोज दूरी',
    radiusNote: 'Google Maps आपकी लोकेशन और उपलब्ध जानकारी के आधार पर परिणाम दिखाता है। चुनी गई दूरी केवल आपकी पसंद है; इससे खोज की सटीक सीमा तय नहीं होती।',
    clinics: 'नजदीकी क्लिनिक',
    clinicsDesc: 'अपने आसपास के क्लिनिक खोजें।',
    hospitals: 'नजदीकी अस्पताल',
    hospitalsDesc: 'आसपास के अस्पताल और स्वास्थ्य केंद्र देखें।',
    doctors: 'नजदीकी डॉक्टर',
    doctorsDesc: 'अपने आसपास डॉक्टर खोजें।',
    dental: 'दंत चिकित्सा क्लिनिक',
    dentalDesc: 'नजदीकी दंत चिकित्सक और क्लिनिक खोजें।',
    emergency: 'आपातकालीन अस्पताल',
    emergencyDesc: 'आसपास आपातकालीन सेवाओं वाले अस्पताल खोजें।',
    find: 'मेरे आसपास खोजें',
    realInfo: 'वास्तविक स्थान की जानकारी',
    realInfoDesc: 'MedGuide क्लिनिक की रेटिंग, फीस, उपलब्धता, समीक्षाएं या सत्यापन की जानकारी स्वयं नहीं बनाता। Google Maps पर उपलब्ध जानकारी सीधे जांचें।'
  },
  hinglish: {
    kicker: 'Location Based Healthcare',
    title: 'Aapke Nearby Clinics & Hospitals',
    subtitle: 'Google Maps par aas-paas ke clinics, hospitals, doctors aur emergency healthcare services search karein.',
    location: 'Aapki Location',
    locationHelp: 'Nearby healthcare services ke liye location access allow karein.',
    detected: 'Location successfully detect ho gayi',
    accuracy: 'Approximate accuracy',
    metres: 'metres',
    detecting: 'Location detect ho rahi hai...',
    refresh: 'Refresh Location',
    useLocation: 'Use My Location',
    viewLocation: 'View My Location',
    denied: 'Location permission blocked hai. Browser settings mein permission allow karke dobara try karein.',
    unavailable: 'Aapki current location detect nahi ho pa rahi hai.',
    timeout: 'Location detect hone mein zyada time lag gaya. Dobara try karein.',
    error: 'Location detect karte waqt problem aayi. Dobara try karein.',
    searchTitle: 'Search Healthcare',
    placeholder: 'Search: eye hospital, skin doctor, child clinic...',
    search: 'Search Nearby',
    radius: 'Preferred Search Radius',
    radiusNote: 'Google Maps location aur available place data ke basis par results dikhata hai. Selected radius sirf preference hai, exact boundary nahi.',
    clinics: 'Nearby Clinics',
    clinicsDesc: 'Aapke aas-paas ke clinics dekhein.',
    hospitals: 'Nearby Hospitals',
    hospitalsDesc: 'Nearby hospitals aur healthcare centres dekhein.',
    doctors: 'Doctors Near Me',
    doctorsDesc: 'Aas-paas ke doctors search karein.',
    dental: 'Dental Clinics',
    dentalDesc: 'Nearby dentists aur dental clinics dekhein.',
    emergency: 'Emergency Hospitals',
    emergencyDesc: 'Nearby emergency hospitals search karein.',
    find: 'Find Near Me',
    realInfo: 'Real Place Information',
    realInfoDesc: 'MedGuide clinic ratings, fees, availability, reviews ya verification status invent nahi karta. Google Maps par actual information check karein.'
  },
  mr: {
    kicker: 'स्थानाधारित आरोग्य सेवा',
    title: 'तुमच्या जवळील दवाखाने आणि रुग्णालये',
    subtitle: 'Google Maps वापरून जवळील दवाखाने, रुग्णालये, डॉक्टर आणि आपत्कालीन आरोग्य सेवा शोधा.',
    location: 'तुमचे स्थान',
    locationHelp: 'जवळील आरोग्य सेवा शोधण्यासाठी स्थानाची परवानगी द्या.',
    detected: 'तुमचे स्थान यशस्वीपणे सापडले',
    accuracy: 'अंदाजे अचूकता',
    metres: 'मीटर',
    detecting: 'स्थान शोधत आहे...',
    refresh: 'स्थान पुन्हा शोधा',
    useLocation: 'माझे स्थान वापरा',
    viewLocation: 'माझे स्थान पाहा',
    denied: 'स्थानाची परवानगी बंद आहे. ब्राउझरमध्ये परवानगी देऊन पुन्हा प्रयत्न करा.',
    unavailable: 'तुमचे सध्याचे स्थान शोधता आले नाही.',
    timeout: 'स्थान शोधण्यासाठी खूप वेळ लागला. पुन्हा प्रयत्न करा.',
    error: 'स्थान शोधताना समस्या आली. पुन्हा प्रयत्न करा.',
    searchTitle: 'आरोग्य सेवा शोधा',
    placeholder: 'शोधा: नेत्र रुग्णालय, त्वचारोगतज्ज्ञ, बालरोग दवाखाना...',
    search: 'जवळपास शोधा',
    radius: 'पसंतीचे शोध अंतर',
    radiusNote: 'Google Maps तुमचे स्थान आणि उपलब्ध माहितीनुसार परिणाम दाखवते. निवडलेले अंतर केवळ पसंती आहे; त्यामुळे शोधाची अचूक मर्यादा ठरत नाही.',
    clinics: 'जवळील दवाखाने',
    clinicsDesc: 'तुमच्या आसपासचे दवाखाने शोधा.',
    hospitals: 'जवळील रुग्णालये',
    hospitalsDesc: 'जवळील रुग्णालये आणि आरोग्य केंद्रे पाहा.',
    doctors: 'जवळील डॉक्टर',
    doctorsDesc: 'तुमच्या परिसरातील डॉक्टर शोधा.',
    dental: 'दंतचिकित्सा दवाखाने',
    dentalDesc: 'जवळील दंतचिकित्सक आणि दवाखाने शोधा.',
    emergency: 'आपत्कालीन रुग्णालये',
    emergencyDesc: 'जवळील आपत्कालीन सेवा असलेली रुग्णालये शोधा.',
    find: 'माझ्या जवळ शोधा',
    realInfo: 'वास्तविक ठिकाणांची माहिती',
    realInfoDesc: 'MedGuide दवाखान्यांचे रेटिंग, शुल्क, उपलब्धता, पुनरावलोकने किंवा पडताळणीची माहिती स्वतः तयार करत नाही. Google Maps वरील माहिती तपासा.'
  },
  ta: {
    kicker: 'இருப்பிட அடிப்படையிலான சுகாதார சேவை',
    title: 'உங்களுக்கு அருகிலுள்ள மருத்துவமனைகள்',
    subtitle: 'Google Maps மூலம் அருகிலுள்ள மருத்துவமனைகள், மருத்துவர்கள் மற்றும் அவசர சுகாதார சேவைகளைக் கண்டறியுங்கள்.',
    location: 'உங்கள் இருப்பிடம்',
    locationHelp: 'அருகிலுள்ள சுகாதார சேவைகளைக் கண்டறிய இருப்பிட அனுமதியை வழங்குங்கள்.',
    detected: 'உங்கள் இருப்பிடம் கண்டறியப்பட்டது',
    accuracy: 'தோராயமான துல்லியம்',
    metres: 'மீட்டர்',
    detecting: 'இருப்பிடம் கண்டறியப்படுகிறது...',
    refresh: 'இருப்பிடத்தைப் புதுப்பிக்கவும்',
    useLocation: 'எனது இருப்பிடத்தைப் பயன்படுத்தவும்',
    viewLocation: 'எனது இருப்பிடத்தைப் பார்க்கவும்',
    denied: 'இருப்பிட அனுமதி மறுக்கப்பட்டுள்ளது. உலாவி அமைப்புகளில் அனுமதித்து மீண்டும் முயற்சிக்கவும்.',
    unavailable: 'உங்கள் தற்போதைய இருப்பிடத்தைக் கண்டறிய முடியவில்லை.',
    timeout: 'இருப்பிடத்தைக் கண்டறிய அதிக நேரம் ஆனது. மீண்டும் முயற்சிக்கவும்.',
    error: 'இருப்பிடத்தைக் கண்டறிவதில் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
    searchTitle: 'சுகாதார சேவைகளைத் தேடுங்கள்',
    placeholder: 'தேடுங்கள்: கண் மருத்துவமனை, தோல் மருத்துவர், குழந்தைகள் மருத்துவமனை...',
    search: 'அருகில் தேடுங்கள்',
    radius: 'விருப்பமான தேடல் தூரம்',
    radiusNote: 'Google Maps உங்கள் இருப்பிடம் மற்றும் கிடைக்கும் தகவல்களின் அடிப்படையில் முடிவுகளைக் காட்டும். தேர்ந்தெடுத்த தூரம் ஒரு விருப்பம் மட்டுமே; துல்லியமான தேடல் எல்லை அல்ல.',
    clinics: 'அருகிலுள்ள மருத்துவ நிலையங்கள்',
    clinicsDesc: 'உங்கள் அருகிலுள்ள மருத்துவ நிலையங்களைக் கண்டறியுங்கள்.',
    hospitals: 'அருகிலுள்ள மருத்துவமனைகள்',
    hospitalsDesc: 'அருகிலுள்ள மருத்துவமனைகளையும் சுகாதார மையங்களையும் பார்க்கவும்.',
    doctors: 'அருகிலுள்ள மருத்துவர்கள்',
    doctorsDesc: 'உங்கள் பகுதியில் மருத்துவர்களைத் தேடுங்கள்.',
    dental: 'பல் மருத்துவ நிலையங்கள்',
    dentalDesc: 'அருகிலுள்ள பல் மருத்துவர்களைக் கண்டறியுங்கள்.',
    emergency: 'அவசர மருத்துவமனைகள்',
    emergencyDesc: 'அவசர சேவைகள் உள்ள மருத்துவமனைகளைக் கண்டறியுங்கள்.',
    find: 'எனக்கு அருகில் தேடுங்கள்',
    realInfo: 'உண்மையான இடத் தகவல்',
    realInfoDesc: 'MedGuide மருத்துவமனை மதிப்பீடுகள், கட்டணங்கள், கிடைக்கும் நேரம், மதிப்புரைகள் அல்லது சரிபார்ப்பு நிலையை உருவாக்குவதில்லை. Google Maps-இல் உள்ள தகவலை நேரடியாகச் சரிபார்க்கவும்.'
  },
  bn: {
    kicker: 'অবস্থানভিত্তিক স্বাস্থ্যসেবা',
    title: 'আপনার কাছাকাছি ক্লিনিক ও হাসপাতাল',
    subtitle: 'Google Maps ব্যবহার করে কাছাকাছি ক্লিনিক, হাসপাতাল, চিকিৎসক ও জরুরি স্বাস্থ্যসেবা খুঁজুন।',
    location: 'আপনার অবস্থান',
    locationHelp: 'কাছাকাছি স্বাস্থ্যসেবা খুঁজতে অবস্থানের অনুমতি দিন।',
    detected: 'আপনার অবস্থান সফলভাবে শনাক্ত হয়েছে',
    accuracy: 'আনুমানিক নির্ভুলতা',
    metres: 'মিটার',
    detecting: 'অবস্থান শনাক্ত করা হচ্ছে...',
    refresh: 'অবস্থান আবার শনাক্ত করুন',
    useLocation: 'আমার অবস্থান ব্যবহার করুন',
    viewLocation: 'আমার অবস্থান দেখুন',
    denied: 'অবস্থানের অনুমতি বন্ধ রয়েছে। ব্রাউজারের সেটিংসে অনুমতি দিয়ে আবার চেষ্টা করুন।',
    unavailable: 'আপনার বর্তমান অবস্থান শনাক্ত করা যাচ্ছে না।',
    timeout: 'অবস্থান শনাক্ত করতে বেশি সময় লেগেছে। আবার চেষ্টা করুন।',
    error: 'অবস্থান শনাক্ত করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    searchTitle: 'স্বাস্থ্যসেবা খুঁজুন',
    placeholder: 'খুঁজুন: চোখের হাসপাতাল, চর্মরোগ বিশেষজ্ঞ, শিশুদের ক্লিনিক...',
    search: 'কাছাকাছি খুঁজুন',
    radius: 'পছন্দের অনুসন্ধান দূরত্ব',
    radiusNote: 'Google Maps আপনার অবস্থান ও উপলব্ধ তথ্যের ভিত্তিতে ফলাফল দেখায়। নির্বাচিত দূরত্ব শুধু পছন্দ; এটি অনুসন্ধানের নির্দিষ্ট সীমা নির্ধারণ করে না।',
    clinics: 'কাছাকাছি ক্লিনিক',
    clinicsDesc: 'আপনার আশপাশের ক্লিনিক খুঁজুন।',
    hospitals: 'কাছাকাছি হাসপাতাল',
    hospitalsDesc: 'কাছাকাছি হাসপাতাল ও স্বাস্থ্যকেন্দ্র দেখুন।',
    doctors: 'কাছাকাছি চিকিৎসক',
    doctorsDesc: 'আপনার এলাকায় চিকিৎসক খুঁজুন।',
    dental: 'দন্ত চিকিৎসা কেন্দ্র',
    dentalDesc: 'কাছাকাছি দন্ত চিকিৎসক ও ক্লিনিক খুঁজুন।',
    emergency: 'জরুরি হাসপাতাল',
    emergencyDesc: 'জরুরি সেবাসহ কাছাকাছি হাসপাতাল খুঁজুন।',
    find: 'আমার কাছাকাছি খুঁজুন',
    realInfo: 'প্রকৃত স্থানের তথ্য',
    realInfoDesc: 'MedGuide ক্লিনিকের রেটিং, ফি, প্রাপ্যতা, পর্যালোচনা বা যাচাইকরণের তথ্য নিজে তৈরি করে না। Google Maps-এ থাকা তথ্য সরাসরি যাচাই করুন।'
  }
};

type Translation = typeof translations.en;

const categories = [
  { id: 'clinics', title: 'clinics', desc: 'clinicsDesc', query: 'clinics', icon: Hospital },
  { id: 'hospitals', title: 'hospitals', desc: 'hospitalsDesc', query: 'hospitals', icon: HeartPulse },
  { id: 'doctors', title: 'doctors', desc: 'doctorsDesc', query: 'doctors', icon: Stethoscope },
  { id: 'dental', title: 'dental', desc: 'dentalDesc', query: 'dental clinics', icon: Cross },
  { id: 'emergency', title: 'emergency', desc: 'emergencyDesc', query: 'emergency hospitals', icon: ShieldCheck }
] as const;

export default function Clinics({ user: _user }: { user: SessionUser }) {
  const { lang } = useLanguage();
  const t: Translation = translations[lang] || translations.en;

  const [careLocation, setCareLocation] = useState<CareLocation | null>(() => getCareLocation(loadSession()?.id || ''));
  useEffect(() => {
    const update = () => setCareLocation(getCareLocation(loadSession()?.id || ''));
    window.addEventListener('medguide-location-updated', update);
    return () => window.removeEventListener('medguide-location-updated', update);
  }, []);
  const [radius, setRadius] = useState(5);
  const [search, setSearch] = useState('');

  const buildMapsUrl = (query: string) => {
    const place = careLocation ? `${careLocation.lat},${careLocation.lon}` : '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query} near ${place}`)}`;
  };
  const openMaps = (query: string) => {
    window.open(buildMapsUrl(query), '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <PageHero
        icon={<Hospital size={28} />}
        kicker={t.kicker}
        title={t.title}
        sub={t.subtitle}
      />

      <Reveal>
        <section className="mb-5 rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center gap-3"><MapPin size={22} className="text-emerald-700"/><div><h2 className="font-extrabold text-slate-900">{t.location}</h2><p className="text-sm text-emerald-900">{careLocation?.label || 'Location required before accessing MedGuide'}</p></div></div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-3 font-extrabold text-slate-900">
            {t.searchTitle}
          </h2>

          <form
            onSubmit={event => {
              event.preventDefault();
              if (search.trim()) openMaps(search.trim());
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-2 rounded-2xl border-2 border-slate-200 px-4 py-3 focus-within:border-blue-600">
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder={t.placeholder}
                aria-label={t.searchTitle}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!search.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              <Search size={17} />
              {t.search}
            </button>
          </form>
        </section>
      </Reveal>

      <Reveal>
        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <MapPin size={18} className="text-blue-600" />
              {t.radius}
            </h2>

            <div className="flex flex-wrap gap-2 sm:ml-auto">
              {[2, 5, 10, 15].map(km => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setRadius(km)}
                  aria-pressed={radius === km}
                  className={`rounded-xl px-4 py-2 text-xs font-bold ${
                    radius === km
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {t.radiusNote}
          </p>
        </section>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => {
          const Icon = category.icon;

          return (
            <Reveal key={category.id} delay={(index % 3) * 0.07}>
              <motion.div
                whileHover={{ y: -5 }}
                className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white">
                  <Icon size={24} />
                </span>

                <h3 className="mt-4 font-extrabold text-slate-900">
                  {t[category.title]}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                  {t[category.desc]}
                </p>

                <button
                  type="button"
                  onClick={() => openMaps(category.query)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 py-3 text-sm font-bold text-white"
                >
                  <MapPin size={16} />
                  {t.find}
                  <ExternalLink size={14} />
                </button>
              </motion.div>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <section className="mt-6 flex gap-3 rounded-3xl bg-blue-50 p-5 ring-1 ring-blue-100">
          <ShieldCheck size={22} className="shrink-0 text-blue-700" />
          <div>
            <h2 className="font-extrabold text-slate-900">
              {t.realInfo}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t.realInfoDesc}
            </p>
          </div>
        </section>
      </Reveal>

      <div className="mt-6">
        <Disclaimer compact />
      </div>
    </div>
  );
}
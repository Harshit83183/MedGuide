import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Hospital, MapPin, Stethoscope } from 'lucide-react';
import { useLanguage } from '../lib/language';
import { loadSession } from '../lib/api';
import { getCareLocation, type CareLocation } from '../lib/careLocation';
import SafeMedicineGuidance from './SafeMedicineGuidance';

type Urgency = 'green' | 'yellow' | 'red';
type Assessment = {
  urgency: Urgency;
  summary?: string;
  possibleCauses?: { name: string }[];
  detectedSymptoms?: string[];
  doctorAdvice?: string[];
};
type Clinic = {
  id: number | string;
  name: string;
  city?: string;
  address?: string;
  type?: string;
  specialties?: string[];
  rating?: number;
  distance_km?: number;
  latitude?: number;
  longitude?: number;
  phone?: string;
  emergency?: boolean;
  source?: string;
};

type Specialty = 'General Medicine' | 'Cardiology' | 'Dermatology' | 'ENT' | 'Orthopedics' | 'Neurology' | 'Gastroenterology' | 'Pulmonology' | 'Urology' | 'Gynecology' | 'Ophthalmology' | 'Pediatrics' | 'Psychiatry';
const patterns: { specialty: Specialty; terms: RegExp }[] = [
  { specialty: 'Cardiology', terms: /chest pain|heart|cardiac|palpitation|सीने में दर्द|हृदय|छाती|हृदयविकार|இதயம்|বুকে ব্যথা/i },
  { specialty: 'Neurology', terms: /seizure|migraine|numbness|neurolog|stroke|मिर्गी|दौरा|लकवा|न्यूरो|ஒற்றைத் தலைவலி|মাইগ্রেন/i },
  { specialty: 'Pulmonology', terms: /asthma|persistent cough|breathlessness|respiratory|lung|दमा|अस्थमा|सांस|श्वास|நுரையீரல்|হাঁপানি/i },
  { specialty: 'Gastroenterology', terms: /persistent abdominal|stomach|digestive|liver|gastr|पेट दर्द|पाचन|यकृत|வயிறு|পেট ব্যথা/i },
  { specialty: 'Dermatology', terms: /rash|eczema|acne|skin|itch|त्वचा|खुजली|दाने|त्वचा|தோல்|চুলকানি/i },
  { specialty: 'ENT', terms: /ear|nose|throat|sinus|tonsil|कान|नाक|गला|घसा|காது|গলা/i },
  { specialty: 'Orthopedics', terms: /fracture|joint|bone|sprain|back pain|घुटना|हड्डी|जोड़|सांधे|எலும்பு|হাড়/i },
  { specialty: 'Urology', terms: /kidney|urinary|urination|bladder|किडनी|पेशाब|मूत्र|சிறுநீர்|প্রস্রাব/i },
  { specialty: 'Gynecology', terms: /pregnan|menstrual|period pain|gynecol|गर्भ|मासिक|महिला|கர்ப்ப|গর্ভ/i },
  { specialty: 'Ophthalmology', terms: /eye|vision|eyesight|आंख|दृष्टि|डोळा|கண்|চোখ/i },
  { specialty: 'Pediatrics', terms: /infant|newborn|child|baby|शिशु|बच्चे|बालक|குழந்தை|শিশু/i },
  { specialty: 'Psychiatry', terms: /panic|depression|anxiety|mental health|अवसाद|घबराहट|चिंता|மனச்சோர்வு|উদ্বেগ/i }
];
const ui = {
  en: { title: 'Care options matched to your symptoms', note: 'Suggested care type, not a diagnosis or confirmation of a clinic’s specialist.', general: 'General physician', specialist: 'Suggested specialty', emergency: 'Urgent care first', urgent: 'For emergency warning signs, call 112 or visit the nearest emergency department immediately. Do not wait for an appointment.', near: 'Nearby care facilities', listed: 'Clinics in the directory', loading: 'Finding relevant facilities...', empty: 'No matching facility is listed right now. Use the nearby search to see more options.', match: 'Specialty listed', unverified: 'Specialty not verified', map: 'Directions', browse: 'Explore clinics', locate: 'Use my location', location: 'Allow location to see actual nearby facilities.', error: 'Nearby results are unavailable. Showing available directory facilities.', disclaimer: 'Confirm the doctor’s specialty, appointment and current availability directly with the facility.', km: 'km away' },
  hi: { title: 'आपके लक्षणों के अनुसार देखभाल के विकल्प', note: 'यह संभावित डॉक्टर का प्रकार है, निदान या किसी क्लिनिक में विशेषज्ञ होने की पुष्टि नहीं।', general: 'जनरल फिजिशियन', specialist: 'सुझाया गया विशेषज्ञ', emergency: 'पहले तत्काल चिकित्सा सहायता', urgent: 'आपातकालीन लक्षणों में 112 पर कॉल करें या तुरंत नजदीकी इमरजेंसी विभाग जाएं। अपॉइंटमेंट का इंतजार न करें।', near: 'नजदीकी स्वास्थ्य केंद्र', listed: 'डायरेक्टरी में उपलब्ध क्लिनिक', loading: 'संबंधित केंद्र खोजे जा रहे हैं...', empty: 'अभी कोई उपयुक्त केंद्र सूचीबद्ध नहीं है। अन्य विकल्प देखने के लिए नजदीकी खोज करें।', match: 'विशेषज्ञता सूचीबद्ध', unverified: 'विशेषज्ञता की पुष्टि नहीं', map: 'रास्ता देखें', browse: 'क्लिनिक देखें', locate: 'मेरी लोकेशन उपयोग करें', location: 'वास्तविक नजदीकी केंद्र देखने के लिए लोकेशन की अनुमति दें।', error: 'नजदीकी परिणाम उपलब्ध नहीं हैं। उपलब्ध डायरेक्टरी दिखाई जा रही है।', disclaimer: 'डॉक्टर की विशेषज्ञता, अपॉइंटमेंट और उपलब्धता की पुष्टि सीधे केंद्र से करें।', km: 'किमी दूर' },
  hinglish: { title: 'Aapke symptoms ke hisaab se care options', note: 'Ye suggested doctor type hai, diagnosis ya clinic mein specialist hone ki guarantee nahi.', general: 'General Physician', specialist: 'Suggested Specialist', emergency: 'Pehle urgent medical help', urgent: 'Emergency signs par 112 call karein ya turant nearest emergency department jayein. Appointment ka wait na karein.', near: 'Nearby care facilities', listed: 'Directory mein listed clinics', loading: 'Relevant clinics dhoondh rahe hain...', empty: 'Abhi matching clinic listed nahi hai. Nearby search mein aur options dekhein.', match: 'Specialty listed', unverified: 'Specialty verify nahi hai', map: 'Directions', browse: 'Explore Clinics', locate: 'Meri location use karein', location: 'Actual nearby clinics ke liye location allow karein.', error: 'Nearby results available nahi hain. Directory clinics dikha rahe hain.', disclaimer: 'Doctor ki specialty, appointment aur availability directly clinic se confirm karein.', km: 'km door' },
  mr: { title: 'तुमच्या लक्षणांनुसार उपचाराचे पर्याय', note: 'हा सुचवलेला डॉक्टरांचा प्रकार आहे; निदान किंवा क्लिनिकमधील तज्ज्ञाची खात्री नाही.', general: 'सामान्य चिकित्सक', specialist: 'सुचवलेला तज्ज्ञ', emergency: 'प्रथम तातडीची मदत', urgent: 'आपत्कालीन लक्षणे असल्यास 112 वर कॉल करा किंवा जवळच्या आपत्कालीन विभागात जा. अपॉइंटमेंटची वाट पाहू नका.', near: 'जवळील आरोग्य केंद्रे', listed: 'सूचीतील दवाखाने', loading: 'संबंधित केंद्रे शोधत आहोत...', empty: 'सध्या योग्य केंद्र सूचीमध्ये नाही. इतर पर्यायांसाठी जवळील शोध वापरा.', match: 'विशेषज्ञता नोंदलेली', unverified: 'विशेषज्ञतेची खात्री नाही', map: 'मार्ग पहा', browse: 'दवाखाने पहा', locate: 'माझे स्थान वापरा', location: 'जवळील केंद्रांसाठी स्थानाची परवानगी द्या.', error: 'जवळील परिणाम उपलब्ध नाहीत. सूचीतील केंद्रे दाखवत आहोत.', disclaimer: 'डॉक्टरांची विशेषज्ञता, अपॉइंटमेंट आणि उपलब्धता केंद्राशी संपर्क करून तपासा.', km: 'किमी अंतरावर' },
  ta: { title: 'உங்கள் அறிகுறிகளுக்கேற்ற சிகிச்சை வாய்ப்புகள்', note: 'இது பரிந்துரைக்கப்படும் மருத்துவர் வகை மட்டுமே; நோயறிதலோ நிபுணர் இருப்பதற்கான உறுதியோ அல்ல.', general: 'பொது மருத்துவர்', specialist: 'பரிந்துரைக்கப்படும் நிபுணர்', emergency: 'முதலில் அவசர மருத்துவ உதவி', urgent: 'அவசர அறிகுறிகள் இருந்தால் 112-ஐ அழைக்கவும் அல்லது அருகிலுள்ள அவசர சிகிச்சைப் பிரிவுக்குச் செல்லவும். முன்பதிவுக்காகக் காத்திருக்க வேண்டாம்.', near: 'அருகிலுள்ள சிகிச்சை மையங்கள்', listed: 'பட்டியலில் உள்ள மருத்துவமனைகள்', loading: 'தொடர்புடைய மையங்கள் தேடப்படுகின்றன...', empty: 'பொருத்தமான மையம் தற்போது பட்டியலில் இல்லை. அருகிலுள்ள தேடலைப் பயன்படுத்தவும்.', match: 'நிபுணத்துவம் பட்டியலிடப்பட்டுள்ளது', unverified: 'நிபுணத்துவம் உறுதிப்படுத்தப்படவில்லை', map: 'வழிகாட்டல்', browse: 'மருத்துவமனைகளைப் பார்க்க', locate: 'என் இருப்பிடத்தைப் பயன்படுத்து', location: 'அருகிலுள்ள மையங்களுக்கு இருப்பிட அனுமதி அளிக்கவும்.', error: 'அருகிலுள்ள முடிவுகள் கிடைக்கவில்லை. பட்டியல் மையங்கள் காட்டப்படுகின்றன.', disclaimer: 'மருத்துவரின் நிபுணத்துவம், நேரம் மற்றும் இருப்பை மையத்துடன் உறுதிசெய்யவும்.', km: 'கிமீ தொலைவில்' },
  bn: { title: 'আপনার উপসর্গ অনুযায়ী চিকিৎসার বিকল্প', note: 'এটি প্রস্তাবিত চিকিৎসকের ধরন, রোগনির্ণয় বা কোনো ক্লিনিকে বিশেষজ্ঞ থাকার নিশ্চয়তা নয়।', general: 'সাধারণ চিকিৎসক', specialist: 'প্রস্তাবিত বিশেষজ্ঞ', emergency: 'আগে জরুরি চিকিৎসা', urgent: 'জরুরি লক্ষণ থাকলে 112 নম্বরে কল করুন বা নিকটতম জরুরি বিভাগে যান। অ্যাপয়েন্টমেন্টের জন্য অপেক্ষা করবেন না।', near: 'কাছাকাছি চিকিৎসাকেন্দ্র', listed: 'তালিকাভুক্ত ক্লিনিক', loading: 'প্রাসঙ্গিক কেন্দ্র খোঁজা হচ্ছে...', empty: 'এখন উপযুক্ত কেন্দ্র তালিকাভুক্ত নেই। আরও বিকল্পের জন্য কাছাকাছি খুঁজুন।', match: 'বিশেষজ্ঞতা তালিকাভুক্ত', unverified: 'বিশেষজ্ঞতা যাচাই করা হয়নি', map: 'দিকনির্দেশ', browse: 'ক্লিনিক দেখুন', locate: 'আমার অবস্থান ব্যবহার করুন', location: 'কাছাকাছি কেন্দ্র দেখতে অবস্থানের অনুমতি দিন।', error: 'কাছাকাছি ফলাফল পাওয়া যাচ্ছে না। তালিকার কেন্দ্র দেখানো হচ্ছে।', disclaimer: 'চিকিৎসকের বিশেষজ্ঞতা, অ্যাপয়েন্টমেন্ট ও উপস্থিতি সরাসরি নিশ্চিত করুন।', km: 'কিমি দূরে' }
};
const specialtyLabels: Record<Specialty, Record<string, string>> = {
  'General Medicine': { hi: 'जनरल फिजिशियन', mr: 'सामान्य चिकित्सक', ta: 'பொது மருத்துவர்', bn: 'সাধারণ চিকিৎসক' },
  Cardiology: { hi: 'हृदय रोग विशेषज्ञ', mr: 'हृदयरोग तज्ज्ञ', ta: 'இதய நிபுணர்', bn: 'হৃদরোগ বিশেষজ্ঞ' },
  Dermatology: { hi: 'त्वचा रोग विशेषज्ञ', mr: 'त्वचारोग तज्ज्ञ', ta: 'தோல் நிபுணர்', bn: 'চর্মরোগ বিশেষজ্ঞ' },
  ENT: { hi: 'कान, नाक और गला विशेषज्ञ', mr: 'कान, नाक व घसा तज्ज्ञ', ta: 'காது, மூக்கு, தொண்டை நிபுணர்', bn: 'কান, নাক ও গলা বিশেষজ্ঞ' },
  Orthopedics: { hi: 'हड्डी रोग विशेषज्ञ', mr: 'अस्थिरोग तज्ज्ञ', ta: 'எலும்பியல் நிபுணர்', bn: 'অস্থিরোগ বিশেষজ্ঞ' },
  Neurology: { hi: 'न्यूरोलॉजिस्ट', mr: 'मज्जातंतू तज्ज्ञ', ta: 'நரம்பியல் நிபுணர்', bn: 'স্নায়ুরোগ বিশেষজ্ঞ' },
  Gastroenterology: { hi: 'पेट और पाचन विशेषज्ञ', mr: 'पचनसंस्था तज्ज्ञ', ta: 'இரைப்பைக் குடல் நிபுணர்', bn: 'পরিপাকতন্ত্র বিশেষজ্ঞ' },
  Pulmonology: { hi: 'फेफड़ों के विशेषज्ञ', mr: 'फुफ्फुसरोग तज्ज्ञ', ta: 'நுரையீரல் நிபுணர்', bn: 'ফুসফুস বিশেষজ্ঞ' },
  Urology: { hi: 'मूत्र रोग विशेषज्ञ', mr: 'मूत्ररोग तज्ज्ञ', ta: 'சிறுநீரக நிபுணர்', bn: 'মূত্ররোগ বিশেষজ্ঞ' },
  Gynecology: { hi: 'स्त्री रोग विशेषज्ञ', mr: 'स्त्रीरोग तज्ज्ञ', ta: 'மகளிர் நல மருத்துவர்', bn: 'স্ত্রীরোগ বিশেষজ্ঞ' },
  Ophthalmology: { hi: 'नेत्र रोग विशेषज्ञ', mr: 'नेत्ररोग तज्ज्ञ', ta: 'கண் மருத்துவர்', bn: 'চক্ষুরোগ বিশেষজ্ঞ' },
  Pediatrics: { hi: 'बाल रोग विशेषज्ञ', mr: 'बालरोग तज्ज्ञ', ta: 'குழந்தை நல மருத்துவர்', bn: 'শিশুরোগ বিশেষজ্ঞ' },
  Psychiatry: { hi: 'मानसिक स्वास्थ्य विशेषज्ञ', mr: 'मानसोपचार तज्ज्ञ', ta: 'மனநல மருத்துவர்', bn: 'মনোরোগ বিশেষজ্ঞ' }
};
function inferSpecialty(assessment: Assessment, sourceText: string): Specialty {
  if (assessment.urgency === 'green') return 'General Medicine';
  const text = [sourceText, assessment.summary, ...(assessment.detectedSymptoms || []), ...(assessment.possibleCauses || []).map(x => x.name), ...(assessment.doctorAdvice || [])].join(' ');
  const explicit = assessment.doctorAdvice?.join(' ') || '';
  for (const item of patterns) if (item.terms.test(explicit)) return item.specialty;
  for (const item of patterns) if (item.terms.test(text)) return item.specialty;
  return 'General Medicine';
}
function matches(clinic: Clinic, specialty: Specialty) {
  const labels = (clinic.specialties || []).join(' ').toLowerCase();
  if (specialty === 'General Medicine') return /general|family|internal|multi|primary|medicine|physician/i.test(labels);
  const synonyms: Record<Specialty, RegExp> = {
    'General Medicine': /general|family|internal|medicine/i, Cardiology: /cardio|heart/i,
    Dermatology: /derma|skin/i, ENT: /ent|oto|ear|nose|throat/i,
    Orthopedics: /ortho|bone/i, Neurology: /neuro/i,
    Gastroenterology: /gastro|digestive/i, Pulmonology: /pulmon|respiratory|chest/i,
    Urology: /uro/i, Gynecology: /gyn|obstetric/i,
    Ophthalmology: /ophthal|eye/i, Pediatrics: /pediatr|paediatr|child/i,
    Psychiatry: /psych/i
  };
  return synonyms[specialty].test(labels);
}

const extra = {
  en: ['Location is needed for actual nearby clinics. No random directory entries are shown.', 'Nearby results could not be fetched. Try again later.', 'Search using your saved location', 'No facilities with this specialty are listed nearby. Showing nearby hospitals with unconfirmed specialist availability.', 'No nearby facilities were found in the map data.', 'OpenStreetMap listing; doctor specialty and availability are not independently verified.', 'Your saved city or location', 'Location access was declined. You can use a city in the onboarding setup on your next login.'],
  hi: ['वास्तविक नजदीकी क्लिनिक दिखाने के लिए लोकेशन चाहिए। कोई रैंडम क्लिनिक नहीं दिखाया जाएगा।', 'नजदीकी क्लिनिक नहीं मिल पाए। बाद में दोबारा कोशिश करें।', 'सेव की गई लोकेशन से खोजें', 'इस विशेषज्ञता का नजदीकी क्लिनिक सूची में नहीं है। नीचे अस्पताल हैं, विशेषज्ञ की पुष्टि नहीं है।', 'मैप डेटा में कोई नजदीकी केंद्र नहीं मिला।', 'OpenStreetMap सूची; डॉक्टर की विशेषज्ञता और उपलब्धता की स्वतंत्र पुष्टि नहीं हुई है।', 'आपका सेव किया हुआ शहर या स्थान', 'लोकेशन की अनुमति नहीं मिली। अगले लॉगिन पर शहर चुन सकते हैं।'],
  hinglish: ['Actual nearby clinics ke liye location chahiye. Random directory clinics nahi dikhayenge.', 'Nearby clinics fetch nahi ho paaye. Baad mein try karein.', 'Saved location se search karein', 'Matching specialist nearby listed nahi hai. Neeche hospitals hain, specialist availability unverified hai.', 'Map data mein nearby facilities nahi mili.', 'OpenStreetMap listing; doctor specialty aur availability independently verify nahi hui hai.', 'Aapki saved city/location', 'Location allow nahi hui. Next login par city select kar sakte hain.'],
  mr: ['खरे जवळील दवाखाने दाखवण्यासाठी स्थान आवश्यक आहे. यादृच्छिक दवाखाने दाखवले जाणार नाहीत.', 'जवळील दवाखाने मिळू शकले नाहीत. नंतर पुन्हा प्रयत्न करा.', 'जतन केलेल्या स्थानावरून शोधा', 'या तज्ज्ञतेचे जवळील दवाखाने नाहीत. खालील रुग्णालयांमध्ये तज्ज्ञ असल्याची खात्री नाही.', 'नकाशात जवळील केंद्रे सापडली नाहीत.', 'OpenStreetMap नोंद; तज्ज्ञता व उपलब्धता स्वतंत्रपणे पडताळलेली नाही.', 'तुमचे जतन केलेले स्थान', 'स्थानाची परवानगी मिळाली नाही. पुढील लॉगिनवर शहर निवडा.'],
  ta: ['உண்மையான அருகிலுள்ள மருத்துவமனைகளைக் காண இருப்பிடம் தேவை. சீரற்ற முடிவுகள் காட்டப்படாது.', 'அருகிலுள்ள மருத்துவமனைகளைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', 'சேமித்த இருப்பிடத்தில் தேடு', 'பொருத்தமான நிபுணர் அருகில் பட்டியலிடப்படவில்லை. கீழே உள்ள மருத்துவமனைகளில் நிபுணர் இருப்பது உறுதிசெய்யப்படவில்லை.', 'வரைபடத்தில் அருகிலுள்ள மையங்கள் இல்லை.', 'OpenStreetMap பட்டியல்; மருத்துவர் நிபுணத்துவம் மற்றும் இருப்பு தனியாகச் சரிபார்க்கப்படவில்லை.', 'சேமித்த நகரம் அல்லது இருப்பிடம்', 'இருப்பிட அனுமதி மறுக்கப்பட்டது. அடுத்த உள்நுழைவில் நகரத்தைத் தேர்ந்தெடுக்கலாம்.'],
  bn: ['প্রকৃত কাছাকাছি ক্লিনিক দেখাতে অবস্থান প্রয়োজন। এলোমেলো ক্লিনিক দেখানো হবে না।', 'কাছাকাছি ক্লিনিক পাওয়া যায়নি। পরে আবার চেষ্টা করুন।', 'সংরক্ষিত অবস্থান দিয়ে খুঁজুন', 'কাছাকাছি এই বিশেষজ্ঞের ক্লিনিক তালিকাভুক্ত নেই। নিচের হাসপাতালগুলিতে বিশেষজ্ঞ আছেন কি না নিশ্চিত নয়।', 'মানচিত্রে কাছাকাছি কেন্দ্র পাওয়া যায়নি।', 'OpenStreetMap তালিকা; চিকিৎসকের বিশেষজ্ঞতা ও উপস্থিতি আলাদাভাবে যাচাই করা হয়নি।', 'সংরক্ষিত শহর বা অবস্থান', 'অবস্থানের অনুমতি পাওয়া যায়নি। পরবর্তী লগইনে শহর বেছে নিতে পারেন।']
};
export default function RecommendedCare({ assessment, sourceText = '', view = 'all' }: { assessment: Assessment; sourceText?: string; view?: 'all' | 'clinics' | 'medicines' | 'preview' }) {
  const { lang } = useLanguage();
  const t = ui[lang as keyof typeof ui] || ui.en;
  const e = extra[lang as keyof typeof extra] || extra.en;
  const specialty = useMemo(() => inferSpecialty(assessment, sourceText), [assessment, sourceText]);
  const userId = loadSession()?.id || '';
  const [location, setLocation] = useState<CareLocation | null>(() => getCareLocation(userId));
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const update = () => setLocation(getCareLocation(userId));
    window.addEventListener('medguide-location-updated', update);
    return () => window.removeEventListener('medguide-location-updated', update);
  }, [userId]);
  useEffect(() => {
    if (!location) { setClinics([]); return; }
    let active = true;
    const cacheKey = `medguide_nearby_${location.lat.toFixed(3)}_${location.lon.toFixed(3)}`;
    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null') as { time: number; clinics: Clinic[] } | null;
      if (cached && Date.now() - cached.time < 10 * 60 * 1000 && retry === 0) { setClinics(cached.clinics); setError(''); setLoading(false); return; }
    } catch { /* Ignore invalid cache */ }
    setLoading(true); setError(''); setClinics([]);
    fetch(`/api/nearby-clinics?lat=${encodeURIComponent(location.lat)}&lon=${encodeURIComponent(location.lon)}&radius=15000`)
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data: { clinics?: Clinic[] }) => { if (active) { const found = Array.isArray(data.clinics) ? data.clinics : []; setClinics(found); sessionStorage.setItem(cacheKey, JSON.stringify({time:Date.now(),clinics:found})); } })
      .catch(() => { if (active) setError(e[1]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [location?.lat, location?.lon, retry]);
  const ranked = useMemo(() => {
    if (assessment.urgency === 'red') return clinics.filter(c => /hospital/i.test(c.type || '') || c.emergency === true).slice(0, view === 'preview' ? 2 : 4);
    const exact = clinics.filter(c => matches(c, specialty));
    if (exact.length) return exact.slice(0, view === 'preview' ? 2 : 4);
    return clinics.filter(c => /hospital|clinic|doctor/i.test(c.type || '')).slice(0, view === 'preview' ? 2 : 4);
  }, [clinics, specialty, assessment.urgency, view]);
  const mapSearch = location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((assessment.urgency === 'red' ? 'emergency hospital' : specialty + ' clinic') + ' near ' + location.lat + ',' + location.lon)}` : '';
  const confirmedMatches = ranked.some(c => matches(c, specialty));
  const label = specialtyLabels[specialty][lang] || specialty;
  return <div className={view === 'all' ? "grid gap-5 xl:grid-cols-2 xl:items-start" : "w-full"}>
    {view !== 'medicines' && <section className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-lg sm:p-7">
      <div className="flex items-start gap-3"><div className="rounded-2xl bg-blue-50 p-3 text-blue-700"><Stethoscope size={25}/></div><div className="min-w-0 flex-1"><h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{t.title}</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">{t.note}</p></div></div>
      <div className={`mt-5 rounded-2xl p-4 ${assessment.urgency === 'red' ? 'bg-red-50 text-red-900' : 'bg-blue-50 text-blue-900'}`}><p className="text-xs font-bold uppercase">{assessment.urgency === 'red' ? t.emergency : specialty === 'General Medicine' ? t.general : t.specialist}</p><p className="mt-1 text-lg font-extrabold">{assessment.urgency === 'red' ? t.emergency : label}</p>{assessment.urgency === 'red' && <p className="mt-2 text-sm font-semibold">{t.urgent}</p>}</div>
      {assessment.urgency === 'red' && <a href="tel:112" className="mt-3 flex justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-extrabold text-white">112 · Emergency</a>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><h3 className="font-extrabold text-slate-900">{t.near}</h3>{location && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800"><MapPin size={13} className="mr-1 inline"/>{location.label}</span>}</div>
      
      {!location && <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{e[0]}</p>}
      {error && <div role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><p>Live clinic directory is currently unavailable. No unverified clinics will be invented.</p><button type="button" onClick={() => setRetry(n => n + 1)} className="mt-2 rounded-lg bg-amber-900 px-3 py-2 font-bold text-white">Retry nearby clinics</button></div>}
      {loading ? <p className="mt-4 text-sm text-slate-500">{t.loading}</p> : location && !error && ranked.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{e[4]}</p> : null}
      {location && !loading && ranked.length > 0 && <><p className="mt-3 text-xs text-slate-600">{!confirmedMatches && assessment.urgency !== 'red' ? e[3] : e[5]}</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{ranked.map(c => {
        const verifiedMatch = matches(c, specialty);
        const directions = c.latitude != null && c.longitude != null ? `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.name, c.address, c.city].filter(Boolean).join(', '))}`;
        return <article key={c.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 p-4"><div><div className="flex items-start gap-2"><Hospital className="mt-0.5 shrink-0 text-blue-700" size={20}/><div><h4 className="font-extrabold text-slate-900">{c.name}</h4><p className="mt-1 text-xs text-slate-500">{[c.address, c.city].filter(Boolean).join(', ')}</p></div></div><div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${verifiedMatch ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{verifiedMatch ? t.match : t.unverified}</span>{typeof c.distance_km === 'number' && <span className="inline-flex items-center gap-1 text-xs text-slate-500"><MapPin size={13}/>{c.distance_km.toFixed(1)} {t.km}</span>}</div></div><a href={directions} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white">{t.map}<ArrowUpRight size={14}/></a></article>;
      })}</div><p className="mt-3 text-[11px] text-slate-500">© OpenStreetMap contributors</p></>}
      {location && !loading && ranked.length > 0 && <a href={mapSearch} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm font-bold text-blue-800">More nearby {assessment.urgency === 'red' ? 'hospitals' : label + ' options'} · Google Maps <ArrowUpRight size={15}/></a>}
      <p className="mt-4 text-xs leading-relaxed text-slate-500">{t.disclaimer}</p><Link to="/clinics" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700">{view === 'preview' ? 'View all nearby clinics' : t.browse}<ArrowUpRight size={15}/></Link>
    </section>}
    {view !== 'clinics' && <SafeMedicineGuidance assessment={assessment} sourceText={sourceText}/>}
  </div>;
}

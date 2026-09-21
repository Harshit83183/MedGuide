import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'hi' | 'hinglish' | 'mr' | 'ta' | 'bn';

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'hinglish', label: 'Hinglish', native: 'Hinglish' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

type Row = { en: string; hi: string; mr: string; ta: string; bn: string };
const P: Record<string, Row> = {};
const add = (source: string, en: string, hi: string, mr: string, ta: string, bn: string) => {
  P[source] = { en, hi, mr, ta, bn };
};

// Common / navigation / trust
add('Sehat ka Smart Saathi', 'Your Smart Health Companion', 'सेहत का स्मार्ट साथी', 'आरोग्याचा स्मार्ट साथी', 'உங்கள் ஸ்மார்ட் ஆரோக்கிய துணை', 'আপনার স্মার্ট স্বাস্থ্যসঙ্গী');
add('SEHAT KA SMART SAATHI', 'YOUR SMART HEALTH COMPANION', 'सेहत का स्मार्ट साथी', 'आरोग्याचा स्मार्ट साथी', 'உங்கள் ஸ்மார்ட் ஆரோக்கிய துணை', 'আপনার স্মার্ট স্বাস্থ্যসঙ্গী');
add('Home', 'Home', 'होम', 'मुख्यपृष्ठ', 'முகப்பு', 'হোম');
add('Symptom Checker', 'Symptom Checker', 'लक्षण जांच', 'लक्षण तपासणी', 'அறிகுறி பரிசோதனை', 'উপসর্গ পরীক্ষা');
add('Common Problems', 'Common Problems', 'सामान्य समस्याएं', 'सामान्य समस्या', 'பொதுவான பிரச்சினைகள்', 'সাধারণ সমস্যা');
add('Clinics', 'Clinics', 'क्लिनिक', 'क्लिनिक', 'மருத்துவமனைகள்', 'ক্লিনিক');
add('Verified Clinics', 'Verified Clinics', 'सत्यापित क्लिनिक', 'पडताळलेली क्लिनिक', 'சரிபார்க்கப்பட்ட மருத்துவமனைகள்', 'যাচাইকৃত ক্লিনিক');
add('Save on Medicines', 'Save on Medicines', 'दवाइयों पर बचत', 'औषधांवर बचत', 'மருந்துகளில் சேமிக்கவும்', 'ওষুধে সাশ্রয়');
add('Video Consult', 'Video Consult', 'वीडियो परामर्श', 'व्हिडिओ सल्ला', 'வீடியோ ஆலோசனை', 'ভিডিও পরামর্শ');
add('Video Consultation', 'Video Consultation', 'वीडियो परामर्श', 'व्हिडिओ सल्लामसलत', 'வீடியோ ஆலோசனை', 'ভিডিও পরামর্শ');
add('My Records', 'My Records', 'मेरे रिकॉर्ड', 'माझे रेकॉर्ड', 'என் பதிவுகள்', 'আমার রেকর্ড');
add('Health Records', 'Health Records', 'स्वास्थ्य रिकॉर्ड', 'आरोग्य नोंदी', 'ஆரோக்கிய பதிவுகள்', 'স্বাস্থ্য রেকর্ড');
add('Family Profiles', 'Family Profiles', 'परिवार प्रोफाइल', 'कुटुंब प्रोफाइल', 'குடும்ப சுயவிவரங்கள்', 'পরিবার প্রোফাইল');
add('Emergency SOS', 'Emergency SOS', 'आपातकालीन SOS', 'आपत्कालीन SOS', 'அவசர SOS', 'জরুরি SOS');
add('🚨 Emergency SOS', '🚨 Emergency SOS', '🚨 आपातकालीन SOS', '🚨 आपत्कालीन SOS', '🚨 அவசர SOS', '🚨 জরুরি SOS');
add('Logout', 'Logout', 'लॉग आउट', 'लॉग आउट', 'வெளியேறு', 'লগ আউট');
add('Data Safe', 'Data Safe', 'डेटा सुरक्षित', 'डेटा सुरक्षित', 'தரவு பாதுகாப்பானது', 'ডেটা নিরাপদ');
add('256-bit Encrypted', '256-bit Encrypted', '256-बिट एन्क्रिप्टेड', '256-बिट एन्क्रिप्टेड', '256-பிட் குறியாக்கம்', '256-বিট এনক্রিপ্টেড');
add('256-bit Encrypted Data Privacy', '256-bit Encrypted Data Privacy', '256-बिट एन्क्रिप्टेड डेटा गोपनीयता', '256-बिट एन्क्रिप्टेड डेटा गोपनीयता', '256-பிட் குறியாக்கப்பட்ட தரவு தனியுரிமை', '256-বিট এনক্রিপ্টেড ডেটা গোপনীয়তা');
add('Your data is safe with MedGuide', 'Your data is safe with MedGuide', 'MedGuide के साथ आपका डेटा सुरक्षित है', 'MedGuide सोबत तुमचा डेटा सुरक्षित आहे', 'MedGuide உடன் உங்கள் தரவு பாதுகாப்பாக உள்ளது', 'MedGuide-এ আপনার ডেটা নিরাপদ');
add('DPDP Act 2023 Compliant', 'DPDP Act 2023 Compliant', 'DPDP Act 2023 के अनुरूप', 'DPDP Act 2023 अनुरूप', 'DPDP Act 2023 இணக்கம்', 'DPDP Act 2023 অনুগত');
add('DPDP Act 2023 compliant', 'DPDP Act 2023 compliant', 'DPDP Act 2023 के अनुरूप', 'DPDP Act 2023 अनुरूप', 'DPDP Act 2023 இணக்கம்', 'DPDP Act 2023 অনুগত');
add('Features', 'Features', 'फीचर्स', 'वैशिष्ट्ये', 'அம்சங்கள்', 'ফিচার');
add('Account', 'Account', 'अकाउंट', 'खाते', 'கணக்கு', 'অ্যাকাউন্ট');
add('Emergency', 'Emergency', 'आपातकाल', 'आपत्काल', 'அவசரம்', 'জরুরি');
add('Privacy Policy', 'Privacy Policy', 'गोपनीयता नीति', 'गोपनीयता धोरण', 'தனியுரிமைக் கொள்கை', 'গোপনীয়তা নীতি');
add('Medical Disclaimer', 'Medical Disclaimer', 'चिकित्सकीय अस्वीकरण', 'वैद्यकीय अस्वीकरण', 'மருத்துவ மறுப்பு', 'চিকিৎসা দায়মুক্তি');

// Login
add('Create Account', 'Create Account', 'अकाउंट बनाएं', 'खाते तयार करा', 'கணக்கு உருவாக்கவும்', 'অ্যাকাউন্ট তৈরি করুন');
add('Sign In', 'Sign In', 'साइन इन', 'साइन इन', 'உள்நுழைக', 'সাইন ইন');
add('Create your account', 'Create your account', 'अपना अकाउंट बनाएं', 'तुमचे खाते तयार करा', 'உங்கள் கணக்கை உருவாக்கவும்', 'আপনার অ্যাকাউন্ট তৈরি করুন');
add('Welcome back 👋', 'Welcome back 👋', 'वापसी पर स्वागत है 👋', 'पुन्हा स्वागत आहे 👋', 'மீண்டும் வரவேற்கிறோம் 👋', 'আবার স্বাগতম 👋');
add('Email ya phone aur password se MedGuide account banayein.', 'Create a MedGuide account with email or phone and password.', 'ईमेल या फोन और पासवर्ड से MedGuide अकाउंट बनाएं।', 'ईमेल किंवा फोन आणि पासवर्डने MedGuide खाते तयार करा.', 'மின்னஞ்சல் அல்லது தொலைபேசி மற்றும் கடவுச்சொல்லுடன் MedGuide கணக்கை உருவாக்கவும்.', 'ইমেইল বা ফোন ও পাসওয়ার্ড দিয়ে MedGuide অ্যাকাউন্ট তৈরি করুন।');
add('Email ya phone aur password se sign in karein.', 'Sign in with email or phone and password.', 'ईमेल या फोन और पासवर्ड से साइन इन करें।', 'ईमेल किंवा फोन आणि पासवर्डने साइन इन करा.', 'மின்னஞ்சல் அல்லது தொலைபேசி மற்றும் கடவுச்சொல்லுடன் உள்நுழைக.', 'ইমেইল বা ফোন ও পাসওয়ার্ড দিয়ে সাইন ইন করুন।');
add('Full Name', 'Full Name', 'पूरा नाम', 'पूर्ण नाव', 'முழு பெயர்', 'পুরো নাম');
add('Your name', 'Your name', 'आपका नाम', 'तुमचे नाव', 'உங்கள் பெயர்', 'আপনার নাম');
add('Email Address', 'Email Address', 'ईमेल पता', 'ईमेल पत्ता', 'மின்னஞ்சல் முகவரி', 'ইমেইল ঠিকানা');
add('Mobile Number', 'Mobile Number', 'मोबाइल नंबर', 'मोबाईल नंबर', 'மொபைல் எண்', 'মোবাইল নম্বর');
add('Phone', 'Phone', 'फोन', 'फोन', 'தொலைபேசி', 'ফোন');
add('Password', 'Password', 'पासवर्ड', 'पासवर्ड', 'கடவுச்சொல்', 'পাসওয়ার্ড');
add('Confirm Password', 'Confirm Password', 'पासवर्ड की पुष्टि करें', 'पासवर्डची पुष्टी करा', 'கடவுச்சொல்லை உறுதிப்படுத்தவும்', 'পাসওয়ার্ড নিশ্চিত করুন');
add('Minimum 6 characters', 'Minimum 6 characters', 'कम से कम 6 अक्षर', 'किमान 6 अक्षरे', 'குறைந்தது 6 எழுத்துகள்', 'কমপক্ষে ৬ অক্ষর');
add('Password dobara likhein', 'Enter the password again', 'पासवर्ड दोबारा लिखें', 'पासवर्ड पुन्हा लिहा', 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்', 'পাসওয়ার্ড আবার লিখুন');
add('Please wait...', 'Please wait...', 'कृपया प्रतीक्षा करें...', 'कृपया थांबा...', 'தயவுசெய்து காத்திருக்கவும்...', 'অনুগ্রহ করে অপেক্ষা করুন...');
add('Sign In with Password', 'Sign In with Password', 'पासवर्ड से साइन इन करें', 'पासवर्डने साइन इन करा', 'கடவுச்சொல்லுடன் உள்நுழைக', 'পাসওয়ার্ড দিয়ে সাইন ইন করুন');
add('Already have an account?', 'Already have an account?', 'पहले से अकाउंट है?', 'आधीच खाते आहे?', 'ஏற்கனவே கணக்கு உள்ளதா?', 'ইতিমধ্যে অ্যাকাউন্ট আছে?');
add("Don't have an account?", "Don't have an account?", 'अकाउंट नहीं है?', 'खाते नाही?', 'கணக்கு இல்லையா?', 'অ্যাকাউন্ট নেই?');
add('Create account', 'Create account', 'अकाउंट बनाएं', 'खाते तयार करा', 'கணக்கு உருவாக்கவும்', 'অ্যাকাউন্ট তৈরি করুন');
add('Sign in', 'Sign in', 'साइन इन', 'साइन इन', 'உள்நுழைக', 'সাইন ইন');
add('OR CONTINUE WITH', 'OR CONTINUE WITH', 'या इसके साथ जारी रखें', 'किंवा यासह पुढे जा', 'அல்லது இதன் மூலம் தொடரவும்', 'অথবা এর মাধ্যমে চালিয়ে যান');
add('Phone OTP', 'Phone OTP', 'फोन OTP', 'फोन OTP', 'தொலைபேசி OTP', 'ফোন OTP');
add('Send OTP', 'Send OTP', 'OTP भेजें', 'OTP पाठवा', 'OTP அனுப்பவும்', 'OTP পাঠান');
add('Verify & Login', 'Verify & Login', 'सत्यापित करें और लॉगिन करें', 'पडताळा आणि लॉगिन करा', 'சரிபார்த்து உள்நுழைக', 'যাচাই করে লগইন করুন');
add('Resend OTP', 'Resend OTP', 'OTP दोबारा भेजें', 'OTP पुन्हा पाठवा', 'OTP மீண்டும் அனுப்பவும்', 'OTP আবার পাঠান');
add('Demo mode — aapka OTP', 'Demo mode — your OTP', 'डेमो मोड — आपका OTP', 'डेमो मोड — तुमचा OTP', 'டெமோ முறை — உங்கள் OTP', 'ডেমো মোড — আপনার OTP');
add('✨ Bina login explore karein (Demo Mode)', '✨ Explore without logging in (Demo Mode)', '✨ बिना लॉगिन एक्सप्लोर करें (डेमो मोड)', '✨ लॉगिनशिवाय पाहा (डेमो मोड)', '✨ உள்நுழையாமல் ஆராயுங்கள் (டெமோ)', '✨ লগইন ছাড়া দেখুন (ডেমো মোড)');
add('Google se pehli baar login par account automatically ban jayega.', 'Your account will be created automatically the first time you sign in with Google.', 'Google से पहली बार लॉगिन पर अकाउंट अपने आप बन जाएगा।', 'Google ने पहिल्यांदा लॉगिन केल्यावर खाते आपोआप तयार होईल.', 'Google மூலம் முதல் முறையாக உள்நுழையும்போது கணக்கு தானாக உருவாகும்.', 'Google দিয়ে প্রথমবার লগইন করলে অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে তৈরি হবে।');
add('Account banakar ya login karke aap', 'By creating an account or logging in, you agree to', 'अकाउंट बनाकर या लॉगिन करके आप', 'खाते तयार करून किंवा लॉगिन करून तुम्ही', 'கணக்கு உருவாக்கி அல்லது உள்நுழைந்து நீங்கள்', 'অ্যাকাউন্ট তৈরি বা লগইন করে আপনি');
add('MedGuide guidance deta hai, diagnosis nahi.', 'MedGuide provides guidance, not a diagnosis.', 'MedGuide मार्गदर्शन देता है, निदान नहीं।', 'MedGuide मार्गदर्शन देते, निदान नाही.', 'MedGuide வழிகாட்டுதலை வழங்குகிறது; நோயறிதல் அல்ல.', 'MedGuide নির্দেশনা দেয়, রোগ নির্ণয় নয়।');
add('Bukhar ho ya', 'Whether it is a fever or', 'बुखार हो या', 'ताप असो किंवा', 'காய்ச்சலாக இருந்தாலும்', 'জ্বর হোক বা');
add('badi chinta', 'a serious concern', 'बड़ी चिंता', 'मोठी चिंता', 'பெரிய கவலை', 'বড় উদ্বেগ');
add('sahi raasta yahin milega.', 'you will find the right path here.', 'सही रास्ता यहीं मिलेगा।', 'योग्य मार्ग इथेच मिळेल.', 'சரியான வழி இங்கே கிடைக்கும்.', 'সঠিক পথ এখানেই পাবেন।');
add('Hindi, English, Hinglish + 3 aur bhashayein · Photo/voice se symptom batayein · Verified doctors · Jan Aushadhi bachat · 1-Tap SOS', '6 languages · Describe symptoms by photo/voice · Verified doctors · Jan Aushadhi savings · 1-Tap SOS', '6 भाषाएं · फोटो/वॉइस से लक्षण बताएं · सत्यापित डॉक्टर · जन औषधि बचत · 1-टैप SOS', '6 भाषा · फोटो/व्हॉइसने लक्षण सांगा · पडताळलेले डॉक्टर · जन औषधी बचत · 1-टॅप SOS', '6 மொழிகள் · புகைப்படம்/குரல் மூலம் அறிகுறிகள் · சரிபார்க்கப்பட்ட மருத்துவர்கள் · Jan Aushadhi சேமிப்பு · 1-டாப் SOS', '৬ ভাষা · ছবি/ভয়েসে উপসর্গ জানান · যাচাইকৃত ডাক্তার · জন ঔষধি সাশ্রয় · ১-ট্যাপ SOS');
add('Smart Symptom Triage', 'Smart Symptom Triage', 'स्मार्ट लक्षण ट्रायेज', 'स्मार्ट लक्षण ट्रायेज', 'ஸ்மார்ட் அறிகுறி டிரையாஜ்', 'স্মার্ট উপসর্গ ট্রায়াজ');
add('Green / Yellow / Red — turant samjho kitni urgent hai problem.', 'Green / Yellow / Red — instantly understand how urgent the problem is.', 'Green / Yellow / Red — तुरंत समझें समस्या कितनी जरूरी है।', 'Green / Yellow / Red — समस्या किती तातडीची आहे ते लगेच समजा.', 'Green / Yellow / Red — பிரச்சினை எவ்வளவு அவசரம் என்பதை உடனே அறியுங்கள்.', 'Green / Yellow / Red — সমস্যা কতটা জরুরি তা সঙ্গে সঙ্গে বুঝুন।');
add('Verified Doctors & Clinics', 'Verified Doctors & Clinics', 'सत्यापित डॉक्टर और क्लिनिक', 'पडताळलेले डॉक्टर आणि क्लिनिक', 'சரிபார்க்கப்பட்ட மருத்துவர்கள் மற்றும் மருத்துவமனைகள்', 'যাচাইকৃত ডাক্তার ও ক্লিনিক');
add('Rating, distance aur booking slots ke saath.', 'With ratings, distance and booking slots.', 'रेटिंग, दूरी और बुकिंग स्लॉट के साथ।', 'रेटिंग, अंतर आणि बुकिंग स्लॉटसह.', 'மதிப்பீடு, தூரம் மற்றும் முன்பதிவு நேரங்களுடன்.', 'রেটিং, দূরত্ব ও বুকিং স্লটসহ।');
add('Jan Aushadhi Savings', 'Jan Aushadhi Savings', 'जन औषधि बचत', 'जन औषधी बचत', 'Jan Aushadhi சேமிப்பு', 'জন ঔষধি সাশ্রয়');
add('Same composition, sasti dawa — bachat calculator.', 'Same composition, lower-cost medicine — savings calculator.', 'एक ही कंपोजिशन, सस्ती दवा — बचत कैलकुलेटर।', 'समान रचना, स्वस्त औषध — बचत कॅल्क्युलेटर.', 'அதே கலவை, குறைந்த விலை மருந்து — சேமிப்பு கணக்கீடு.', 'একই উপাদান, কম দামের ওষুধ — সাশ্রয় ক্যালকুলেটর।');
add('MedGuide Care Core', 'MedGuide Care Core', 'MedGuide केयर कोर', 'MedGuide केअर कोर', 'MedGuide Care Core', 'MedGuide Care Core');
add('One connected path for smarter care', 'One connected path for smarter care', 'स्मार्ट देखभाल के लिए एक जुड़ा हुआ रास्ता', 'स्मार्ट काळजीसाठी एक जोडलेला मार्ग', 'சிறந்த பராமரிப்பிற்கான ஒருங்கிணைந்த பாதை', 'স্মার্ট কেয়ারের জন্য এক সংযুক্ত পথ');
add('Symptom AI', 'Symptom AI', 'लक्षण AI', 'लक्षण AI', 'அறிகுறி AI', 'উপসর্গ AI');
add('Verified Care', 'Verified Care', 'सत्यापित देखभाल', 'पडताळलेली काळजी', 'சரிபார்க்கப்பட்ட பராமரிப்பு', 'যাচাইকৃত সেবা');
add('Smart Medicine', 'Smart Medicine', 'स्मार्ट मेडिसिन', 'स्मार्ट औषध', 'ஸ்மார்ட் மருந்து', 'স্মার্ট ওষুধ');
add('SOS Ready', 'SOS Ready', 'SOS तैयार', 'SOS तयार', 'SOS தயார்', 'SOS প্রস্তুত');
add('Languages', 'Languages', 'भाषाएं', 'भाषा', 'மொழிகள்', 'ভাষা');
add('Smart Triage', 'Smart Triage', 'स्मार्ट ट्रायेज', 'स्मार्ट ट्रायेज', 'ஸ்மார்ட் டிரையாஜ்', 'স্মার্ট ট্রায়াজ');

// Home
add('Suprabhat', 'Good morning', 'सुप्रभात', 'सुप्रभात', 'காலை வணக்கம்', 'সুপ্রভাত');
add('Namaste', 'Hello', 'नमस्ते', 'नमस्कार', 'வணக்கம்', 'নমস্কার');
add('Shubh Sandhya', 'Good evening', 'शुभ संध्या', 'शुभ संध्याकाळ', 'மாலை வணக்கம்', 'শুভ সন্ধ্যা');
add('Aaj aapki sehat me', 'How can we', 'आज आपकी सेहत में', 'आज तुमच्या आरोग्यासाठी', 'இன்று உங்கள் ஆரோக்கியத்திற்கு', 'আজ আপনার স্বাস্থ্যে');
add('kaise madad', 'help with your health', 'कैसे मदद', 'कशी मदत', 'எப்படி உதவ', 'কীভাবে সাহায্য');
add('kar sakte hain?', 'today?', 'कर सकते हैं?', 'करू शकतो?', 'முடியும்?', 'করতে পারি?');
add('Apni bhasha me takleef batayein, turant triage payein, verified doctor book karein aur dawaiyon par bachat karein.', 'Describe your problem in your language, get instant triage, book a verified doctor and save on medicines.', 'अपनी भाषा में समस्या बताएं, तुरंत ट्रायेज पाएं, सत्यापित डॉक्टर बुक करें और दवाइयों पर बचत करें।', 'तुमच्या भाषेत समस्या सांगा, त्वरित ट्रायेज मिळवा, पडताळलेला डॉक्टर बुक करा आणि औषधांवर बचत करा.', 'உங்கள் மொழியில் பிரச்சினையை கூறுங்கள், உடனடி டிரையாஜ் பெறுங்கள், சரிபார்க்கப்பட்ட மருத்துவரை முன்பதிவு செய்து மருந்துகளில் சேமிக்கவும்.', 'নিজের ভাষায় সমস্যা বলুন, দ্রুত ট্রায়াজ পান, যাচাইকৃত ডাক্তার বুক করুন এবং ওষুধে সাশ্রয় করুন।');
add('Takleef Batayein', 'Describe Your Problem', 'अपनी समस्या बताएं', 'तुमची समस्या सांगा', 'உங்கள் பிரச்சினையை கூறுங்கள்', 'আপনার সমস্যা বলুন');
add('Free-text, photo ya voice note se apni takleef batayein — 6 bhashaon me.', 'Describe your problem by text, photo or voice note — in 6 languages.', 'टेक्स्ट, फोटो या वॉइस नोट से अपनी समस्या बताएं — 6 भाषाओं में।', 'टेक्स्ट, फोटो किंवा व्हॉइस नोटने समस्या सांगा — 6 भाषांमध्ये.', 'உரை, புகைப்படம் அல்லது குரல் குறிப்பில் பிரச்சினையை கூறுங்கள் — 6 மொழிகளில்.', 'টেক্সট, ছবি বা ভয়েস নোটে সমস্যা বলুন — ৬ ভাষায়।');
add('6 Languages', '6 Languages', '6 भाषाएं', '6 भाषा', '6 மொழிகள்', '৬ ভাষা');
add('Bukhar, sir-dard, sardi... basic sawalon se turant sahi salah.', 'Fever, headache, cold... get quick guidance through simple questions.', 'बुखार, सिरदर्द, सर्दी... आसान सवालों से तुरंत सही सलाह।', 'ताप, डोकेदुखी, सर्दी... सोप्या प्रश्नांमधून त्वरित योग्य सल्ला.', 'காய்ச்சல், தலைவலி, சளி... எளிய கேள்விகள் மூலம் விரைவான வழிகாட்டல்.', 'জ্বর, মাথাব্যথা, সর্দি... সহজ প্রশ্নে দ্রুত সঠিক নির্দেশনা।');
add('No AI needed', 'No AI needed', 'AI की जरूरत नहीं', 'AI ची गरज नाही', 'AI தேவையில்லை', 'AI দরকার নেই');
add('Green (self-care), Yellow (doctor), Red (emergency) — turant sort.', 'Green (self-care), Yellow (doctor), Red (emergency) — instantly categorized.', 'Green (सेल्फ-केयर), Yellow (डॉक्टर), Red (आपातकाल) — तुरंत वर्गीकरण।', 'Green (स्वतःची काळजी), Yellow (डॉक्टर), Red (आपत्काल) — त्वरित वर्गीकरण.', 'Green (சுய பராமரிப்பு), Yellow (மருத்துவர்), Red (அவசரம்) — உடனடி வகைப்படுத்தல்.', 'Green (স্ব-যত্ন), Yellow (ডাক্তার), Red (জরুরি) — সঙ্গে সঙ্গে শ্রেণিবিভাগ।');
add('Distance, rating, booking time + dawa uplabdhta aur daam.', 'Distance, ratings, booking time + medicine availability and prices.', 'दूरी, रेटिंग, बुकिंग समय + दवा की उपलब्धता और कीमत।', 'अंतर, रेटिंग, बुकिंग वेळ + औषध उपलब्धता आणि किंमत.', 'தூரம், மதிப்பீடு, முன்பதிவு நேரம் + மருந்து கிடைக்கும் நிலை மற்றும் விலை.', 'দূরত্ব, রেটিং, বুকিং সময় + ওষুধের প্রাপ্যতা ও দাম।');
add('Jan Aushadhi vs brand — same composition, kitni bachat? Calculator.', 'Jan Aushadhi vs brand — same composition, see how much you can save.', 'जन औषधि बनाम ब्रांड — एक ही कंपोजिशन, कितनी बचत? कैलकुलेटर।', 'जन औषधी विरुद्ध ब्रँड — समान रचना, किती बचत? कॅल्क्युलेटर.', 'Jan Aushadhi vs பிராண்ட் — அதே கலவை, எவ்வளவு சேமிப்பு? கணக்கீடு.', 'জন ঔষধি বনাম ব্র্যান্ড — একই উপাদান, কত সাশ্রয়? ক্যালকুলেটর।');
add('Up to 90% off', 'Up to 90% off', '90% तक बचत', '90% पर्यंत बचत', '90% வரை சேமிப்பு', '৯০% পর্যন্ত সাশ্রয়');
add('₹400 me 3 meetings × 10 min — ghar baithe doctor se baat.', '3 × 10-minute meetings for ₹400 — consult a doctor from home.', '₹400 में 3 × 10 मिनट मीटिंग — घर बैठे डॉक्टर से बात करें।', '₹400 मध्ये 3 × 10 मिनिटांच्या भेटी — घरून डॉक्टरांशी बोला.', '₹400க்கு 3 × 10 நிமிட ஆலோசனைகள் — வீட்டிலிருந்தே மருத்துவருடன் பேசுங்கள்.', '₹400-এ 3 × 10 মিনিটের মিটিং — ঘরে বসে ডাক্তারের সঙ্গে কথা বলুন।');
add('Purani saari problems ka record + future advice, ek jagah.', 'Past health problems and future advice, all in one place.', 'पुरानी सभी समस्याओं का रिकॉर्ड + भविष्य की सलाह, एक जगह।', 'जुन्या सर्व समस्यांची नोंद + भविष्यातील सल्ला, एका ठिकाणी.', 'முந்தைய அனைத்து பிரச்சினைகளின் பதிவு + எதிர்கால ஆலோசனை, ஒரே இடத்தில்.', 'পুরনো সব সমস্যার রেকর্ড + ভবিষ্যৎ পরামর্শ, এক জায়গায়।');
add('Maa, papa, bachche — poore parivaar ka health hub.', 'Parents and children — one health hub for the whole family.', 'मां, पापा, बच्चे — पूरे परिवार का हेल्थ हब।', 'आई, बाबा, मुले — संपूर्ण कुटुंबासाठी हेल्थ हब.', 'பெற்றோர், குழந்தைகள் — முழு குடும்பத்திற்கும் ஒரே ஆரோக்கிய மையம்.', 'মা, বাবা, সন্তান — পুরো পরিবারের স্বাস্থ্য কেন্দ্র।');
add('1-Tap Emergency SOS', '1-Tap Emergency SOS', '1-टैप आपातकालीन SOS', '1-टॅप आपत्कालीन SOS', '1-டாப் அவசர SOS', '১-ট্যাপ জরুরি SOS');
add('Emergency? Ek tap me madad.', 'Emergency? Get help in one tap.', 'आपातकाल? एक टैप में मदद पाएं।', 'आपत्काल? एका टॅपमध्ये मदत मिळवा.', 'அவசரமா? ஒரு டாப் மூலம் உதவி பெறுங்கள்.', 'জরুরি অবস্থা? এক ট্যাপে সাহায্য নিন।');
add('Location + contacts ko turant alert · 108 / 112 direct dial · ER first-aid steps', 'Instantly alert location + contacts · Direct dial 108 / 112 · ER first-aid steps', 'लोकेशन + संपर्कों को तुरंत अलर्ट · 108 / 112 सीधे डायल · ER फर्स्ट-एड निर्देश', 'लोकेशन + संपर्कांना त्वरित अलर्ट · 108 / 112 थेट डायल · ER प्रथमोपचार सूचना', 'இருப்பிடம் + தொடர்புகளுக்கு உடனடி எச்சரிக்கை · 108 / 112 நேரடி அழைப்பு · ER முதலுதவி வழிமுறைகள்', 'লোকেশন + পরিচিতদের তাৎক্ষণিক সতর্কতা · 108 / 112 সরাসরি ডায়াল · ER প্রাথমিক চিকিৎসা ধাপ');
add('Aapka data, aapka haq. Bina permission kuch share nahi.', 'Your data, your rights. Nothing is shared without permission.', 'आपका डेटा, आपका अधिकार। बिना अनुमति कुछ साझा नहीं।', 'तुमचा डेटा, तुमचा हक्क. परवानगीशिवाय काहीही शेअर नाही.', 'உங்கள் தரவு, உங்கள் உரிமை. அனுமதியின்றி எதுவும் பகிரப்படாது.', 'আপনার ডেটা, আপনার অধিকার। অনুমতি ছাড়া কিছু শেয়ার নয়।');
add('Bank-jaisi security har photo, voice aur record par.', 'Bank-grade security for every photo, voice note and record.', 'हर फोटो, वॉइस और रिकॉर्ड पर बैंक जैसी सुरक्षा।', 'प्रत्येक फोटो, व्हॉइस आणि रेकॉर्डवर बँकसारखी सुरक्षा.', 'ஒவ்வொரு புகைப்படம், குரல் மற்றும் பதிவுக்கும் வங்கி தர பாதுகாப்பு.', 'প্রতিটি ছবি, ভয়েস ও রেকর্ডে ব্যাংক-স্তরের নিরাপত্তা।');
add('Verified Network', 'Verified Network', 'सत्यापित नेटवर्क', 'पडताळलेले नेटवर्क', 'சரிபார்க்கப்பட்ட வலைப்பின்னல்', 'যাচাইকৃত নেটওয়ার্ক');
add('Licensed clinics aur registered doctors hi listed.', 'Only licensed clinics and registered doctors are listed.', 'केवल लाइसेंस प्राप्त क्लिनिक और पंजीकृत डॉक्टर सूचीबद्ध हैं।', 'फक्त परवानाधारक क्लिनिक आणि नोंदणीकृत डॉक्टर सूचीबद्ध आहेत.', 'உரிமம் பெற்ற மருத்துவமனைகள் மற்றும் பதிவு செய்யப்பட்ட மருத்துவர்கள் மட்டுமே பட்டியலிடப்படுவர்.', 'শুধু লাইসেন্সপ্রাপ্ত ক্লিনিক ও নিবন্ধিত ডাক্তার তালিকাভুক্ত।');
add('MedGuide health guidance deta hai — diagnosis/prescription ka vikalp nahi.', 'MedGuide provides health guidance — it is not a substitute for diagnosis or prescription.', 'MedGuide स्वास्थ्य मार्गदर्शन देता है — यह निदान/प्रिस्क्रिप्शन का विकल्प नहीं है।', 'MedGuide आरोग्य मार्गदर्शन देते — निदान/प्रिस्क्रिप्शनचा पर्याय नाही.', 'MedGuide ஆரோக்கிய வழிகாட்டுதலை வழங்குகிறது — நோயறிதல்/மருந்து பரிந்துரைக்கு மாற்றாக அல்ல.', 'MedGuide স্বাস্থ্য নির্দেশনা দেয় — রোগ নির্ণয়/প্রেসক্রিপশনের বিকল্প নয়।');

// Symptom checker
add('Step 1 · Free Text Intake', 'Step 1 · Describe Your Symptoms', 'चरण 1 · अपनी समस्या बताएं', 'पायरी 1 · तुमची समस्या सांगा', 'படி 1 · உங்கள் அறிகுறிகளை கூறுங்கள்', 'ধাপ ১ · আপনার উপসর্গ বলুন');
add('Apni takleef batayein', 'Describe your problem', 'अपनी समस्या बताएं', 'तुमची समस्या सांगा', 'உங்கள் பிரச்சினையை கூறுங்கள்', 'আপনার সমস্যা বলুন');
add('Likhkar, photo/report upload karke, ya voice note record karke — jis tarah aasaan lage. Phir Smart Triage aapko sahi raasta dikhayega.', 'Type it, upload a photo/report, or record a voice note — whichever is easiest. Smart Triage will then guide you.', 'लिखकर, फोटो/रिपोर्ट अपलोड करके या वॉइस नोट रिकॉर्ड करके — जो आसान लगे। फिर Smart Triage सही रास्ता दिखाएगा।', 'लिहून, फोटो/रिपोर्ट अपलोड करून किंवा व्हॉइस नोट रेकॉर्ड करून — जे सोपे वाटेल. मग Smart Triage योग्य मार्ग दाखवेल.', 'எழுதி, புகைப்படம்/அறிக்கை பதிவேற்றி அல்லது குரல் குறிப்பு பதிவு செய்து — எது எளிதோ அதைத் தேர்வு செய்யுங்கள். பின்னர் Smart Triage வழிகாட்டும்.', 'লিখে, ছবি/রিপোর্ট আপলোড করে বা ভয়েস নোট রেকর্ড করে — যেটা সহজ। তারপর Smart Triage সঠিক পথ দেখাবে।');
add('Apni bhasha chunein', 'Choose your language', 'अपनी भाषा चुनें', 'तुमची भाषा निवडा', 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', 'আপনার ভাষা নির্বাচন করুন');
add('Describe your problem in your own words', 'Describe your problem in your own words', 'अपनी समस्या अपने शब्दों में बताएं', 'तुमची समस्या तुमच्या शब्दांत सांगा', 'உங்கள் பிரச்சினையை உங்கள் சொற்களில் கூறுங்கள்', 'নিজের ভাষায় আপনার সমস্যা বলুন');
add('Apni takleef apne shabdon me batayein', 'Describe your problem in your own words', 'अपनी तकलीफ अपने शब्दों में बताएं', 'तुमची तक्रार तुमच्या शब्दांत सांगा', 'உங்கள் பிரச்சினையை உங்கள் சொற்களில் கூறுங்கள்', 'আপনার সমস্যা নিজের ভাষায় বলুন');
add('Photo / Report', 'Photo / Report', 'फोटो / रिपोर्ट', 'फोटो / रिपोर्ट', 'புகைப்படம் / அறிக்கை', 'ছবি / রিপোর্ট');
add('Document', 'Document', 'दस्तावेज़', 'दस्तऐवज', 'ஆவணம்', 'ডকুমেন্ট');
add('Voice Note', 'Voice Note', 'वॉइस नोट', 'व्हॉइस नोट', 'குரல் குறிப்பு', 'ভয়েস নোট');
add('Secure upload ho raha hai...', 'Uploading securely...', 'सुरक्षित अपलोड हो रहा है...', 'सुरक्षित अपलोड होत आहे...', 'பாதுகாப்பாக பதிவேற்றப்படுகிறது...', 'নিরাপদে আপলোড হচ্ছে...');
add('✓ Encrypted upload done', '✓ Encrypted upload complete', '✓ एन्क्रिप्टेड अपलोड पूरा', '✓ एन्क्रिप्टेड अपलोड पूर्ण', '✓ குறியாக்கப்பட்ட பதிவேற்றம் முடிந்தது', '✓ এনক্রিপ্টেড আপলোড সম্পন্ন');
add('Save ho raha hai...', 'Saving...', 'सेव हो रहा है...', 'सेव्ह होत आहे...', 'சேமிக்கப்படுகிறது...', 'সেভ হচ্ছে...');
add('Aage Badhein — Smart Triage', 'Continue — Smart Triage', 'आगे बढ़ें — Smart Triage', 'पुढे जा — Smart Triage', 'தொடரவும் — Smart Triage', 'এগিয়ে যান — Smart Triage');
add('💡 Achhe se batane ke tips', '💡 Tips for describing it clearly', '💡 अच्छी तरह बताने के टिप्स', '💡 स्पष्ट सांगण्यासाठी टिप्स', '💡 தெளிவாக விவரிக்க உதவும் குறிப்புகள்', '💡 পরিষ্কারভাবে বলার টিপস');
add('• Kab se hai? (2 din / 1 hafta...)', '• Since when? (2 days / 1 week...)', '• कब से है? (2 दिन / 1 सप्ताह...)', '• किती दिवसांपासून? (2 दिवस / 1 आठवडा...)', '• எப்போதிலிருந்து? (2 நாள் / 1 வாரம்...)', '• কতদিন ধরে? (২ দিন / ১ সপ্তাহ...)');
add('• Dard kitna? (halka / tez / bahut tez)', '• How severe is the pain? (mild / severe / very severe)', '• दर्द कितना है? (हल्का / तेज / बहुत तेज)', '• वेदना किती? (हलकी / तीव्र / खूप तीव्र)', '• வலி எவ்வளவு? (லேசான / கடுமையான / மிகக் கடுமையான)', '• ব্যথা কতটা? (হালকা / তীব্র / খুব তীব্র)');
add('• Kya khaane/peene se badhta-ghatta hai?', '• Does food or drink make it better or worse?', '• क्या खाने/पीने से बढ़ता या घटता है?', '• खाण्या-पिण्याने वाढते/कमी होते का?', '• உணவு/பானம் காரணமாக அதிகரிக்கிறதா அல்லது குறைகிறதா?', '• খাওয়া/পান করলে বাড়ে বা কমে?');
add('• Koi dawa li? Kaun si?', '• Have you taken any medicine? Which one?', '• कोई दवा ली? कौन सी?', '• काही औषध घेतले? कोणते?', '• ஏதேனும் மருந்து எடுத்தீர்களா? எது?', '• কোনো ওষুধ নিয়েছেন? কোনটি?');
add('• Rash/sujan hai to photo zaroor jodein', '• If there is a rash/swelling, please add a photo', '• रैश/सूजन हो तो फोटो जरूर जोड़ें', '• पुरळ/सूज असल्यास फोटो नक्की जोडा', '• சிரங்கு/வீக்கம் இருந்தால் புகைப்படம் சேர்க்கவும்', '• র‍্যাশ/ফোলা থাকলে ছবি দিন');

// Common problems / triage
add('Quick Help · Bina AI ke', 'Quick Help · Without AI', 'त्वरित मदद · बिना AI', 'त्वरित मदत · AI शिवाय', 'விரைவு உதவி · AI இல்லாமல்', 'দ্রুত সাহায্য · AI ছাড়া');
add('Roz-marra ki takleefon ke liye guided sawal-jawab — kitne din se hai, 1-10 tak kitni takleef — bas 30 second me sahi salah.', 'Guided questions for everyday problems — duration and severity from 1–10 — get useful guidance in about 30 seconds.', 'रोज़मर्रा की समस्याओं के लिए आसान सवाल-जवाब — कितने दिन से है, 1–10 तक कितनी तकलीफ — लगभग 30 सेकंड में सही मार्गदर्शन।', 'दैनंदिन समस्यांसाठी मार्गदर्शित प्रश्न — किती दिवस आणि 1–10 तीव्रता — सुमारे 30 सेकंदात योग्य मार्गदर्शन.', 'தினசரி பிரச்சினைகளுக்கு வழிகாட்டும் கேள்விகள் — எத்தனை நாள், 1–10 தீவிரம் — சுமார் 30 விநாடிகளில் வழிகாட்டல்.', 'দৈনন্দিন সমস্যার জন্য নির্দেশিত প্রশ্ন — কতদিন, ১–১০ তীব্রতা — প্রায় ৩০ সেকেন্ডে সঠিক নির্দেশনা।');
add('Start', 'Start', 'शुरू करें', 'सुरू करा', 'தொடங்கவும்', 'শুরু করুন');
add('Saari problems', 'All problems', 'सभी समस्याएं', 'सर्व समस्या', 'அனைத்து பிரச்சினைகள்', 'সব সমস্যা');
add('How many days has this lasted?', 'How many days has this lasted?', 'यह कितने दिन से है?', 'हे किती दिवसांपासून आहे?', 'இது எத்தனை நாட்களாக உள்ளது?', 'এটি কতদিন ধরে চলছে?');
add('Aaj se', 'Since today', 'आज से', 'आजपासून', 'இன்றிலிருந்து', 'আজ থেকে');
add('2-3 din', '2–3 days', '2–3 दिन', '2–3 दिवस', '2–3 நாட்கள்', '২–৩ দিন');
add('4-7 din', '4–7 days', '4–7 दिन', '4–7 दिवस', '4–7 நாட்கள்', '৪–৭ দিন');
add('1-2 hafte', '1–2 weeks', '1–2 सप्ताह', '1–2 आठवडे', '1–2 வாரங்கள்', '১–২ সপ্তাহ');
add('2+ hafte', '2+ weeks', '2+ सप्ताह', '2+ आठवडे', '2+ வாரங்கள்', '২+ সপ্তাহ');
add('Takleef 1 se 10 tak kitni hai?', 'How severe is it from 1 to 10?', 'तकलीफ 1 से 10 तक कितनी है?', 'त्रास 1 ते 10 किती आहे?', 'தீவிரம் 1 முதல் 10 வரை எவ்வளவு?', 'কষ্ট ১ থেকে ১০ কতটা?');
add('1 = halki, 10 = asahaniya. Slider ghumayein.', '1 = mild, 10 = unbearable. Move the slider.', '1 = हल्की, 10 = असहनीय। स्लाइडर चलाएं।', '1 = हलकी, 10 = असह्य. स्लायडर हलवा.', '1 = லேசானது, 10 = தாங்க முடியாதது. ஸ்லைடரை நகர்த்தவும்.', '১ = হালকা, ১০ = অসহনীয়। স্লাইডার সরান।');
add('1 · Halki', '1 · Mild', '1 · हल्की', '1 · हलकी', '1 · லேசான', '১ · হালকা');
add('5 · Medium', '5 · Moderate', '5 · मध्यम', '5 · मध्यम', '5 · மிதமான', '৫ · মাঝারি');
add('10 · Bahut tez', '10 · Very severe', '10 · बहुत तेज', '10 · खूप तीव्र', '10 · மிகவும் கடுமையான', '১০ · খুব তীব্র');
add('Koi', 'Any', 'कोई', 'काही', 'ஏதேனும்', 'কোনো');
add('khatre wali nishani', 'warning sign', 'खतरे की निशानी', 'धोक्याची खूण', 'எச்சரிக்கை அறிகுறி', 'বিপদের লক্ষণ');
add('to nahi?', 'present?', 'तो नहीं?', 'आहे का?', 'உள்ளதா?', 'আছে কি?');
add('Ho to zaroor tick karein — yeh sabse important step hai.', 'If yes, please select it — this is the most important step.', 'अगर है तो जरूर चुनें — यह सबसे महत्वपूर्ण चरण है।', 'असल्यास नक्की निवडा — हा सर्वात महत्त्वाचा टप्पा आहे.', 'இருந்தால் அவசியம் தேர்வு செய்யுங்கள் — இது மிக முக்கியமான படி.', 'থাকলে অবশ্যই নির্বাচন করুন — এটি সবচেয়ে গুরুত্বপূর্ণ ধাপ।');
add('Peeche', 'Back', 'पीछे', 'मागे', 'பின்செல்', 'পেছনে');
add('Aage', 'Next', 'आगे', 'पुढे', 'அடுத்து', 'পরবর্তী');
add('Mera Result Dekhein', 'View My Result', 'मेरा परिणाम देखें', 'माझा निकाल पाहा', 'என் முடிவைப் பார்க்கவும்', 'আমার ফলাফল দেখুন');
add('Step 2 · Smart Triage Result', 'Step 2 · Smart Triage Result', 'चरण 2 · स्मार्ट ट्रायेज परिणाम', 'पायरी 2 · स्मार्ट ट्रायेज निकाल', 'படி 2 · ஸ்மார்ட் டிரையாஜ் முடிவு', 'ধাপ ২ · স্মার্ট ট্রায়াজ ফলাফল');
add('Aapka Health Signal', 'Your Health Signal', 'आपका हेल्थ सिग्नल', 'तुमचा आरोग्य संकेत', 'உங்கள் ஆரோக்கிய சிக்னல்', 'আপনার স্বাস্থ্য সংকেত');
add('GREEN — Self-Care Zone', 'GREEN — Self-Care Zone', 'GREEN — स्वयं देखभाल क्षेत्र', 'GREEN — स्वतःची काळजी', 'GREEN — சுய பராமரிப்பு பகுதி', 'GREEN — স্ব-যত্ন অঞ্চল');
add('Ghar par dekhbhal se theek ho sakta hai', 'May improve with home self-care', 'घर पर देखभाल से ठीक हो सकता है', 'घरी काळजी घेतल्यास बरे होऊ शकते', 'வீட்டிலேயே பராமரிப்பால் மேம்படலாம்', 'বাড়িতে যত্নে ভালো হতে পারে');
add('Ghabrayein nahi. Neeche diye self-care steps follow karein aur 2–3 din nazar rakhein.', 'Do not panic. Follow the self-care steps below and monitor for 2–3 days.', 'घबराएं नहीं। नीचे दिए सेल्फ-केयर स्टेप्स अपनाएं और 2–3 दिन निगरानी रखें।', 'घाबरू नका. खालील स्व-काळजीच्या सूचना पाळा आणि 2–3 दिवस निरीक्षण करा.', 'பதற்றப்பட வேண்டாம். கீழே உள்ள சுய பராமரிப்பு வழிமுறைகளை பின்பற்றி 2–3 நாட்கள் கவனிக்கவும்.', 'ভয় পাবেন না। নিচের স্ব-যত্নের ধাপ অনুসরণ করুন এবং ২–৩ দিন নজর রাখুন।');
add('YELLOW — Doctor ko Dikhayein', 'YELLOW — See a Doctor Soon', 'YELLOW — जल्द डॉक्टर को दिखाएं', 'YELLOW — लवकर डॉक्टरांना भेटा', 'YELLOW — விரைவில் மருத்துவரை அணுகவும்', 'YELLOW — দ্রুত ডাক্তার দেখান');
add('24–48 ghante me doctor se milein', 'See a doctor within 24–48 hours', '24–48 घंटे में डॉक्टर से मिलें', '24–48 तासांत डॉक्टरांना भेटा', '24–48 மணி நேரத்தில் மருத்துவரை அணுகவும்', '২৪–৪৮ ঘণ্টার মধ্যে ডাক্তার দেখান');
add('Yeh self-care se aage ki baat lag rahi hai. Verified clinic book karein ya video consult lein.', 'This needs more than self-care. Book a verified clinic or take a video consultation.', 'यह केवल सेल्फ-केयर से आगे की स्थिति लगती है। सत्यापित क्लिनिक बुक करें या वीडियो परामर्श लें।', 'हे फक्त स्व-काळजीपेक्षा अधिक आहे. पडताळलेले क्लिनिक बुक करा किंवा व्हिडिओ सल्ला घ्या.', 'இது சுய பராமரிப்பை விட அதிக கவனம் தேவைப்படலாம். சரிபார்க்கப்பட்ட மருத்துவமனை அல்லது வீடியோ ஆலோசனையைப் பயன்படுத்தவும்.', 'এটি স্ব-যত্নের চেয়ে বেশি মনোযোগ দাবি করে। যাচাইকৃত ক্লিনিক বুক করুন বা ভিডিও পরামর্শ নিন।');
add('RED — Emergency!', 'RED — Emergency!', 'RED — आपातकाल!', 'RED — आपत्काल!', 'RED — அவசரம்!', 'RED — জরুরি!');
add('Turant action lein', 'Act immediately', 'तुरंत कार्रवाई करें', 'तात्काळ कृती करा', 'உடனடியாக நடவடிக்கை எடுக்கவும்', 'তৎক্ষণাৎ ব্যবস্থা নিন');
add('Warning sign mila hai. Der na karein — 108/112 par call karein ya nazdeeki ER jayein.', 'A warning sign was found. Do not delay — call 108/112 or go to the nearest ER.', 'चेतावनी संकेत मिला है। देर न करें — 108/112 पर कॉल करें या नज़दीकी ER जाएं।', 'धोक्याचे चिन्ह आढळले. उशीर करू नका — 108/112 वर कॉल करा किंवा जवळच्या ER मध्ये जा.', 'எச்சரிக்கை அறிகுறி உள்ளது. தாமதிக்க வேண்டாம் — 108/112 அழைக்கவும் அல்லது அருகிலுள்ள ER செல்லவும்.', 'সতর্কতার লক্ষণ পাওয়া গেছে। দেরি করবেন না — 108/112 কল করুন বা নিকটস্থ ER-এ যান।');
add('Kyun yeh result? (Reasons)', 'Why this result? (Reasons)', 'यह परिणाम क्यों? (कारण)', 'हा निकाल का? (कारणे)', 'இந்த முடிவு ஏன்? (காரணங்கள்)', 'এই ফলাফল কেন? (কারণ)');
add('🌱 Self-Care Plan (Ghar par)', '🌱 Self-Care Plan (At Home)', '🌱 सेल्फ-केयर योजना (घर पर)', '🌱 स्व-काळजी योजना (घरी)', '🌱 சுய பராமரிப்பு திட்டம் (வீட்டில்)', '🌱 স্ব-যত্ন পরিকল্পনা (বাড়িতে)');
add('🩺 Doctor Visit Plan', '🩺 Doctor Visit Plan', '🩺 डॉक्टर विज़िट योजना', '🩺 डॉक्टर भेट योजना', '🩺 மருத்துவர் சந்திப்பு திட்டம்', '🩺 ডাক্তার দেখানোর পরিকল্পনা');
add('🚨 Emergency Action Plan', '🚨 Emergency Action Plan', '🚨 आपातकालीन कार्य योजना', '🚨 आपत्कालीन कृती योजना', '🚨 அவசர செயல் திட்டம்', '🚨 জরুরি কর্মপরিকল্পনা');
add('Is problem ke khaas tips', 'Special tips for this problem', 'इस समस्या के खास सुझाव', 'या समस्येसाठी खास टिप्स', 'இந்த பிரச்சினைக்கான சிறப்பு குறிப்புகள்', 'এই সমস্যার বিশেষ টিপস');
add('Call 108', 'Call 108', '108 पर कॉल करें', '108 वर कॉल करा', '108 அழைக்கவும்', '108-এ কল করুন');
add('Nearest ER', 'Nearest ER', 'नज़दीकी ER', 'जवळचा ER', 'அருகிலுள்ள ER', 'নিকটস্থ ER');
add('Book Clinic', 'Book Clinic', 'क्लिनिक बुक करें', 'क्लिनिक बुक करा', 'மருத்துவமனை முன்பதிவு', 'ক্লিনিক বুক করুন');
add('Video Doctor', 'Video Doctor', 'वीडियो डॉक्टर', 'व्हिडिओ डॉक्टर', 'வீடியோ மருத்துவர்', 'ভিডিও ডাক্তার');
add('Sasti Dawa', 'Affordable Medicines', 'सस्ती दवाएं', 'स्वस्त औषधे', 'குறைந்த விலை மருந்துகள்', 'সাশ্রয়ী ওষুধ');
add('Nayi takleef check karein', 'Check a new problem', 'नई समस्या जांचें', 'नवी समस्या तपासा', 'புதிய பிரச்சினையைச் சரிபார்க்கவும்', 'নতুন সমস্যা পরীক্ষা করুন');
add('Pehle apni takleef batayein', 'Describe your problem first', 'पहले अपनी समस्या बताएं', 'आधी तुमची समस्या सांगा', 'முதலில் உங்கள் பிரச்சினையை கூறுங்கள்', 'প্রথমে আপনার সমস্যা বলুন');
add('Triage result ke liye Symptom Checker ya Common Problems se shuru karein.', 'Start with Symptom Checker or Common Problems to get a triage result.', 'ट्रायेज परिणाम के लिए Symptom Checker या Common Problems से शुरू करें।', 'ट्रायेज निकालासाठी Symptom Checker किंवा Common Problems पासून सुरू करा.', 'டிரையாஜ் முடிவுக்கு Symptom Checker அல்லது Common Problems மூலம் தொடங்குங்கள்.', 'ট্রায়াজ ফলাফলের জন্য Symptom Checker বা Common Problems দিয়ে শুরু করুন।');

add('Step 1 · AI Smart Intake', 'Step 1 · AI Smart Intake', 'चरण 1 · AI स्मार्ट इनटेक', 'पायरी 1 · AI स्मार्ट इनटेक', 'படி 1 · AI ஸ்மார்ட் இன்டேக்', 'ধাপ ১ · AI স্মার্ট ইনটেক');
add('Apni takleef batayein', 'Describe Your Problem', 'अपनी समस्या बताएं', 'तुमची समस्या सांगा', 'உங்கள் பிரச்சினையை கூறுங்கள்', 'আপনার সমস্যা বলুন');
add('Apni problem apne shabdon me likhein. Smart Triage aapke symptoms aur context ko samajhkar possible causes, urgency aur next steps batayega.', 'Describe your problem in your own words. Smart Triage will use your symptoms and context to explain possible causes, urgency and next steps.', 'अपनी समस्या अपने शब्दों में लिखें। स्मार्ट ट्रायेज आपके लक्षणों और संदर्भ को समझकर संभावित कारण, गंभीरता और अगले कदम बताएगा।', 'तुमची समस्या तुमच्या शब्दांत लिहा. स्मार्ट ट्रायेज तुमची लक्षणे आणि संदर्भ समजून संभाव्य कारणे, तातडी आणि पुढील पावले सांगेल.', 'உங்கள் பிரச்சினையை உங்கள் சொற்களில் எழுதுங்கள். ஸ்மார்ட் டிரையாஜ் உங்கள் அறிகுறிகள் மற்றும் சூழலைப் புரிந்து சாத்தியமான காரணங்கள், அவசரம் மற்றும் அடுத்த படிகளை விளக்கும்.', 'আপনার সমস্যা নিজের ভাষায় লিখুন। স্মার্ট ট্রায়াজ আপনার উপসর্গ ও প্রেক্ষাপট বুঝে সম্ভাব্য কারণ, জরুরিতা এবং পরবর্তী পদক্ষেপ জানাবে।');
add('Apni bhasha chunein', 'Choose your language', 'अपनी भाषा चुनें', 'तुमची भाषा निवडा', 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', 'আপনার ভাষা বেছে নিন');
add('akshar', 'characters', 'अक्षर', 'अक्षरे', 'எழுத்துகள்', 'অক্ষর');
add('min 10', 'min 10', 'कम से कम 10', 'किमान 10', 'குறைந்தது 10', 'কমপক্ষে ১০');
add('Photo / Report', 'Photo / Report', 'फोटो / रिपोर्ट', 'फोटो / रिपोर्ट', 'புகைப்படம் / அறிக்கை', 'ছবি / রিপোর্ট');
add('Document', 'Document', 'दस्तावेज़', 'दस्तऐवज', 'ஆவணம்', 'ডকুমেন্ট');
add('Voice Note', 'Voice Note', 'वॉइस नोट', 'व्हॉइस नोट', 'குரல் குறிப்பு', 'ভয়েস নোট');
add('Stop', 'Stop', 'रोकें', 'थांबवा', 'நிறுத்தவும்', 'থামান');
add('✓ Secure upload complete', '✓ Secure upload complete', '✓ सुरक्षित अपलोड पूरा हुआ', '✓ सुरक्षित अपलोड पूर्ण', '✓ பாதுகாப்பான பதிவேற்றம் முடிந்தது', '✓ নিরাপদ আপলোড সম্পন্ন');
add('Photo, document aur voice note securely upload honge. Current Smart Triage abhi written description ko analyse karta hai; uploaded file ki medical content ko analyse karne ka claim nahi karega.', 'Photos, documents and voice notes are uploaded securely. Smart Triage currently analyses your written description; it does not claim to analyse the medical content of uploaded files.', 'फोटो, दस्तावेज़ और वॉइस नोट सुरक्षित रूप से अपलोड होंगे। स्मार्ट ट्रायेज अभी आपके लिखित विवरण का विश्लेषण करता है; यह अपलोड की गई फाइल की चिकित्सकीय सामग्री का विश्लेषण करने का दावा नहीं करता।', 'फोटो, दस्तऐवज आणि व्हॉइस नोट सुरक्षितपणे अपलोड केले जातील. स्मार्ट ट्रायेज सध्या तुमच्या लिखित वर्णनाचे विश्लेषण करते; अपलोड केलेल्या फाइलमधील वैद्यकीय मजकुराचे विश्लेषण केल्याचा दावा करत नाही.', 'புகைப்படங்கள், ஆவணங்கள் மற்றும் குரல் குறிப்புகள் பாதுகாப்பாக பதிவேற்றப்படும். ஸ்மார்ட் டிரையாஜ் தற்போது நீங்கள் எழுதிய விளக்கத்தை மட்டுமே பகுப்பாய்வு செய்கிறது; பதிவேற்றப்பட்ட கோப்பின் மருத்துவ உள்ளடக்கத்தை பகுப்பாய்வு செய்வதாகக் கூறாது.', 'ছবি, ডকুমেন্ট এবং ভয়েস নোট নিরাপদে আপলোড হবে। স্মার্ট ট্রায়াজ বর্তমানে আপনার লিখিত বিবরণ বিশ্লেষণ করে; আপলোড করা ফাইলের চিকিৎসাবিষয়ক বিষয়বস্তু বিশ্লেষণ করার দাবি করে না।');
add('Voice/File process ho raha hai...', 'Processing voice/file...', 'वॉइस/फाइल प्रोसेस हो रही है...', 'व्हॉइस/फाइल प्रक्रिया सुरू आहे...', 'குரல்/கோப்பு செயலாக்கப்படுகிறது...', 'ভয়েস/ফাইল প্রসেস হচ্ছে...');
add('AI symptoms analyse kar raha hai...', 'AI is analysing your symptoms...', 'AI आपके लक्षणों का विश्लेषण कर रहा है...', 'AI तुमच्या लक्षणांचे विश्लेषण करत आहे...', 'AI உங்கள் அறிகுறிகளை பகுப்பாய்வு செய்கிறது...', 'AI আপনার উপসর্গ বিশ্লেষণ করছে...');
add('Aage Badhein — Smart Triage', 'Continue — Smart Triage', 'आगे बढ़ें — स्मार्ट ट्रायेज', 'पुढे जा — स्मार्ट ट्रायेज', 'தொடரவும் — ஸ்மார்ட் டிரையாஜ்', 'এগিয়ে যান — স্মার্ট ট্রায়াজ');
add('💡 Achhe se batane ke tips', '💡 Tips for describing your problem', '💡 अपनी समस्या सही तरह बताने के सुझाव', '💡 समस्या स्पष्टपणे सांगण्यासाठी टिप्स', '💡 உங்கள் பிரச்சினையை தெளிவாக கூற உதவும் குறிப்புகள்', '💡 সমস্যা ভালোভাবে বোঝানোর পরামর্শ');
add('• Kab se hai? (2 din / 1 hafta...)', '• How long have you had it? (2 days / 1 week...)', '• यह कब से है? (2 दिन / 1 सप्ताह...)', '• हे किती दिवसांपासून आहे? (2 दिवस / 1 आठवडा...)', '• இது எவ்வளவு காலமாக உள்ளது? (2 நாட்கள் / 1 வாரம்...)', '• কতদিন ধরে হচ্ছে? (২ দিন / ১ সপ্তাহ...)');
add('• Dard kitna? (halka / tez / bahut tez)', '• How severe is the pain? (mild / severe / very severe)', '• दर्द कितना है? (हल्का / तेज़ / बहुत तेज़)', '• वेदना किती आहे? (सौम्य / तीव्र / खूप तीव्र)', '• வலி எவ்வளவு? (லேசான / கடுமையான / மிகவும் கடுமையான)', '• ব্যথা কতটা? (হালকা / তীব্র / খুব তীব্র)');
add('• Kya khaane/peene se badhta-ghatta hai?', '• Does eating or drinking make it better or worse?', '• क्या खाने या पीने से यह बढ़ता या घटता है?', '• खाण्याने किंवा पिण्याने ते वाढते किंवा कमी होते का?', '• சாப்பிடுவதால் அல்லது குடிப்பதால் இது அதிகரிக்கிறதா அல்லது குறைகிறதா?', '• খাওয়া বা পান করলে এটি বাড়ে বা কমে কি?');
add('• Koi dawa li? Kaun si?', '• Have you taken any medicine? Which one?', '• क्या आपने कोई दवा ली है? कौन सी?', '• काही औषध घेतले आहे का? कोणते?', '• ஏதேனும் மருந்து எடுத்தீர்களா? எது?', '• কোনো ওষুধ নিয়েছেন? কোনটি?');
add('• Koi existing disease ya treatment chal raha hai to batayein', '• Mention any existing condition or ongoing treatment', '• कोई पहले से बीमारी या इलाज चल रहा हो तो बताएं', '• आधीपासूनचा आजार किंवा सुरू असलेला उपचार असल्यास सांगा', '• ஏற்கனவே உள்ள நோய் அல்லது தொடர்ந்து வரும் சிகிச்சை இருந்தால் குறிப்பிடவும்', '• আগে থেকে কোনো রোগ বা চলমান চিকিৎসা থাকলে জানান');
add('Kam se kam 10 aksharon me apni takleef likhein.', 'Describe your problem in at least 10 characters.', 'अपनी समस्या कम से कम 10 अक्षरों में लिखें।', 'तुमची समस्या किमान 10 अक्षरांत लिहा.', 'உங்கள் பிரச்சினையை குறைந்தது 10 எழுத்துகளில் எழுதுங்கள்.', 'আপনার সমস্যা কমপক্ষে ১০ অক্ষরে লিখুন।');
add('Upload complete hone ka wait karein.', 'Please wait for the upload to finish.', 'अपलोड पूरा होने तक प्रतीक्षा करें।', 'अपलोड पूर्ण होईपर्यंत प्रतीक्षा करा.', 'பதிவேற்றம் முடியும் வரை காத்திருக்கவும்.', 'আপলোড শেষ হওয়া পর্যন্ত অপেক্ষা করুন।');
add('Pehle voice recording stop karein.', 'Stop the voice recording first.', 'पहले वॉइस रिकॉर्डिंग रोकें।', 'आधी व्हॉइस रेकॉर्डिंग थांबवा.', 'முதலில் குரல் பதிவை நிறுத்தவும்.', 'প্রথমে ভয়েস রেকর্ডিং বন্ধ করুন।');
add('Smart Triage se valid response nahi mila.', 'Smart Triage did not return a valid response.', 'स्मार्ट ट्रायेज से सही प्रतिक्रिया नहीं मिली।', 'स्मार्ट ट्रायेजकडून वैध प्रतिसाद मिळाला नाही.', 'ஸ்மார்ட் டிரையாஜிலிருந்து சரியான பதில் கிடைக்கவில்லை.', 'স্মার্ট ট্রায়াজ থেকে সঠিক উত্তর পাওয়া যায়নি।');
add('Smart Triage abhi available nahi hai.', 'Smart Triage is currently unavailable.', 'स्मार्ट ट्रायेज अभी उपलब्ध नहीं है।', 'स्मार्ट ट्रायेज सध्या उपलब्ध नाही.', 'ஸ்மார்ட் டிரையாஜ் தற்போது கிடைக்கவில்லை.', 'স্মার্ট ট্রায়াজ বর্তমানে উপলভ্য নয়।');
add('Smart Triage ka response incomplete hai.', 'The Smart Triage response is incomplete.', 'स्मार्ट ट्रायेज की प्रतिक्रिया अधूरी है।', 'स्मार्ट ट्रायेजचा प्रतिसाद अपूर्ण आहे.', 'ஸ்மார்ட் டிரையாஜ் பதில் முழுமையற்றது.', 'স্মার্ট ট্রায়াজের উত্তর অসম্পূর্ণ।');
add('Smart Triage fail ho gaya. Dobara try karein.', 'Smart Triage failed. Please try again.', 'स्मार्ट ट्रायेज विफल हो गया। दोबारा प्रयास करें।', 'स्मार्ट ट्रायेज अयशस्वी झाले. पुन्हा प्रयत्न करा.', 'ஸ்மார்ட் டிரையாஜ் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.', 'স্মার্ট ট্রায়াজ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');

// Clinics / medicines / video / records / family / SOS
add('Clinics & Specialists', 'Clinics & Specialists', 'क्लिनिक और विशेषज्ञ', 'क्लिनिक आणि तज्ज्ञ', 'மருத்துவமனைகள் மற்றும் நிபுணர்கள்', 'ক্লিনিক ও বিশেষজ্ঞ');
add('Verified clinics — distance, rating/feedback, booking time aur dawa ki uplabdhta + daam, sab transparent.', 'Verified clinics — distance, ratings/feedback, booking time, medicine availability and prices, all transparent.', 'सत्यापित क्लिनिक — दूरी, रेटिंग/फीडबैक, बुकिंग समय और दवा की उपलब्धता + कीमत, सब पारदर्शी।', 'पडताळलेली क्लिनिक — अंतर, रेटिंग/अभिप्राय, बुकिंग वेळ आणि औषध उपलब्धता + किंमत, सर्व पारदर्शक.', 'சரிபார்க்கப்பட்ட மருத்துவமனைகள் — தூரம், மதிப்பீடு, முன்பதிவு நேரம், மருந்து கிடைக்கும் நிலை மற்றும் விலை அனைத்தும் வெளிப்படையாக.', 'যাচাইকৃত ক্লিনিক — দূরত্ব, রেটিং/মতামত, বুকিং সময়, ওষুধের প্রাপ্যতা ও দাম—সব স্বচ্ছ।');
add('Search: clinic, doctor, specialty, area... (e.g. child, skin, Lucknow)', 'Search: clinic, doctor, specialty, area... (e.g. child, skin, Lucknow)', 'खोजें: क्लिनिक, डॉक्टर, विशेषज्ञता, क्षेत्र...', 'शोधा: क्लिनिक, डॉक्टर, विशेषता, परिसर...', 'தேடல்: மருத்துவமனை, மருத்துவர், நிபுணத்துவம், பகுதி...', 'খুঁজুন: ক্লিনিক, ডাক্তার, বিশেষত্ব, এলাকা...');
add('All Cities', 'All Cities', 'सभी शहर', 'सर्व शहरे', 'அனைத்து நகரங்கள்', 'সব শহর');
add('Nearest First', 'Nearest First', 'सबसे नज़दीक पहले', 'सर्वात जवळचे आधी', 'அருகிலுள்ளவை முதலில்', 'নিকটতম আগে');
add('Top Rated', 'Top Rated', 'टॉप रेटेड', 'सर्वोत्तम रेटिंग', 'சிறந்த மதிப்பீடு', 'সর্বোচ্চ রেটেড');
add('Lowest Fee', 'Lowest Fee', 'सबसे कम फीस', 'सर्वात कमी फी', 'குறைந்த கட்டணம்', 'সর্বনিম্ন ফি');
add('Koi clinic nahi mili', 'No clinic found', 'कोई क्लिनिक नहीं मिला', 'क्लिनिक सापडले नाही', 'மருத்துவமனை எதுவும் கிடைக்கவில்லை', 'কোনো ক্লিনিক পাওয়া যায়নি');
add('Search ya filter badal kar dekhein.', 'Try changing the search or filter.', 'खोज या फ़िल्टर बदलकर देखें।', 'शोध किंवा फिल्टर बदला.', 'தேடல் அல்லது வடிகட்டியை மாற்றிப் பாருங்கள்.', 'সার্চ বা ফিল্টার বদলে দেখুন।');
add('Booking Time — din aur slot chunein', 'Booking Time — choose date and slot', 'बुकिंग समय — दिन और स्लॉट चुनें', 'बुकिंग वेळ — दिवस आणि स्लॉट निवडा', 'முன்பதிவு நேரம் — தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுக்கவும்', 'বুকিং সময় — দিন ও স্লট বেছে নিন');
add('Slot Booked!', 'Slot Booked!', 'स्लॉट बुक हो गया!', 'स्लॉट बुक झाला!', 'நேரம் முன்பதிவு செய்யப்பட்டது!', 'স্লট বুক হয়েছে!');
add('Jan Aushadhi · Savings Calculator', 'Jan Aushadhi · Savings Calculator', 'जन औषधि · बचत कैलकुलेटर', 'जन औषधी · बचत कॅल्क्युलेटर', 'Jan Aushadhi · சேமிப்பு கணக்கீடு', 'জন ঔষধি · সাশ্রয় ক্যালকুলেটর');
add('Same Dawa, Sahi Daam', 'Same Medicine, Right Price', 'वही दवा, सही दाम', 'तेच औषध, योग्य किंमत', 'அதே மருந்து, சரியான விலை', 'একই ওষুধ, সঠিক দাম');
add('Same composition, alag brand — price compare karein aur dekhein Jan Aushadhi/generic se kitni bachat hogi.', 'Same composition, different brands — compare prices and see how much Jan Aushadhi/generics can save.', 'एक ही कंपोजिशन, अलग ब्रांड — कीमत तुलना करें और देखें जन औषधि/जेनेरिक से कितनी बचत होगी।', 'समान रचना, वेगवेगळे ब्रँड — किंमती तुलना करा आणि जन औषधी/जेनेरिकमुळे किती बचत होईल ते पहा.', 'அதே கலவை, வேறு பிராண்டுகள் — விலையை ஒப்பிட்டு Jan Aushadhi/ஜெனரிக் மூலம் எவ்வளவு சேமிக்கலாம் என்று பாருங்கள்.', 'একই উপাদান, ভিন্ন ব্র্যান্ড — দাম তুলনা করে জন ঔষধি/জেনেরিকে কত সাশ্রয় হবে দেখুন।');
add('Dawa / composition khojein...', 'Search medicine / composition...', 'दवा / कंपोजिशन खोजें...', 'औषध / रचना शोधा...', 'மருந்து / கலவை தேடவும்...', 'ওষুধ / উপাদান খুঁজুন...');
add('Loading medicines...', 'Loading medicines...', 'दवाएं लोड हो रही हैं...', 'औषधे लोड होत आहेत...', 'மருந்துகள் ஏற்றப்படுகின்றன...', 'ওষুধ লোড হচ্ছে...');
add('Koi dawa nahi mili', 'No medicine found', 'कोई दवा नहीं मिली', 'औषध सापडले नाही', 'மருந்து கிடைக்கவில்லை', 'কোনো ওষুধ পাওয়া যায়নি');
add('Aapki Bachat', 'Your Savings', 'आपकी बचत', 'तुमची बचत', 'உங்கள் சேமிப்பு', 'আপনার সাশ্রয়');
add('SABSE SASTA', 'LOWEST PRICE', 'सबसे सस्ता', 'सर्वात स्वस्त', 'குறைந்த விலை', 'সবচেয়ে সস্তা');
add('SABSE MEHNGA', 'HIGHEST PRICE', 'सबसे महंगा', 'सर्वात महाग', 'அதிக விலை', 'সবচেয়ে দামি');
add('BACHAT / PACK', 'SAVINGS / PACK', 'बचत / पैक', 'बचत / पॅक', 'சேமிப்பு / பேக்', 'সাশ্রয় / প্যাক');
add('KUL BACHAT', 'TOTAL SAVINGS', 'कुल बचत', 'एकूण बचत', 'மொத்த சேமிப்பு', 'মোট সাশ্রয়');
add('Mahine me kitne pack lagte hain?', 'How many packs per month?', 'महीने में कितने पैक लगते हैं?', 'महिन्याला किती पॅक लागतात?', 'மாதத்திற்கு எத்தனை பேக்?', 'মাসে কত প্যাক লাগে?');
add('Kitne mahine ki dawa?', 'For how many months?', 'कितने महीने की दवा?', 'किती महिन्यांची औषधे?', 'எத்தனை மாதங்களுக்கு?', 'কত মাসের ওষুধ?');
add('Brand switch karne se pehle:', 'Before switching brands:', 'ब्रांड बदलने से पहले:', 'ब्रँड बदलण्यापूर्वी:', 'பிராண்ட் மாற்றுவதற்கு முன்:', 'ব্র্যান্ড বদলানোর আগে:');
add('doctor/pharmacist se confirm', 'confirm with a doctor/pharmacist', 'डॉक्टर/फार्मासिस्ट से पुष्टि करें', 'डॉक्टर/फार्मासिस्टकडून खात्री करा', 'மருத்துவர்/மருந்தாளரிடம் உறுதிப்படுத்தவும்', 'ডাক্তার/ফার্মাসিস্টের সঙ্গে নিশ্চিত করুন');
add('Prices sanket-matra (indicative) hain — store par confirm karein.', 'Prices are indicative — confirm at the store.', 'कीमतें संकेत मात्र हैं — स्टोर पर पुष्टि करें।', 'किंमती अंदाजे आहेत — स्टोअरमध्ये खात्री करा.', 'விலைகள் குறிப்புக்காக மட்டுமே — கடையில் உறுதிப்படுத்தவும்.', 'দাম আনুমানিক — দোকানে নিশ্চিত করুন।');
add('Telemedicine · Ghar baithe Doctor', 'Telemedicine · Doctor from Home', 'टेलीमेडिसिन · घर बैठे डॉक्टर', 'टेलिमेडिसिन · घरबसल्या डॉक्टर', 'தொலைமருத்துவம் · வீட்டிலிருந்து மருத்துவர்', 'টেলিমেডিসিন · ঘরে বসে ডাক্তার');
add('Pack lein → doctor chunein → samay fix karein', 'Choose a pack → select a doctor → schedule a time', 'पैक लें → डॉक्टर चुनें → समय तय करें', 'पॅक घ्या → डॉक्टर निवडा → वेळ ठरवा', 'பேக் தேர்வு → மருத்துவர் தேர்வு → நேரம் நிர்ணயம்', 'প্যাক নিন → ডাক্তার বাছুন → সময় ঠিক করুন');
add('Single Consult', 'Single Consult', 'सिंगल कंसल्ट', 'एक सल्लामसलत', 'ஒரு ஆலோசனை', 'একক পরামর্শ');
add('Family Pack ⭐', 'Family Pack ⭐', 'फैमिली पैक ⭐', 'फॅमिली पॅक ⭐', 'குடும்ப பேக் ⭐', 'ফ্যামিলি প্যাক ⭐');
add('Buy Pack', 'Buy Pack', 'पैक खरीदें', 'पॅक घ्या', 'பேக் வாங்கவும்', 'প্যাক কিনুন');
add('Book Video Meeting', 'Book Video Meeting', 'वीडियो मीटिंग बुक करें', 'व्हिडिओ भेट बुक करा', 'வீடியோ சந்திப்பு முன்பதிவு', 'ভিডিও মিটিং বুক করুন');
add('Kis baare me baat karni hai?', 'What would you like to discuss?', 'किस बारे में बात करनी है?', 'कशाबद्दल बोलायचे आहे?', 'எதைப் பற்றி பேச விரும்புகிறீர்கள்?', 'কী নিয়ে কথা বলতে চান?');
add('Din + samay', 'Date + time', 'दिन + समय', 'दिवस + वेळ', 'தேதி + நேரம்', 'দিন + সময়');
add('Confirm Meeting (1 credit)', 'Confirm Meeting (1 credit)', 'मीटिंग कन्फर्म करें (1 क्रेडिट)', 'भेट निश्चित करा (1 क्रेडिट)', 'சந்திப்பை உறுதிப்படுத்தவும் (1 கிரெடிட்)', 'মিটিং নিশ্চিত করুন (১ ক্রেডিট)');
add('Abhi koi meeting nahi', 'No meetings yet', 'अभी कोई मीटिंग नहीं', 'अजून कोणतीही भेट नाही', 'இன்னும் சந்திப்பு இல்லை', 'এখনও কোনো মিটিং নেই');
add('Join Meeting', 'Join Meeting', 'मीटिंग जॉइन करें', 'भेटीत सामील व्हा', 'சந்திப்பில் இணையவும்', 'মিটিংয়ে যোগ দিন');
add('Personal Health Timeline', 'Personal Health Timeline', 'व्यक्तिगत स्वास्थ्य टाइमलाइन', 'वैयक्तिक आरोग्य टाइमलाइन', 'தனிப்பட்ட ஆரோக்கிய காலவரிசை', 'ব্যক্তিগত স্বাস্থ্য টাইমলাইন');
add('Mere Health Records', 'My Health Records', 'मेरे स्वास्थ्य रिकॉर्ड', 'माझ्या आरोग्य नोंदी', 'என் ஆரோக்கிய பதிவுகள்', 'আমার স্বাস্থ্য রেকর্ড');
add('Aaj tak ki saari takleefen, triage results aur reports — ek surakshit timeline me. Isi pattern se future advice milti hai.', 'All your problems, triage results and reports in one secure timeline. These patterns help provide future guidance.', 'अब तक की सभी समस्याएं, ट्रायेज परिणाम और रिपोर्ट — एक सुरक्षित टाइमलाइन में। इसी पैटर्न से भविष्य की सलाह मिलती है।', 'आतापर्यंतच्या सर्व समस्या, ट्रायेज निकाल आणि रिपोर्ट — एका सुरक्षित टाइमलाइनमध्ये. या पॅटर्नवरून पुढील मार्गदर्शन मिळते.', 'இதுவரையிலான பிரச்சினைகள், டிரையாஜ் முடிவுகள் மற்றும் அறிக்கைகள் — ஒரே பாதுகாப்பான காலவரிசையில். இந்த முறை எதிர்கால வழிகாட்டலுக்கு உதவும்.', 'এ পর্যন্ত সব সমস্যা, ট্রায়াজ ফলাফল ও রিপোর্ট — এক নিরাপদ টাইমলাইনে। এই প্যাটার্ন ভবিষ্যৎ নির্দেশনায় সহায়তা করে।');
add('Manual Entry', 'Manual Entry', 'मैनुअल एंट्री', 'मॅन्युअल नोंद', 'கைமுறை பதிவு', 'ম্যানুয়াল এন্ট্রি');
add('Band karein', 'Close', 'बंद करें', 'बंद करा', 'மூடவும்', 'বন্ধ করুন');
add('Save Record', 'Save Record', 'रिकॉर्ड सेव करें', 'रेकॉर्ड सेव्ह करा', 'பதிவை சேமிக்கவும்', 'রেকর্ড সেভ করুন');
add('Abhi koi record nahi', 'No records yet', 'अभी कोई रिकॉर्ड नहीं', 'अजून कोणतीही नोंद नाही', 'இன்னும் பதிவுகள் இல்லை', 'এখনও কোনো রেকর্ড নেই');
add('Future Advice', 'Future Advice', 'भविष्य की सलाह', 'भविष्यातील सल्ला', 'எதிர்கால ஆலோசனை', 'ভবিষ্যৎ পরামর্শ');
add('(aapke pattern se)', '(based on your pattern)', '(आपके पैटर्न के आधार पर)', '(तुमच्या पॅटर्नवरून)', '(உங்கள் முறையை அடிப்படையாகக் கொண்டு)', '(আপনার প্যাটার্ন অনুযায়ী)');
add('Parivaar ka Health Hub', 'Family Health Hub', 'परिवार का हेल्थ हब', 'कुटुंब आरोग्य हब', 'குடும்ப ஆரோக்கிய மையம்', 'পরিবারের স্বাস্থ্য হাব');
add('Maa-papa, bachche, dada-dadi — sabka blood group, umra aur bimari ka record ek jagah. Emergency me turant kaam aayega.', 'Parents, children and grandparents — blood group, age and conditions in one place. Useful in an emergency.', 'मां-पापा, बच्चे, दादा-दादी — सबका ब्लड ग्रुप, उम्र और बीमारी का रिकॉर्ड एक जगह। आपातकाल में तुरंत काम आएगा।', 'आई-वडील, मुले, आजी-आजोबा — सर्वांचा रक्तगट, वय आणि आजारांची नोंद एका ठिकाणी. आपत्कालात उपयोगी.', 'பெற்றோர், குழந்தைகள், தாத்தா-பாட்டி — அனைவரின் இரத்த வகை, வயது, நோய் பதிவு ஒரே இடத்தில். அவசரத்தில் உதவும்.', 'মা-বাবা, সন্তান, দাদা-দাদি — সবার রক্তের গ্রুপ, বয়স ও অসুস্থতার রেকর্ড এক জায়গায়। জরুরিতে কাজে লাগবে।');
add('Add Member', 'Add Member', 'सदस्य जोड़ें', 'सदस्य जोडा', 'உறுப்பினரைச் சேர்க்கவும்', 'সদস্য যোগ করুন');
add('Naam (e.g. Papa)', 'Name (e.g. Dad)', 'नाम (जैसे पापा)', 'नाव (उदा. बाबा)', 'பெயர் (உதா. அப்பா)', 'নাম (যেমন বাবা)');
add('Rishta', 'Relationship', 'रिश्ता', 'नाते', 'உறவு', 'সম্পর্ক');
add('Umra', 'Age', 'उम्र', 'वय', 'வயது', 'বয়স');
add('Blood Group', 'Blood Group', 'ब्लड ग्रुप', 'रक्तगट', 'இரத்த வகை', 'রক্তের গ্রুপ');
add('Pehle se koi bimari? (BP, Sugar, Asthma...)', 'Any existing condition? (BP, diabetes, asthma...)', 'पहले से कोई बीमारी? (BP, शुगर, अस्थमा...)', 'आधीपासून काही आजार? (BP, शुगर, दमा...)', 'ஏதேனும் முன்நிலை நோய்? (BP, சர்க்கரை, ஆஸ்துமா...)', 'আগে থেকে কোনো রোগ? (BP, ডায়াবেটিস, অ্যাজমা...)');
add('Abhi koi member nahi', 'No members yet', 'अभी कोई सदस्य नहीं', 'अजून सदस्य नाहीत', 'இன்னும் உறுப்பினர்கள் இல்லை', 'এখনও কোনো সদস্য নেই');
add('SOS & ER Dispatcher', 'SOS & ER Dispatcher', 'SOS और ER सहायता', 'SOS आणि ER मदत', 'SOS மற்றும் ER உதவி', 'SOS ও ER সহায়তা');
add('Emergency? Darro mat — dabao', 'Emergency? Stay calm — tap now', 'आपातकाल? घबराएं नहीं — दबाएं', 'आपत्काल? घाबरू नका — दाबा', 'அவசரமா? பதற்றப்பட வேண்டாம் — அழுத்தவும்', 'জরুরি? ভয় পাবেন না — চাপুন');
add('Step 1: Apni Location ON karein', 'Step 1: Turn on your location', 'चरण 1: अपनी लोकेशन ON करें', 'पायरी 1: लोकेशन ON करा', 'படி 1: இருப்பிடத்தை ON செய்யவும்', 'ধাপ ১: লোকেশন ON করুন');
add('Location le rahe hain...', 'Getting location...', 'लोकेशन ली जा रही है...', 'लोकेशन घेत आहोत...', 'இருப்பிடத்தைப் பெறுகிறது...', 'লোকেশন নেওয়া হচ্ছে...');
add('GPS unavailable', 'GPS unavailable', 'GPS उपलब्ध नहीं', 'GPS उपलब्ध नाही', 'GPS கிடைக்கவில்லை', 'GPS পাওয়া যাচ্ছে না');
add('Save Contact', 'Save Contact', 'संपर्क सेव करें', 'संपर्क सेव्ह करा', 'தொடர்பை சேமிக்கவும்', 'যোগাযোগ সেভ করুন');
add('WhatsApp SOS', 'WhatsApp SOS', 'WhatsApp SOS', 'WhatsApp SOS', 'WhatsApp SOS', 'WhatsApp SOS');
add('🚨 Call 108 — Ambulance', '🚨 Call 108 — Ambulance', '🚨 108 पर कॉल करें — एम्बुलेंस', '🚨 108 वर कॉल करा — रुग्णवाहिका', '🚨 108 அழைக்கவும் — ஆம்புலன்ஸ்', '🚨 108-এ কল করুন — অ্যাম্বুলেন্স');
add('Call 112 — Emergency', 'Call 112 — Emergency', '112 पर कॉल करें — आपातकाल', '112 वर कॉल करा — आपत्काल', '112 அழைக்கவும் — அவசரம்', '112-এ কল করুন — জরুরি');
add('🏥 Ambulance aane tak — ER First-Aid Steps', '🏥 Until the ambulance arrives — ER First-Aid Steps', '🏥 एम्बुलेंस आने तक — ER फर्स्ट-एड स्टेप्स', '🏥 रुग्णवाहिका येईपर्यंत — ER प्रथमोपचार सूचना', '🏥 ஆம்புலன்ஸ் வரும் வரை — ER முதலுதவி வழிமுறைகள்', '🏥 অ্যাম্বুলেন্স আসা পর্যন্ত — ER প্রাথমিক চিকিৎসা ধাপ');

// Privacy / legal / footer
add('Trust & Safety', 'Trust & Safety', 'विश्वास और सुरक्षा', 'विश्वास आणि सुरक्षा', 'நம்பிக்கை மற்றும் பாதுகாப்பு', 'বিশ্বাস ও নিরাপত্তা');
add('Seedhi-saadi bhasha me — aapka data kaise surakshit hai, kaun dekhta hai, aur aapke adhikaar kya hain.', 'In simple language — how your data is protected, who can see it, and what your rights are.', 'सरल भाषा में — आपका डेटा कैसे सुरक्षित है, कौन देखता है और आपके अधिकार क्या हैं।', 'सोप्या भाषेत — तुमचा डेटा कसा सुरक्षित आहे, कोण पाहू शकते आणि तुमचे हक्क काय आहेत.', 'எளிய மொழியில் — உங்கள் தரவு எப்படி பாதுகாக்கப்படுகிறது, யார் பார்க்கலாம், உங்கள் உரிமைகள் என்ன.', 'সহজ ভাষায় — আপনার ডেটা কীভাবে সুরক্ষিত, কে দেখতে পারে এবং আপনার অধিকার কী।');
add('Aapka Data, Aapka Haq', 'Your Data, Your Rights', 'आपका डेटा, आपका अधिकार', 'तुमचा डेटा, तुमचा हक्क', 'உங்கள் தரவு, உங்கள் உரிமை', 'আপনার ডেটা, আপনার অধিকার');
add('Minimum Data, Maximum Care', 'Minimum Data, Maximum Care', 'न्यूनतम डेटा, अधिकतम देखभाल', 'किमान डेटा, कमाल काळजी', 'குறைந்த தரவு, அதிகபட்ச பராமரிப்பு', 'ন্যূনতম ডেটা, সর্বোচ্চ যত্ন');
add('Delete Anytime', 'Delete Anytime', 'कभी भी डिलीट करें', 'कधीही हटवा', 'எப்போது வேண்டுமானாலும் நீக்கவும்', 'যেকোনো সময় মুছুন');
add('Transparent Alerts', 'Transparent Alerts', 'पारदर्शी अलर्ट', 'पारदर्शक सूचना', 'வெளிப்படையான எச்சரிக்கைகள்', 'স্বচ্ছ সতর্কতা');
add('Verified Partners Only', 'Verified Partners Only', 'केवल सत्यापित पार्टनर', 'फक्त पडताळलेले भागीदार', 'சரிபார்க்கப்பட்ட கூட்டாளர்கள் மட்டும்', 'শুধু যাচাইকৃত অংশীদার');
add('Legal & Compliance', 'Legal & Compliance', 'कानूनी और अनुपालन', 'कायदेशीर आणि अनुपालन', 'சட்டம் மற்றும் இணக்கம்', 'আইন ও সম্মতি');
add('MedGuide kya hai, kya nahi — aur kaun se kanoon hum follow karte hain. Kripya dhyaan se padhein.', 'What MedGuide is, what it is not, and the laws we follow. Please read carefully.', 'MedGuide क्या है, क्या नहीं — और हम किन कानूनों का पालन करते हैं। कृपया ध्यान से पढ़ें।', 'MedGuide काय आहे, काय नाही — आणि आम्ही कोणते कायदे पाळतो. कृपया काळजीपूर्वक वाचा.', 'MedGuide என்ன, என்ன அல்ல — மேலும் நாம் பின்பற்றும் சட்டங்கள். கவனமாக படிக்கவும்.', 'MedGuide কী, কী নয় — এবং আমরা কোন আইন মানি। অনুগ্রহ করে মনোযোগ দিয়ে পড়ুন।');
add('MedGuide kya HAI', 'What MedGuide IS', 'MedGuide क्या है', 'MedGuide काय आहे', 'MedGuide என்ன', 'MedGuide কী');
add('MedGuide kya NAHI hai', 'What MedGuide is NOT', 'MedGuide क्या नहीं है', 'MedGuide काय नाही', 'MedGuide என்ன அல்ல', 'MedGuide কী নয়');
add('Dawaon par Niyam', 'Medicine Rules', 'दवाइयों के नियम', 'औषधांचे नियम', 'மருந்து விதிகள்', 'ওষুধের নিয়ম');
add('Telemedicine Niyam', 'Telemedicine Rules', 'टेलीमेडिसिन नियम', 'टेलिमेडिसिन नियम', 'தொலைமருத்துவ விதிகள்', 'টেলিমেডিসিন নিয়ম');
add('Kanooni Dhyan (Legal Boundaries)', 'Legal Boundaries', 'कानूनी सीमाएं', 'कायदेशीर मर्यादा', 'சட்ட வரம்புகள்', 'আইনি সীমা');
add('Patient Testimonials', 'Patient Testimonials', 'मरीजों की प्रतिक्रियाएं', 'रुग्णांचे अनुभव', 'நோயாளர் கருத்துகள்', 'রোগীর অভিজ্ঞতা');
add('Log kya kehte hain MedGuide ke baare me', 'What people say about MedGuide', 'लोग MedGuide के बारे में क्या कहते हैं', 'लोक MedGuide बद्दल काय म्हणतात', 'MedGuide பற்றி மக்கள் என்ன சொல்கிறார்கள்', 'MedGuide সম্পর্কে মানুষ কী বলে');
add('Real experiences, real savings, real care.', 'Real experiences, real savings, real care.', 'वास्तविक अनुभव, वास्तविक बचत, वास्तविक देखभाल।', 'खरे अनुभव, खरी बचत, खरी काळजी.', 'உண்மையான அனுபவங்கள், உண்மையான சேமிப்பு, உண்மையான பராமரிப்பு.', 'বাস্তব অভিজ্ঞতা, বাস্তব সাশ্রয়, বাস্তব যত্ন।');
add('MedGuide health guidance, verified clinics aur affordable dawaiyon tak pahunch aasaan banata hai — rural aur urban Bharat, dono ke liye.', 'MedGuide makes health guidance, verified clinics and affordable medicines easier to access across rural and urban India.', 'MedGuide स्वास्थ्य मार्गदर्शन, सत्यापित क्लिनिक और किफायती दवाइयों तक पहुंच आसान बनाता है — ग्रामीण और शहरी भारत दोनों के लिए।', 'MedGuide आरोग्य मार्गदर्शन, पडताळलेली क्लिनिक आणि परवडणारी औषधे सहज उपलब्ध करते — ग्रामीण आणि शहरी भारतासाठी.', 'MedGuide ஆரோக்கிய வழிகாட்டல், சரிபார்க்கப்பட்ட மருத்துவமனைகள் மற்றும் மலிவு மருந்துகளை இந்தியா முழுவதும் எளிதாக அணுக உதவுகிறது.', 'MedGuide স্বাস্থ্য নির্দেশনা, যাচাইকৃত ক্লিনিক ও সাশ্রয়ী ওষুধের প্রবেশাধিকার সহজ করে — গ্রামীণ ও শহুরে ভারত উভয়ের জন্য।');
add('© 2026 MedGuide. Health guidance only — not a substitute for professional medical advice.', '© 2026 MedGuide. Health guidance only — not a substitute for professional medical advice.', '© 2026 MedGuide. केवल स्वास्थ्य मार्गदर्शन — पेशेवर चिकित्सकीय सलाह का विकल्प नहीं।', '© 2026 MedGuide. फक्त आरोग्य मार्गदर्शन — व्यावसायिक वैद्यकीय सल्ल्याचा पर्याय नाही.', '© 2026 MedGuide. ஆரோக்கிய வழிகாட்டுதல் மட்டுமே — தொழில்முறை மருத்துவ ஆலோசனைக்கு மாற்றாக அல்ல.', '© 2026 MedGuide. শুধু স্বাস্থ্য নির্দেশনা — পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়।');

// Common problem names, red flags, choices and clinical advice
const rows: Array<[string,string,string,string,string,string]> = [
['Fever','Fever','बुखार','ताप','காய்ச்சல்','জ্বর'],['Bukhar','Fever','बुखार','ताप','காய்ச்சல்','জ্বর'],
['Headache','Headache','सिरदर्द','डोकेदुखी','தலைவலி','মাথাব্যথা'],['Sir Dard','Headache','सिरदर्द','डोकेदुखी','தலைவலி','মাথাব্যথা'],
['Cold & Flu','Cold & Flu','सर्दी और फ्लू','सर्दी आणि फ्लू','சளி மற்றும் காய்ச்சல்','সর্দি ও ফ্লু'],['Sardi-Zukam','Cold & Flu','सर्दी-जुकाम','सर्दी-पडसे','சளி','সর্দি-জুকাম'],
['Stomach Pain','Stomach Pain','पेट दर्द','पोटदुखी','வயிற்று வலி','পেট ব্যথা'],['Pet Dard','Stomach Pain','पेट दर्द','पोटदुखी','வயிற்று வலி','পেট ব্যথা'],
['Cough','Cough','खांसी','खोकला','இருமல்','কাশি'],['Khansi','Cough','खांसी','खोकला','இருமல்','কাশি'],
['Body Pain','Body Pain','बदन दर्द','शरीरदुखी','உடல் வலி','শরীর ব্যথা'],['Badan Dard','Body Pain','बदन दर्द','शरीरदुखी','உடல் வலி','শরীর ব্যথা'],
['Skin Issue','Skin Issue','त्वचा समस्या','त्वचेची समस्या','தோல் பிரச்சினை','ত্বকের সমস্যা'],['Twacha Samasya','Skin Issue','त्वचा समस्या','त्वचेची समस्या','தோல் பிரச்சினை','ত্বকের সমস্যা'],
['Acidity / Gas','Acidity / Gas','एसिडिटी / गैस','अॅसिडिटी / गॅस','அமிலத்தன்மை / வாயு','অ্যাসিডিটি / গ্যাস'],
['Chest pain or pressure','Chest pain or pressure','सीने में दर्द या दबाव','छातीत दुखणे किंवा दाब','மார்பு வலி அல்லது அழுத்தம்','বুকে ব্যথা বা চাপ'],
['Seene me dard ya dabav','Chest pain or pressure','सीने में दर्द या दबाव','छातीत दुखणे किंवा दाब','மார்பு வலி அல்லது அழுத்தம்','বুকে ব্যথা বা চাপ'],
['Trouble breathing / shortness of breath','Trouble breathing / shortness of breath','सांस लेने में दिक्कत','श्वास घेण्यास त्रास','மூச்சுத்திணறல்','শ্বাসকষ্ট'],
['Saans lene me dikkat','Trouble breathing','सांस लेने में दिक्कत','श्वास घेण्यास त्रास','மூச்சுத்திணறல்','শ্বাসকষ্ট'],
['Fainting / fainted recently','Fainting / fainted recently','बेहोशी / हाल में बेहोश हुए','बेशुद्ध पडणे','மயக்கம் / சமீபத்தில் மயங்கியது','অজ্ঞান হওয়া'],
['Heavy or uncontrolled bleeding','Heavy or uncontrolled bleeding','बहुत अधिक या न रुकने वाला खून','जास्त किंवा न थांबणारा रक्तस्राव','அதிக அல்லது கட்டுப்படுத்த முடியாத இரத்தப்போக்கு','অতিরিক্ত বা নিয়ন্ত্রণহীন রক্তপাত'],
['Head injury / accident','Head injury / accident','सिर में चोट / दुर्घटना','डोक्याला दुखापत / अपघात','தலை காயம் / விபத்து','মাথায় আঘাত / দুর্ঘটনা'],
['Fever above 103°F / 39.4°C','Fever above 103°F / 39.4°C','103°F / 39.4°C से अधिक बुखार','103°F / 39.4°C पेक्षा जास्त ताप','103°F / 39.4°Cக்கு மேல் காய்ச்சல்','103°F / 39.4°C-এর বেশি জ্বর'],
['Thoughts of self-harm','Thoughts of self-harm','खुद को नुकसान पहुंचाने के विचार','स्वतःला इजा करण्याचे विचार','சுயகாய எண்ணங்கள்','নিজেকে ক্ষতি করার চিন্তা'],
['Continuous','Continuous','लगातार','सतत','தொடர்ச்சியான','একটানা'],['Comes & goes','Comes & goes','आता-जाता है','येते-जाते','வருகிறது-போகிறது','আসে-যায়'],['Only at night','Only at night','केवल रात में','फक्त रात्री','இரவில் மட்டும்','শুধু রাতে'],['With chills/shivering','With chills/shivering','ठंड/कंपकंपी के साथ','थंडी/कापरेसह','குளிர்/நடுக்கத்துடன்','কাঁপুনি সহ'],
['Forehead / front','Forehead / front','माथे / आगे','कपाळ / पुढे','நெற்றி / முன்பக்கம்','কপাল / সামনে'],['One side','One side','एक तरफ','एका बाजूला','ஒரு பக்கம்','এক পাশে'],['Full head','Full head','पूरा सिर','संपूर्ण डोके','முழு தலை','পুরো মাথা'],['Back of head + neck','Back of head + neck','सिर के पीछे + गर्दन','डोक्याचा मागचा भाग + मान','தலையின் பின்புறம் + கழுத்து','মাথার পেছন + ঘাড়'],
['Runny nose','Runny nose','नाक बहना','नाक वाहणे','மூக்கு ஒழுகுதல்','নাক দিয়ে পানি পড়া'],['Blocked nose','Blocked nose','नाक बंद','नाक बंद','மூக்கு அடைப்பு','নাক বন্ধ'],['Sneezing + watery eyes','Sneezing + watery eyes','छींक + आंखों से पानी','शिंका + डोळ्यात पाणी','தும்மல் + கண்களில் நீர்','হাঁচি + চোখে পানি'],['Body ache + fever','Body ache + fever','बदन दर्द + बुखार','शरीरदुखी + ताप','உடல் வலி + காய்ச்சல்','শরীর ব্যথা + জ্বর'],
['Gas / bloating','Gas / bloating','गैस / पेट फूलना','गॅस / पोट फुगणे','வாயு / வயிறு வீக்கம்','গ্যাস / পেট ফাঁপা'],['Loose motion','Loose motion','दस्त','जुलाब','வயிற்றுப்போக்கு','ডায়রিয়া'],['Vomiting','Vomiting','उल्टी','उलटी','வாந்தி','বমি'],['Sharp stomach pain','Sharp stomach pain','तेज पेट दर्द','तीव्र पोटदुखी','கடுமையான வயிற்று வலி','তীব্র পেট ব্যথা'],
['Dry cough','Dry cough','सूखी खांसी','कोरडा खोकला','உலர் இருமல்','শুকনো কাশি'],['With phlegm','With phlegm','बलगम के साथ','कफासह','சளியுடன்','কফসহ'],['With wheezing','With wheezing','घरघराहट के साथ','घरघरासह','வீசிங் உடன்','শোঁ শোঁ শব্দসহ'],['With chest pain','With chest pain','सीने के दर्द के साथ','छातीत दुखण्यासह','மார்பு வலியுடன்','বুকে ব্যথাসহ'],
['Back','Back','कमर / पीठ','पाठ','முதுகு','পিঠ'],['Knee / joints','Knee / joints','घुटना / जोड़','गुडघे / सांधे','முழங்கால் / மூட்டுகள்','হাঁটু / জয়েন্ট'],['Neck / shoulder','Neck / shoulder','गर्दन / कंधा','मान / खांदा','கழுத்து / தோள்','ঘাড় / কাঁধ'],['Full body','Full body','पूरा शरीर','संपूर्ण शरीर','முழு உடல்','পুরো শরীর'],
['Red rash','Red rash','लाल रैश','लाल पुरळ','சிவப்பு சிரங்கு','লাল র‍্যাশ'],['Itching only','Itching only','केवल खुजली','फक्त खाज','அரிப்பு மட்டும்','শুধু চুলকানি'],['Pimples / boils','Pimples / boils','मुंहासे / फोड़े','मुरुम / फोड','பருக்கள் / கட்டிகள்','ব্রণ / ফোড়া'],['Dry patches','Dry patches','सूखे धब्बे','कोरडे डाग','உலர் தழும்புகள்','শুষ্ক দাগ'],
['After meals','After meals','खाने के बाद','जेवणानंतर','உணவுக்குப் பிறகு','খাবারের পরে'],['Empty stomach','Empty stomach','खाली पेट','रिकाम्या पोटी','வெறும் வயிற்றில்','খালি পেটে'],['At night','At night','रात में','रात्री','இரவில்','রাতে'],['With chest discomfort','With chest discomfort','सीने की तकलीफ के साथ','छातीच्या त्रासासह','மார்பு அசௌகரியத்துடன்','বুকে অস্বস্তিসহ'],
['Rest well and drink plenty of clean water / ORS-style fluids.','Rest well and drink plenty of clean water / ORS-style fluids.','अच्छी तरह आराम करें और पर्याप्त साफ पानी / ORS जैसे तरल लें।','चांगली विश्रांती घ्या आणि भरपूर स्वच्छ पाणी / ORS द्रव प्या.','நன்றாக ஓய்வு எடுத்து போதுமான சுத்தமான தண்ணீர் / ORS போன்ற திரவங்களை குடிக்கவும்.','ভালোভাবে বিশ্রাম নিন এবং প্রচুর পরিষ্কার পানি / ORS ধরনের তরল পান করুন।'],
['Eat light, home-cooked food; avoid junk and alcohol.','Eat light, home-cooked food; avoid junk and alcohol.','हल्का घर का खाना खाएं; जंक फूड और शराब से बचें।','हलके घरचे अन्न खा; जंक फूड आणि मद्य टाळा.','லேசான வீட்டுச் சாப்பாடு சாப்பிடுங்கள்; ஜங்க் உணவு மற்றும் மதுவை தவிர்க்கவும்.','হালকা ঘরের খাবার খান; জাঙ্ক ফুড ও অ্যালকোহল এড়ান।'],
['Track temperature / symptoms twice a day for 2–3 days.','Track temperature / symptoms twice a day for 2–3 days.','2–3 दिन तक दिन में दो बार तापमान / लक्षण नोट करें।','2–3 दिवस दिवसातून दोनदा तापमान / लक्षणे नोंदवा.','2–3 நாட்களுக்கு தினமும் இருமுறை வெப்பநிலை / அறிகுறிகளை பதிவு செய்யவும்.','২–৩ দিন দিনে দুবার তাপমাত্রা / উপসর্গ নোট করুন।'],
['Do NOT self-medicate with antibiotics or steroids without a doctor.','Do NOT self-medicate with antibiotics or steroids without a doctor.','डॉक्टर के बिना एंटीबायोटिक या स्टेरॉयड खुद से न लें।','डॉक्टरांशिवाय अँटिबायोटिक्स किंवा स्टेरॉइड स्वतः घेऊ नका.','மருத்துவர் ஆலோசனை இல்லாமல் ஆன்டிபயாட்டிக் அல்லது ஸ்டீராய்டு எடுக்க வேண்டாம்.','ডাক্তারের পরামর্শ ছাড়া অ্যান্টিবায়োটিক বা স্টেরয়েড নিজে নেবেন না।'],
['Book a verified clinic or video consult within 24–48 hours.','Book a verified clinic or video consult within 24–48 hours.','24–48 घंटे के भीतर सत्यापित क्लिनिक या वीडियो परामर्श बुक करें।','24–48 तासांत पडताळलेले क्लिनिक किंवा व्हिडिओ सल्ला बुक करा.','24–48 மணி நேரத்திற்குள் சரிபார்க்கப்பட்ட மருத்துவமனை அல்லது வீடியோ ஆலோசனையை முன்பதிவு செய்யவும்.','২৪–৪৮ ঘণ্টার মধ্যে যাচাইকৃত ক্লিনিক বা ভিডিও পরামর্শ বুক করুন।'],
['Call 108 (ambulance) or 112 (national emergency) RIGHT NOW.','Call 108 (ambulance) or 112 (national emergency) RIGHT NOW.','अभी तुरंत 108 (एम्बुलेंस) या 112 (राष्ट्रीय आपातकाल) पर कॉल करें।','आत्ताच 108 (रुग्णवाहिका) किंवा 112 (राष्ट्रीय आपत्काल) वर कॉल करा.','உடனே 108 (ஆம்புலன்ஸ்) அல்லது 112 (தேசிய அவசரம்) அழைக்கவும்.','এখনই 108 (অ্যাম্বুলেন্স) বা 112 (জাতীয় জরুরি) নম্বরে কল করুন।'],
['Use MedGuide 1-Tap SOS to alert your emergency contacts.','Use MedGuide 1-Tap SOS to alert your emergency contacts.','अपने आपातकालीन संपर्कों को अलर्ट करने के लिए MedGuide 1-Tap SOS का उपयोग करें।','आपत्कालीन संपर्कांना अलर्ट करण्यासाठी MedGuide 1-Tap SOS वापरा.','அவசர தொடர்புகளை எச்சரிக்க MedGuide 1-Tap SOS ஐ பயன்படுத்தவும்.','জরুরি পরিচিতদের সতর্ক করতে MedGuide 1-Tap SOS ব্যবহার করুন।'],
];
rows.forEach((r) => add(...r));

const extraRows: Array<[string,string,string,string,string,string]> = [
['Body garam lag rahi hai? Pehle basic sawalon se samjhte hain.','Feeling feverish? Let’s understand it with a few basic questions.','शरीर गर्म लग रहा है? पहले कुछ आसान सवालों से समझते हैं।','शरीर गरम वाटत आहे? आधी काही सोप्या प्रश्नांनी समजून घेऊया.','உடல் சூடாக உள்ளதா? சில அடிப்படை கேள்விகளால் புரிந்துகொள்வோம்.','শরীর গরম লাগছে? কিছু সহজ প্রশ্ন দিয়ে বুঝে নিই।'],
['Sir me dard? Aao sahi wajah tak pahuche.','Headache? Let’s narrow down the likely cause.','सिर में दर्द? आइए संभावित कारण समझें।','डोके दुखत आहे? संभाव्य कारण समजून घेऊया.','தலைவலியா? சாத்தியமான காரணத்தை புரிந்துகொள்வோம்.','মাথাব্যথা? সম্ভাব্য কারণ বুঝে নিই।'],
['Naak beh rahi hai ya cheenk a rahi hai?','Runny nose or sneezing?','नाक बह रही है या छींक आ रही है?','नाक वाहत आहे किंवा शिंका येत आहेत?', 'மூக்கு ஒழுகுகிறதா அல்லது தும்மலா?','নাক দিয়ে পানি পড়ছে বা হাঁচি হচ্ছে?'],
['Pet me dard, gas ya loose motion?','Stomach pain, gas or loose motions?','पेट में दर्द, गैस या दस्त?', 'पोटदुखी, गॅस किंवा जुलाब?', 'வயிற்று வலி, வாயு அல்லது வயிற்றுப்போக்கு?', 'পেট ব্যথা, গ্যাস বা ডায়রিয়া?'],
['Sukhi ya balgham wali khansi?','Dry cough or cough with phlegm?','सूखी या बलगम वाली खांसी?', 'कोरडा किंवा कफाचा खोकला?', 'உலர் இருமலா அல்லது சளியுடன் இருமலா?', 'শুকনো কাশি নাকি কফসহ?'],
['Kamar, ghutna ya poore badan me dard?','Back, knee or whole-body pain?','कमर, घुटने या पूरे शरीर में दर्द?', 'कंबर, गुडघे किंवा संपूर्ण शरीर दुखते?', 'முதுகு, முழங்கால் அல்லது முழு உடல் வலியா?', 'কোমর, হাঁটু বা পুরো শরীরে ব্যথা?'],
['Rash, khujli ya daag-dhabbe?','Rash, itching or skin spots?','रैश, खुजली या दाग-धब्बे?', 'पुरळ, खाज किंवा डाग?', 'சிரங்கு, அரிப்பு அல்லது தோல் தழும்புகள்?', 'র‍্যাশ, চুলকানি বা দাগ?'],
['Seene me jalan ya khatte dakaar?','Heartburn or sour burps?','सीने में जलन या खट्टी डकार?', 'छातीत जळजळ किंवा आंबट ढेकर?', 'நெஞ்செரிச்சல் அல்லது புளிப்பு ஏப்பம்?', 'বুকজ্বালা বা টক ঢেকুর?'],
['How many days has the fever lasted?','How many days has the fever lasted?','बुखार कितने दिन से है?','ताप किती दिवसांपासून आहे?','காய்ச்சல் எத்தனை நாட்களாக உள்ளது?','জ্বর কতদিন ধরে আছে?'],
['How many days have you had the headache?','How many days have you had the headache?','सिरदर्द कितने दिन से है?','डोकेदुखी किती दिवसांपासून आहे?','தலைவலி எத்தனை நாட்களாக உள்ளது?','মাথাব্যথা কতদিন ধরে আছে?'],
['How many days of cold/flu symptoms?','How many days of cold/flu symptoms?','सर्दी/फ्लू के लक्षण कितने दिन से हैं?','सर्दी/फ्लूची लक्षणे किती दिवसांपासून आहेत?','சளி/காய்ச்சல் அறிகுறிகள் எத்தனை நாட்களாக உள்ளன?','সর্দি/ফ্লুর উপসর্গ কতদিন ধরে?'],
['How many days of stomach trouble?','How many days of stomach trouble?','पेट की समस्या कितने दिन से है?','पोटाचा त्रास किती दिवसांपासून आहे?','வயிற்றுப் பிரச்சினை எத்தனை நாட்களாக உள்ளது?','পেটের সমস্যা কতদিন ধরে?'],
['How many days of cough?','How many days of cough?','खांसी कितने दिन से है?','खोकला किती दिवसांपासून आहे?','இருமல் எத்தனை நாட்களாக உள்ளது?','কাশি কতদিন ধরে?'],
['How many days of body pain?','How many days of body pain?','बदन दर्द कितने दिन से है?','शरीरदुखी किती दिवसांपासून आहे?','உடல் வலி எத்தனை நாட்களாக உள்ளது?','শরীর ব্যথা কতদিন ধরে?'],
['How many days of skin issue?','How many days of skin issue?','त्वचा की समस्या कितने दिन से है?','त्वचेची समस्या किती दिवसांपासून आहे?','தோல் பிரச்சினை எத்தனை நாட்களாக உள்ளது?','ত্বকের সমস্যা কতদিন ধরে?'],
['How many days of acidity?','How many days of acidity?','एसिडिटी कितने दिन से है?','अॅसिडिटी किती दिवसांपासून आहे?','அமிலத்தன்மை எத்தனை நாட்களாக உள்ளது?','অ্যাসিডিটি কতদিন ধরে?'],
['Fever pattern?','Fever pattern?','बुखार का पैटर्न?', 'तापाचा पॅटर्न?', 'காய்ச்சல் எப்படி வருகிறது?', 'জ্বরের ধরন?'],
['Where is the pain?','Where is the pain?','दर्द कहां है?', 'दुखणे कुठे आहे?', 'வலி எங்கே?', 'ব্যথা কোথায়?'],
['Main symptom?','Main symptom?','मुख्य लक्षण?', 'मुख्य लक्षण?', 'முக்கிய அறிகுறி?', 'প্রধান উপসর্গ?'],
['What best describes it?','What best describes it?','इसे सबसे अच्छा क्या बताता है?', 'याचे सर्वोत्तम वर्णन कोणते?', 'இதனை சிறப்பாக விவரிப்பது எது?', 'কোনটি সবচেয়ে ভালোভাবে বর্ণনা করে?'],
['Type of cough?','Type of cough?','खांसी कैसी है?', 'खोकला कसा आहे?', 'இருமல் எந்த வகை?', 'কাশির ধরন?'],
['What do you see?','What do you see?','क्या दिखाई दे रहा है?', 'काय दिसत आहे?', 'என்ன தெரிகிறது?', 'কি দেখা যাচ্ছে?'],
['When is it worst?','When is it worst?','यह कब ज्यादा होता है?', 'कधी जास्त होते?', 'எப்போது அதிகமாக உள்ளது?', 'কখন বেশি হয়?'],
['Rate how bad you feel (1 = mild, 10 = worst)','Rate how bad you feel (1 = mild, 10 = worst)','अपनी तकलीफ 1 से 10 तक बताएं (1 = हल्की, 10 = सबसे ज्यादा)','तुमचा त्रास 1 ते 10 द्या (1 = हलका, 10 = सर्वाधिक)','உங்கள் சிரமத்தை 1 முதல் 10 வரை மதிப்பிடுங்கள் (1 = லேசான, 10 = மிக மோசமான)','কষ্ট ১ থেকে ১০ পর্যন্ত রেট করুন (১ = হালকা, ১০ = সবচেয়ে বেশি)'],
['Rate the pain from 1 to 10','Rate the pain from 1 to 10','दर्द 1 से 10 तक बताएं','वेदना 1 ते 10 द्या','வலியை 1 முதல் 10 வரை மதிப்பிடுங்கள்','ব্যথা ১ থেকে ১০ পর্যন্ত রেট করুন'],
['Rate discomfort from 1 to 10','Rate discomfort from 1 to 10','तकलीफ 1 से 10 तक बताएं','त्रास 1 ते 10 द्या','அசௌகரியத்தை 1 முதல் 10 வரை மதிப்பிடுங்கள்','অস্বস্তি ১ থেকে ১০ পর্যন্ত রেট করুন'],
['Rate discomfort / itching 1 to 10','Rate discomfort / itching 1 to 10','तकलीफ / खुजली 1 से 10 तक बताएं','त्रास / खाज 1 ते 10 द्या','அசௌகரியம் / அரிப்பை 1 முதல் 10 வரை மதிப்பிடுங்கள்','অস্বস্তি / চুলকানি ১ থেকে ১০ পর্যন্ত রেট করুন'],
['Rate burning/discomfort 1 to 10','Rate burning/discomfort 1 to 10','जलन / तकलीफ 1 से 10 तक बताएं','जळजळ / त्रास 1 ते 10 द्या','எரிச்சல் / அசௌகரியத்தை 1 முதல் 10 வரை மதிப்பிடுங்கள்','জ্বালা / অস্বস্তি ১ থেকে ১০ পর্যন্ত রেট করুন'],
['Face droop, slurred speech, one-side weakness','Face droop, slurred speech, one-side weakness','चेहरा टेढ़ा, बोलने में दिक्कत, एक तरफ कमजोरी','चेहरा वाकडा, बोलण्यात अडचण, एका बाजूला अशक्तपणा','முகம் சாய்வு, பேச்சு குழப்பம், ஒரு பக்கம் பலவீனம்','মুখ বেঁকে যাওয়া, কথা জড়িয়ে যাওয়া, একপাশ দুর্বল'],
['Swelling of lips/tongue, severe allergy','Swelling of lips/tongue, severe allergy','होंठ/जीभ में सूजन, गंभीर एलर्जी','ओठ/जीभ सूज, गंभीर अॅलर्जी','உதடு/நாக்கு வீக்கம், கடுமையான அலர்ஜி','ঠোঁট/জিহ্বা ফুলে যাওয়া, গুরুতর অ্যালার্জি'],
['No urine for 8+ hours, severe dehydration','No urine for 8+ hours, severe dehydration','8+ घंटे पेशाब न होना, गंभीर डिहाइड्रेशन','8+ तास लघवी न होणे, गंभीर निर्जलीकरण','8+ மணி நேரமாக சிறுநீர் இல்லாமை, கடுமையான நீரிழப்பு','৮+ ঘণ্টা প্রস্রাব না হওয়া, গুরুতর পানিশূন্যতা'],
['Pregnant + bleeding / severe pain','Pregnant + bleeding / severe pain','गर्भावस्था + रक्तस्राव / तेज दर्द','गर्भधारणा + रक्तस्राव / तीव्र वेदना','கர்ப்பம் + இரத்தப்போக்கு / கடுமையான வலி','গর্ভাবস্থা + রক্তপাত / তীব্র ব্যথা'],
['Baby under 3 months with fever','Baby under 3 months with fever','3 महीने से छोटे बच्चे को बुखार','3 महिन्यांखालील बाळाला ताप','3 மாதத்திற்கு குறைவான குழந்தைக்கு காய்ச்சல்','৩ মাসের কম বয়সী শিশুর জ্বর'],
['Check temperature every 6 hours and note it.','Check temperature every 6 hours and note it.','हर 6 घंटे तापमान जांचकर नोट करें।','दर 6 तासांनी तापमान तपासा आणि नोंदवा.','ஒவ்வொரு 6 மணி நேரத்துக்கும் வெப்பநிலையை பதிவு செய்யவும்.','প্রতি ৬ ঘণ্টায় তাপমাত্রা মেপে নোট করুন।'],
['Lukewarm sponge + fluids; rest in a cool room.','Lukewarm sponge + fluids; rest in a cool room.','गुनगुने पानी की पट्टी + तरल लें; ठंडे कमरे में आराम करें।','कोमट पाण्याची पट्टी + द्रव; थंड खोलीत विश्रांती घ्या.','வெதுவெதுப்பான நீர் துடைப்பு + திரவங்கள்; குளிர்ச்சியான அறையில் ஓய்வு.','কুসুম গরম পানি দিয়ে মুছুন + তরল পান করুন; ঠান্ডা ঘরে বিশ্রাম নিন।'],
['See a doctor if fever crosses 3 days or 102°F.','See a doctor if fever crosses 3 days or 102°F.','बुखार 3 दिन से ज्यादा या 102°F पार करे तो डॉक्टर को दिखाएं।','ताप 3 दिवसांपेक्षा जास्त किंवा 102°F पेक्षा जास्त असल्यास डॉक्टरांना भेटा.','காய்ச்சல் 3 நாட்களுக்கு மேல் அல்லது 102°Fக்கு மேல் இருந்தால் மருத்துவரை அணுகவும்.','জ্বর ৩ দিনের বেশি বা 102°F-এর বেশি হলে ডাক্তার দেখান।'],
['Rest in a dark, quiet room; hydrate well.','Rest in a dark, quiet room; hydrate well.','अंधेरे, शांत कमरे में आराम करें और पर्याप्त पानी पिएं।','अंधाऱ्या, शांत खोलीत विश्रांती घ्या आणि भरपूर पाणी प्या.','இருண்ட அமைதியான அறையில் ஓய்வு எடுத்து போதுமான தண்ணீர் குடிக்கவும்.','অন্ধকার, শান্ত ঘরে বিশ্রাম নিন এবং পর্যাপ্ত পানি পান করুন।'],
['Check sleep, screen time and missed meals.','Check sleep, screen time and missed meals.','नींद, स्क्रीन टाइम और छूटा हुआ खाना जांचें।','झोप, स्क्रीन टाइम आणि जेवण चुकले का ते तपासा.','தூக்கம், திரை நேரம் மற்றும் தவறிய உணவுகளை கவனிக்கவும்.','ঘুম, স্ক্রিন টাইম ও খাবার বাদ গেছে কি না দেখুন।'],
['Sudden worst-ever headache = emergency, call 108.','Sudden worst-ever headache = emergency, call 108.','अचानक बहुत तेज सिरदर्द = आपातकाल, 108 पर कॉल करें।','अचानक सर्वात तीव्र डोकेदुखी = आपत्काल, 108 वर कॉल करा.','திடீரென மிகக் கடுமையான தலைவலி = அவசரம், 108 அழைக்கவும்.','হঠাৎ জীবনের সবচেয়ে তীব্র মাথাব্যথা = জরুরি, 108-এ কল করুন।'],
['Steam inhalation 2–3 times a day.','Steam inhalation 2–3 times a day.','दिन में 2–3 बार भाप लें।','दिवसातून 2–3 वेळा वाफ घ्या.','நாளுக்கு 2–3 முறை நீராவி எடுத்துக்கொள்ளவும்.','দিনে ২–৩ বার ভাপ নিন।'],
['Warm fluids, honey-ginger (adults), rest.','Warm fluids, honey-ginger (adults), rest.','गर्म तरल, शहद-अदरक (वयस्क), आराम।','गरम द्रव, मध-आले (प्रौढ), विश्रांती.','சூடான திரவங்கள், தேன்-இஞ்சி (பெரியவர்கள்), ஓய்வு.','গরম তরল, মধু-আদা (প্রাপ্তবয়স্ক), বিশ্রাম।'],
['Breathing difficulty or 10+ days = see a doctor.','Breathing difficulty or 10+ days = see a doctor.','सांस में दिक्कत या 10+ दिन = डॉक्टर को दिखाएं।','श्वास घेण्यास त्रास किंवा 10+ दिवस = डॉक्टरांना भेटा.','மூச்சுத்திணறல் அல்லது 10+ நாட்கள் = மருத்துவரை அணுகவும்.','শ্বাসকষ্ট বা ১০+ দিন = ডাক্তার দেখান।'],
['ORS / nimbu-paani in small sips.','ORS / lemon water in small sips.','ORS / नींबू पानी छोटे-छोटे घूंट में लें।','ORS / लिंबूपाणी थोडे-थोडे प्या.','ORS / எலுமிச்சை நீரை சிறு சிறு குடிகளாக குடிக்கவும்.','ORS / লেবুর পানি অল্প অল্প করে পান করুন।'],
['Khichdi, curd-rice; avoid spicy/oily food.','Khichdi, curd-rice; avoid spicy/oily food.','खिचड़ी, दही-चावल लें; मसालेदार/तेलीय भोजन से बचें।','खिचडी, दही-भात; तिखट/तेलकट अन्न टाळा.','கிச்சடி, தயிர் சாதம்; காரம்/எண்ணெய் உணவை தவிர்க்கவும்.','খিচুড়ি, দই-ভাত; ঝাল/তেলযুক্ত খাবার এড়ান।'],
['Blood in stool/vomit or severe pain = emergency.','Blood in stool/vomit or severe pain = emergency.','मल/उल्टी में खून या तेज दर्द = आपातकाल।','शौच/उलटीत रक्त किंवा तीव्र वेदना = आपत्काल.','மலம்/வாந்தியில் இரத்தம் அல்லது கடுமையான வலி = அவசரம்.','পায়খানা/বমিতে রক্ত বা তীব্র ব্যথা = জরুরি।'],
['Warm water, steam; avoid cold drinks and dust.','Warm water, steam; avoid cold drinks and dust.','गर्म पानी, भाप लें; ठंडे पेय और धूल से बचें।','गरम पाणी, वाफ; थंड पेय आणि धूळ टाळा.','சூடான நீர், நீராவி; குளிர்பானம் மற்றும் தூசியை தவிர்க்கவும்.','গরম পানি, ভাপ; ঠান্ডা পানীয় ও ধুলো এড়ান।'],
['Honey (1+ year age) can soothe throat.','Honey (age 1+) can soothe the throat.','1 साल से बड़े के लिए शहद गले को राहत दे सकता है।','1 वर्षांवरील व्यक्तीस मध घशाला आराम देऊ शकतो.','1 வயதுக்கு மேல் தேன் தொண்டைக்கு நிவாரணம் தரலாம்.','১ বছরের বেশি বয়সে মধু গলা আরাম দিতে পারে।'],
['Blood in cough or breathlessness = see doctor fast.','Blood in cough or breathlessness = see a doctor quickly.','खांसी में खून या सांस फूलना = जल्दी डॉक्टर को दिखाएं।','खोकल्यात रक्त किंवा श्वास लागणे = लवकर डॉक्टरांना भेटा.','இருமலில் இரத்தம் அல்லது மூச்சுத்திணறல் = விரைவில் மருத்துவரை அணுகவும்.','কাশিতে রক্ত বা শ্বাসকষ্ট = দ্রুত ডাক্তার দেখান।'],
['Gentle stretching + warm compress.','Gentle stretching + warm compress.','हल्की स्ट्रेचिंग + गर्म सिकाई।','हलके स्ट्रेचिंग + गरम शेक.','மெதுவான நீட்டிப்பு + சூடான ஒத்தடம்.','হালকা স্ট্রেচিং + গরম সেঁক।'],
['Fix posture and sleep position.','Fix posture and sleep position.','बैठने और सोने की स्थिति सुधारें।','बसण्याची आणि झोपण्याची स्थिती सुधारा.','உட்காரும் மற்றும் தூங்கும் நிலையை சரிசெய்யவும்.','বসা ও ঘুমের ভঙ্গি ঠিক করুন।'],
['Pain after injury with swelling = get an X-ray opinion.','Pain after injury with swelling = consider an X-ray evaluation.','चोट के बाद दर्द और सूजन = X-ray के लिए डॉक्टर से सलाह लें।','दुखापतीनंतर वेदना व सूज = X-ray साठी डॉक्टरांचा सल्ला घ्या.','காயத்திற்குப் பிறகு வலி மற்றும் வீக்கம் = X-ray மதிப்பீடு பெறவும்.','আঘাতের পর ব্যথা ও ফোলা = X-ray মূল্যায়ন নিন।'],
['Do NOT scratch; keep area clean and dry.','Do NOT scratch; keep the area clean and dry.','खुजाएं नहीं; जगह को साफ और सूखा रखें।','खाजवू नका; भाग स्वच्छ आणि कोरडा ठेवा.','சொறிக்க வேண்டாம்; பகுதியை சுத்தமாகவும் உலர்ந்தும் வைத்திருங்கள்.','চুলকাবেন না; জায়গা পরিষ্কার ও শুকনো রাখুন।'],
['Avoid new cosmetics/steroid creams on your own.','Avoid new cosmetics/steroid creams on your own.','नई कॉस्मेटिक्स/स्टेरॉयड क्रीम खुद से न लगाएं।','नवीन कॉस्मेटिक्स/स्टेरॉइड क्रीम स्वतः वापरू नका.','புதிய அழகு பொருட்கள்/ஸ்டீராய்டு கிரீம்களை தானாக பயன்படுத்த வேண்டாம்.','নতুন কসমেটিক/স্টেরয়েড ক্রিম নিজে ব্যবহার করবেন না।'],
['Spreading redness with fever = see a dermatologist.','Spreading redness with fever = see a dermatologist.','फैलती लालिमा और बुखार = त्वचा विशेषज्ञ को दिखाएं।','पसरत जाणारी लालसरपणा + ताप = त्वचारोग तज्ज्ञांना भेटा.','பரவுகின்ற சிவப்பு + காய்ச்சல் = தோல் மருத்துவரை அணுகவும்.','ছড়িয়ে পড়া লালচে ভাব + জ্বর = চর্মরোগ বিশেষজ্ঞ দেখান।'],
['Small frequent meals; avoid late-night eating.','Eat small frequent meals; avoid late-night eating.','थोड़ा-थोड़ा बार-बार खाएं; देर रात खाने से बचें।','थोडे-थोडे वारंवार खा; उशिरा रात्री खाणे टाळा.','சிறு அளவில் அடிக்கடி சாப்பிடுங்கள்; இரவு தாமதமாக சாப்பிட வேண்டாம்.','অল্প অল্প করে বারবার খান; রাতে দেরি করে খাওয়া এড়ান।'],
['Less tea/coffee/spicy food for a few days.','Reduce tea, coffee and spicy food for a few days.','कुछ दिनों तक चाय, कॉफी और मसालेदार खाना कम करें।','काही दिवस चहा, कॉफी आणि तिखट अन्न कमी करा.','சில நாட்களுக்கு தேநீர், காபி மற்றும் கார உணவை குறைக்கவும்.','কয়েকদিন চা, কফি ও ঝাল খাবার কমান।'],
['Chest-pain-like burning with sweating = emergency.','Burning like chest pain with sweating = emergency.','सीने के दर्द जैसी जलन और पसीना = आपातकाल।','छातीत दुखण्यासारखी जळजळ + घाम = आपत्काल.','மார்பு வலி போன்ற எரிச்சல் + வியர்வை = அவசரம்.','বুকব্যথার মতো জ্বালা + ঘাম = জরুরি।'],
['Stay calm, call 108','Stay calm, call 108','शांत रहें, 108 पर कॉल करें','शांत राहा, 108 वर कॉल करा','அமைதியாக இருந்து 108 அழைக்கவும்','শান্ত থাকুন, 108-এ কল করুন'],
['Do not move spine injuries','Do not move someone with a possible spine injury','रीढ़ की चोट में व्यक्ति को न हिलाएं','मणक्याच्या दुखापतीत व्यक्तीला हलवू नका','முதுகுத்தண்டு காயம் இருந்தால் நபரை நகர்த்த வேண்டாம்','মেরুদণ্ডে আঘাত হলে ব্যক্তিকে নড়াবেন না'],
['Stop heavy bleeding','Stop heavy bleeding','भारी रक्तस्राव रोकें','जास्त रक्तस्राव थांबवा','அதிக இரத்தப்போக்கை நிறுத்தவும்','অতিরিক্ত রক্তপাত বন্ধ করুন'],
['Free govt ambulance service across India','Free government ambulance service across India','भारत भर में मुफ्त सरकारी एम्बुलेंस सेवा','भारतभर मोफत सरकारी रुग्णवाहिका सेवा','இந்தியா முழுவதும் இலவச அரசு ஆம்புலன்ஸ் சேவை','ভারতজুড়ে বিনামূল্যের সরকারি অ্যাম্বুলেন্স পরিষেবা'],
['Single emergency number — police, fire, medical','Single emergency number — police, fire, medical','एक आपातकालीन नंबर — पुलिस, अग्निशमन, चिकित्सा','एक आपत्कालीन नंबर — पोलीस, अग्निशमन, वैद्यकीय','ஒரே அவசர எண் — காவல், தீயணைப்பு, மருத்துவம்','এক জরুরি নম্বর — পুলিশ, ফায়ার, চিকিৎসা'],
['Women in distress','Women in distress','संकट में महिलाएं','संकटातील महिला','அவசரத்தில் உள்ள பெண்கள்','সঙ্কটে থাকা নারী'],
['Child emergency','Child emergency','बाल आपातकाल','बाल आपत्काल','குழந்தை அவசரம்','শিশু জরুরি'],
['Upload fail ho gaya.','Upload failed.','अपलोड विफल हो गया।','अपलोड अयशस्वी झाले.','பதிவேற்றம் தோல்வியடைந்தது.','আপলোড ব্যর্থ হয়েছে।'],
['Voice upload fail.','Voice upload failed.','वॉइस अपलोड विफल।','व्हॉइस अपलोड अयशस्वी.','குரல் பதிவேற்றம் தோல்வியடைந்தது.','ভয়েস আপলোড ব্যর্থ।'],
['Mic access nahi mila. Browser permission allow karein.','Microphone access was not granted. Allow browser permission.','माइक एक्सेस नहीं मिला। ब्राउज़र अनुमति दें।','माइक प्रवेश मिळाला नाही. ब्राउझर परवानगी द्या.','மைக்ரோஃபோன் அனுமதி கிடைக்கவில்லை. உலாவி அனுமதியை வழங்கவும்.','মাইক্রোফোন অ্যাক্সেস মেলেনি। ব্রাউজার অনুমতি দিন।'],
['Kam se kam 10 aksharon me takleef likhein, ya photo/voice note jodein.','Describe the problem in at least 10 characters, or add a photo/voice note.','कम से कम 10 अक्षरों में समस्या लिखें, या फोटो/वॉइस नोट जोड़ें।','किमान 10 अक्षरांत समस्या लिहा किंवा फोटो/व्हॉइस नोट जोडा.','குறைந்தது 10 எழுத்துகளில் பிரச்சினையை எழுதவும் அல்லது புகைப்படம்/குரல் குறிப்பை சேர்க்கவும்.','কমপক্ষে ১০ অক্ষরে সমস্যা লিখুন, অথবা ছবি/ভয়েস নোট যোগ করুন।'],
['Sahi email address likhein.','Enter a valid email address.','सही ईमेल पता लिखें।','वैध ईमेल पत्ता लिहा.','சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.','সঠিক ইমেইল ঠিকানা লিখুন।'],
['Sahi 10-digit Indian mobile number likhein.','Enter a valid 10-digit Indian mobile number.','सही 10-अंकों का भारतीय मोबाइल नंबर लिखें।','वैध 10-अंकी भारतीय मोबाईल नंबर लिहा.','சரியான 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும்.','সঠিক ১০ সংখ্যার ভারতীয় মোবাইল নম্বর লিখুন।'],
['Password kam se kam 6 characters ka hona chahiye.','Password must be at least 6 characters.','पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।','पासवर्ड किमान 6 अक्षरांचा असावा.','கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.','পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'],
['Password aur Confirm Password match nahi kar rahe.','Password and confirmation do not match.','पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।','पासवर्ड आणि पुष्टी पासवर्ड जुळत नाहीत.','கடவுச்சொல் மற்றும் உறுதிப்படுத்தல் பொருந்தவில்லை.','পাসওয়ার্ড ও নিশ্চিতকরণ মিলছে না।'],
['Authentication failed. Dobara try karein.','Authentication failed. Please try again.','प्रमाणीकरण विफल। दोबारा प्रयास करें।','प्रमाणीकरण अयशस्वी. पुन्हा प्रयत्न करा.','அங்கீகாரம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.','অথেন্টিকেশন ব্যর্থ। আবার চেষ্টা করুন।'],
['Galat OTP. Demo OTP screen par dikh raha hai — wahi daalein.','Incorrect OTP. Use the demo OTP shown on screen.','गलत OTP। स्क्रीन पर दिख रहा डेमो OTP दर्ज करें।','चुकीचा OTP. स्क्रीनवरील डेमो OTP टाका.','தவறான OTP. திரையில் காட்டப்படும் டெமோ OTP ஐ உள்ளிடவும்.','ভুল OTP। স্ক্রিনে দেখানো ডেমো OTP দিন।'],
['Account create ho gaya. Verification email bheji gayi hai — email verify karke Sign In karein.','Account created. A verification email has been sent — verify it and then sign in.','अकाउंट बन गया। सत्यापन ईमेल भेजा गया है — ईमेल सत्यापित करके साइन इन करें।','खाते तयार झाले. पडताळणी ईमेल पाठवला आहे — पडताळून साइन इन करा.','கணக்கு உருவாக்கப்பட்டது. சரிபார்ப்பு மின்னஞ்சல் அனுப்பப்பட்டது — சரிபார்த்து உள்நுழைக.','অ্যাকাউন্ট তৈরি হয়েছে। যাচাই ইমেইল পাঠানো হয়েছে — যাচাই করে সাইন ইন করুন।'],
['Details load ho rahe hain...','Loading details...','विवरण लोड हो रहे हैं...','तपशील लोड होत आहेत...','விவரங்கள் ஏற்றப்படுகின்றன...','বিস্তারিত লোড হচ্ছে...'],
['Abhi koi record nahi','No records yet','अभी कोई रिकॉर्ड नहीं','अजून नोंद नाही','இன்னும் பதிவுகள் இல்லை','এখনও কোনো রেকর্ড নেই'],
['Abhi koi review nahi — pehle aap likhein!','No reviews yet — be the first to write one!','अभी कोई रिव्यू नहीं — पहला रिव्यू आप लिखें!','अजून रिव्ह्यू नाही — पहिला रिव्ह्यू तुम्ही लिहा!','இன்னும் மதிப்புரை இல்லை — முதலில் நீங்கள் எழுதுங்கள்!','এখনও কোনো রিভিউ নেই — প্রথমটি আপনি লিখুন!'],
['Apna anubhav likhein...','Write about your experience...','अपना अनुभव लिखें...','तुमचा अनुभव लिहा...','உங்கள் அனுபவத்தை எழுதுங்கள்...','আপনার অভিজ্ঞতা লিখুন...'],
['Note (optional): e.g. Seene me dard, 2nd floor, Sharma Niwas','Note (optional): e.g. chest pain, 2nd floor, Sharma Niwas','नोट (वैकल्पिक): जैसे सीने में दर्द, दूसरी मंज़िल, शर्मा निवास','नोंद (ऐच्छिक): उदा. छातीत दुखणे, दुसरा मजला, शर्मा निवास','குறிப்பு (விருப்பம்): உதா. மார்பு வலி, 2வது மாடி, Sharma Niwas','নোট (ঐচ্ছিক): যেমন বুকে ব্যথা, ২য় তলা, Sharma Niwas'],
['EMERGENCY SOS bhejein? Aapke contacts ko turant alert jayega.','Send EMERGENCY SOS? Your contacts will be alerted immediately.','आपातकालीन SOS भेजें? आपके संपर्कों को तुरंत अलर्ट जाएगा।','आपत्कालीन SOS पाठवू? तुमच्या संपर्कांना त्वरित अलर्ट जाईल.','அவசர SOS அனுப்பவா? உங்கள் தொடர்புகளுக்கு உடனடி எச்சரிக்கை செல்லும்.','জরুরি SOS পাঠাবেন? আপনার পরিচিতদের সঙ্গে সঙ্গে সতর্ক করা হবে।'],
['SOS Alert bhej diya gaya! Madad aa rahi hai.','SOS alert sent! Help is on the way.','SOS अलर्ट भेज दिया गया! मदद आ रही है।','SOS अलर्ट पाठवला! मदत येत आहे.','SOS எச்சரிக்கை அனுப்பப்பட்டது! உதவி வருகிறது.','SOS সতর্কতা পাঠানো হয়েছে! সাহায্য আসছে।'],
];
extraRows.forEach((r) => add(...r));


const finalRows: Array<[string,string,string,string,string,string]> = [
['256-bit Encryption','256-bit Encryption','256-बिट एन्क्रिप्शन','256-बिट एन्क्रिप्शन','256-பிட் குறியாக்கம்','256-বিট এনক্রিপশন'],
['Aapki har photo, voice note aur health record bank-grade 256-bit encryption se surakshit hai — transfer me bhi, storage me bhi.','Every photo, voice note and health record is protected with bank-grade 256-bit encryption — in transit and at rest.','आपकी हर फोटो, वॉइस नोट और हेल्थ रिकॉर्ड बैंक-ग्रेड 256-बिट एन्क्रिप्शन से सुरक्षित है — ट्रांसफर और स्टोरेज दोनों में।','तुमचा प्रत्येक फोटो, व्हॉइस नोट आणि आरोग्य रेकॉर्ड बँक-ग्रेड 256-बिट एन्क्रिप्शनने सुरक्षित आहे — ट्रान्सफर आणि स्टोरेज दोन्हीमध्ये.','ஒவ்வொரு புகைப்படம், குரல் குறிப்பு மற்றும் ஆரோக்கிய பதிவும் வங்கி தர 256-பிட் குறியாக்கத்தால் பாதுகாக்கப்படுகிறது — பரிமாற்றத்திலும் சேமிப்பிலும்.','প্রতিটি ছবি, ভয়েস নোট ও স্বাস্থ্য রেকর্ড ব্যাংক-গ্রেড 256-বিট এনক্রিপশনে সুরক্ষিত — ট্রান্সফার ও স্টোরেজ উভয় ক্ষেত্রেই।'],
['DPDP Act 2023 ke tahat aapka data bina aapki saaf permission ke kabhi share, becha ya misuse nahi hoga.','Under the DPDP Act 2023, your data will never be shared, sold or misused without your clear permission.','DPDP Act 2023 के तहत आपकी स्पष्ट अनुमति के बिना आपका डेटा कभी साझा, बेचा या दुरुपयोग नहीं किया जाएगा।','DPDP Act 2023 अंतर्गत तुमच्या स्पष्ट परवानगीशिवाय तुमचा डेटा कधीही शेअर, विकला किंवा गैरवापरला जाणार नाही.','DPDP Act 2023 கீழ் உங்கள் தெளிவான அனுமதி இல்லாமல் தரவு பகிரப்படாது, விற்கப்படாது அல்லது தவறாக பயன்படுத்தப்படாது.','DPDP Act 2023 অনুযায়ী আপনার স্পষ্ট অনুমতি ছাড়া ডেটা কখনও শেয়ার, বিক্রি বা অপব্যবহার করা হবে না।'],
['Hum sirf utna data lete hain jitna aapki madad ke liye zaroori hai. Koi hidden tracking nahi.','We collect only the data needed to help you. No hidden tracking.','हम केवल उतना डेटा लेते हैं जितना आपकी मदद के लिए जरूरी है। कोई छिपी ट्रैकिंग नहीं।','तुमच्या मदतीसाठी जितका डेटा आवश्यक आहे तितकाच घेतो. कोणतेही लपलेले ट्रॅकिंग नाही.','உங்களுக்கு உதவ தேவையான தரவு மட்டுமே சேகரிக்கப்படுகிறது. மறைமுக கண்காணிப்பு இல்லை.','আপনাকে সাহায্য করতে যতটুকু ডেটা দরকার ততটুকুই নেওয়া হয়। কোনো গোপন ট্র্যাকিং নেই।'],
['Koi bhi record ya poora account ek request par permanently delete — no questions, no delay.','Any record or the entire account can be permanently deleted on request — no questions, no delay.','किसी भी रिकॉर्ड या पूरे अकाउंट को अनुरोध पर स्थायी रूप से डिलीट किया जा सकता है — बिना सवाल, बिना देरी।','कोणताही रेकॉर्ड किंवा संपूर्ण खाते विनंतीवर कायमचे हटवता येते — प्रश्न नाही, विलंब नाही.','எந்த பதிவோ முழு கணக்கோ கோரிக்கையின்படி நிரந்தரமாக நீக்கப்படும் — கேள்வி இல்லை, தாமதம் இல்லை.','যেকোনো রেকর্ড বা পুরো অ্যাকাউন্ট অনুরোধে স্থায়ীভাবে মুছে ফেলা যাবে — কোনো প্রশ্ন নয়, কোনো দেরি নয়।'],
['Jab bhi aapka data access ho (jaise SOS par), aapko turant suchna milegi.','Whenever your data is accessed (for example during SOS), you will be notified immediately.','जब भी आपका डेटा एक्सेस होगा (जैसे SOS में), आपको तुरंत सूचना मिलेगी।','तुमचा डेटा जेव्हा प्रवेश केला जाईल (उदा. SOS), तेव्हा तुम्हाला त्वरित सूचना मिळेल.','உங்கள் தரவு அணுகப்படும் போதெல்லாம் (உதா. SOS), உடனடி அறிவிப்பு கிடைக்கும்.','আপনার ডেটা অ্যাক্সেস হলেই (যেমন SOS-এ) সঙ্গে সঙ্গে জানানো হবে।'],
['Clinics aur doctors ko list karne se pehle license + registration verify hota hai.','Clinic licenses and doctor registrations are verified before listing.','क्लिनिक और डॉक्टरों को सूचीबद्ध करने से पहले लाइसेंस + रजिस्ट्रेशन सत्यापित किया जाता है।','क्लिनिक आणि डॉक्टर सूचीबद्ध करण्यापूर्वी परवाना + नोंदणी पडताळली जाते.','மருத்துவமனைகள் மற்றும் மருத்துவர்களை பட்டியலிடுவதற்கு முன் உரிமம் + பதிவு சரிபார்க்கப்படும்.','ক্লিনিক ও ডাক্তার তালিকাভুক্ত করার আগে লাইসেন্স + নিবন্ধন যাচাই করা হয়।'],
['Aapke Adhikaar (DPDP Act 2023)','Your Rights (DPDP Act 2023)','आपके अधिकार (DPDP Act 2023)','तुमचे हक्क (DPDP Act 2023)','உங்கள் உரிமைகள் (DPDP Act 2023)','আপনার অধিকার (DPDP Act 2023)'],
['✓ Apna saara data dekhne ka haq (Right to Access)','✓ Right to view all your data (Right to Access)','✓ अपना पूरा डेटा देखने का अधिकार (Right to Access)','✓ तुमचा सर्व डेटा पाहण्याचा हक्क (Right to Access)','✓ உங்கள் அனைத்து தரவையும் பார்க்கும் உரிமை (Right to Access)','✓ আপনার সব ডেটা দেখার অধিকার (Right to Access)'],
['✓ Galat data sudharne ka haq (Right to Correction)','✓ Right to correct inaccurate data (Right to Correction)','✓ गलत डेटा सुधारने का अधिकार (Right to Correction)','✓ चुकीचा डेटा दुरुस्त करण्याचा हक्क (Right to Correction)','✓ தவறான தரவை திருத்தும் உரிமை (Right to Correction)','✓ ভুল ডেটা সংশোধনের অধিকার (Right to Correction)'],
['✓ Data delete karwane ka haq (Right to Erasure)','✓ Right to delete data (Right to Erasure)','✓ डेटा डिलीट करवाने का अधिकार (Right to Erasure)','✓ डेटा हटवण्याचा हक्क (Right to Erasure)','✓ தரவை நீக்கும் உரிமை (Right to Erasure)','✓ ডেটা মুছে ফেলার অধিকার (Right to Erasure)'],
['✓ Permission wapas lene ka haq (Withdraw Consent)','✓ Right to withdraw consent','✓ अनुमति वापस लेने का अधिकार','✓ संमती मागे घेण्याचा हक्क','✓ ஒப்புதலை திரும்பப் பெறும் உரிமை','✓ সম্মতি প্রত্যাহারের অধিকার'],
['✓ Data breach par suchna ka haq (72 hrs)','✓ Right to be notified of a data breach (72 hrs)','✓ डेटा उल्लंघन पर सूचना का अधिकार (72 घंटे)','✓ डेटा उल्लंघनाची सूचना मिळण्याचा हक्क (72 तास)','✓ தரவு மீறல் குறித்து அறிவிப்பு பெறும் உரிமை (72 மணி)','✓ ডেটা লঙ্ঘনের নোটিশ পাওয়ার অধিকার (৭২ ঘণ্টা)'],
['Medical Disclaimer:','Medical Disclaimer:','चिकित्सकीय अस्वीकरण:','वैद्यकीय अस्वीकरण:','மருத்துவ மறுப்பு:','চিকিৎসা দায়মুক্তি:'],
['MedGuide sirf general health','MedGuide only provides general health','MedGuide केवल सामान्य स्वास्थ्य','MedGuide फक्त सामान्य आरोग्य','MedGuide பொதுவான ஆரோக்கிய','MedGuide শুধু সাধারণ স্বাস্থ্য'],
['guidance','guidance','मार्गदर्शन','मार्गदर्शन','வழிகாட்டுதல்','নির্দেশনা'],
['deta hai — yeh','— it is','देता है — यह','देते — हे','— இது','দেয় — এটি'],
['diagnosis ya prescription nahi','not a diagnosis or prescription','निदान या प्रिस्क्रिप्शन नहीं','निदान किंवा प्रिस्क्रिप्शन नाही','நோயறிதல் அல்லது மருந்து பரிந்துரை அல்ல','রোগ নির্ণয় বা প্রেসক্রিপশন নয়'],
['hai. Koi bhi dawa doctor/pharmacist ki salah ke bina na lein. Emergency me turant','Do not take any medicine without a doctor/pharmacist’s advice. In an emergency, immediately','है। डॉक्टर/फार्मासिस्ट की सलाह के बिना कोई दवा न लें। आपातकाल में तुरंत','आहे. डॉक्टर/फार्मासिस्टच्या सल्ल्याशिवाय कोणतेही औषध घेऊ नका. आपत्कालात त्वरित','மருத்துவர்/மருந்தாளரின் ஆலோசனை இல்லாமல் எந்த மருந்தையும் எடுக்க வேண்டாம். அவசரத்தில் உடனே','। ডাক্তার/ফার্মাসিস্টের পরামর্শ ছাড়া কোনো ওষুধ নেবেন না। জরুরিতে সঙ্গে সঙ্গে'],
['par call karein.','call.','पर कॉल करें।','वर कॉल करा.','அழைக்கவும்.','কল করুন।'],
['Members','Members','सदस्य','सदस्य','உறுப்பினர்கள்','সদস্য'],
['Save','Save','सेव करें','सेव्ह करा','சேமிக்கவும்','সেভ করুন'],
['No conditions','No conditions','कोई बीमारी नहीं','कोणतीही स्थिती नाही','நோய் நிலை இல்லை','কোনো রোগ নেই'],
['Self','Self','स्वयं','स्वतः','சுயம்','নিজে'],['Father','Father','पिता','वडील','தந்தை','বাবা'],['Mother','Mother','माता','आई','தாய்','মা'],['Spouse','Spouse','जीवनसाथी','जोडीदार','துணைவர்','জীবনসঙ্গী'],['Son','Son','बेटा','मुलगा','மகன்','ছেলে'],['Daughter','Daughter','बेटी','मुलगी','மகள்','মেয়ে'],['Brother','Brother','भाई','भाऊ','சகோதரன்','ভাই'],['Sister','Sister','बहन','बहीण','சகோதரி','বোন'],['Grandparent','Grandparent','दादा-दादी/नाना-नानी','आजी-आजोबा','தாத்தா/பாட்டி','দাদা-দাদি/নানা-নানি'],['Other','Other','अन्य','इतर','மற்றவை','অন্যান্য'],
['Ambulance','Ambulance','एम्बुलेंस','रुग्णवाहिका','ஆம்புலன்ஸ்','অ্যাম্বুলেন্স'],['National Emergency','National Emergency','राष्ट्रीय आपातकाल','राष्ट्रीय आपत्काल','தேசிய அவசரம்','জাতীয় জরুরি'],['Women Helpline','Women Helpline','महिला हेल्पलाइन','महिला हेल्पलाइन','பெண்கள் உதவி எண்','নারী হেল্পলাইন'],['Child Helpline','Child Helpline','बाल हेल्पलाइन','बाल हेल्पलाइन','குழந்தைகள் உதவி எண்','শিশু হেল্পলাইন'],
['Chest pain? Chew aspirin only if advised','Chest pain? Chew aspirin only if advised','सीने में दर्द? एस्पिरिन केवल सलाह पर चबाएं','छातीत दुखत आहे? अॅस्पिरिन फक्त सल्ल्याने घ्या','மார்பு வலியா? ஆலோசனை இருந்தால் மட்டுமே aspirin மென்று கொள்ளவும்','বুকে ব্যথা? পরামর্শ থাকলেই অ্যাসপিরিন চিবান'],
['Put phone on speaker. Tell operator: location, what happened, age of patient.','Put the phone on speaker. Tell the operator your location, what happened and the patient’s age.','फोन स्पीकर पर रखें। ऑपरेटर को लोकेशन, क्या हुआ और मरीज की उम्र बताएं।','फोन स्पीकरवर ठेवा. ऑपरेटरला लोकेशन, काय झाले आणि रुग्णाचे वय सांगा.','தொலைபேசியை ஸ்பீக்கரில் வைக்கவும். இருப்பிடம், நடந்தது, நோயாளியின் வயதை கூறவும்.','ফোন স্পিকারে দিন। অপারেটরকে লোকেশন, কী হয়েছে এবং রোগীর বয়স বলুন।'],
['After accidents/falls, keep the person still unless in danger (fire, traffic).','After accidents/falls, keep the person still unless there is immediate danger (fire, traffic).','दुर्घटना/गिरने के बाद व्यक्ति को स्थिर रखें, जब तक तत्काल खतरा न हो।','अपघात/पडल्यानंतर व्यक्तीला स्थिर ठेवा, तातडीचा धोका नसल्यास.','விபத்து/விழுதல் பிறகு உடனடி ஆபத்து இல்லாவிட்டால் நபரை அசைக்க வேண்டாம்.','দুর্ঘটনা/পড়ে যাওয়ার পর তাৎক্ষণিক বিপদ না থাকলে ব্যক্তিকে নড়াবেন না।'],
['Press clean cloth firmly on the wound. Keep pressing till help arrives.','Press a clean cloth firmly on the wound and keep pressing until help arrives.','घाव पर साफ कपड़ा मजबूती से दबाएं और मदद आने तक दबाव बनाए रखें।','जखमेवर स्वच्छ कापड घट्ट दाबा आणि मदत येईपर्यंत दाब ठेवून द्या.','காயத்தின் மீது சுத்தமான துணியை உறுதியாக அழுத்தி உதவி வரும் வரை தொடரவும்.','ক্ষতের উপর পরিষ্কার কাপড় শক্ত করে চেপে ধরুন এবং সাহায্য আসা পর্যন্ত চাপ দিন।'],
['Sit the person down, loosen clothes. Aspirin only if a doctor/operator says so.','Sit the person down and loosen tight clothing. Give aspirin only if a doctor/operator advises it.','व्यक्ति को बैठाएं और तंग कपड़े ढीले करें। एस्पिरिन केवल डॉक्टर/ऑपरेटर की सलाह पर दें।','व्यक्तीला बसवा आणि घट्ट कपडे सैल करा. अॅस्पिरिन फक्त डॉक्टर/ऑपरेटरच्या सल्ल्याने द्या.','நபரை உட்கார வைத்து இறுக்கமான உடைகளை தளர்த்தவும். மருத்துவர்/ஆபரேட்டர் கூறினால் மட்டுமே aspirin கொடுக்கவும்.','ব্যক্তিকে বসান ও আঁটসাঁট পোশাক ঢিলা করুন। ডাক্তার/অপারেটর বললে তবেই অ্যাসপিরিন দিন।'],
];
finalRows.forEach((r) => add(...r));


const polishRows: Array<[string,string,string,string,string,string]> = [
['Save fail','Save failed','सेव विफल','सेव्ह अयशस्वी','சேமிப்பு தோல்வி','সেভ ব্যর্থ'],
['Save fail ho gaya.','Save failed.','सेव विफल हो गया।','सेव्ह अयशस्वी झाले.','சேமிப்பு தோல்வியடைந்தது.','সেভ ব্যর্থ হয়েছে।'],
['Booking fail','Booking failed','बुकिंग विफल','बुकिंग अयशस्वी','முன்பதிவு தோல்வி','বুকিং ব্যর্থ'],
['Scheduling fail','Scheduling failed','शेड्यूलिंग विफल','शेड्युलिंग अयशस्वी','அட்டவணை அமைப்பு தோல்வி','সময় নির্ধারণ ব্যর্থ'],
['Purchase fail','Purchase failed','खरीद विफल','खरेदी अयशस्वी','வாங்குதல் தோல்வி','ক্রয় ব্যর্থ'],
['Review fail','Review failed','रिव्यू विफल','रिव्ह्यू अयशस्वी','மதிப்புரை தோல்வி','রিভিউ ব্যর্থ'],
['SOS fail','SOS failed','SOS विफल','SOS अयशस्वी','SOS தோல்வி','SOS ব্যর্থ'],
['Hide password','Hide password','पासवर्ड छिपाएं','पासवर्ड लपवा','கடவுச்சொல்லை மறைக்கவும்','পাসওয়ার্ড লুকান'],
['Show password','Show password','पासवर्ड दिखाएं','पासवर्ड दाखवा','கடவுச்சொல்லை காட்டவும்','পাসওয়ার্ড দেখান'],
['Select language','Select language','भाषा चुनें','भाषा निवडा','மொழியைத் தேர்ந்தெடுக்கவும்','ভাষা নির্বাচন করুন'],
['Aapka naam','Your name','आपका नाम','तुमचे नाव','உங்கள் பெயர்','আপনার নাম'],
['Demo Mehmaan','Demo Guest','डेमो मेहमान','डेमो पाहुणा','டெமோ விருந்தினர்','ডেমো অতিথি'],
['Manual entry','Manual entry','मैनुअल एंट्री','मॅन्युअल नोंद','கைமுறை பதிவு','ম্যানুয়াল এন্ট্রি'],
['Verified ✓','Verified ✓','सत्यापित ✓','पडताळलेले ✓','சரிபார்க்கப்பட்டது ✓','যাচাইকৃত ✓'],
['BEST VALUE','BEST VALUE','सबसे अच्छा मूल्य','सर्वोत्तम मूल्य','சிறந்த மதிப்பு','সেরা মূল্য'],
['MOST POPULAR','MOST POPULAR','सबसे लोकप्रिय','सर्वाधिक लोकप्रिय','மிகப் பிரபலமான','সবচেয়ে জনপ্রিয়'],
['Care Plus','Care Plus','केयर प्लस','केअर प्लस','Care Plus','Care Plus'],
['1 video meeting × 10 min','1 video meeting × 10 min','1 वीडियो मीटिंग × 10 मिनट','1 व्हिडिओ भेट × 10 मिनिटे','1 வீடியோ சந்திப்பு × 10 நிமிடம்','১ ভিডিও মিটিং × ১০ মিনিট'],
['3 video meetings × 10 min · 30 din valid','3 video meetings × 10 min · valid for 30 days','3 वीडियो मीटिंग × 10 मिनट · 30 दिन वैध','3 व्हिडिओ भेटी × 10 मिनिटे · 30 दिवस वैध','3 வீடியோ சந்திப்புகள் × 10 நிமிடம் · 30 நாட்கள் செல்லுபடியாகும்','৩ ভিডিও মিটিং × ১০ মিনিট · ৩০ দিন বৈধ'],
['6 video meetings × 10 min · 60 din valid','6 video meetings × 10 min · valid for 60 days','6 वीडियो मीटिंग × 10 मिनट · 60 दिन वैध','6 व्हिडिओ भेटी × 10 मिनिटे · 60 दिवस वैध','6 வீடியோ சந்திப்புகள் × 10 நிமிடம் · 60 நாட்கள் செல்லுபடியாகும்','৬ ভিডিও মিটিং × ১০ মিনিট · ৬০ দিন বৈধ'],
['Doctor, vishay aur samay — teeno chunein.','Choose a doctor, topic and time.','डॉक्टर, विषय और समय — तीनों चुनें।','डॉक्टर, विषय आणि वेळ — तिन्ही निवडा.','மருத்துவர், தலைப்பு மற்றும் நேரம் — மூன்றையும் தேர்வு செய்யவும்.','ডাক্তার, বিষয় ও সময় — তিনটিই বেছে নিন।'],
['Pehle subscription pack lein — phir meeting schedule hogi.','Choose a subscription pack first, then schedule a meeting.','पहले सब्सक्रिप्शन पैक लें — फिर मीटिंग शेड्यूल करें।','आधी सबस्क्रिप्शन पॅक घ्या — मग भेट शेड्यूल करा.','முதலில் சந்தா பேக் வாங்குங்கள் — பின்னர் சந்திப்பை திட்டமிடுங்கள்.','আগে সাবস্ক্রিপশন প্যাক নিন — তারপর মিটিং সময় ঠিক করুন।'],
['Registered doctors se 10-minute video meetings — subscription pack par bhaari bachat. NMC Telemedicine Guidelines ka paalan.','10-minute video meetings with registered doctors — save more with subscription packs. NMC Telemedicine Guidelines followed.','पंजीकृत डॉक्टरों से 10-मिनट की वीडियो मीटिंग — सब्सक्रिप्शन पैक पर बड़ी बचत। NMC टेलीमेडिसिन दिशानिर्देशों का पालन।','नोंदणीकृत डॉक्टरांसोबत 10-मिनिटांच्या व्हिडिओ भेटी — सबस्क्रिप्शन पॅकमुळे मोठी बचत. NMC टेलिमेडिसिन मार्गदर्शक तत्त्वांचे पालन.','பதிவு செய்யப்பட்ட மருத்துவர்களுடன் 10 நிமிட வீடியோ ஆலோசனைகள் — சந்தா பேக்கில் அதிக சேமிப்பு. NMC தொலைமருத்துவ வழிகாட்டுதல்கள் பின்பற்றப்படுகின்றன.','নিবন্ধিত ডাক্তারদের সঙ্গে ১০ মিনিটের ভিডিও মিটিং — সাবস্ক্রিপশন প্যাকে বেশি সাশ্রয়। NMC টেলিমেডিসিন নির্দেশিকা অনুসরণ করা হয়।'],
['Rest, hydrate and monitor for 2–3 days.','Rest, stay hydrated and monitor for 2–3 days.','आराम करें, पानी पिएं और 2–3 दिन निगरानी रखें।','विश्रांती घ्या, पाणी प्या आणि 2–3 दिवस निरीक्षण करा.','ஓய்வு எடுத்து, தண்ணீர் குடித்து 2–3 நாட்கள் கவனிக்கவும்.','বিশ্রাম নিন, পানি পান করুন এবং ২–৩ দিন নজর রাখুন।'],
['Avoid self-medication beyond basic first-aid.','Avoid self-medication beyond basic first aid.','बुनियादी फर्स्ट-एड के अलावा खुद से दवा न लें।','मूलभूत प्रथमोपचारापलीकडे स्वतः औषध घेऊ नका.','அடிப்படை முதலுதவியைத் தவிர தானாக மருந்து எடுக்க வேண்டாம்.','প্রাথমিক চিকিৎসার বাইরে নিজে ওষুধ নেবেন না।'],
['Worsening signs = re-check triage or see a doctor.','If symptoms worsen, re-check triage or see a doctor.','लक्षण बिगड़ें तो ट्रायेज दोबारा जांचें या डॉक्टर को दिखाएं।','लक्षणे वाढल्यास ट्रायेज पुन्हा तपासा किंवा डॉक्टरांना भेटा.','அறிகுறிகள் மோசமானால் டிரையாஜை மீண்டும் பார்க்கவும் அல்லது மருத்துவரை அணுகவும்.','উপসর্গ খারাপ হলে ট্রায়াজ আবার দেখুন বা ডাক্তার দেখান।'],
['Carry your MedGuide health record + past reports.','Carry your MedGuide health record and past reports.','MedGuide हेल्थ रिकॉर्ड और पुरानी रिपोर्ट साथ रखें।','MedGuide आरोग्य रेकॉर्ड आणि जुने रिपोर्ट सोबत ठेवा.','MedGuide ஆரோக்கிய பதிவு மற்றும் பழைய அறிக்கைகளை எடுத்துச் செல்லவும்.','MedGuide স্বাস্থ্য রেকর্ড ও পুরনো রিপোর্ট সঙ্গে রাখুন।'],
['Note down: since when, what makes it better/worse, any medicines taken.','Note down when it started, what makes it better/worse and any medicines taken.','नोट करें: कब से है, किससे बेहतर/खराब होता है, कौन सी दवा ली है।','नोंदवा: केव्हापासून आहे, कशाने बरे/वाईट होते, कोणती औषधे घेतली.','எப்போது தொடங்கியது, எது மேம்படுத்துகிறது/மோசமாக்குகிறது, எடுத்த மருந்துகள் என்ன என்பதை பதிவு செய்யவும்.','নোট করুন: কবে থেকে, কী করলে ভালো/খারাপ হয়, কী ওষুধ নেওয়া হয়েছে।'],
['Avoid strong painkillers/antibiotics on your own before the visit.','Avoid strong painkillers or antibiotics on your own before the visit.','डॉक्टर से मिलने से पहले तेज दर्द निवारक/एंटीबायोटिक खुद से न लें।','भेटीपूर्वी जोरदार वेदनाशामक/अँटिबायोटिक्स स्वतः घेऊ नका.','மருத்துவரை சந்திப்பதற்கு முன் வலுவான வலி நிவாரணி/ஆண்டிபயாட்டிக் தானாக எடுக்க வேண்டாம்.','ডাক্তার দেখানোর আগে শক্তিশালী ব্যথার ওষুধ/অ্যান্টিবায়োটিক নিজে নেবেন না।'],
['Do NOT drive yourself — ask someone to take you to the nearest ER.','Do NOT drive yourself — ask someone to take you to the nearest ER.','खुद गाड़ी न चलाएं — किसी से नज़दीकी ER ले जाने को कहें।','स्वतः वाहन चालवू नका — कोणाला जवळच्या ER मध्ये घेऊन जायला सांगा.','நீங்களே வாகனம் ஓட்ட வேண்டாம் — அருகிலுள்ள ERக்கு யாராவது அழைத்துச் செல்லட்டும்.','নিজে গাড়ি চালাবেন না — কাউকে নিকটস্থ ER-এ নিয়ে যেতে বলুন।'],
['Keep the patient lying down, loosen tight clothes, stay calm.','Keep the patient lying down, loosen tight clothes and stay calm.','मरीज को लिटाएं, तंग कपड़े ढीले करें और शांत रहें।','रुग्णाला झोपवून ठेवा, घट्ट कपडे सैल करा आणि शांत राहा.','நோயாளியை படுக்க வைத்து இறுக்கமான உடைகளை தளர்த்தி அமைதியாக இருங்கள்.','রোগীকে শুইয়ে রাখুন, আঁটসাঁট পোশাক ঢিলা করুন এবং শান্ত থাকুন।'],
['Mild, short-duration issue with no warning signs — usually manageable with home self-care.','Mild, short-duration problem with no warning signs — usually manageable with home self-care.','हल्की, कम समय की समस्या और कोई चेतावनी संकेत नहीं — आमतौर पर घर पर देखभाल से संभल सकती है।','हलकी, अल्पकालीन समस्या आणि धोक्याची चिन्हे नाहीत — साधारणपणे घरी काळजी घेता येते.','லேசான, குறுகிய கால பிரச்சினை மற்றும் எச்சரிக்கை அறிகுறிகள் இல்லை — பொதுவாக வீட்டில் பராமரிக்கலாம்.','হালকা, স্বল্পমেয়াদি সমস্যা এবং সতর্কতার লক্ষণ নেই — সাধারণত বাড়িতে যত্নে সামলানো যায়।'],
['If symptoms worsen or cross 3 days, re-check here or visit a doctor.','If symptoms worsen or continue beyond 3 days, re-check here or visit a doctor.','लक्षण बिगड़ें या 3 दिन से ज्यादा रहें तो यहां दोबारा जांचें या डॉक्टर को दिखाएं।','लक्षणे वाढली किंवा 3 दिवसांपेक्षा जास्त राहिली तर पुन्हा तपासा किंवा डॉक्टरांना भेटा.','அறிகுறிகள் மோசமானால் அல்லது 3 நாட்களுக்கு மேல் நீடித்தால் மீண்டும் சரிபார்க்கவும் அல்லது மருத்துவரை அணுகவும்.','উপসর্গ খারাপ হলে বা ৩ দিনের বেশি থাকলে আবার পরীক্ষা করুন বা ডাক্তার দেখান।'],
['Naam + sahi 10-digit number likhein.','Enter a name and a valid 10-digit number.','नाम और सही 10-अंकों का नंबर लिखें।','नाव आणि वैध 10-अंकी नंबर लिहा.','பெயர் மற்றும் சரியான 10 இலக்க எண்ணை உள்ளிடவும்.','নাম ও সঠিক ১০ সংখ্যার নম্বর লিখুন।'],
['Delete this member?','Delete this member?','इस सदस्य को डिलीट करें?','हा सदस्य हटवायचा?','இந்த உறுப்பினரை நீக்கவா?','এই সদস্যকে মুছবেন?'],
['Yeh record delete karein?','Delete this record?','यह रिकॉर्ड डिलीट करें?','हा रेकॉर्ड हटवायचा?','இந்த பதிவை நீக்கவா?','এই রেকর্ড মুছবেন?'],
['Detail (optional)...','Details (optional)...','विवरण (वैकल्पिक)...','तपशील (ऐच्छिक)...','விவரங்கள் (விருப்பம்)...','বিস্তারিত (ঐচ্ছিক)...'],
['Title: e.g. Gala kharab, 2 din','Title: e.g. sore throat, 2 days','शीर्षक: जैसे गला खराब, 2 दिन','शीर्षक: उदा. घसा दुखणे, 2 दिवस','தலைப்பு: உதா. தொண்டை வலி, 2 நாட்கள்','শিরোনাম: যেমন গলা ব্যথা, ২ দিন'],
['Main surakshit hun — Resolve','I am safe — Resolve','मैं सुरक्षित हूं — समाधान करें','मी सुरक्षित आहे — निराकरण करा','நான் பாதுகாப்பாக இருக்கிறேன் — தீர்க்கவும்','আমি নিরাপদ — সমাধান করুন'],
['Abhi tak koi SOS nahi bheja. Surakshit rahein! 🙏','No SOS has been sent yet. Stay safe! 🙏','अभी तक कोई SOS नहीं भेजा गया। सुरक्षित रहें! 🙏','अजून SOS पाठवलेले नाही. सुरक्षित राहा! 🙏','இதுவரை SOS அனுப்பப்படவில்லை. பாதுகாப்பாக இருங்கள்! 🙏','এখনও কোনো SOS পাঠানো হয়নি। নিরাপদ থাকুন! 🙏'],
['Ek tap me contacts ko GPS alert + 108/112 direct dial + hospital pahunchne tak first-aid steps.','One tap sends a GPS alert to contacts + direct 108/112 dialing + first-aid steps until you reach hospital.','एक टैप में संपर्कों को GPS अलर्ट + 108/112 सीधे डायल + अस्पताल पहुंचने तक फर्स्ट-एड स्टेप्स।','एका टॅपमध्ये संपर्कांना GPS अलर्ट + 108/112 थेट डायल + हॉस्पिटलपर्यंत प्रथमोपचार सूचना.','ஒரு டாப் மூலம் தொடர்புகளுக்கு GPS எச்சரிக்கை + 108/112 நேரடி அழைப்பு + மருத்துவமனை செல்லும் வரை முதலுதவி வழிமுறைகள்.','এক ট্যাপে পরিচিতদের GPS সতর্কতা + 108/112 সরাসরি ডায়াল + হাসপাতালে পৌঁছানো পর্যন্ত প্রাথমিক চিকিৎসা ধাপ।'],
['Google login configure nahi hai. Supabase me Google provider enable karein.','Google login is not configured. Enable the Google provider in Supabase.','Google लॉगिन कॉन्फ़िगर नहीं है। Supabase में Google provider सक्षम करें।','Google लॉगिन कॉन्फिगर केलेले नाही. Supabase मध्ये Google provider सक्षम करा.','Google உள்நுழைவு அமைக்கப்படவில்லை. Supabase இல் Google provider ஐ இயக்கவும்.','Google লগইন কনফিগার করা নেই। Supabase-এ Google provider চালু করুন।'],
['Google login use karne ke liye pehle .env.local me apne Supabase URL aur anon/publishable key add karein.','To use Google login, first add your Supabase URL and anon/publishable key to .env.local.','Google लॉगिन के लिए पहले .env.local में Supabase URL और anon/publishable key जोड़ें।','Google लॉगिनसाठी आधी .env.local मध्ये Supabase URL आणि anon/publishable key जोडा.','Google உள்நுழைவிற்கு முதலில் .env.local இல் Supabase URL மற்றும் anon/publishable key சேர்க்கவும்.','Google লগইনের জন্য আগে .env.local-এ Supabase URL ও anon/publishable key যোগ করুন।'],
['Email/phone + password account ke liye pehle apna Supabase project connect karein (.env.local me URL aur anon key).','For email/phone + password accounts, connect your Supabase project first (URL and anon key in .env.local).','ईमेल/फोन + पासवर्ड अकाउंट के लिए पहले Supabase प्रोजेक्ट कनेक्ट करें (.env.local में URL और anon key)।','ईमेल/फोन + पासवर्ड खात्यासाठी आधी Supabase प्रोजेक्ट कनेक्ट करा (.env.local मध्ये URL आणि anon key).','மின்னஞ்சல்/தொலைபேசி + கடவுச்சொல் கணக்கிற்கு முதலில் Supabase திட்டத்தை இணைக்கவும் (.env.local இல் URL மற்றும் anon key).','ইমেইল/ফোন + পাসওয়ার্ড অ্যাকাউন্টের জন্য আগে Supabase প্রজেক্ট যুক্ত করুন (.env.local-এ URL ও anon key)।'],
];
polishRows.forEach((r) => add(...r));

const Context = createContext<{ lang: Lang; setLang: (l: Lang) => void; tr: (text: string) => string }>({
  lang: 'en', setLang: () => undefined, tr: (x) => x,
});

function dynamicTranslation(source: string, lang: Exclude<Lang, 'hinglish'>): string | null {
  const pick = (en: string, hi: string, mr: string, ta: string, bn: string) => ({ en, hi, mr, ta, bn })[lang];
  let m = source.match(/^Pain\/severity (\d+)\/10 is very high — needs urgent attention\.$/);
  if (m) return pick(`Pain/severity ${m[1]}/10 is very high — needs urgent attention.`, `दर्द/तीव्रता ${m[1]}/10 बहुत अधिक है — तुरंत ध्यान जरूरी है।`, `वेदना/तीव्रता ${m[1]}/10 खूप जास्त आहे — तातडीची काळजी आवश्यक.`, `வலி/தீவிரம் ${m[1]}/10 மிகவும் அதிகம் — உடனடி கவனம் தேவை.`, `ব্যথা/তীব্রতা ${m[1]}/10 খুব বেশি — দ্রুত চিকিৎসা দরকার।`);
  m = source.match(/^Pain\/severity (\d+)\/10 is high — a doctor should see you soon\.$/);
  if (m) return pick(`Pain/severity ${m[1]}/10 is high — a doctor should see you soon.`, `दर्द/तीव्रता ${m[1]}/10 अधिक है — जल्द डॉक्टर को दिखाएं।`, `वेदना/तीव्रता ${m[1]}/10 जास्त आहे — लवकर डॉक्टरांना भेटा.`, `வலி/தீவிரம் ${m[1]}/10 அதிகம் — விரைவில் மருத்துவரை அணுகவும்.`, `ব্যথা/তীব্রতা ${m[1]}/10 বেশি — দ্রুত ডাক্তার দেখান।`);
  m = source.match(/^Issue lasting (\d+)\+ days — get it checked by a doctor\.$/);
  if (m) return pick(`Issue lasting ${m[1]}+ days — get it checked by a doctor.`, `समस्या ${m[1]}+ दिन से है — डॉक्टर से जांच कराएं।`, `समस्या ${m[1]}+ दिवसांपासून आहे — डॉक्टरांकडून तपासणी करा.`, `பிரச்சினை ${m[1]}+ நாட்களாக உள்ளது — மருத்துவரிடம் பரிசோதிக்கவும்.`, `সমস্যা ${m[1]}+ দিন ধরে — ডাক্তার দেখান।`);
  m = source.match(/^(\d+) days with moderate pain \((\d+)\/10\) — doctor visit advised\.$/);
  if (m) return pick(`${m[1]} days with moderate pain (${m[2]}/10) — doctor visit advised.`, `${m[1]} दिन से मध्यम दर्द (${m[2]}/10) — डॉक्टर से मिलें।`, `${m[1]} दिवस मध्यम वेदना (${m[2]}/10) — डॉक्टरांना भेटण्याचा सल्ला.`, `${m[1]} நாட்களாக மிதமான வலி (${m[2]}/10) — மருத்துவரை அணுகவும்.`, `${m[1]} দিন ধরে মাঝারি ব্যথা (${m[2]}/10) — ডাক্তার দেখানোর পরামর্শ।`);
  if (source.startsWith('Emergency warning sign selected: ')) {
    const rest = source.slice('Emergency warning sign selected: '.length).split(', ').map((x) => translateStatic(x, lang)).join(', ');
    return pick(`Emergency warning sign selected: ${rest}`, `आपातकालीन चेतावनी संकेत चुना गया: ${rest}`, `आपत्कालीन धोक्याचे चिन्ह निवडले: ${rest}`, `அவசர எச்சரிக்கை அறிகுறி தேர்வு செய்யப்பட்டது: ${rest}`, `জরুরি সতর্কতার লক্ষণ নির্বাচিত: ${rest}`);
  }
  m = source.match(/^OTP dobara (\d+)s me bhejein$/);
  if (m) return pick(`Resend OTP in ${m[1]}s`, `${m[1]} सेकंड में OTP दोबारा भेजें`, `${m[1]} सेकंदात OTP पुन्हा पाठवा`, `${m[1]} வினாடிகளில் OTP மீண்டும் அனுப்பவும்`, `${m[1]} সেকেন্ড পরে OTP আবার পাঠান`);
  m = source.match(/^Voice note \((\d+)s\)$/);
  if (m) return pick(`Voice note (${m[1]}s)`, `वॉइस नोट (${m[1]} सेकंड)`, `व्हॉइस नोट (${m[1]} सेकंद)`, `குரல் குறிப்பு (${m[1]} வினாடி)`, `ভয়েস নোট (${m[1]} সেকেন্ড)`);
  return null;
}

export function translateStatic(text: string, lang: Lang): string {
  if (lang === 'hinglish') return text;
  const trimmed = text.trim();
  const row = P[trimmed];
  const translated = row ? row[lang] : dynamicTranslation(trimmed, lang);
  if (!translated) return text;
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const tail = text.match(/\s*$/)?.[0] ?? '';
  return lead + translated + tail;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('medguide_language') as Lang | null;
    return saved && LANGUAGES.some((x) => x.code === saved) ? saved : 'en';
  });
  const setLang = (next: Lang) => {
    localStorage.setItem('medguide_language', next);
    setLangState(next);
  };
  useEffect(() => { document.documentElement.lang = lang === 'hinglish' ? 'en' : lang; }, [lang]);
  const value = useMemo(() => ({ lang, setLang, tr: (text: string) => translateStatic(text, lang) }), [lang]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useLanguage = () => useContext(Context);

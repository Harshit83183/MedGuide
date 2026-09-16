export type Lang = 'en' | 'hi' | 'hinglish' | 'mr' | 'ta' | 'bn';

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'hinglish', label: 'Hinglish', native: 'Hinglish' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ्' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

export const T = {
  triageGreen: {
    en: 'Self-Care Zone', hi: 'सेल्फ-केयर ज़ोन', hinglish: 'Self-Care Zone', mr: 'सेल्फ-केअर झोन', ta: 'Self-Care Zone', bn: 'Self-Care Zone',
  } as Record<Lang, string>,
  triageYellow: {
    en: 'See a Doctor Soon', hi: 'जल्द डॉक्टर को दिखाएं', hinglish: 'Doctor ko dikhayein', mr: 'लवकर डॉक्टरांना भेटा', ta: 'Doctor-ai paarungal', bn: 'ডাক্তার দেখান',
  } as Record<Lang, string>,
  triageRed: {
    en: 'Emergency — Act Now', hi: 'आपातकाल — तुरंत कार्रवाई', hinglish: 'Emergency — Turant action lein', mr: 'आणीबाणी — तातडीने कृती करा', ta: 'Emergency — Udanadiyaai seyal', bn: 'জরুরি — এখনই ব্যবস্থা নিন',
  } as Record<Lang, string>,
};

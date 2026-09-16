export interface CommonProblem {
  key: string;
  icon: string;
  title: string;
  titleHi: string;
  tagline: string;
  questions: { key: string; q: string; qHi: string; type: 'days' | 'scale' | 'choice'; choices?: string[] }[];
}

export const COMMON_PROBLEMS: CommonProblem[] = [
  {
    key: 'fever', icon: 'Thermometer', title: 'Fever', titleHi: 'Bukhar',
    tagline: 'Body garam lag rahi hai? Pehle basic sawalon se samjhte hain.',
    questions: [
      { key: 'days', q: 'How many days has the fever lasted?', qHi: 'Kitne din se bukhar hai?', type: 'days' },
      { key: 'severity', q: 'Rate how bad you feel (1 = mild, 10 = worst)', qHi: 'Takleef 1 se 10 tak kitni hai?', type: 'scale' },
      { key: 'pattern', q: 'Fever pattern?', qHi: 'Bukhar kaisa hai?', type: 'choice', choices: ['Continuous', 'Comes & goes', 'Only at night', 'With chills/shivering'] },
    ],
  },
  {
    key: 'headache', icon: 'Brain', title: 'Headache', titleHi: 'Sir Dard',
    tagline: 'Sir me dard? Aao sahi wajah tak pahuche.',
    questions: [
      { key: 'days', q: 'How many days have you had the headache?', qHi: 'Kitne din se sir dard hai?', type: 'days' },
      { key: 'severity', q: 'Rate the pain from 1 to 10', qHi: 'Dard 1 se 10 tak kitna hai?', type: 'scale' },
      { key: 'pattern', q: 'Where is the pain?', qHi: 'Dard kahan hai?', type: 'choice', choices: ['Forehead / front', 'One side', 'Full head', 'Back of head + neck'] },
    ],
  },
  {
    key: 'cold', icon: 'Wind', title: 'Cold & Flu', titleHi: 'Sardi-Zukam',
    tagline: 'Naak beh rahi hai ya cheenk a rahi hai?',
    questions: [
      { key: 'days', q: 'How many days of cold/flu symptoms?', qHi: 'Kitne din se sardi hai?', type: 'days' },
      { key: 'severity', q: 'Rate discomfort from 1 to 10', qHi: 'Takleef 1 se 10 tak kitni hai?', type: 'scale' },
      { key: 'pattern', q: 'Main symptom?', qHi: 'Sabse zyada kya hai?', type: 'choice', choices: ['Runny nose', 'Blocked nose', 'Sneezing + watery eyes', 'Body ache + fever'] },
    ],
  },
  {
    key: 'stomach', icon: 'Cookie', title: 'Stomach Pain', titleHi: 'Pet Dard',
    tagline: 'Pet me dard, gas ya loose motion?',
    questions: [
      { key: 'days', q: 'How many days of stomach trouble?', qHi: 'Kitne din se pet kharab hai?', type: 'days' },
      { key: 'severity', q: 'Rate the pain from 1 to 10', qHi: 'Dard 1 se 10 tak kitna hai?', type: 'scale' },
      { key: 'pattern', q: 'What best describes it?', qHi: 'Kaisa lag raha hai?', type: 'choice', choices: ['Gas / bloating', 'Loose motion', 'Vomiting', 'Sharp stomach pain'] },
    ],
  },
  {
    key: 'cough', icon: 'AudioWaveform', title: 'Cough', titleHi: 'Khansi',
    tagline: 'Sukhi ya balgham wali khansi?',
    questions: [
      { key: 'days', q: 'How many days of cough?', qHi: 'Kitne din se khansi hai?', type: 'days' },
      { key: 'severity', q: 'Rate discomfort from 1 to 10', qHi: 'Takleef 1 se 10 tak kitni hai?', type: 'scale' },
      { key: 'pattern', q: 'Type of cough?', qHi: 'Khansi kaisi hai?', type: 'choice', choices: ['Dry cough', 'With phlegm', 'With wheezing', 'With chest pain'] },
    ],
  },
  {
    key: 'bodypain', icon: 'PersonStanding', title: 'Body Pain', titleHi: 'Badan Dard',
    tagline: 'Kamar, ghutna ya poore badan me dard?',
    questions: [
      { key: 'days', q: 'How many days of body pain?', qHi: 'Kitne din se dard hai?', type: 'days' },
      { key: 'severity', q: 'Rate the pain from 1 to 10', qHi: 'Dard 1 se 10 tak kitna hai?', type: 'scale' },
      { key: 'pattern', q: 'Where is the pain?', qHi: 'Dard kahan hai?', type: 'choice', choices: ['Back', 'Knee / joints', 'Neck / shoulder', 'Full body'] },
    ],
  },
  {
    key: 'skin', icon: 'Sparkles', title: 'Skin Issue', titleHi: 'Twacha Samasya',
    tagline: 'Rash, khujli ya daag-dhabbe?',
    questions: [
      { key: 'days', q: 'How many days of skin issue?', qHi: 'Kitne din se skin problem hai?', type: 'days' },
      { key: 'severity', q: 'Rate discomfort / itching 1 to 10', qHi: 'Khujli/takleef 1 se 10 tak?', type: 'scale' },
      { key: 'pattern', q: 'What do you see?', qHi: 'Kya dikh raha hai?', type: 'choice', choices: ['Red rash', 'Itching only', 'Pimples / boils', 'Dry patches'] },
    ],
  },
  {
    key: 'acidity', icon: 'Flame', title: 'Acidity / Gas', titleHi: 'Acidity / Gas',
    tagline: 'Seene me jalan ya khatte dakaar?',
    questions: [
      { key: 'days', q: 'How many days of acidity?', qHi: 'Kitne din se acidity hai?', type: 'days' },
      { key: 'severity', q: 'Rate burning/discomfort 1 to 10', qHi: 'Jalan 1 se 10 tak kitni hai?', type: 'scale' },
      { key: 'pattern', q: 'When is it worst?', qHi: 'Kab zyada hota hai?', type: 'choice', choices: ['After meals', 'Empty stomach', 'At night', 'With chest discomfort'] },
    ],
  },
];

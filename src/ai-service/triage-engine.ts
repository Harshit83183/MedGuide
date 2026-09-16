export type TriageLevel = 'green' | 'yellow' | 'red';

export interface TriageInput {
  days: number;
  severity: number; // 1-10
  flags: string[];
  problemKey?: string;
}

export interface TriageResult {
  level: TriageLevel;
  reasons: string[];
  selfCare: string[];
  seeDoctor: string[];
  emergency: string[];
}

export const RED_FLAGS: { key: string; label: string; labelHi: string }[] = [
  { key: 'chest-pain', label: 'Chest pain or pressure', labelHi: 'Seene me dard ya dabav' },
  { key: 'breath', label: 'Trouble breathing / shortness of breath', labelHi: 'Saans lene me dikkat' },
  { key: 'faint', label: 'Fainting / fainted recently', labelHi: 'Behosh hona' },
  { key: 'bleeding', label: 'Heavy or uncontrolled bleeding', labelHi: 'Zyada khoon behna' },
  { key: 'stroke', label: 'Face droop, slurred speech, one-side weakness', labelHi: 'Chehra tedha, bolne me dikkat' },
  { key: 'severe-allergy', label: 'Swelling of lips/tongue, severe allergy', labelHi: 'Honth/jeebh me sujan, allergy' },
  { key: 'head-injury', label: 'Head injury / accident', labelHi: 'Sir me chot / accident' },
  { key: 'high-fever', label: 'Fever above 103°F / 39.4°C', labelHi: '103°F se zyada bukhar' },
  { key: 'dehydration', label: 'No urine for 8+ hours, severe dehydration', labelHi: '8+ ghante se peshab nahi' },
  { key: 'pregnancy', label: 'Pregnant + bleeding / severe pain', labelHi: 'Pregnancy + bleeding / tez dard' },
  { key: 'infant', label: 'Baby under 3 months with fever', labelHi: '3 mahine se chhota bachcha + bukhar' },
  { key: 'suicide', label: 'Thoughts of self-harm', labelHi: 'Khud ko nuksan ke vichar' },
];

export function triage(input: TriageInput): TriageResult {
  const { days, severity, flags } = input;
  const reasons: string[] = [];
  let level: TriageLevel = 'green';

  if (flags.length > 0) {
    level = 'red';
    reasons.push('Emergency warning sign selected: ' + flags.map((f) => RED_FLAGS.find((r) => r.key === f)?.label || f).join(', '));
  }
  if (severity >= 9) {
    level = 'red';
    reasons.push('Pain/severity ' + severity + '/10 is very high — needs urgent attention.');
  } else if (severity >= 7 && level !== 'red') {
    level = 'yellow';
    reasons.push('Pain/severity ' + severity + '/10 is high — a doctor should see you soon.');
  }
  if (days >= 7 && level === 'green') {
    level = 'yellow';
    reasons.push('Issue lasting ' + days + '+ days — get it checked by a doctor.');
  }
  if (days >= 3 && severity >= 5 && level === 'green') {
    level = 'yellow';
    reasons.push(days + ' days with moderate pain (' + severity + '/10) — doctor visit advised.');
  }
  if (level === 'green') {
    reasons.push('Mild, short-duration issue with no warning signs — usually manageable with home self-care.');
  }

  return {
    level,
    reasons,
    selfCare: [
      'Rest well and drink plenty of clean water / ORS-style fluids.',
      'Eat light, home-cooked food; avoid junk and alcohol.',
      'Track temperature / symptoms twice a day for 2–3 days.',
      'Do NOT self-medicate with antibiotics or steroids without a doctor.',
      'If symptoms worsen or cross 3 days, re-check here or visit a doctor.',
    ],
    seeDoctor: [
      'Book a verified clinic or video consult within 24–48 hours.',
      'Carry your MedGuide health record + past reports.',
      'Note down: since when, what makes it better/worse, any medicines taken.',
      'Avoid strong painkillers/antibiotics on your own before the visit.',
    ],
    emergency: [
      'Call 108 (ambulance) or 112 (national emergency) RIGHT NOW.',
      'Use MedGuide 1-Tap SOS to alert your emergency contacts.',
      'Do NOT drive yourself — ask someone to take you to the nearest ER.',
      'Keep the patient lying down, loosen tight clothes, stay calm.',
    ],
  };
}

export function problemAdvice(problemKey: string): string[] {
  const map: Record<string, string[]> = {
    fever: ['Check temperature every 6 hours and note it.', 'Lukewarm sponge + fluids; rest in a cool room.', 'See a doctor if fever crosses 3 days or 102°F.'],
    headache: ['Rest in a dark, quiet room; hydrate well.', 'Check sleep, screen time and missed meals.', 'Sudden worst-ever headache = emergency, call 108.'],
    cold: ['Steam inhalation 2–3 times a day.', 'Warm fluids, honey-ginger (adults), rest.', 'Breathing difficulty or 10+ days = see a doctor.'],
    stomach: ['ORS / nimbu-paani in small sips.', 'Khichdi, curd-rice; avoid spicy/oily food.', 'Blood in stool/vomit or severe pain = emergency.'],
    cough: ['Warm water, steam; avoid cold drinks and dust.', 'Honey (1+ year age) can soothe throat.', 'Blood in cough or breathlessness = see doctor fast.'],
    bodypain: ['Gentle stretching + warm compress.', 'Fix posture and sleep position.', 'Pain after injury with swelling = get an X-ray opinion.'],
    skin: ['Do NOT scratch; keep area clean and dry.', 'Avoid new cosmetics/steroid creams on your own.', 'Spreading redness with fever = see a dermatologist.'],
    acidity: ['Small frequent meals; avoid late-night eating.', 'Less tea/coffee/spicy food for a few days.', 'Chest-pain-like burning with sweating = emergency.'],
  };
  return map[problemKey] || ['Rest, hydrate and monitor for 2–3 days.', 'Avoid self-medication beyond basic first-aid.', 'Worsening signs = re-check triage or see a doctor.'];
}

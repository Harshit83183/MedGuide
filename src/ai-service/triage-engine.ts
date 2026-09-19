export type TriageLevel = 'green' | 'yellow' | 'red';

export interface TriageInput {
  text?: string;
  days: number;
  severity: number;
  flags: string[];
  problemKey?: string;
}

export interface PossibleCondition {
  name: string;
  matchScore: number;
  matchedSymptoms: string[];
  description: string;
}

export interface TriageResult {
  level: TriageLevel;
  reasons: string[];
  selfCare: string[];
  seeDoctor: string[];
  emergency: string[];
  possibleConditions: PossibleCondition[];
  recommendation: string;
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

type ConditionRule = {
  name: string;
  symptoms: string[][];
  description: string;
  selfCare: string[];
  doctorAdvice: string;
};

const CONDITIONS: ConditionRule[] = [
  {
    name: 'Common cold / viral upper respiratory infection',
    symptoms: [
      ['cold', 'sardi', 'zukam', 'runny nose', 'naak beh'],
      ['sneeze', 'sneezing', 'cheenk'],
      ['blocked nose', 'naak band'],
      ['sore throat', 'gala kharab', 'gale me dard'],
    ],
    description: 'Cold-like symptoms can occur with a viral upper respiratory infection.',
    selfCare: [
      'Rest and drink enough fluids.',
      'Warm fluids may help with throat discomfort.',
      'Saline nasal drops or steam may help nasal congestion.',
      'Monitor for high fever, breathing difficulty or worsening symptoms.',
    ],
    doctorAdvice: 'If symptoms are severe, keep worsening, or persist beyond about 7–10 days, get medical advice.',
  },
  {
    name: 'Flu-like viral illness',
    symptoms: [
      ['fever', 'bukhar', 'temperature'],
      ['body pain', 'body ache', 'badan dard'],
      ['chills', 'shivering', 'thand lag'],
      ['tired', 'fatigue', 'weakness', 'kamzori'],
      ['headache', 'sir dard'],
      ['cough', 'khansi'],
    ],
    description: 'Fever with body aches, fatigue, headache or cough can occur with a flu-like viral illness.',
    selfCare: [
      'Rest and maintain good fluid intake.',
      'Check temperature periodically.',
      'Eat light meals as tolerated.',
      'Avoid antibiotics unless prescribed by a clinician.',
    ],
    doctorAdvice: 'Seek medical advice if fever is persistent, symptoms are worsening, or you are in a high-risk group.',
  },
  {
    name: 'Tension-type headache',
    symptoms: [
      ['headache', 'sir dard', 'head pain'],
      ['stress', 'tension'],
      ['screen', 'screen time'],
      ['neck pain', 'gardan dard'],
      ['sleep', 'neend'],
    ],
    description: 'Headache associated with stress, poor sleep, prolonged screen use or neck tension may fit a tension-type pattern.',
    selfCare: [
      'Rest in a quiet environment.',
      'Drink adequate water and avoid skipping meals.',
      'Take breaks from screens.',
      'Gentle neck and shoulder relaxation may help.',
    ],
    doctorAdvice: 'See a clinician for recurrent, persistent or unusually severe headaches.',
  },
  {
    name: 'Migraine-like headache',
    symptoms: [
      ['headache', 'sir dard'],
      ['one side', 'ek taraf'],
      ['light sensitivity', 'roshni', 'light se'],
      ['sound sensitivity', 'awaz se'],
      ['nausea', 'ulti jaisa', 'ji michlana'],
      ['vomiting', 'ulti'],
    ],
    description: 'One-sided headache with nausea or sensitivity to light or sound can occur with migraine.',
    selfCare: [
      'Rest in a dark and quiet room.',
      'Stay hydrated and avoid skipping meals.',
      'Reduce screen exposure during the headache.',
      'Note possible triggers and recurrence.',
    ],
    doctorAdvice: 'A clinician should assess new, frequent or disabling headaches.',
  },
  {
    name: 'Gastroenteritis / stomach infection pattern',
    symptoms: [
      ['loose motion', 'diarrhea', 'dast'],
      ['vomiting', 'ulti'],
      ['stomach pain', 'pet dard'],
      ['nausea', 'ji michlana'],
      ['fever', 'bukhar'],
    ],
    description: 'Loose stools, vomiting and abdominal discomfort can occur with gastroenteritis.',
    selfCare: [
      'Take frequent small sips of water or ORS.',
      'Eat light food as tolerated.',
      'Watch for signs of dehydration.',
      'Avoid unnecessary antibiotics or anti-diarrheal medicines without medical advice.',
    ],
    doctorAdvice: 'Seek care for persistent vomiting, dehydration, blood in stool, high fever or severe abdominal pain.',
  },
  {
    name: 'Acidity / reflux pattern',
    symptoms: [
      ['acidity', 'gas'],
      ['heartburn', 'jalan'],
      ['sour burp', 'khatte dakar', 'khatta'],
      ['after food', 'after meal', 'khane ke baad'],
      ['reflux'],
    ],
    description: 'Burning or sour reflux related to meals may fit an acidity or reflux pattern.',
    selfCare: [
      'Prefer smaller meals for a few days.',
      'Avoid lying down immediately after eating.',
      'Reduce foods or drinks that clearly trigger symptoms.',
      'Avoid very late-night meals.',
    ],
    doctorAdvice: 'Frequent or persistent symptoms should be discussed with a clinician.',
  },
  {
    name: 'Allergic rhinitis pattern',
    symptoms: [
      ['sneezing', 'cheenk'],
      ['watery eyes', 'aankh se pani'],
      ['itchy eyes', 'aankh me khujli'],
      ['runny nose', 'naak beh'],
      ['allergy'],
    ],
    description: 'Repeated sneezing with watery or itchy eyes and a runny nose may fit an allergy pattern.',
    selfCare: [
      'Try to avoid known dust, smoke or pollen triggers.',
      'Keep the room and bedding relatively dust-free.',
      'Saline nasal rinsing may help some people.',
      'Monitor for wheezing or breathing difficulty.',
    ],
    doctorAdvice: 'Persistent or troublesome allergy symptoms can be evaluated by a clinician.',
  },
  {
    name: 'Respiratory infection / cough pattern',
    symptoms: [
      ['cough', 'khansi'],
      ['phlegm', 'balgam'],
      ['sore throat', 'gala kharab'],
      ['fever', 'bukhar'],
      ['cold', 'sardi'],
    ],
    description: 'Cough with throat, cold or fever symptoms can occur with a respiratory infection.',
    selfCare: [
      'Drink warm fluids and stay hydrated.',
      'Avoid smoke and other airway irritants.',
      'Rest and monitor temperature.',
      'Honey may soothe cough in people older than one year.',
    ],
    doctorAdvice: 'Seek medical assessment for persistent fever, worsening cough, wheezing, chest pain or breathing difficulty.',
  },
  {
    name: 'Muscle strain / musculoskeletal pain pattern',
    symptoms: [
      ['body pain', 'badan dard'],
      ['back pain', 'kamar dard'],
      ['neck pain', 'gardan dard'],
      ['shoulder pain', 'kandhe me dard'],
      ['muscle pain', 'muscle'],
      ['exercise', 'gym', 'workout'],
    ],
    description: 'Localized pain after exertion or posture-related strain may be musculoskeletal.',
    selfCare: [
      'Rest the painful area from heavy activity.',
      'Gentle movement may be preferable to prolonged complete bed rest.',
      'Use a warm or cold compress depending on what feels comfortable.',
      'Avoid heavy lifting until symptoms improve.',
    ],
    doctorAdvice: 'Get assessed if pain follows significant injury, causes weakness/numbness, or does not improve.',
  },
  {
    name: 'Skin irritation / dermatitis pattern',
    symptoms: [
      ['rash', 'rashes', 'daane'],
      ['itching', 'khujli'],
      ['redness', 'lal'],
      ['dry skin', 'dry patches'],
      ['skin'],
    ],
    description: 'Itching, redness or dry patches may occur with skin irritation or dermatitis.',
    selfCare: [
      'Avoid scratching the affected area.',
      'Keep the skin clean and avoid new irritating products.',
      'Avoid using steroid or antibiotic creams without medical advice.',
      'Monitor whether the rash is spreading.',
    ],
    doctorAdvice: 'See a clinician if the rash spreads quickly, becomes painful, develops pus, or occurs with fever.',
  },
];

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.,!?;:()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function analyseConditions(text: string): PossibleCondition[] {
  const source = normalise(text);

  if (!source) return [];

  const matches = CONDITIONS.map((condition) => {
    const matchedSymptoms: string[] = [];

    for (const group of condition.symptoms) {
      const match = group.find((term) => source.includes(term.toLowerCase()));

      if (match) {
        matchedSymptoms.push(match);
      }
    }

    const total = condition.symptoms.length;
    const matched = matchedSymptoms.length;

    if (matched === 0) return null;

    const score = Math.min(
      95,
      Math.round(25 + (matched / total) * 70)
    );

    return {
      name: condition.name,
      matchScore: score,
      matchedSymptoms,
      description: condition.description,
    };
  })
    .filter((item): item is PossibleCondition => item !== null)
    .sort((a, b) => b.matchScore - a.matchScore);

  return matches.slice(0, 3);
}

function detectTextRedFlags(text: string): string[] {
  const source = normalise(text);
  const found: string[] = [];

  const patterns: Record<string, string[]> = {
    'chest-pain': [
      'chest pain',
      'chest pressure',
      'seene me dard',
      'seene mein dard',
      'seene me dabav',
    ],
    breath: [
      'difficulty breathing',
      'trouble breathing',
      'shortness of breath',
      'saans lene me dikkat',
      'saans nahi',
      'breathlessness',
    ],
    faint: [
      'fainted',
      'fainting',
      'behosh',
      'unconscious',
    ],
    bleeding: [
      'heavy bleeding',
      'uncontrolled bleeding',
      'bahut khoon',
      'zyada khoon',
    ],
    stroke: [
      'face droop',
      'slurred speech',
      'one side weakness',
      'bolne me dikkat',
      'ek taraf kamzori',
    ],
    'severe-allergy': [
      'tongue swelling',
      'lip swelling',
      'honth me sujan',
      'jeebh me sujan',
    ],
    'head-injury': [
      'head injury',
      'sir me chot',
      'accident',
    ],
    dehydration: [
      'no urine',
      'peshab nahi',
      'severe dehydration',
    ],
    suicide: [
      'self harm',
      'kill myself',
      'suicide',
      'khud ko nuksan',
    ],
  };

  Object.entries(patterns).forEach(([key, terms]) => {
    if (terms.some((term) => source.includes(term))) {
      found.push(key);
    }
  });

  return found;
}

function getConditionCare(
  possibleConditions: PossibleCondition[]
): string[] {
  if (possibleConditions.length === 0) {
    return [
      'Rest and maintain adequate fluid intake.',
      'Monitor how your symptoms change.',
      'Avoid taking antibiotics or steroids without medical advice.',
      'If symptoms persist or worsen, consult a qualified clinician.',
    ];
  }

  const condition = CONDITIONS.find(
    (item) => item.name === possibleConditions[0].name
  );

  return condition?.selfCare ?? [];
}

function getDoctorAdvice(
  possibleConditions: PossibleCondition[]
): string {
  if (possibleConditions.length === 0) {
    return 'Your description does not match the available symptom patterns confidently. A clinician can assess it properly if it persists or concerns you.';
  }

  const condition = CONDITIONS.find(
    (item) => item.name === possibleConditions[0].name
  );

  return (
    condition?.doctorAdvice ??
    'If symptoms persist or worsen, consult a qualified clinician.'
  );
}

export function triage(input: TriageInput): TriageResult {
  const {
    text = '',
    days,
    severity,
    flags,
  } = input;

  const reasons: string[] = [];
  const textFlags = detectTextRedFlags(text);
  const allFlags = Array.from(new Set([...flags, ...textFlags]));
  const possibleConditions = analyseConditions(text);

  let level: TriageLevel = 'green';

  if (allFlags.length > 0) {
    level = 'red';

    reasons.push(
      'Your description contains a warning sign that may need urgent medical assessment.'
    );
  }

  if (severity >= 9) {
    level = 'red';
    reasons.push(
      'Reported severity is very high (' + severity + '/10).'
    );
  } else if (severity >= 7 && level !== 'red') {
    level = 'yellow';
    reasons.push(
      'Reported severity is high (' + severity + '/10).'
    );
  }

  if (days >= 7 && level === 'green') {
    level = 'yellow';
    reasons.push(
      'Symptoms have lasted about ' + days + ' days.'
    );
  }

  if (days >= 3 && severity >= 5 && level === 'green') {
    level = 'yellow';
    reasons.push(
      'Symptoms have continued for several days with moderate severity.'
    );
  }

  if (possibleConditions.length > 0) {
    const best = possibleConditions[0];

    reasons.push(
      'Your description matched symptoms associated with ' +
        best.name +
        ': ' +
        best.matchedSymptoms.join(', ') +
        '.'
    );
  } else {
    reasons.push(
      'There is not enough specific symptom information for a useful pattern match.'
    );
  }

  if (level === 'green') {
    reasons.push(
      'No emergency warning sign was detected from the information provided.'
    );
  }

  const conditionCare = getConditionCare(possibleConditions);
  const doctorAdvice = getDoctorAdvice(possibleConditions);

  return {
    level,
    reasons,
    possibleConditions,
    recommendation: doctorAdvice,
    selfCare: conditionCare,
    seeDoctor: [
      doctorAdvice,
      'Tell the clinician when the symptoms started and how they have changed.',
      'Mention medicines already taken, allergies and relevant medical history.',
      'Seek urgent help sooner if a warning sign develops.',
    ],
    emergency: [
      'Seek emergency medical help now.',
      'Call 112 or the appropriate local emergency service if immediate assistance is needed.',
      'Do not drive yourself if you are faint, severely unwell or having breathing/chest symptoms.',
      'Stay with another person while arranging emergency care when possible.',
    ],
  };
}

export function problemAdvice(problemKey: string): string[] {
  const map: Record<string, string[]> = {
    fever: [
      'Check temperature periodically and keep a note of it.',
      'Rest and maintain adequate fluid intake.',
      'Persistent or very high fever should be medically assessed.',
    ],
    headache: [
      'Rest, hydrate and avoid skipping meals.',
      'Reduce screen exposure during the headache.',
      'A sudden extremely severe or unusual headache needs urgent assessment.',
    ],
    cold: [
      'Rest and drink warm fluids.',
      'Saline nasal drops or steam may help congestion.',
      'Seek care if breathing becomes difficult or symptoms keep worsening.',
    ],
    stomach: [
      'Use water or ORS in small frequent sips if fluid is being lost.',
      'Eat light food as tolerated.',
      'Blood in stool/vomit, dehydration or severe abdominal pain needs medical attention.',
    ],
    cough: [
      'Stay hydrated and avoid smoke or dust.',
      'Warm fluids may soothe throat irritation.',
      'Breathing difficulty, chest pain or coughing blood needs prompt assessment.',
    ],
    bodypain: [
      'Rest from strenuous activity and stay hydrated.',
      'Gentle movement and a warm or cold compress may help.',
      'Severe pain after injury or pain with weakness/numbness should be assessed.',
    ],
    skin: [
      'Avoid scratching and irritating skin products.',
      'Keep the affected area clean.',
      'Rapidly spreading rash, fever, severe swelling or breathing trouble needs medical attention.',
    ],
    acidity: [
      'Eat smaller meals and avoid lying down immediately after food.',
      'Avoid foods that clearly trigger symptoms.',
      'Chest pressure, sweating or breathing difficulty should not be assumed to be acidity.',
    ],
  };

  return map[problemKey] || [
    'Monitor your symptoms and stay adequately hydrated.',
    'Avoid unnecessary self-medication.',
    'Seek medical advice if symptoms persist, worsen or concern you.',
  ];
}
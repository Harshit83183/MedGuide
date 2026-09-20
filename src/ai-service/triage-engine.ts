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
  needsMoreInfo: boolean;
  followUpQuestions: string[];
}

export const RED_FLAGS: {
  key: string;
  label: string;
  labelHi: string;
}[] = [
  {
    key: 'chest-pain',
    label: 'Severe chest pain or pressure',
    labelHi: 'Seene me tez dard ya dabav',
  },
  {
    key: 'breath',
    label: 'Severe trouble breathing',
    labelHi: 'Saans lene me bahut dikkat',
  },
  {
    key: 'faint',
    label: 'Fainting or unconsciousness',
    labelHi: 'Behosh hona',
  },
  {
    key: 'bleeding',
    label: 'Heavy or uncontrolled bleeding',
    labelHi: 'Bahut zyada khoon behna',
  },
  {
    key: 'stroke',
    label: 'Possible stroke symptoms',
    labelHi: 'Stroke jaise lakshan',
  },
  {
    key: 'severe-allergy',
    label: 'Severe allergic reaction',
    labelHi: 'Gambhir allergy',
  },
  {
    key: 'head-injury',
    label: 'Serious head injury',
    labelHi: 'Sir me gambhir chot',
  },
  {
    key: 'high-fever',
    label: 'Very high fever',
    labelHi: 'Bahut tez bukhar',
  },
  {
    key: 'dehydration',
    label: 'Severe dehydration',
    labelHi: 'Sharir me pani ki gambhir kami',
  },
  {
    key: 'pregnancy',
    label: 'Pregnancy with bleeding or severe pain',
    labelHi: 'Pregnancy ke saath bleeding ya tez dard',
  },
  {
    key: 'infant',
    label: 'Baby under 3 months with fever',
    labelHi: '3 mahine se chhote bachche ko bukhar',
  },
  {
    key: 'suicide',
    label: 'Thoughts of self-harm',
    labelHi: 'Khud ko nuksan pahunchane ke vichar',
  },
];

type ConditionRule = {
  name: string;
  groups: string[][];
  description: string;
  selfCare: string[];
  doctorAdvice: string;
};

const CONDITIONS: ConditionRule[] = [
  {
    name: 'Flu-like viral illness',
    groups: [
      ['fever', 'bukhar', 'temperature', 'taap'],
      ['body pain', 'body ache', 'badan dard', 'shareer dard'],
      ['chills', 'shivering', 'thand lag', 'kapkapi'],
      ['headache', 'sir dard'],
      ['fatigue', 'weakness', 'kamzori', 'thakan'],
      ['cough', 'khansi'],
    ],
    description:
      'Fever ke saath body ache, chills, headache, weakness ya cough viral flu-like illness me ho sakte hain.',
    selfCare: [
      'Aaram karein aur fluids lete rahein.',
      'Temperature monitor karein.',
      'Halka aur easily digestible khana lein.',
      'Antibiotics bina doctor ki advice ke na lein.',
    ],
    doctorAdvice:
      'Bukhar persistent ho, symptoms worsen hon, ya aap high-risk patient hon to doctor se assessment karayein.',
  },
  {
    name: 'Common cold / upper respiratory infection',
    groups: [
      ['cold', 'sardi', 'zukam'],
      ['runny nose', 'naak beh'],
      ['blocked nose', 'naak band'],
      ['sneezing', 'cheenk'],
      ['sore throat', 'gala kharab', 'gale me dard'],
      ['cough', 'khansi'],
    ],
    description:
      'Naak, gala, sneezing aur cough wale symptoms common cold ya upper respiratory infection me ho sakte hain.',
    selfCare: [
      'Aaram aur adequate fluids lein.',
      'Warm fluids throat discomfort me help kar sakte hain.',
      'Nasal congestion ke liye saline nasal rinse helpful ho sakta hai.',
      'Symptoms worsen hon to medical advice lein.',
    ],
    doctorAdvice:
      'Breathing problem, persistent fever, worsening symptoms ya prolonged illness ho to doctor ko dikhayein.',
  },
  {
    name: 'Migraine-like headache',
    groups: [
      ['headache', 'sir dard'],
      ['one side', 'ek taraf', 'aadhe sir'],
      ['light sensitivity', 'roshni se', 'light se'],
      ['sound sensitivity', 'awaz se', 'sound se'],
      ['nausea', 'ji michlana', 'ulti jaisa'],
      ['vomiting', 'ulti'],
    ],
    description:
      'One-sided headache ke saath nausea ya light/sound sensitivity migraine pattern me ho sakti hai.',
    selfCare: [
      'Quiet aur dark room me rest karein.',
      'Pani lete rahein aur meals skip na karein.',
      'Screen exposure kam karein.',
      'Triggers aur headache frequency note karein.',
    ],
    doctorAdvice:
      'Naya, frequent, unusual ya disabling headache doctor se evaluate karayein.',
  },
  {
    name: 'Tension-type headache',
    groups: [
      ['headache', 'sir dard'],
      ['stress', 'tension'],
      ['screen time', 'screen'],
      ['neck pain', 'gardan dard'],
      ['poor sleep', 'neend kam', 'neend nahi'],
    ],
    description:
      'Stress, poor sleep, screen use ya neck tension ke saath headache tension-type pattern me ho sakta hai.',
    selfCare: [
      'Quiet environment me rest karein.',
      'Hydration maintain karein.',
      'Regular screen breaks lein.',
      'Neck aur shoulder ko gently relax karein.',
    ],
    doctorAdvice:
      'Repeated, persistent ya unusually severe headache ko doctor se evaluate karayein.',
  },
  {
    name: 'Gastroenteritis / stomach infection pattern',
    groups: [
      ['diarrhea', 'loose motion', 'dast'],
      ['vomiting', 'ulti'],
      ['stomach pain', 'pet dard', 'pet me dard'],
      ['nausea', 'ji michlana'],
      ['fever', 'bukhar'],
    ],
    description:
      'Loose motion, vomiting, nausea aur stomach pain gastroenteritis ya stomach infection me ho sakte hain.',
    selfCare: [
      'ORS ya fluids small frequent sips me lein.',
      'Halka khana lein.',
      'Dehydration ke signs monitor karein.',
      'Bina medical advice antibiotics na lein.',
    ],
    doctorAdvice:
      'Persistent vomiting, dehydration, blood in stool, high fever ya severe abdominal pain me doctor ko dikhayein.',
  },
  {
    name: 'Acidity / reflux pattern',
    groups: [
      ['acidity', 'gas'],
      ['heartburn', 'seene me jalan', 'chest burning'],
      ['sour burp', 'khatte dakar', 'khatta dakar'],
      ['after food', 'after meal', 'khane ke baad'],
      ['reflux'],
    ],
    description:
      'Meal-related burning, sour burps aur reflux acidity/GERD type pattern me ho sakte hain.',
    selfCare: [
      'Chhote meals lein.',
      'Khane ke turant baad na letein.',
      'Trigger foods aur drinks avoid karein.',
      'Late-night heavy meals avoid karein.',
    ],
    doctorAdvice:
      'Frequent, persistent ya worsening reflux symptoms ko doctor se evaluate karayein.',
  },
  {
    name: 'Allergic rhinitis pattern',
    groups: [
      ['sneezing', 'cheenk'],
      ['watery eyes', 'aankh se pani'],
      ['itchy eyes', 'aankh me khujli'],
      ['runny nose', 'naak beh'],
      ['allergy'],
    ],
    description:
      'Repeated sneezing, watery/itchy eyes aur runny nose allergy pattern me ho sakte hain.',
    selfCare: [
      'Dust, smoke aur known triggers avoid karein.',
      'Room aur bedding clean rakhein.',
      'Saline nasal rinse helpful ho sakta hai.',
      'Breathing symptoms ko monitor karein.',
    ],
    doctorAdvice:
      'Persistent ya troublesome allergy symptoms ke liye clinician se advice lein.',
  },
  {
    name: 'Respiratory infection pattern',
    groups: [
      ['cough', 'khansi'],
      ['phlegm', 'balgam', 'sputum'],
      ['sore throat', 'gala kharab', 'gale me dard'],
      ['fever', 'bukhar'],
      ['cold', 'sardi'],
    ],
    description:
      'Cough ke saath fever, phlegm, cold ya sore throat respiratory infection pattern me ho sakte hain.',
    selfCare: [
      'Warm fluids aur adequate hydration rakhein.',
      'Smoke aur dust avoid karein.',
      'Temperature monitor karein.',
      'Rest karein.',
    ],
    doctorAdvice:
      'Persistent fever, worsening cough, wheezing, chest pain ya breathing difficulty me medical assessment lein.',
  },
  {
    name: 'Musculoskeletal pain pattern',
    groups: [
      ['back pain', 'kamar dard'],
      ['neck pain', 'gardan dard'],
      ['shoulder pain', 'kandhe me dard'],
      ['muscle pain', 'muscle dard'],
      ['body pain', 'badan dard'],
      ['gym', 'exercise', 'workout', 'heavy lifting'],
    ],
    description:
      'Activity, posture ya muscle strain ke saath localized pain musculoskeletal pattern me ho sakta hai.',
    selfCare: [
      'Heavy activity se temporary rest lein.',
      'Gentle movement maintain karein.',
      'Comfort ke according warm ya cold compress use kar sakte hain.',
      'Heavy lifting temporarily avoid karein.',
    ],
    doctorAdvice:
      'Significant injury, weakness, numbness, swelling ya persistent pain me medical assessment karayein.',
  },
  {
    name: 'Skin irritation / dermatitis pattern',
    groups: [
      ['rash', 'rashes', 'daane'],
      ['itching', 'khujli'],
      ['redness', 'lalpan'],
      ['dry skin', 'dry patches'],
      ['skin irritation'],
    ],
    description:
      'Itching, redness, rash ya dry patches skin irritation/dermatitis pattern me ho sakte hain.',
    selfCare: [
      'Affected area ko scratch na karein.',
      'New irritating cosmetics/products avoid karein.',
      'Skin ko gently clean rakhein.',
      'Bina advice steroid/antibiotic cream use na karein.',
    ],
    doctorAdvice:
      'Rapidly spreading rash, pain, pus, fever ya severe swelling me doctor ko dikhayein.',
  },
  {
    name: 'Urinary tract infection pattern',
    groups: [
      ['burning urine', 'urine me jalan', 'peshab me jalan'],
      ['frequent urine', 'bar bar peshab', 'baar baar peshab'],
      ['lower abdominal pain', 'neeche pet me dard'],
      ['urine smell', 'peshab me smell'],
      ['blood in urine', 'peshab me khoon'],
    ],
    description:
      'Urination me burning, frequency aur lower abdominal discomfort urinary infection me ho sakte hain.',
    selfCare: [
      'Adequate fluids lein unless a doctor has restricted your fluid intake.',
      'Symptoms ko ignore na karein.',
      'Bina prescription antibiotics start na karein.',
    ],
    doctorAdvice:
      'UTI-like symptoms ko clinician se assess karana useful hai, especially fever, back pain, pregnancy ya blood in urine ke saath.',
  },
];

const SERIOUS_CONDITIONS: {
  name: string;
  terms: string[];
  recommendation: string;
}[] = [
  {
    name: 'Cancer',
    terms: [
      'cancer',
      'tumor',
      'tumour',
      'malignancy',
      'chemotherapy',
      'chemo',
      'radiotherapy',
      'oncologist',
    ],
    recommendation:
      'Aapne cancer ya cancer treatment mention kiya hai. Apne treating doctor/oncologist ke follow-up plan ko follow karein. Naye ya worsening symptoms ko unse discuss karein.',
  },
  {
    name: 'Heart disease',
    terms: [
      'heart disease',
      'heart patient',
      'cardiac patient',
      'heart attack history',
      'bypass surgery',
      'angioplasty',
    ],
    recommendation:
      'Aapne heart-related medical history mention ki hai. Naye symptoms ko casually self-treat na karein aur treating doctor se appropriate follow-up lein.',
  },
  {
    name: 'Kidney disease',
    terms: [
      'kidney failure',
      'kidney disease',
      'ckd',
      'dialysis',
      'renal failure',
    ],
    recommendation:
      'Kidney disease/dialysis ke saath medicines, fluids aur symptoms ke decisions individual ho sakte hain. Treating clinician se advice lein.',
  },
  {
    name: 'Liver disease',
    terms: [
      'liver failure',
      'cirrhosis',
      'chronic liver disease',
    ],
    recommendation:
      'Aapne significant liver disease mention ki hai. New symptoms ya medication changes ko treating clinician se discuss karein.',
  },
  {
    name: 'Diabetes',
    terms: [
      'diabetes',
      'diabetic',
      'sugar patient',
    ],
    recommendation:
      'Diabetes ke saath infection, vomiting, dehydration ya unusual weakness ko closely monitor karein aur concerning symptoms me clinician se advice lein.',
  },
  {
    name: 'Immunocompromised state',
    terms: [
      'immunocompromised',
      'low immunity',
      'organ transplant',
      'transplant patient',
      'immunosuppressant',
    ],
    recommendation:
      'Reduced immunity ke saath infections aur new symptoms ko earlier medical assessment ki zarurat ho sakti hai.',
  },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:()[\]{}"'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function detectSeriousConditions(text: string) {
  const source = normalize(text);

  return SERIOUS_CONDITIONS.filter((condition) =>
    containsAny(source, condition.terms)
  );
}

function detectTextRedFlags(text: string): string[] {
  const source = normalize(text);
  const flags: string[] = [];

  const patterns: Record<string, string[]> = {
    'chest-pain': [
      'severe chest pain',
      'intense chest pain',
      'chest pressure',
      'crushing chest pain',
      'seene me tez dard',
      'seene mein tez dard',
      'seene me dabav',
      'chest tightness with sweating',
    ],
    breath: [
      'severe breathing difficulty',
      'cannot breathe',
      'cant breathe',
      'unable to breathe',
      'struggling to breathe',
      'severe shortness of breath',
      'saans nahi aa rahi',
      'saans lene me bahut dikkat',
      'saans lene mein bahut dikkat',
    ],
    faint: [
      'fainted',
      'fainting',
      'unconscious',
      'behosh',
      'hosh nahi',
    ],
    bleeding: [
      'heavy bleeding',
      'uncontrolled bleeding',
      'bleeding wont stop',
      'bahut khoon beh raha',
      'zyada khoon beh raha',
      'khoon ruk nahi raha',
    ],
    stroke: [
      'face droop',
      'slurred speech',
      'one sided weakness',
      'one side weakness',
      'ek taraf kamzori',
      'chehra tedha',
      'bol nahi pa raha',
    ],
    'severe-allergy': [
      'tongue swelling',
      'lip swelling',
      'throat swelling',
      'jeebh me sujan',
      'honth me sujan',
      'gala suj',
    ],
    'head-injury': [
      'serious head injury',
      'severe head injury',
      'head injury with vomiting',
      'head injury unconscious',
      'sir me gambhir chot',
    ],
    'high-fever': [
      '104 fever',
      '104°',
      '105 fever',
      '105°',
      '40 c fever',
      '40°c',
      '103.5 fever',
    ],
    dehydration: [
      'no urine for 8 hours',
      'no urine 8 hours',
      '8 ghante se peshab nahi',
      'severe dehydration',
    ],
    pregnancy: [
      'pregnant and bleeding',
      'pregnancy bleeding severe pain',
      'pregnancy me bleeding',
      'pregnancy mein bleeding',
    ],
    infant: [
      'newborn fever',
      '2 month baby fever',
      '1 month baby fever',
      '3 month baby fever',
    ],
    suicide: [
      'kill myself',
      'want to die',
      'suicide',
      'self harm',
      'hurt myself',
      'khud ko maar',
      'khud ko nuksan',
      'marna chahta',
      'marna chahti',
    ],
  };

  Object.entries(patterns).forEach(([key, terms]) => {
    if (containsAny(source, terms)) {
      flags.push(key);
    }
  });

  return unique(flags);
}

function analyzeConditions(text: string): PossibleCondition[] {
  const source = normalize(text);

  if (!source) {
    return [];
  }

  const results: PossibleCondition[] = [];

  CONDITIONS.forEach((condition) => {
    const matchedSymptoms: string[] = [];

    condition.groups.forEach((group) => {
      const found = group.find((term) =>
        source.includes(normalize(term))
      );

      if (found) {
        matchedSymptoms.push(found);
      }
    });

    if (matchedSymptoms.length === 0) {
      return;
    }

    const ratio =
      matchedSymptoms.length / condition.groups.length;

    let score = Math.round(30 + ratio * 60);

    if (matchedSymptoms.length === 1) {
      score = Math.min(score, 45);
    }

    if (matchedSymptoms.length >= 2) {
      score = Math.max(score, 55);
    }

    score = Math.min(score, 90);

    results.push({
      name: condition.name,
      matchScore: score,
      matchedSymptoms: unique(matchedSymptoms),
      description: condition.description,
    });
  });

  return results
    .sort((a, b) => {
      if (b.matchedSymptoms.length !== a.matchedSymptoms.length) {
        return b.matchedSymptoms.length - a.matchedSymptoms.length;
      }

      return b.matchScore - a.matchScore;
    })
    .slice(0, 3);
}

function getConditionRule(
  conditionName: string | undefined
): ConditionRule | undefined {
  if (!conditionName) {
    return undefined;
  }

  return CONDITIONS.find(
    (condition) => condition.name === conditionName
  );
}

function getFollowUpQuestions(
  text: string,
  possibleConditions: PossibleCondition[],
  seriousCondition: boolean
): string[] {
  const source = normalize(text);
  const questions: string[] = [];

  if (
    !source.includes('day') &&
    !source.includes('din') &&
    !source.includes('week') &&
    !source.includes('haft')
  ) {
    questions.push('Yeh problem kitne din se hai?');
  }

  if (
    !source.includes('/10') &&
    !source.includes('mild') &&
    !source.includes('moderate') &&
    !source.includes('severe') &&
    !source.includes('halka') &&
    !source.includes('tez')
  ) {
    questions.push('Takleef 1 se 10 tak kitni severe hai?');
  }

  if (possibleConditions.length === 0 && !seriousCondition) {
    questions.push(
      'Main symptoms exactly kya hain aur body ke kis part me problem hai?'
    );
  }

  if (seriousCondition) {
    questions.push(
      'Kya yeh condition doctor se diagnosed hai aur abhi treatment chal raha hai?'
    );

    questions.push(
      'Kya abhi koi naya ya rapidly worsening symptom hai?'
    );
  }

  return unique(questions).slice(0, 3);
}

export function triage(input: TriageInput): TriageResult {
  const text = input.text || '';
  const days = Number.isFinite(input.days)
    ? Math.max(0, input.days)
    : 0;
  const severity = Number.isFinite(input.severity)
    ? Math.min(10, Math.max(1, input.severity))
    : 1;

  const seriousConditions = detectSeriousConditions(text);
  const textFlags = detectTextRedFlags(text);
  const allFlags = unique([
    ...(input.flags || []),
    ...textFlags,
  ]);

  const possibleConditions = analyzeConditions(text);
  const bestCondition = getConditionRule(
    possibleConditions[0]?.name
  );

  const reasons: string[] = [];

  let level: TriageLevel = 'green';

  if (allFlags.length > 0) {
    level = 'red';

    const labels = allFlags.map(
      (flag) =>
        RED_FLAGS.find((item) => item.key === flag)?.label ||
        flag
    );

    reasons.push(
      'Emergency warning sign detected: ' +
        labels.join(', ') +
        '.'
    );
  }

  if (severity >= 9 && level !== 'red') {
    level = 'red';

    reasons.push(
      'Reported symptom severity is extremely high (' +
        severity +
        '/10).'
    );
  } else if (severity >= 7 && level === 'green') {
    level = 'yellow';

    reasons.push(
      'Reported symptom severity is high (' +
        severity +
        '/10).'
    );
  }

  if (seriousConditions.length > 0 && level === 'green') {
    level = 'yellow';

    reasons.push(
      'A significant medical condition/history was mentioned: ' +
        seriousConditions.map((item) => item.name).join(', ') +
        '.'
    );
  }

  if (days >= 7 && level === 'green') {
    level = 'yellow';

    reasons.push(
      'Symptoms have continued for ' +
        days +
        ' days and should be medically reviewed if not improving.'
    );
  }

  if (
    days >= 3 &&
    severity >= 5 &&
    level === 'green'
  ) {
    level = 'yellow';

    reasons.push(
      'Symptoms have persisted for several days with moderate severity.'
    );
  }

  if (possibleConditions.length > 0) {
    const best = possibleConditions[0];

    reasons.push(
      'The description has features that overlap with ' +
        best.name +
        ': ' +
        best.matchedSymptoms.join(', ') +
        '.'
    );
  }

  if (
    possibleConditions.length === 0 &&
    seriousConditions.length === 0
  ) {
    reasons.push(
      'The information provided is not specific enough for a useful symptom-pattern match.'
    );
  }

  if (
    level === 'green' &&
    possibleConditions.length > 0
  ) {
    reasons.push(
      'No emergency warning sign was detected from the information provided.'
    );
  }

  let recommendation =
    'Symptoms ko monitor karein. Agar problem persist kare, worsen ho, ya aap concerned hon to qualified doctor se consultation lein.';

  if (bestCondition) {
    recommendation = bestCondition.doctorAdvice;
  }

  if (seriousConditions.length > 0) {
    recommendation = seriousConditions
      .map((condition) => condition.recommendation)
      .join(' ');
  }

  if (level === 'red') {
    recommendation =
      'Emergency warning sign mila hai. Abhi urgent medical assessment lein. Symptom checker ke result ka wait karke treatment delay na karein.';
  }

  const selfCare =
    bestCondition?.selfCare || [
      'Rest aur adequate hydration maintain karein.',
      'Symptoms me changes ko monitor karein.',
      'Bina medical advice antibiotics ya steroids start na karein.',
      'Symptoms persist ya worsen hon to doctor se consult karein.',
    ];

  const seeDoctor: string[] = [
    recommendation,
    'Doctor ko batayein ki symptoms kab shuru hue aur kaise change hue.',
    'Jo medicines already le rahe hain aur relevant medical history doctor ko batayein.',
    'Emergency warning sign develop ho to routine appointment ka wait na karein.',
  ];

  const emergency: string[] = [
    'Urgent medical help lein.',
    'Immediate emergency me 112 ya appropriate local emergency service contact karein.',
    'Severe chest/breathing symptoms, fainting ya severe weakness me khud drive na karein.',
    'Possible ho to kisi trusted person ko apne saath rakhein.',
  ];

  const followUpQuestions = getFollowUpQuestions(
    text,
    possibleConditions,
    seriousConditions.length > 0
  );

  return {
    level,
    reasons,
    selfCare,
    seeDoctor,
    emergency,
    possibleConditions,
    recommendation,
    needsMoreInfo:
      possibleConditions.length === 0 ||
      followUpQuestions.length > 0,
    followUpQuestions,
  };
}

export function problemAdvice(
  problemKey: string
): string[] {
  const map: Record<string, string[]> = {
    fever: [
      'Temperature periodically check karein.',
      'Rest aur adequate fluids lein.',
      'Persistent, worsening ya very high fever ko doctor se assess karayein.',
    ],
    headache: [
      'Rest karein, hydrate rahein aur meals skip na karein.',
      'Screen exposure temporarily kam karein.',
      'Sudden extremely severe ya unusual headache ko urgently assess karayein.',
    ],
    cold: [
      'Rest aur warm fluids lein.',
      'Nasal congestion me saline rinse helpful ho sakta hai.',
      'Breathing problem ya worsening symptoms me doctor se consult karein.',
    ],
    stomach: [
      'Fluid loss ho to ORS ya fluids small frequent sips me lein.',
      'Halka khana lein.',
      'Blood, dehydration ya severe abdominal pain me medical assessment lein.',
    ],
    cough: [
      'Hydration maintain karein aur smoke/dust avoid karein.',
      'Warm fluids throat irritation me help kar sakte hain.',
      'Breathing difficulty, chest pain ya blood ke saath cough ko promptly assess karayein.',
    ],
    bodypain: [
      'Heavy activity temporarily avoid karein.',
      'Gentle movement aur comfortable warm/cold compress try kar sakte hain.',
      'Injury, weakness, numbness ya persistent severe pain me doctor ko dikhayein.',
    ],
    skin: [
      'Affected area scratch na karein.',
      'New irritating products avoid karein.',
      'Rapidly spreading rash, severe swelling ya fever me doctor ko dikhayein.',
    ],
    acidity: [
      'Smaller meals lein aur meal ke turant baad na letein.',
      'Known trigger foods avoid karein.',
      'Chest pressure, severe chest pain, sweating ya breathing difficulty ko sirf acidity assume na karein.',
    ],
  };

  return (
    map[problemKey] || [
      'Symptoms ko monitor karein.',
      'Unnecessary self-medication avoid karein.',
      'Persistent ya worsening symptoms me medical advice lein.',
    ]
  );
}
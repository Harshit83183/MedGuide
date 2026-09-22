
const LANGUAGES = {
  en: 'English',
  hi: 'Hindi written in Devanagari',
  hinglish: 'Hinglish written in Roman script',
  mr: 'Marathi written in Devanagari',
  ta: 'Tamil written in Tamil script',
  bn: 'Bengali written in Bengali script'
};

const MODELS = [
  process.env.GEMINI_TRIAGE_MODEL,
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite'
].filter(Boolean);

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    urgency: {
      type: 'string',
      enum: ['green', 'yellow', 'red']
    },
    urgencyTitle: { type: 'string' },
    summary: { type: 'string' },
    possibleCauses: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          relevance: {
            type: 'string',
            enum: ['low', 'moderate', 'strong']
          },
          reason: { type: 'string' }
        },
        required: ['name', 'relevance', 'reason']
      }
    },
    detectedSymptoms: {
      type: 'array',
      items: { type: 'string' }
    },
    importantContext: {
      type: 'array',
      items: { type: 'string' }
    },
    redFlags: {
      type: 'array',
      items: { type: 'string' }
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' }
    },
    selfCare: {
      type: 'array',
      items: { type: 'string' }
    },
    doctorAdvice: {
      type: 'array',
      items: { type: 'string' }
    },
    emergencyAdvice: {
      type: 'array',
      items: { type: 'string' }
    },
    followUpQuestions: {
      type: 'array',
      items: { type: 'string' }
    },
    needsMoreInformation: { type: 'boolean' },
    disclaimer: { type: 'string' }
  },
  required: [
    'urgency',
    'urgencyTitle',
    'summary',
    'possibleCauses',
    'detectedSymptoms',
    'importantContext',
    'redFlags',
    'recommendations',
    'selfCare',
    'doctorAdvice',
    'emergencyAdvice',
    'followUpQuestions',
    'needsMoreInformation',
    'disclaimer'
  ]
};

const SYSTEM_PROMPT = `
You are MedGuide Smart Triage, a cautious medical information assistant.

The selected website language is mandatory. It takes priority over the language used by the patient.

Supported languages:
en: English
hi: Hindi in Devanagari
hinglish: Roman-script Hinglish
mr: Marathi in Devanagari
ta: Tamil in Tamil script
bn: Bengali in Bengali script

Every human-readable JSON value must be entirely in the selected language.

This includes urgencyTitle, summary, possible causes, reasons, detected symptoms, context, red flags, recommendations, self-care, doctor advice, emergency advice, follow-up questions and disclaimer.

Never copy Hinglish into English, Hindi, Marathi, Tamil or Bengali responses.

Preserve medicine names, proper nouns and necessary medical terminology.

Never translate JSON property names or enum values.

Understand complaints written in any supported language or a mixture of languages.

Distinguish reported symptoms from suspected diseases and existing diagnosed conditions.

Never invent symptoms, diagnoses, test results, medical history, medication, duration, severity, age or pregnancy status.

Never claim to diagnose a disease.

List only reasonable possible causes supported by the supplied information. Do not assign probabilities.

Use urgency green when the information does not suggest concerning warning signs and general self-care may be appropriate.

Use urgency yellow when medical assessment is appropriate for persistent, worsening or concerning symptoms.

Use urgency red for potentially time-critical emergencies, including severe breathing difficulty, severe chest pain, stroke-like symptoms, unconsciousness, uncontrolled bleeding, severe allergic reactions, major trauma or suicidal intent.

Do not classify a disease name alone as an emergency. Assess the actual symptoms and reported circumstances.

Account for important existing medical conditions and treatment.

For red urgency, give immediate emergency guidance. Do not delay emergency care to ask follow-up questions.

If information is insufficient and there is no emergency, ask focused follow-up questions.

When previous results and follow-up answers are provided, reassess using the original complaint and all available answers.

Do not repeat questions already answered.

Do not prescribe prescription medicines or provide medication doses.

Keep advice practical, cautious and clear.

State that MedGuide provides informational triage, not a medical diagnosis.
`;

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectHardEmergency(text) {
  const value = normalize(text);

  const patterns = [
    'cannot breathe',
    'cant breathe',
    'unable to breathe',
    'severe breathing difficulty',
    'saans nahi aa rahi',
    'saans nahi aa raha',
    'saans lene me bahut dikkat',
    'saans lene mein bahut dikkat',
    'severe chest pain',
    'crushing chest pain',
    'seene me bahut tez dard',
    'seene mein bahut tez dard',
    'unconscious',
    'behosh',
    'not responding',
    'face drooping',
    'slurred speech',
    'one sided weakness',
    'ek taraf kamzori',
    'heavy bleeding',
    'uncontrolled bleeding',
    'khoon ruk nahi raha',
    'severe allergic reaction',
    'tongue swelling breathing',
    'throat swelling breathing',
    'want to die',
    'kill myself',
    'suicide',
    'khud ko maar',
    'khud ko nuksan'
  ];

  return patterns.some(pattern =>
    value.includes(normalize(pattern))
  );
}

const EMERGENCY_TEXT = {
  en: {
    title: 'Emergency warning sign',
    summary: 'Your description contains a potentially serious warning sign requiring urgent medical assessment.',
    flag: 'Potential emergency warning sign',
    seek: 'Seek urgent medical help immediately.',
    delay: 'Do not delay medical care while using this symptom checker.',
    contact: 'Contact your local emergency service or nearest emergency department now.',
    drive: 'Do not drive yourself if you are seriously unwell.',
    person: 'If possible, have a trusted person stay with you.',
    disclaimer: 'MedGuide provides informational triage and is not a medical diagnosis or a replacement for emergency services.'
  },
  hi: {
    title: 'आपातकालीन चेतावनी संकेत',
    summary: 'आपके बताए लक्षणों में गंभीर चेतावनी संकेत हो सकता है, जिसके लिए तुरंत चिकित्सकीय जांच जरूरी है।',
    flag: 'संभावित आपातकालीन चेतावनी संकेत',
    seek: 'तुरंत चिकित्सा सहायता लें।',
    delay: 'इस लक्षण जांच के कारण इलाज में देरी न करें।',
    contact: 'अभी स्थानीय आपातकालीन सेवा या नजदीकी अस्पताल के आपातकालीन विभाग से संपर्क करें।',
    drive: 'यदि आपकी हालत गंभीर है, तो स्वयं गाड़ी न चलाएं।',
    person: 'संभव हो तो किसी भरोसेमंद व्यक्ति को अपने साथ रखें।',
    disclaimer: 'MedGuide केवल स्वास्थ्य संबंधी जानकारी देता है। यह चिकित्सकीय निदान या आपातकालीन सेवाओं का विकल्प नहीं है।'
  },
  hinglish: {
    title: 'Emergency warning sign',
    summary: 'Aapke bataye symptoms mein serious warning sign ho sakta hai, jiske liye urgent medical assessment zaroori hai.',
    flag: 'Possible emergency warning sign',
    seek: 'Turant medical help lein.',
    delay: 'Symptom checker ke chakkar mein treatment delay na karein.',
    contact: 'Abhi local emergency service ya nearest emergency department se contact karein.',
    drive: 'Agar aapki condition serious hai to khud drive na karein.',
    person: 'Possible ho to kisi trusted person ko apne saath rakhein.',
    disclaimer: 'MedGuide informational triage tool hai. Ye medical diagnosis ya emergency service ka replacement nahi hai.'
  },
  mr: {
    title: 'आपत्कालीन धोक्याचे लक्षण',
    summary: 'तुम्ही सांगितलेल्या लक्षणांमध्ये गंभीर धोक्याचे लक्षण असू शकते. तातडीने वैद्यकीय तपासणी आवश्यक आहे.',
    flag: 'संभाव्य आपत्कालीन धोक्याचे लक्षण',
    seek: 'तातडीने वैद्यकीय मदत घ्या.',
    delay: 'या लक्षण तपासणीमुळे उपचार घेण्यास उशीर करू नका.',
    contact: 'आत्ताच स्थानिक आपत्कालीन सेवा किंवा जवळच्या रुग्णालयाच्या आपत्कालीन विभागाशी संपर्क साधा.',
    drive: 'तुमची प्रकृती गंभीर असल्यास स्वतः वाहन चालवू नका.',
    person: 'शक्य असल्यास एखाद्या विश्वासू व्यक्तीला तुमच्यासोबत ठेवा.',
    disclaimer: 'MedGuide केवळ आरोग्यविषयक माहिती देते. हे वैद्यकीय निदान किंवा आपत्कालीन सेवांचा पर्याय नाही.'
  },
  ta: {
    title: 'அவசர எச்சரிக்கை அறிகுறி',
    summary: 'நீங்கள் தெரிவித்த அறிகுறிகளில் தீவிரமான எச்சரிக்கை அறிகுறி இருக்கலாம். உடனடி மருத்துவப் பரிசோதனை தேவை.',
    flag: 'சாத்தியமான அவசர எச்சரிக்கை அறிகுறி',
    seek: 'உடனடியாக மருத்துவ உதவி பெறுங்கள்.',
    delay: 'இந்த அறிகுறி சரிபார்ப்புக்காக மருத்துவ சிகிச்சையைத் தாமதப்படுத்த வேண்டாம்.',
    contact: 'உள்ளூர் அவசர சேவை அல்லது அருகிலுள்ள மருத்துவமனையின் அவசரப் பிரிவை இப்போதே தொடர்புகொள்ளுங்கள்.',
    drive: 'உங்கள் உடல்நிலை மோசமாக இருந்தால் நீங்களே வாகனம் ஓட்ட வேண்டாம்.',
    person: 'முடிந்தால் நம்பகமான ஒருவரை உங்களுடன் இருக்கச் சொல்லுங்கள்.',
    disclaimer: 'MedGuide உடல்நலம் குறித்த தகவல்களை மட்டுமே வழங்குகிறது. இது மருத்துவ நோயறிதலுக்கோ அவசர சேவைகளுக்கோ மாற்றாகாது.'
  },
  bn: {
    title: 'জরুরি সতর্কতামূলক লক্ষণ',
    summary: 'আপনার বর্ণিত উপসর্গে গুরুতর সতর্কতামূলক লক্ষণ থাকতে পারে। দ্রুত চিকিৎসা পরীক্ষা প্রয়োজন।',
    flag: 'সম্ভাব্য জরুরি সতর্কতামূলক লক্ষণ',
    seek: 'অবিলম্বে চিকিৎসা সহায়তা নিন।',
    delay: 'এই উপসর্গ পরীক্ষার কারণে চিকিৎসা নিতে দেরি করবেন না।',
    contact: 'এখনই স্থানীয় জরুরি সেবা বা কাছাকাছি হাসপাতালের জরুরি বিভাগে যোগাযোগ করুন।',
    drive: 'আপনার অবস্থা গুরুতর হলে নিজে গাড়ি চালাবেন না।',
    person: 'সম্ভব হলে বিশ্বস্ত কাউকে আপনার সঙ্গে থাকতে বলুন।',
    disclaimer: 'MedGuide শুধু স্বাস্থ্যসংক্রান্ত তথ্য দেয়। এটি চিকিৎসা নির্ণয় বা জরুরি সেবার বিকল্প নয়।'
  }
};

function emergencyFallback(language) {
  const t = EMERGENCY_TEXT[language] || EMERGENCY_TEXT.en;

  return {
    urgency: 'red',
    urgencyTitle: t.title,
    summary: t.summary,
    possibleCauses: [],
    detectedSymptoms: [],
    importantContext: [],
    redFlags: [t.flag],
    recommendations: [t.seek, t.delay],
    selfCare: [],
    doctorAdvice: [],
    emergencyAdvice: [t.contact, t.drive, t.person],
    followUpQuestions: [],
    needsMoreInformation: false,
    disclaimer: t.disclaimer
  };
}

function extractText(data) {
  if (typeof data?.output_text === 'string') {
    return data.output_text.trim();
  }

  if (!Array.isArray(data?.steps)) return '';

  return data.steps
    .flatMap(step =>
      Array.isArray(step?.content) ? step.content : []
    )
    .filter(item =>
      item?.type === 'text' &&
      typeof item.text === 'string'
    )
    .map(item => item.text)
    .join('')
    .trim();
}

function validateResult(result) {
  if (!result || typeof result !== 'object') return false;

  if (!['green', 'yellow', 'red'].includes(result.urgency)) {
    return false;
  }

  const strings = [
    'urgencyTitle',
    'summary',
    'disclaimer'
  ];

  const arrays = [
    'possibleCauses',
    'detectedSymptoms',
    'importantContext',
    'redFlags',
    'recommendations',
    'selfCare',
    'doctorAdvice',
    'emergencyAdvice',
    'followUpQuestions'
  ];

  if (strings.some(key => typeof result[key] !== 'string')) {
    return false;
  }

  if (arrays.some(key => !Array.isArray(result[key]))) {
    return false;
  }

  if (typeof result.needsMoreInformation !== 'boolean') {
    return false;
  }

  if (
    result.possibleCauses.some(cause =>
      typeof cause?.name !== 'string' ||
      typeof cause?.reason !== 'string' ||
      !['low', 'moderate', 'strong'].includes(cause?.relevance)
    )
  ) {
    return false;
  }

  return arrays
    .filter(key => key !== 'possibleCauses')
    .every(key =>
      result[key].every(item => typeof item === 'string')
    );
}

async function callGemini(apiKey, model, input) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/interactions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Api-Revision': '2026-05-20'
      },
      body: JSON.stringify({
        model,
        input,
        store: false,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: SCHEMA
        }
      })
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  return { response, data };
}

async function requestWithFallback(apiKey, input) {
  let lastError = 'Gemini is temporarily unavailable.';
  let lastStatus = 503;

  for (const model of [...new Set(MODELS)]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { response, data } = await callGemini(
          apiKey,
          model,
          input
        );

        if (response.ok) {
          return { data, model };
        }

        lastStatus = response.status;
        lastError =
          data?.error?.message ||
          `Gemini request failed: ${response.status}`;

        if (
          response.status === 400 ||
          response.status === 401 ||
          response.status === 403
        ) {
          return {
            error: lastError,
            status: response.status
          };
        }

        if (
          response.status !== 404 &&
          response.status !== 429 &&
          response.status < 500
        ) {
          return {
            error: lastError,
            status: response.status
          };
        }
      } catch (error) {
        lastError =
          error instanceof Error
            ? error.message
            : 'Gemini network error.';
      }

      if (attempt === 0) {
        await new Promise(resolve =>
          setTimeout(resolve, 1000)
        );
      }
    }
  }

  return {
    error: lastError,
    status: lastStatus
  };
}

function preservesMedicalStructure(original, translated) {
  if (!validateResult(translated)) return false;

  if (original.urgency !== translated.urgency) return false;

  if (
    original.needsMoreInformation !==
    translated.needsMoreInformation
  ) {
    return false;
  }

  if (
    original.possibleCauses.length !==
    translated.possibleCauses.length
  ) {
    return false;
  }

  for (let i = 0; i < original.possibleCauses.length; i++) {
    if (
      original.possibleCauses[i].relevance !==
      translated.possibleCauses[i].relevance
    ) {
      return false;
    }
  }

  const arrays = [
    'detectedSymptoms',
    'importantContext',
    'redFlags',
    'recommendations',
    'selfCare',
    'doctorAdvice',
    'emergencyAdvice',
    'followUpQuestions'
  ];

  return arrays.every(key =>
    original[key].length === translated[key].length
  );
}

async function translateExistingResult(
  apiKey,
  original,
  language
) {
  if (!validateResult(original)) {
    return {
      error: 'Invalid saved medical result.',
      status: 400
    };
  }

  const input = `
You are a medical translator, not a medical assessor.

Translate the following existing medical triage JSON into:
${LANGUAGES[language]}

Translate every human-readable string, including all nested arrays and objects.

Do not leave English or Hinglish sentences in another selected language, except medicine names, proper nouns and essential medical terminology.

Preserve medical meaning, uncertainty, urgency, all warning signs and all recommendations.

Do not add, remove, weaken or strengthen medical advice.

Keep the exact JSON keys, enum values, array lengths and boolean values.

The urgency must remain exactly:
${original.urgency}

Return only valid JSON matching the provided schema.

Original result:
${JSON.stringify(original)}
`;

  const response = await requestWithFallback(apiKey, input);

  if (response.error) return response;

  let translated;

  try {
    translated = JSON.parse(extractText(response.data));
  } catch {
    return {
      error: 'Translation returned invalid JSON.',
      status: 502
    };
  }

  if (!preservesMedicalStructure(original, translated)) {
    return {
      error: 'Translation did not preserve the medical result structure.',
      status: 502
    };
  }

  return {
    result: translated,
    model: response.model
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed.'
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing GEMINI_API_KEY server environment variable.'
    });
  }

  const body = req.body || {};
  const language = LANGUAGES[body.language]
    ? body.language
    : 'en';

  if (body.mode === 'translate') {
    try {
      const translated = await translateExistingResult(
        apiKey,
        body.result,
        language
      );

      if (translated.error) {
        return res.status(translated.status || 502).json({
          error: translated.error
        });
      }

      return res.status(200).json({
        success: true,
        provider: 'gemini',
        model: translated.model,
        result: translated.result
      });
    } catch {
      return res.status(503).json({
        error: 'Translation is temporarily unavailable.'
      });
    }
  }

  const text = String(body.text || '').trim();

  if (text.length < 3) {
    return res.status(400).json({
      error: 'Please describe your symptoms in more detail.'
    });
  }

  if (text.length > 6000) {
    return res.status(400).json({
      error: 'Symptom description must be under 6000 characters.'
    });
  }

  const attachments = Array.isArray(body.attachments)
    ? body.attachments.slice(0, 8)
    : [];

  const previousResult = validateResult(body.previousResult)
    ? body.previousResult
    : null;

  const followUpAnswers = Array.isArray(body.followUpAnswers)
    ? body.followUpAnswers
        .slice(0, 12)
        .map(item => ({
          question: String(item?.question || '').trim(),
          answer: String(item?.answer || '').trim()
        }))
        .filter(item => item.question && item.answer)
    : [];

  const emergencyText = [
    text,
    ...followUpAnswers.map(item => item.answer)
  ].join(' ');

  const hardEmergency = detectHardEmergency(emergencyText);

  const attachmentDescriptions = attachments.map(item => ({
    name: String(item?.name || ''),
    type: String(item?.type || ''),
    description: String(
      item?.description ||
      item?.extractedText ||
      ''
    ).slice(0, 3000)
  }));

  const input = `
${SYSTEM_PROMPT}

MANDATORY OUTPUT LANGUAGE:
${LANGUAGES[language]}

Original patient complaint:
${text}

Attachments:
${JSON.stringify(attachmentDescriptions)}

Previous triage result:
${previousResult ? JSON.stringify(previousResult) : 'None'}

Follow-up answers:
${JSON.stringify(followUpAnswers)}

Potential emergency keyword detected:
${hardEmergency ? 'Yes' : 'No'}

Assess the complete complaint and return the required JSON.

Every human-readable value must be in ${LANGUAGES[language]}.

Do not copy the language of the complaint when it differs from the selected output language.
`;

  try {
    const ai = await requestWithFallback(apiKey, input);

    if (ai.error) {
      if (hardEmergency) {
        return res.status(200).json({
          success: true,
          provider: 'safety-fallback',
          result: emergencyFallback(language)
        });
      }

      return res.status(ai.status || 503).json({
        error: ai.error
      });
    }

    let result;

    try {
      result = JSON.parse(extractText(ai.data));
    } catch {
      if (hardEmergency) {
        return res.status(200).json({
          success: true,
          provider: 'safety-fallback',
          result: emergencyFallback(language)
        });
      }

      return res.status(502).json({
        error: 'AI returned invalid JSON.'
      });
    }

    if (!validateResult(result)) {
      if (hardEmergency) {
        return res.status(200).json({
          success: true,
          provider: 'safety-fallback',
          result: emergencyFallback(language)
        });
      }

      return res.status(502).json({
        error: 'AI returned an incomplete triage result.'
      });
    }

    if (hardEmergency && result.urgency !== 'red') {
      result = emergencyFallback(language);
    }

    if (result.urgency === 'red') {
      result.needsMoreInformation = false;
      result.followUpQuestions = [];
    }

    return res.status(200).json({
      success: true,
      provider: 'gemini',
      model: ai.model,
      result
    });
  } catch (error) {
    if (hardEmergency) {
      return res.status(200).json({
        success: true,
        provider: 'safety-fallback',
        result: emergencyFallback(language)
      });
    }

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'AI triage failed.'
    });
  }
}
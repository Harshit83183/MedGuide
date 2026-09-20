const MODELS = [
  process.env.GEMINI_TRIAGE_MODEL,
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite'
].filter(Boolean);

const UNIQUE_MODELS = [...new Set(MODELS)];

const TRIAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    urgency: {
      type: 'string',
      enum: ['green', 'yellow', 'red']
    },
    urgencyTitle: {
      type: 'string'
    },
    summary: {
      type: 'string'
    },
    possibleCauses: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: {
            type: 'string'
          },
          relevance: {
            type: 'string',
            enum: ['low', 'moderate', 'strong']
          },
          reason: {
            type: 'string'
          }
        },
        required: ['name', 'relevance', 'reason']
      }
    },
    detectedSymptoms: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    importantContext: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    redFlags: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    selfCare: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    doctorAdvice: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    emergencyAdvice: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    followUpQuestions: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'string'
      }
    },
    needsMoreInformation: {
      type: 'boolean'
    },
    disclaimer: {
      type: 'string'
    }
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
You are MedGuide Smart Triage, a cautious health-information and medical triage assistant.

Understand natural health descriptions written in English, Hindi, Hinglish, Marathi, Tamil, Bengali, or mixtures of these languages.

Analyze the complete meaning and context rather than isolated keywords.

Separate:
- current symptoms
- duration and severity when provided
- existing diagnosed conditions reported by the user
- diseases the user only suspects
- current treatment
- medicines mentioned by the user
- relevant medical history
- emergency warning signs

Never claim that you diagnosed a disease.

possibleCauses must contain only reasonable possibilities based on the symptoms actually supplied. They are not diagnoses.

Never invent symptoms, medical history, test results, diagnoses, age, sex, pregnancy status, medicines, duration, severity, or treatment.

If the information is insufficient, set needsMoreInformation to true and ask focused follow-up questions instead of guessing.

Do not generate disease probabilities or fake percentages.

For possibleCauses.relevance use only:
low
moderate
strong

Use RED when the supplied information suggests a potentially time-critical emergency such as severe breathing difficulty, severe or crushing chest pain, unconsciousness, stroke-like symptoms, uncontrolled major bleeding, severe allergic reaction affecting breathing, severe seizure-related symptoms, severe dehydration, major trauma, suicidal intent, or another clearly dangerous presentation.

Use YELLOW when medical assessment or clinician follow-up is appropriate, including persistent or worsening symptoms, significant severity, concerning non-emergency symptoms, or important existing diseases or treatments that increase risk.

Use GREEN only when no concerning warning sign is apparent from the supplied information and reasonable self-care and monitoring may be appropriate.

A serious disease name alone does not automatically mean RED.

If the user says they have cancer, treat cancer as user-reported medical history. Do not claim that you diagnosed cancer. Ask about symptoms and current treatment and recommend appropriate treating-clinician or oncology follow-up.

If the user asks whether they have cancer, do not confirm cancer from symptoms alone.

If cancer, chemotherapy, immune suppression, or another important condition is reported together with a new concerning symptom, account for the increased medical risk.

Emergency warning signs override ordinary symptom matching.

recommendations must provide useful next steps based on the supplied information.

selfCare must contain only low-risk general measures appropriate to the situation.

Do not prescribe prescription medicines.

Do not provide medication doses.

doctorAdvice should explain when professional medical assessment is appropriate.

emergencyAdvice should contain urgent instructions only when relevant.

followUpQuestions should contain questions that materially improve triage.

Respond in the same general language and simple style used by the user whenever practical. Hinglish input should normally receive simple Hinglish output.

The disclaimer must clearly state that MedGuide provides informational triage and is not a medical diagnosis.
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

  return patterns.some((pattern) =>
    value.includes(normalize(pattern))
  );
}

function emergencyFallback(language) {
  const hinglish =
    language === 'hinglish' ||
    language === 'hi' ||
    language === 'hindi';

  if (hinglish) {
    return {
      urgency: 'red',
      urgencyTitle: 'Emergency warning sign',
      summary:
        'Aapke description me potentially serious warning sign mila hai jisme urgent medical assessment ki zarurat ho sakti hai.',
      possibleCauses: [],
      detectedSymptoms: [],
      importantContext: [],
      redFlags: [
        'Potential emergency warning sign detected'
      ],
      recommendations: [
        'Urgent medical help lein.',
        'Symptom checker ke result ke liye medical care delay na karein.'
      ],
      selfCare: [],
      doctorAdvice: [],
      emergencyAdvice: [
        'Nearest emergency department ya local emergency service se turant contact karein.',
        'Agar aap seriously unwell hain to khud drive na karein.',
        'Possible ho to kisi trusted person ko apne saath rakhein.'
      ],
      followUpQuestions: [],
      needsMoreInformation: false,
      disclaimer:
        'MedGuide informational triage tool hai. Ye medical diagnosis ya emergency service ka replacement nahi hai.'
    };
  }

  return {
    urgency: 'red',
    urgencyTitle: 'Emergency warning sign',
    summary:
      'Your description contains a potentially serious warning sign that may require urgent medical assessment.',
    possibleCauses: [],
    detectedSymptoms: [],
    importantContext: [],
    redFlags: [
      'Potential emergency warning sign detected'
    ],
    recommendations: [
      'Seek urgent medical help.',
      'Do not delay medical care while waiting for this symptom checker.'
    ],
    selfCare: [],
    doctorAdvice: [],
    emergencyAdvice: [
      'Contact your local emergency service or nearest emergency department now.',
      'Do not drive yourself if you are seriously unwell.',
      'If possible, have a trusted person stay with you.'
    ],
    followUpQuestions: [],
    needsMoreInformation: false,
    disclaimer:
      'MedGuide provides informational triage and is not a medical diagnosis or replacement for emergency services.'
  };
}

function extractInteractionText(data) {
  if (typeof data?.output_text === 'string') {
    return data.output_text.trim();
  }

  if (!Array.isArray(data?.steps)) {
    return '';
  }

  const texts = [];

  for (const step of data.steps) {
    if (!Array.isArray(step?.content)) {
      continue;
    }

    for (const content of step.content) {
      if (
        content?.type === 'text' &&
        typeof content.text === 'string'
      ) {
        texts.push(content.text);
      }
    }
  }

  return texts.join('').trim();
}

function validateResult(result) {
  if (!result || typeof result !== 'object') {
    return false;
  }

  if (!['green', 'yellow', 'red'].includes(result.urgency)) {
    return false;
  }

  if (typeof result.urgencyTitle !== 'string') {
    return false;
  }

  if (typeof result.summary !== 'string') {
    return false;
  }

  if (!Array.isArray(result.possibleCauses)) {
    return false;
  }

  if (!Array.isArray(result.detectedSymptoms)) {
    return false;
  }

  if (!Array.isArray(result.importantContext)) {
    return false;
  }

  if (!Array.isArray(result.redFlags)) {
    return false;
  }

  if (!Array.isArray(result.recommendations)) {
    return false;
  }

  if (!Array.isArray(result.selfCare)) {
    return false;
  }

  if (!Array.isArray(result.doctorAdvice)) {
    return false;
  }

  if (!Array.isArray(result.emergencyAdvice)) {
    return false;
  }

  if (!Array.isArray(result.followUpQuestions)) {
    return false;
  }

  if (typeof result.needsMoreInformation !== 'boolean') {
    return false;
  }

  if (typeof result.disclaimer !== 'string') {
    return false;
  }

  return true;
}

function isRetryable(status, code) {
  if (status === 408 || status === 429) {
    return true;
  }

  if (status >= 500 && status <= 599) {
    return true;
  }

  return [
    'rate_limit_exceeded',
    'too_many_requests',
    'api_error',
    'service_unavailable',
    'deadline_exceeded',
    'aborted'
  ].includes(code);
}

function isModelUnavailable(status, code) {
  return (
    status === 404 ||
    code === 'not_found' ||
    code === 'model_not_found'
  );
}

function delayForAttempt(attempt) {
  const base = 700 * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 300);
  return base + jitter;
}

async function callGemini(apiKey, model, input) {
  return fetch(
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
          schema: TRIAGE_SCHEMA
        }
      })
    }
  );
}

async function requestWithFallback(apiKey, input) {
  const attempts = [];
  let lastStatus = 503;
  let lastMessage =
    'All Gemini models are temporarily unavailable.';

  for (const model of UNIQUE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let response;
      let data;

      try {
        response = await callGemini(
          apiKey,
          model,
          input
        );

        data = await response.json();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Network request failed.';

        attempts.push({
          model,
          attempt: attempt + 1,
          status: 0,
          error: message
        });

        lastStatus = 503;
        lastMessage = message;

        if (attempt === 0) {
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              delayForAttempt(attempt)
            )
          );

          continue;
        }

        break;
      }

      if (response.ok) {
        return {
          response,
          data,
          model,
          attempts
        };
      }

      const code = String(
        data?.error?.code || ''
      );

      const message =
        data?.error?.message ||
        `Gemini request failed with status ${response.status}.`;

      attempts.push({
        model,
        attempt: attempt + 1,
        status: response.status,
        code,
        error: message
      });

      lastStatus = response.status;
      lastMessage = message;

      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403
      ) {
        return {
          error: true,
          status: response.status,
          message,
          attempts
        };
      }

      if (
        isModelUnavailable(
          response.status,
          code
        )
      ) {
        break;
      }

      if (
        isRetryable(
          response.status,
          code
        )
      ) {
        if (attempt === 0) {
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              delayForAttempt(attempt)
            )
          );

          continue;
        }

        break;
      }

      return {
        error: true,
        status: response.status,
        message,
        attempts
      };
    }
  }

  return {
    error: true,
    status:
      lastStatus >= 400 &&
      lastStatus <= 599
        ? lastStatus
        : 503,
    message: lastMessage,
    attempts
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error:
        'Missing GEMINI_API_KEY server environment variable.'
    });
  }

  const body = req.body || {};

  const text = String(
    body.text || ''
  ).trim();

  const language = String(
    body.language || 'hinglish'
  ).toLowerCase();

  const attachments = Array.isArray(
    body.attachments
  )
    ? body.attachments
    : [];

  if (text.length < 3) {
    return res.status(400).json({
      error:
        'Please describe your health problem in a little more detail.'
    });
  }

  if (text.length > 6000) {
    return res.status(400).json({
      error:
        'Symptom description is too long. Please keep it under 6000 characters.'
    });
  }

  const hardEmergency =
    detectHardEmergency(text);

  const attachmentSummary = attachments
    .slice(0, 5)
    .map((item) => {
      const kind = String(
        item?.kind || 'file'
      );

      const name = String(
        item?.name || 'attachment'
      );

      return `${kind}: ${name}`;
    })
    .join('\n');

  const input = `
${SYSTEM_PROMPT}

User language preference:
${language}

User health description:
${text}

Uploaded attachment metadata:
${attachmentSummary || 'None'}

Important attachment rule:
Attachment metadata only indicates that files exist.
The actual medical content of those files has not been supplied in this request.
Do not claim that you read, interpreted, transcribed, or diagnosed anything from an attachment.
`;

  try {
    const aiResponse =
      await requestWithFallback(
        apiKey,
        input
      );

    if (aiResponse.error) {
      return res
        .status(aiResponse.status)
        .json({
          error: aiResponse.message,
          modelsTried:
            aiResponse.attempts.map(
              (item) => ({
                model: item.model,
                status: item.status
              })
            )
        });
    }

    const outputText =
      extractInteractionText(
        aiResponse.data
      );

    if (!outputText) {
      return res.status(502).json({
        error:
          'Gemini returned an empty response.',
        model: aiResponse.model
      });
    }

    let result;

    try {
      result = JSON.parse(outputText);
    } catch {
      return res.status(502).json({
        error:
          'Gemini returned invalid structured JSON.',
        model: aiResponse.model
      });
    }

    if (!validateResult(result)) {
      return res.status(502).json({
        error:
          'Gemini returned an incomplete triage response.',
        model: aiResponse.model
      });
    }

    if (
      hardEmergency &&
      result.urgency !== 'red'
    ) {
      result =
        emergencyFallback(language);
    }

    return res.status(200).json({
      success: true,
      provider: 'gemini',
      model: aiResponse.model,
      result
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Gemini triage failed.'
    });
  }
}
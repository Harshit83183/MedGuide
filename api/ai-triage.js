const MODEL = process.env.OPENAI_TRIAGE_MODEL || 'gpt-5.6-luna';

const TRIAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    urgency: {
      type: 'string',
      enum: ['green', 'yellow', 'red'],
    },
    urgencyTitle: {
      type: 'string',
    },
    summary: {
      type: 'string',
    },
    possibleCauses: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: {
            type: 'string',
          },
          relevance: {
            type: 'string',
            enum: ['low', 'moderate', 'strong'],
          },
          reason: {
            type: 'string',
          },
        },
        required: ['name', 'relevance', 'reason'],
      },
    },
    detectedSymptoms: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    importantContext: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    redFlags: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    selfCare: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    doctorAdvice: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    emergencyAdvice: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    followUpQuestions: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'string',
      },
    },
    needsMoreInformation: {
      type: 'boolean',
    },
    disclaimer: {
      type: 'string',
    },
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
    'disclaimer',
  ],
};

const SYSTEM_PROMPT = `
You are MedGuide Smart Triage, a cautious health-information and triage assistant.

Your job is to understand natural-language health descriptions written in English, Hindi, Hinglish, Marathi, Tamil, Bengali, or mixtures of these languages.

Analyze the complete context rather than matching isolated keywords.

You must distinguish between:
1. symptoms the user is experiencing,
2. a medical condition the user says they already have,
3. a condition the user is asking whether they might have,
4. previous medical history,
5. current treatment,
6. emergency warning signs.

Never claim to diagnose a disease.

Possible causes must be presented only as symptom patterns or possibilities that may warrant clinical evaluation.

Do not invent symptoms, history, test results, medicines, diagnoses, duration, age, sex, pregnancy status, or other facts that the user did not provide.

If there is not enough information, explicitly say that more information is needed and ask focused follow-up questions.

Do not give a fake disease probability or percentage.

Use relevance values only:
low
moderate
strong

Urgency rules:

RED means urgent/emergency assessment may be needed because of warning signs such as severe breathing difficulty, severe or crushing chest pain, loss of consciousness, stroke-like symptoms, uncontrolled major bleeding, severe allergic reaction affecting breathing, seizure with concerning features, severe dehydration, major trauma, suicidal intent, or another clearly time-critical presentation.

YELLOW means medical assessment or clinician follow-up is appropriate. Examples include persistent or worsening symptoms, significant severity, concerning but non-emergency symptoms, or important existing conditions/treatments that change risk.

GREEN means no emergency warning sign is apparent from the information supplied and reasonable self-care/monitoring may be appropriate.

A serious disease name alone does not automatically mean RED.

For example:
"I have cancer" means the user reports an existing serious condition. Do not diagnose cancer. Recommend appropriate treating-clinician/oncology follow-up and ask about current symptoms/treatment. Usually this should not be casual GREEN self-care.

"I think I have cancer" does not establish cancer. Explain that symptoms alone cannot confirm it and recommend appropriate evaluation based on the symptoms described.

"I have cancer and I am on chemotherapy and now have fever" requires more cautious medical assessment because treatment may affect infection risk.

Emergency symptoms override ordinary symptom matching.

Recommendations must be specific to the information given but cautious.

Do not prescribe prescription medicines.

Do not provide medication doses unless the user has explicitly provided an existing clinician-directed plan and the response is only clarifying that plan.

When self-care is reasonable, give practical low-risk steps.

When clinician review is appropriate, explain what type of care and how urgently it should be sought.

When RED, clearly tell the user to seek urgent medical help and not to delay because of this tool.

Respond in the same general language/style as the user's symptom description when practical. Hinglish input should normally receive simple Hinglish output.

The disclaimer must make clear that this is informational triage and not a medical diagnosis.
`;

function detectHardEmergency(text) {
  const value = String(text || '').toLowerCase();

  const patterns = [
    'cannot breathe',
    "can't breathe",
    'cant breathe',
    'unable to breathe',
    'severe breathing difficulty',
    'saans nahi aa rahi',
    'saans nahi aa raha',
    'saans lene me bahut dikkat',
    'saans lene mein bahut dikkat',
    'crushing chest pain',
    'severe chest pain',
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
    'tongue swelling and breathing',
    'throat swelling and breathing',
    'kill myself',
    'want to die',
    'suicide',
    'khud ko maar',
    'khud ko nuksan',
  ];

  return patterns.some((pattern) => value.includes(pattern));
}

function emergencyFallback(language) {
  const hinglish =
    language === 'hinglish' ||
    language === 'hi' ||
    !language;

  if (hinglish) {
    return {
      urgency: 'red',
      urgencyTitle: 'Emergency warning sign mila hai',
      summary:
        'Aapke description me aisa symptom mila hai jisme urgent medical assessment ki zarurat ho sakti hai.',
      possibleCauses: [],
      detectedSymptoms: [],
      importantContext: [],
      redFlags: [
        'Potential emergency warning sign detected',
      ],
      recommendations: [
        'Abhi urgent medical help lein.',
        'Symptom checker ke result ka wait karke treatment delay na karein.',
      ],
      selfCare: [],
      doctorAdvice: [],
      emergencyAdvice: [
        'Emergency service ya nearest emergency department se turant contact karein.',
        'Agar aap bahut unwell hain to khud drive na karein.',
        'Possible ho to kisi trusted person ko apne saath rakhein.',
      ],
      followUpQuestions: [],
      needsMoreInformation: false,
      disclaimer:
        'MedGuide informational triage tool hai, medical diagnosis ya emergency service ka replacement nahi.',
    };
  }

  return {
    urgency: 'red',
    urgencyTitle: 'Emergency warning sign detected',
    summary:
      'Your description contains a warning sign that may require urgent medical assessment.',
    possibleCauses: [],
    detectedSymptoms: [],
    importantContext: [],
    redFlags: [
      'Potential emergency warning sign detected',
    ],
    recommendations: [
      'Seek urgent medical help now.',
      'Do not delay emergency care while waiting for this symptom checker.',
    ],
    selfCare: [],
    doctorAdvice: [],
    emergencyAdvice: [
      'Contact an emergency service or nearest emergency department now.',
      'Do not drive yourself if you are seriously unwell.',
      'If possible, have a trusted person stay with you.',
    ],
    followUpQuestions: [],
    needsMoreInformation: false,
    disclaimer:
      'MedGuide provides informational triage and is not a medical diagnosis or a replacement for emergency services.',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error:
        'Missing OPENAI_API_KEY server environment variable.',
    });
  }

  const body = req.body || {};
  const text = String(body.text || '').trim();
  const language = String(body.language || 'hinglish');
  const attachments = Array.isArray(body.attachments)
    ? body.attachments
    : [];

  if (text.length < 3) {
    return res.status(400).json({
      error:
        'Please describe the health problem in a little more detail.',
    });
  }

  if (text.length > 6000) {
    return res.status(400).json({
      error:
        'Symptom description is too long. Please keep it under 6000 characters.',
    });
  }

  const hardEmergency = detectHardEmergency(text);

  const attachmentSummary = attachments
    .slice(0, 5)
    .map((item) => {
      const kind = String(item?.kind || 'file');
      const name = String(item?.name || 'attachment');
      return `${kind}: ${name}`;
    })
    .join('\n');

  const userInput = `
User language preference: ${language}

User health description:
${text}

Uploaded attachment metadata:
${attachmentSummary || 'None'}

Important:
Attachment metadata only tells you that files exist. You have NOT been given the actual medical content of those files in this request. Do not claim to have read, interpreted, transcribed, or diagnosed anything from an attachment.
`;

  try {
    const response = await fetch(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          input: [
            {
              role: 'system',
              content: [
                {
                  type: 'input_text',
                  text: SYSTEM_PROMPT,
                },
              ],
            },
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: userInput,
                },
              ],
            },
          ],
          text: {
            format: {
              type: 'json_schema',
              name: 'medguide_triage',
              strict: true,
              schema: TRIAGE_SCHEMA,
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message ||
        'AI triage request failed.';

      return res.status(response.status).json({
        error: message,
      });
    }

    let outputText = '';

    if (typeof data.output_text === 'string') {
      outputText = data.output_text;
    }

    if (!outputText && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (!Array.isArray(item?.content)) {
          continue;
        }

        for (const content of item.content) {
          if (
            content?.type === 'output_text' &&
            typeof content.text === 'string'
          ) {
            outputText += content.text;
          }
        }
      }
    }

    if (!outputText) {
      return res.status(502).json({
        error:
          'AI response was empty. Please try again.',
      });
    }

    let result;

    try {
      result = JSON.parse(outputText);
    } catch {
      return res.status(502).json({
        error:
          'AI returned an invalid structured response.',
      });
    }

    if (hardEmergency && result.urgency !== 'red') {
      result = emergencyFallback(language);
    }

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'AI triage failed.',
    });
  }
}
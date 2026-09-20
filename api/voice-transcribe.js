const MODELS = [
  process.env.GEMINI_TRIAGE_MODEL,
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite'
].filter(Boolean);

const UNIQUE_MODELS = [...new Set(MODELS)];

function extractText(data) {
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

function retryable(status) {
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

async function wait(ms) {
  await new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function transcribeWithModel(
  apiKey,
  model,
  audio,
  mimeType,
  language
) {
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
        store: false,
        input: [
          {
            type: 'text',
            text: `
Transcribe the spoken audio accurately.

The speaker may use English, Hindi, Hinglish, Marathi, Tamil, Bengali, or a mixture.

Language preference from the app:
${language}

Rules:
Return only the spoken transcript.
Do not summarize.
Do not diagnose.
Do not answer the speaker.
Do not translate unless necessary to preserve mixed-language speech.
Preserve medical words and symptom descriptions accurately.
For Hinglish, use readable Latin-script Hinglish when practical.
Do not add quotation marks.
If speech is unclear, transcribe only what can reasonably be understood.
`
          },
          {
            type: 'audio',
            data: audio,
            mime_type: mimeType
          }
        ]
      })
    }
  );
}

export default async function handler(
  req,
  res
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error:
        'Missing GEMINI_API_KEY server environment variable.'
    });
  }

  const body = req.body || {};

  const audio = String(
    body.audio || ''
  ).trim();

  const mimeType = String(
    body.mimeType || 'audio/webm'
  );

  const language = String(
    body.language || 'hinglish'
  );

  if (!audio) {
    return res.status(400).json({
      error:
        'Audio data nahi mila.'
    });
  }

  const estimatedBytes =
    Math.ceil(
      (audio.length * 3) / 4
    );

  if (
    estimatedBytes >
    15 * 1024 * 1024
  ) {
    return res.status(413).json({
      error:
        'Voice recording bahut badi hai. Chhoti recording try karein.'
    });
  }

  let lastError =
    'Voice transcription failed.';

  let lastStatus = 503;

  for (const model of UNIQUE_MODELS) {
    for (
      let attempt = 0;
      attempt < 2;
      attempt++
    ) {
      try {
        const response =
          await transcribeWithModel(
            apiKey,
            model,
            audio,
            mimeType,
            language
          );

        const data =
          await response.json();

        if (response.ok) {
          const transcript =
            extractText(data);

          if (!transcript) {
            lastStatus = 502;
            lastError =
              'Voice samajh nahi aayi. Dobara clearly bolkar try karein.';
            break;
          }

          return res
            .status(200)
            .json({
              success: true,
              provider:
                'gemini',
              model,
              transcript
            });
        }

        lastStatus =
          response.status;

        lastError =
          data?.error?.message ||
          `Gemini voice request failed with status ${response.status}.`;

        if (
          response.status ===
            400 ||
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          return res
            .status(
              response.status
            )
            .json({
              error:
                lastError
            });
        }

        if (
          !retryable(
            response.status
          )
        ) {
          break;
        }

        if (attempt === 0) {
          await wait(800);
        }
      } catch (error) {
        lastStatus = 503;

        lastError =
          error instanceof Error
            ? error.message
            : 'Voice transcription request failed.';

        if (attempt === 0) {
          await wait(800);
        }
      }
    }
  }

  return res
    .status(lastStatus)
    .json({
      error: lastError
    });
}
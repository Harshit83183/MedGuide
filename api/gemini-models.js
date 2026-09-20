export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing GEMINI_API_KEY',
    });
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models',
      {
        headers: {
          'x-goog-api-key': apiKey,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          'Could not load Gemini models.',
      });
    }

    const models = Array.isArray(data.models)
      ? data.models
          .filter((model) =>
            Array.isArray(model.supportedGenerationMethods)
          )
          .map((model) => ({
            name: model.name,
            displayName: model.displayName,
            methods: model.supportedGenerationMethods,
          }))
      : [];

    return res.status(200).json({
      models,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Could not load Gemini models.',
    });
  }
}
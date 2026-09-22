export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const city = String(req.query.city || '').trim().slice(0, 100);
  if (city.length < 2) return res.status(400).json({ error: 'Enter a city or locality.' });
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    let response;
    try {
      response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=3&countrycodes=in&q=${encodeURIComponent(city)}`, {
        headers: { 'User-Agent': 'MedGuide-Healthcare-Educational-Project/1.0', Accept: 'application/json' }, signal: controller.signal
      });
    } finally { clearTimeout(timeout); }
    if (!response.ok) throw new Error('Location search unavailable');
    const rows = await response.json();
    return res.status(200).json({ locations: rows.map(row => ({ lat: Number(row.lat), lon: Number(row.lon), label: row.display_name, source: 'city' })).filter(row => Number.isFinite(row.lat) && Number.isFinite(row.lon)) });
  } catch { return res.status(503).json({ error: 'City lookup is unavailable. Please try again later.' }); }
}

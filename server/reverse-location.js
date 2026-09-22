export default async function handler(req, res) {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return res.status(400).json({ error: 'Invalid coordinates' });
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    let response;
    try {
      response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`, { headers: { 'User-Agent': 'MedGuide-Educational-Project/1.0' }, signal: controller.signal });
    } finally { clearTimeout(timeout); }
    if (!response.ok) throw new Error('Reverse lookup unavailable');
    const data = await response.json();
    const a = data.address || {};
    const label = [a.suburb || a.neighbourhood || a.village || a.town, a.city || a.county || a.state].filter(Boolean).filter((v, i, all) => all.indexOf(v) === i).join(', ');
    return res.status(200).json({ label: label || `${lat.toFixed(4)}, ${lon.toFixed(4)}` });
  } catch { return res.status(200).json({ label: `${lat.toFixed(4)}, ${lon.toFixed(4)}` }); }
}

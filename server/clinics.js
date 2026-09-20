import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { city, type, specialty, q } = req.query;
      let query = supabase.from('clinics').select('*').order('rating', { ascending: false });
      if (city) query = query.eq('city', city);
      if (type) query = query.eq('type', type);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      let rows = data || [];
      if (specialty) {
        const needle = String(specialty).toLowerCase();
        rows = rows.filter((r) => (r.specialties || []).some((s) => String(s).toLowerCase().includes(needle)));
      }
      if (q) {
        const needle = String(q).toLowerCase();
        rows = rows.filter((r) => [r.name, r.address, r.city, (r.specialties || []).join(' ')].join(' ').toLowerCase().includes(needle));
      }
      return res.status(200).json(rows);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('clinics API:', err);
    return res.status(500).json({ error: err.message });
  }
}

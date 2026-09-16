import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { q, category } = req.query;
      const { data, error } = await supabase.from('medicines').select('*').order('composition', { ascending: true }).limit(200);
      if (error) throw error;
      let rows = data || [];
      if (category) rows = rows.filter((m) => String(m.category || '').toLowerCase() === String(category).toLowerCase());
      if (q) {
        const needle = String(q).toLowerCase();
        rows = rows.filter((m) => [m.composition, m.brand, m.maker, m.strength].join(' ').toLowerCase().includes(needle));
      }
      return res.status(200).json(rows);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('medicines API:', err);
    return res.status(500).json({ error: err.message });
  }
}

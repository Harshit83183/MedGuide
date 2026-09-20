import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { clinic_id, specialty, video } = req.query;
      let query = supabase.from('doctors').select('*').order('rating', { ascending: false });
      if (clinic_id) query = query.eq('clinic_id', Number(clinic_id));
      if (specialty) query = query.ilike('specialty', '%' + specialty + '%');
      const { data, error } = await query.limit(100);
      if (error) throw error;
      let rows = data || [];
      if (video === '1') rows = rows.filter((d) => d.video_fee && d.video_fee > 0);
      return res.status(200).json(rows);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('doctors API:', err);
    return res.status(500).json({ error: err.message });
  }
}

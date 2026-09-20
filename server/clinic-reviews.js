import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { clinic_id } = req.query;
      let query = supabase.from('clinic_reviews').select('*').order('id', { ascending: false }).limit(50);
      if (clinic_id) query = query.eq('clinic_id', Number(clinic_id));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { clinic_id, user_name, rating, comment } = req.body;
      if (!clinic_id || !user_name || !rating) return res.status(400).json({ error: 'clinic_id, user_name and rating are required' });
      const { data, error } = await supabase.from('clinic_reviews').insert({ clinic_id, user_name, rating, comment: comment || '' }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('clinic-reviews API:', err);
    return res.status(500).json({ error: err.message });
  }
}

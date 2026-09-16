import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('testimonials').select('*').eq('approved', true).order('id', { ascending: false }).limit(50);
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { name, city, rating, message, tag } = req.body;
      if (!name || !message) return res.status(400).json({ error: 'name and message are required' });
      const { data, error } = await supabase.from('testimonials').insert({ name, city: city || '', rating: rating || 5, message, tag: tag || 'MedGuide User', approved: true }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('testimonials API:', err);
    return res.status(500).json({ error: err.message });
  }
}

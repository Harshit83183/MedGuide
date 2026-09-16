import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      let query = supabase.from('video_consults').select('*').order('id', { ascending: false }).limit(100);
      if (user_id) query = query.eq('user_id', String(user_id));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { user_id, doctor_id, topic, scheduled_at, duration_min, link, notes } = req.body;
      if (!user_id || !topic) return res.status(400).json({ error: 'user_id and topic are required' });
      const { data, error } = await supabase.from('video_consults').insert({ user_id, doctor_id: doctor_id || null, topic, scheduled_at: scheduled_at || '', duration_min: duration_min || 10, status: 'scheduled', link: link || '', notes: notes || '' }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, status, notes } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const patch = {};
      if (status !== undefined) patch.status = status;
      if (notes !== undefined) patch.notes = notes;
      const { data, error } = await supabase.from('video_consults').update(patch).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('video-consults API:', err);
    return res.status(500).json({ error: err.message });
  }
}

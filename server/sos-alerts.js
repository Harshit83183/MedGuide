import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      let query = supabase.from('sos_alerts').select('*').order('id', { ascending: false }).limit(50);
      if (user_id) query = query.eq('user_id', String(user_id));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { user_id, lat, lng, address_text, note } = req.body;
      if (!user_id) return res.status(400).json({ error: 'user_id is required' });
      const { data, error } = await supabase.from('sos_alerts').insert({ user_id, lat: lat || '', lng: lng || '', address_text: address_text || '', note: note || '', status: 'active' }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, status } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { data, error } = await supabase.from('sos_alerts').update({ status: status || 'resolved' }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('sos-alerts API:', err);
    return res.status(500).json({ error: err.message });
  }
}

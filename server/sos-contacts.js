import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      let query = supabase.from('sos_contacts').select('*').order('id', { ascending: true }).limit(20);
      if (user_id) query = query.eq('user_id', String(user_id));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { user_id, name, phone, relation } = req.body;
      if (!user_id || !name || !phone) return res.status(400).json({ error: 'user_id, name and phone are required' });
      const { data, error } = await supabase.from('sos_contacts').insert({ user_id, name, phone, relation: relation || '' }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('sos_contacts').delete().eq('id', Number(id));
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('sos-contacts API:', err);
    return res.status(500).json({ error: err.message });
  }
}

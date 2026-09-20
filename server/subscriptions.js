import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      let query = supabase.from('subscriptions').select('*').order('id', { ascending: false }).limit(20);
      if (user_id) query = query.eq('user_id', String(user_id));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { user_id, plan, price, total, expires_at } = req.body;
      if (!user_id || !plan) return res.status(400).json({ error: 'user_id and plan are required' });
      const { data, error } = await supabase.from('subscriptions').insert({ user_id, plan, price: price || 0, total: total || 0, used: 0, expires_at: expires_at || '', status: 'active' }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, used, status } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const patch = {};
      if (used !== undefined) patch.used = used;
      if (status !== undefined) patch.status = status;
      const { data, error } = await supabase.from('subscriptions').update(patch).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('subscriptions API:', err);
    return res.status(500).json({ error: err.message });
  }
}

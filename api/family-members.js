import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      let query = supabase.from('family_members').select('*').order('id', { ascending: true }).limit(50);
      if (user_id) query = query.eq('user_id', String(user_id));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { user_id, name, relation, age, blood_group, conditions } = req.body;
      if (!user_id || !name) return res.status(400).json({ error: 'user_id and name are required' });
      const { data, error } = await supabase.from('family_members').insert({ user_id, name, relation: relation || '', age: age || null, blood_group: blood_group || '', conditions: conditions || '' }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, name, relation, age, blood_group, conditions } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const patch = {};
      if (name !== undefined) patch.name = name;
      if (relation !== undefined) patch.relation = relation;
      if (age !== undefined) patch.age = age;
      if (blood_group !== undefined) patch.blood_group = blood_group;
      if (conditions !== undefined) patch.conditions = conditions;
      const { data, error } = await supabase.from('family_members').update(patch).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('family_members').delete().eq('id', Number(id));
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('family-members API:', err);
    return res.status(500).json({ error: err.message });
  }
}

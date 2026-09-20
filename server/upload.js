import supabase from './db-client.js';

const BUCKET = 'medguide-uploads';
const MAX_BYTES = 3 * 1024 * 1024;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'POST') {
      const { fileName, fileBase64, contentType, folder } = req.body;
      if (!fileName || !fileBase64) return res.status(400).json({ error: 'fileName and fileBase64 are required' });
      const buffer = Buffer.from(fileBase64, 'base64');
      if (buffer.length > MAX_BYTES) return res.status(400).json({ error: 'File too large. Max 3 MB allowed.' });
      const safe = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = (folder || 'general') + '/' + Date.now() + '_' + safe;
      const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: contentType || 'application/octet-stream', upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return res.status(200).json({ url: urlData.publicUrl, path });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('upload API:', err);
    return res.status(500).json({ error: err.message });
  }
}

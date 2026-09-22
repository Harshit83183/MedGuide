
import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    if (req.method === 'GET') {
      const userId = String(req.query?.user_id || '').trim();

      if (!userId) {
        return res.status(400).json({
          error: 'User ID is required'
        });
      }

      let query = supabase
        .from('health_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (req.query?.triage) {
        query = query.eq('triage', String(req.query.triage));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Records fetch failed:', error);
        return res.status(500).json({
          error: error.message,
          code: error.code
        });
      }

      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      const userId = String(body.user_id || '').trim();
      const title = String(body.title || '').trim();

      if (!userId || !title) {
        return res.status(400).json({
          error: 'User ID and record title are required'
        });
      }

      const record = {
        user_id: userId,
        title,
        issue: String(body.issue || ''),
        triage: ['green', 'yellow', 'red'].includes(body.triage)
          ? body.triage
          : 'green',
        severity: Number(body.severity) || 1,
        days: String(body.days || ''),
        language: String(body.language || 'en'),
        advice: String(body.advice || ''),
        attachment_url: String(body.attachment_url || ''),
        source: String(body.source || 'manual')
      };

      const { data, error } = await supabase
        .from('health_records')
        .insert(record)
        .select('*')
        .single();

      if (error) {
        console.error('Record insert failed:', {
          message: error.message,
          code: error.code,
          details: error.details
        });

        return res.status(500).json({
          error: error.message,
          code: error.code,
          details: error.details
        });
      }

      return res.status(201).json({
        success: true,
        record: data
      });
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query?.id);
      const userId = String(req.query?.user_id || '').trim();

      if (!id || !userId) {
        return res.status(400).json({
          error: 'Record ID and user ID are required'
        });
      }

      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return res.status(500).json({
          error: error.message
        });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({
      error: 'Method not allowed'
    });
  } catch (error) {
    console.error('Health records API:', error);

    return res.status(500).json({
      error: error instanceof Error
        ? error.message
        : 'Unexpected server error'
    });
  }
}
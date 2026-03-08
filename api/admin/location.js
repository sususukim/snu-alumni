const { requireAdmin } = require('../_lib/adminAuth');
const { assertSupabaseServerEnv, supabaseRest } = require('../_lib/supabaseRest');

module.exports = async function handler(req, res) {
  if (!['GET', 'PUT'].includes(req.method)) {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  const env = assertSupabaseServerEnv(res);
  if (!env) return;

  if (req.method === 'GET') {
    try {
      const response = await supabaseRest('event_settings?key=eq.location&select=value&limit=1', {
        env,
      });

      if (!response.ok) {
        const text = await response.text();
        res.status(response.status).json({ error: text || 'Failed to fetch location' });
        return;
      }

      const rows = await response.json();
      res.status(200).json({ value: rows?.[0]?.value || '' });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to fetch location' });
    }
    return;
  }

  try {
    const value = (req.body && req.body.value ? String(req.body.value) : '').trim();
    if (!value) {
      res.status(400).json({ error: 'value is required' });
      return;
    }

    const response = await supabaseRest('event_settings?on_conflict=key', {
      env,
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: [{ key: 'location', value }],
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: text || 'Failed to save location' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save location' });
  }
};

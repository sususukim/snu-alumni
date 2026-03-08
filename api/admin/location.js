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
      const response = await supabaseRest('event_settings?id=eq.1&select=event_datetime_text,place_name,naver_map_url&limit=1', {
        env,
      });

      if (!response.ok) {
        const text = await response.text();
        res.status(response.status).json({ error: text || 'Failed to fetch event settings' });
        return;
      }

      const rows = await response.json();
      const row = rows?.[0] || null;
      res.status(200).json({
        event_datetime_text: row?.event_datetime_text || '',
        place_name: row?.place_name || '',
        naver_map_url: row?.naver_map_url || '',
      });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to fetch event settings' });
    }
    return;
  }

  try {
    const eventDatetimeText = (req.body?.event_datetime_text ? String(req.body.event_datetime_text) : '').trim();
    const placeName = (req.body?.place_name ? String(req.body.place_name) : '').trim();
    const naverMapUrl = (req.body?.naver_map_url ? String(req.body.naver_map_url) : '').trim();

    if (!eventDatetimeText || !placeName) {
      res.status(400).json({ error: 'event_datetime_text and place_name are required' });
      return;
    }

    const response = await supabaseRest('event_settings?on_conflict=id', {
      env,
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: [{
        id: 1,
        event_datetime_text: eventDatetimeText,
        place_name: placeName,
        naver_map_url: naverMapUrl,
      }],
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: text || 'Failed to save event settings' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save event settings' });
  }
};

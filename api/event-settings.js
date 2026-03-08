const { assertSupabaseServerEnv, supabaseRest } = require('./_lib/supabaseRest');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const env = assertSupabaseServerEnv(res);
  if (!env) return;

  try {
    const response = await supabaseRest('event_settings?id=eq.1&select=event_title,event_datetime_text,place_name,naver_map_url&limit=1', {
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
      event_title: row?.event_title || '동문회 참석 신청',
      event_datetime_text: row?.event_datetime_text || '2026년 5월 12일',
      place_name: row?.place_name || '여의도',
      naver_map_url: row?.naver_map_url || '',
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch event settings' });
  }
};

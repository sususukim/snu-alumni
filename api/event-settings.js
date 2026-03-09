const { json, methodNotAllowed, serverError } = require('./_lib/http');
const { assertSupabaseServerEnv, supabaseRest } = require('./_lib/supabaseRest');

const FALLBACK = {
  event_title: '동문회 참석 신청',
  event_datetime_text: '2026년 5월 12일',
  place_name: '여의도',
  naver_map_url: '',
};

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }

  const envResult = assertSupabaseServerEnv();
  if (!envResult.ok) {
    json(res, 500, { ok: false, error: envResult.error });
    return;
  }

  try {
    const response = await supabaseRest(envResult.env, {
      path: 'event_settings',
      query: {
        id: 'eq.1',
        select: 'event_title,event_datetime_text,place_name,naver_map_url',
        limit: 1,
      },
    });

    if (!response.ok) {
      json(res, response.status || 500, {
        ok: false,
        error: 'Failed to fetch event settings',
      });
      return;
    }

    const row = Array.isArray(response.data) ? response.data[0] : null;
    json(res, 200, {
      ok: true,
      event_title: row?.event_title || FALLBACK.event_title,
      event_datetime_text: row?.event_datetime_text || FALLBACK.event_datetime_text,
      place_name: row?.place_name || FALLBACK.place_name,
      naver_map_url: row?.naver_map_url || FALLBACK.naver_map_url,
    });
  } catch (err) {
    serverError(res, 'Failed to fetch event settings', err.message);
  }
};

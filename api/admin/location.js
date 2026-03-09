const { requireAdmin } = require('../_lib/adminAuth');
const { json, methodNotAllowed, readJsonBody, serverError } = require('../_lib/http');
const { assertSupabaseServerEnv, supabaseRest } = require('../_lib/supabaseRest');

module.exports = async function handler(req, res) {
  if (!['GET', 'PUT'].includes(req.method)) {
    methodNotAllowed(res, ['GET', 'PUT']);
    return;
  }

  const auth = requireAdmin(req, res);
  if (!auth.ok) return;

  const envResult = assertSupabaseServerEnv();
  if (!envResult.ok) {
    json(res, 500, { ok: false, error: envResult.error });
    return;
  }

  if (req.method === 'GET') {
    try {
      const response = await supabaseRest(envResult.env, {
        path: 'event_settings',
        query: {
          id: 'eq.1',
          select: 'event_title,event_datetime_text,place_name,naver_map_url,updated_at',
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
        event_title: row?.event_title || '',
        event_datetime_text: row?.event_datetime_text || '',
        place_name: row?.place_name || '',
        naver_map_url: row?.naver_map_url || '',
        updated_at: row?.updated_at || null,
      });
    } catch (err) {
      serverError(res, 'Failed to fetch event settings', err.message);
    }
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    json(res, 400, { ok: false, error: 'Invalid JSON body' });
    return;
  }

  const eventTitle = String(body?.event_title || '').trim();
  const eventDatetimeText = String(body?.event_datetime_text || '').trim();
  const placeName = String(body?.place_name || '').trim();
  const naverMapUrl = String(body?.naver_map_url || '').trim();

  if (!eventDatetimeText || !placeName) {
    json(res, 400, {
      ok: false,
      error: 'event_datetime_text and place_name are required',
    });
    return;
  }

  try {
    const response = await supabaseRest(envResult.env, {
      method: 'POST',
      path: 'event_settings',
      query: { on_conflict: 'id' },
      headers: {
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: [{
        id: 1,
        event_title: eventTitle || '동문회 참석 신청',
        event_datetime_text: eventDatetimeText,
        place_name: placeName,
        naver_map_url: naverMapUrl,
      }],
    });

    if (!response.ok) {
      json(res, response.status || 500, {
        ok: false,
        error: 'Failed to save event settings',
      });
      return;
    }

    json(res, 200, { ok: true });
  } catch (err) {
    serverError(res, 'Failed to save event settings', err.message);
  }
};

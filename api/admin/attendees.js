const { requireAdmin } = require('../_lib/adminAuth');
const { json, methodNotAllowed, serverError } = require('../_lib/http');
const { assertSupabaseServerEnv, supabaseRest } = require('../_lib/supabaseRest');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }

  const auth = requireAdmin(req, res);
  if (!auth.ok) return;

  const envResult = assertSupabaseServerEnv();
  if (!envResult.ok) {
    json(res, 500, { ok: false, error: envResult.error });
    return;
  }

  try {
    const response = await supabaseRest(envResult.env, {
      path: 'attendees',
      query: {
        select: 'id,student_id,department,name,attendance,created_at',
        order: 'created_at.desc',
      },
    });

    if (!response.ok) {
      json(res, response.status || 500, {
        ok: false,
        error: 'Failed to fetch attendees',
      });
      return;
    }

    const attendees = Array.isArray(response.data) ? response.data : [];
    json(res, 200, { ok: true, attendees });
  } catch (err) {
    serverError(res, 'Failed to fetch attendees', err.message);
  }
};

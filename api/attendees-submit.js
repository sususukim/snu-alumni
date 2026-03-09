const { json, methodNotAllowed, readJsonBody, serverError } = require('./_lib/http');
const { assertSupabaseServerEnv, supabaseRest } = require('./_lib/supabaseRest');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  const envResult = assertSupabaseServerEnv();
  if (!envResult.ok) {
    json(res, 500, { ok: false, error: envResult.error });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    json(res, 400, { ok: false, error: 'Invalid JSON body' });
    return;
  }

  const attendance = String(body?.attendance || '').trim();
  const studentId = String(body?.student_id || '').trim();
  const department = String(body?.department || '').trim();
  const name = String(body?.name || '').trim();

  if (!attendance || !studentId || !department || !name) {
    json(res, 400, {
      ok: false,
      error: 'attendance, student_id, department, name are required',
    });
    return;
  }

  if (!['참석', '불참', '미정'].includes(attendance)) {
    json(res, 400, { ok: false, error: 'attendance is invalid' });
    return;
  }

  try {
    const dup = await supabaseRest(envResult.env, {
      path: 'attendees',
      query: {
        select: 'id',
        attendance: `eq.${attendance}`,
        student_id: `eq.${studentId}`,
        department: `eq.${department}`,
        name: `eq.${name}`,
        limit: 1,
      },
    });

    if (!dup.ok) {
      json(res, dup.status || 500, {
        ok: false,
        error: 'Failed to check duplicate attendee',
      });
      return;
    }

    const dupRows = Array.isArray(dup.data) ? dup.data : [];
    if (dupRows.length > 0) {
      json(res, 409, { ok: false, error: 'already_exists' });
      return;
    }

    const insert = await supabaseRest(envResult.env, {
      method: 'POST',
      path: 'attendees',
      headers: { Prefer: 'return=minimal' },
      body: [{
        attendance,
        student_id: studentId,
        department,
        name,
      }],
    });

    if (!insert.ok) {
      const maybeMsg = typeof insert.data === 'object' ? insert.data?.message : '';
      if (insert.status === 409 || String(maybeMsg || '').includes('duplicate key')) {
        json(res, 409, { ok: false, error: 'already_exists' });
        return;
      }

      json(res, insert.status || 500, {
        ok: false,
        error: 'Failed to submit attendee',
      });
      return;
    }

    json(res, 200, { ok: true });
  } catch (err) {
    serverError(res, 'Failed to submit attendee', err.message);
  }
};

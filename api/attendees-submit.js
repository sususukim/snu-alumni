const { assertSupabaseServerEnv, supabaseRest } = require('./_lib/supabaseRest');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const env = assertSupabaseServerEnv(res);
  if (!env) return;

  try {
    const attendance = (req.body?.attendance ? String(req.body.attendance) : '').trim();
    const studentId = (req.body?.student_id ? String(req.body.student_id) : '').trim();
    const department = (req.body?.department ? String(req.body.department) : '').trim();
    const name = (req.body?.name ? String(req.body.name) : '').trim();

    if (!attendance || !studentId || !department || !name) {
      res.status(400).json({ error: 'attendance, student_id, department, name are required' });
      return;
    }

    const dupPath = `attendees?select=id&student_id=eq.${encodeURIComponent(studentId)}&department=eq.${encodeURIComponent(department)}&name=eq.${encodeURIComponent(name)}&limit=1`;
    const dupRes = await supabaseRest(dupPath, { env });

    if (!dupRes.ok) {
      const text = await dupRes.text();
      res.status(dupRes.status).json({ error: text || 'Failed to check duplicate attendee' });
      return;
    }

    const dupRows = await dupRes.json();
    if (Array.isArray(dupRows) && dupRows.length > 0) {
      res.status(409).json({ error: 'already_exists' });
      return;
    }

    const insertRes = await supabaseRest('attendees', {
      env,
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: [{
        attendance,
        student_id: studentId,
        department,
        name,
      }],
    });

    if (!insertRes.ok) {
      const text = await insertRes.text();
      res.status(insertRes.status).json({ error: text || 'Failed to insert attendee' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to submit attendee' });
  }
};

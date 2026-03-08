const { requireAdmin } = require('../_lib/adminAuth');
const { assertSupabaseServerEnv, supabaseRest } = require('../_lib/supabaseRest');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  const env = assertSupabaseServerEnv(res);
  if (!env) return;

  try {
    const response = await supabaseRest('attendees?select=*&order=created_at.desc', { env });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: text || 'Failed to fetch attendees' });
      return;
    }

    const attendees = await response.json();
    res.status(200).json({ attendees });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch attendees' });
  }
};

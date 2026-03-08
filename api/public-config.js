const { getSupabaseEnv } = require('./_lib/supabaseRest');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) {
    res.status(500).json({ error: 'SUPABASE_URL or SUPABASE_ANON_KEY is missing' });
    return;
  }

  res.status(200).json({ url, anonKey });
};

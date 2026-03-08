function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return { url, anonKey, serviceRoleKey };
}

function assertSupabaseServerEnv(res) {
  const { url, serviceRoleKey } = getSupabaseEnv();
  if (!url || !serviceRoleKey) {
    res.status(500).json({ error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing' });
    return null;
  }
  return { url, serviceRoleKey };
}

async function supabaseRest(path, options = {}) {
  const { url, serviceRoleKey } = options.env;
  const method = options.method || 'GET';

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return response;
}

module.exports = {
  getSupabaseEnv,
  assertSupabaseServerEnv,
  supabaseRest,
};

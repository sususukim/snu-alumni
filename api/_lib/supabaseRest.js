const { URL } = require('url');

function getSupabaseEnv() {
  return {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function assertSupabaseServerEnv() {
  const { url, serviceRoleKey } = getSupabaseEnv();
  if (!url || !serviceRoleKey) {
    return {
      ok: false,
      error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing',
    };
  }

  return {
    ok: true,
    env: { url, serviceRoleKey },
  };
}

function buildRestPath(path, query) {
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  if (!query || typeof query !== 'object') {
    return normalizedPath;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }

  const qs = params.toString();
  return qs ? `${normalizedPath}?${qs}` : normalizedPath;
}

async function supabaseRest(env, options) {
  const method = options?.method || 'GET';
  const path = buildRestPath(options?.path, options?.query);
  const endpoint = new URL(`/rest/v1/${path}`, env.url).toString();

  const headers = {
    apikey: env.serviceRoleKey,
    Authorization: `Bearer ${env.serviceRoleKey}`,
    ...(options?.headers || {}),
  };

  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method,
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: 'Failed to connect to Supabase REST API',
      detail: err.message,
    };
  }

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: 'Supabase REST request failed',
      data,
    };
  }

  return {
    ok: true,
    status: response.status,
    data,
  };
}

module.exports = {
  getSupabaseEnv,
  assertSupabaseServerEnv,
  buildRestPath,
  supabaseRest,
};

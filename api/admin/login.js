const { signPayload, safeEqual } = require('../_lib/adminAuth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!adminPassword || !secret) {
    res.status(500).json({ error: 'ADMIN_PASSWORD or ADMIN_SESSION_SECRET is missing' });
    return;
  }

  const provided = (req.body && req.body.password) || '';
  if (!safeEqual(adminPassword, provided)) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  const payload = {
    role: 'admin',
    exp: Date.now() + 1000 * 60 * 60 * 8,
  };

  const token = signPayload(payload, secret);
  res.status(200).json({ token });
};

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ethara_secret_2026';

function authenticate(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try { req.user = jwt.verify(h.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired token' }); }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

module.exports = { authenticate, adminOnly, JWT_SECRET };

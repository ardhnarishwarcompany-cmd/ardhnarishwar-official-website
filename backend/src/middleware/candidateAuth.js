const jwt = require('jsonwebtoken');
const { Candidate } = require('../models/candidate/candidateAssociations');

// Protects candidate routes. Separate from requireUser (org platform) and
// requireAdmin (legacy CMS) — candidate tokens are signed with their own
// secret and can never be used against org/admin-only routes, or vice versa.
async function requireCandidate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided.' });

  try {
    const payload = jwt.verify(token, process.env.CANDIDATE_JWT_SECRET || process.env.JWT_SECRET);
    if (payload.type !== 'candidate_access') {
      return res.status(401).json({ error: 'Invalid token type.' });
    }
    const candidate = await Candidate.findByPk(payload.id);
    if (!candidate || candidate.status === 'SUSPENDED' || candidate.status === 'INACTIVE') {
      return res.status(401).json({ error: 'Account is not active.' });
    }
    req.candidate = { id: candidate.id, email: candidate.email, name: candidate.name };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = { requireCandidate };

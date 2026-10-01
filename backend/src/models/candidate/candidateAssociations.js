const Candidate = require('./Candidate');
const CandidateRefreshToken = require('./CandidateRefreshToken');

Candidate.hasMany(CandidateRefreshToken, { foreignKey: 'candidateId', as: 'refreshTokens' });
CandidateRefreshToken.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

module.exports = { Candidate, CandidateRefreshToken };

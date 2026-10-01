/**
 * AI Sales Prediction (Customer Intelligence) — rule-based scoring engine.
 *
 * No ML infra/training data exists in this project, so this implements a
 * deterministic, explainable scoring model instead of a black-box one:
 * every point is tied to a concrete signal of lead quality/intent, the
 * same signals a human sales rep would use to triage a lead. Swap this
 * function's internals for a real ML model later without touching any
 * caller — createLead/updateLead/contact-form intake all just call
 * computeLeadScore(lead) and store the result.
 */

const HIGH_INTENT_SOURCES = ['referral', 'demo-request', 'demo', 'partner'];
const MEDIUM_INTENT_SOURCES = ['website', 'job-portal', 'campaign'];

function computeLeadScore(lead = {}) {
  let score = 0;

  if (lead.email) score += 15;
  if (lead.phone) score += 15;
  if (lead.company) score += 15;

  const reqLen = (lead.requirement || '').trim().length;
  if (reqLen > 80) score += 15;
  else if (reqLen > 20) score += 8;

  const source = (lead.source || '').toLowerCase();
  if (HIGH_INTENT_SOURCES.includes(source)) score += 15;
  else if (MEDIUM_INTENT_SOURCES.includes(source)) score += 8;

  const value = Number(lead.estimatedValue || 0);
  if (value >= 500000) score += 15;
  else if (value >= 100000) score += 10;
  else if (value > 0) score += 5;

  if (lead.priority === 'URGENT') score += 15;
  else if (lead.priority === 'HIGH') score += 10;
  else if (lead.priority === 'MEDIUM') score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let grade = 'COLD';
  if (score >= 70) grade = 'HOT';
  else if (score >= 40) grade = 'WARM';

  return { score, grade };
}

module.exports = { computeLeadScore };

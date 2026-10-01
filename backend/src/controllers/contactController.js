const ContactSubmission = require('../models/ContactSubmission');
const Lead = require('../models/Lead');
const { computeLeadScore } = require('../utils/leadScoring');

// Public: visitor submits the contact / demo request form
async function create(req, res) {
  try {
    const { name, email, phone, company, message, interestedIn, subject, source } = req.body;
    const interest = interestedIn || subject || source || null;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required.' });
    }

    const submission = await ContactSubmission.create({
      name, email, phone, company, message, interestedIn: interest,
    });

    // Auto-create CRM lead (with duplicate detection)
    let lead = null;
    let leadCreated = false;
    try {
      let existing = null;
      if (email) existing = await Lead.findOne({ where: { email, organizationId: 1 } });
      if (!existing && phone) existing = await Lead.findOne({ where: { phone, organizationId: 1 } });

      if (existing) {
        lead = existing;
        const noteBits = [existing.notes || '', `New website inquiry (${new Date().toISOString()}): ${message}`].filter(Boolean);
        await existing.update({
          notes: noteBits.join('\n\n').slice(0, 5000),
          requirement: existing.requirement || message,
        });
      } else {
        const { score, grade } = computeLeadScore({
          email, phone, company, requirement: message, source: 'website', priority: 'MEDIUM',
        });
        lead = await Lead.create({
          name,
          email,
          phone: phone || null,
          company: company || null,
          requirement: message,
          source: 'website',
          status: 'NEW',
          priority: 'MEDIUM',
          industry: interest || null,
          contactSubmissionId: submission.id,
          organizationId: 1, // default org until multi-org website routing is added
          aiScore: score,
          aiGrade: grade,
        });
        leadCreated = true;
      }
    } catch (leadErr) {
      console.error('Lead auto-create failed (submission still saved):', leadErr.message);
    }

    res.status(201).json({
      success: true,
      id: submission.id,
      leadId: lead?.id || null,
      leadCreated,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not submit form.', details: err.message });
  }
}

// Admin only: view and manage submissions
async function list(req, res) {
  try {
    const submissions = await ContactSubmission.findAll({ order: [['createdAt', 'DESC']] });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Could not load submissions.', details: err.message });
  }
}

async function updateStatus(req, res) {
  try {
    const submission = await ContactSubmission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });
    await submission.update({ status: req.body.status });
    res.json(submission);
  } catch (err) {
    res.status(400).json({ error: 'Could not update submission.', details: err.message });
  }
}

module.exports = { create, list, updateStatus };

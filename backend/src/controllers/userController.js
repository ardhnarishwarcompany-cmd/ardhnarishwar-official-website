const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, OrganizationUser, Role } = require('../models/platform/platformAssociations');
const { recordAudit } = require('../utils/audit');
const { notifyUser } = require('../utils/notify');

// Org-scoped user management. Requires requireOrganization to have already
// resolved req.organizationId (and req.membership for the actor).

async function listMembers(req, res) {
  try {
    const members = await OrganizationUser.findAll({
      where: { organizationId: req.organizationId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'status', 'lastLoginAt'] },
        { model: Role, as: 'role' },
      ],
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list users.', details: err.message });
  }
}

// Invites a person into the current organization. If they already have a
// platform account, they're just added to this org; otherwise a new
// PENDING_VERIFICATION user is created with a random temporary password
// they're expected to reset via forgot-password.
async function inviteUser(req, res) {
  try {
    const { name, email, roleName } = req.body;
    if (!email || !roleName) return res.status(400).json({ error: 'email and roleName are required.' });

    const role = await Role.findOne({ where: { name: roleName.toUpperCase() } });
    if (!role) return res.status(400).json({ error: `Unknown role: ${roleName}` });

    let user = await User.findOne({ where: { email } });
    if (!user) {
      const tempPassword = crypto.randomBytes(12).toString('hex');
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        passwordHash: await bcrypt.hash(tempPassword, 10),
        status: 'PENDING_VERIFICATION',
      });
      console.log(`[invite] ${email} temporary password (dev-only log, wire a mailer for production): ${tempPassword}`);
    }

    const [membership, created] = await OrganizationUser.findOrCreate({
      where: { organizationId: req.organizationId, userId: user.id },
      defaults: { roleId: role.id, status: 'INVITED' },
    });
    if (!created) return res.status(409).json({ error: 'User is already a member of this organization.' });

    await notifyUser({ organizationId: req.organizationId, userId: user.id, type: 'ORG_INVITE', title: 'You were added to an organization', message: `Role: ${role.name}` });
    await recordAudit({ req, organizationId: req.organizationId, action: 'USER_CREATED', entityType: 'User', entityId: user.id, metadata: { roleName: role.name } });

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, membership });
  } catch (err) {
    res.status(500).json({ error: 'Failed to invite user.', details: err.message });
  }
}

async function updateMemberRole(req, res) {
  try {
    const { roleName } = req.body;
    const role = await Role.findOne({ where: { name: roleName.toUpperCase() } });
    if (!role) return res.status(400).json({ error: `Unknown role: ${roleName}` });

    const membership = await OrganizationUser.findOne({ where: { organizationId: req.organizationId, userId: req.params.userId } });
    if (!membership) return res.status(404).json({ error: 'Membership not found.' });

    membership.roleId = role.id;
    await membership.save();
    await recordAudit({ req, organizationId: req.organizationId, action: 'ROLE_CHANGED', entityType: 'User', entityId: Number(req.params.userId), metadata: { roleName: role.name } });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role.', details: err.message });
  }
}

async function setMemberStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });

    const membership = await OrganizationUser.findOne({ where: { organizationId: req.organizationId, userId: req.params.userId } });
    if (!membership) return res.status(404).json({ error: 'Membership not found.' });
    if (membership.isOwner) return res.status(400).json({ error: "The organization's owner cannot be suspended." });

    membership.status = status;
    await membership.save();
    await recordAudit({ req, organizationId: req.organizationId, action: 'USER_UPDATED', entityType: 'User', entityId: Number(req.params.userId), metadata: { status } });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update member status.', details: err.message });
  }
}

module.exports = { listMembers, inviteUser, updateMemberRole, setMemberStatus };

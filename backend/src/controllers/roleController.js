const { Role, Permission, RolePermission } = require('../models/platform/platformAssociations');
const { recordAudit } = require('../utils/audit');

async function listRoles(req, res) {
  try {
    const roles = await Role.findAll({ include: [{ model: Permission, as: 'permissions' }], order: [['name', 'ASC']] });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list roles.', details: err.message });
  }
}

async function createRole(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required.' });
    const role = await Role.create({ name: name.toUpperCase(), description, isSystem: false });
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create role.', details: err.message });
  }
}

async function updateRole(req, res) {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found.' });
    if (req.body.description !== undefined) role.description = req.body.description;
    await role.save();
    res.json(role);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role.', details: err.message });
  }
}

async function deleteRole(req, res) {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found.' });
    if (role.isSystem) return res.status(400).json({ error: 'System roles cannot be deleted.' });
    await role.destroy();
    res.json({ message: 'Role deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete role.', details: err.message });
  }
}

// Replaces a role's full permission set — the CONFIGURE action from the spec.
async function setRolePermissions(req, res) {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found.' });
    const { permissionIds } = req.body;
    if (!Array.isArray(permissionIds)) return res.status(400).json({ error: 'permissionIds must be an array.' });

    await RolePermission.destroy({ where: { roleId: role.id } });
    await RolePermission.bulkCreate(permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })));

    await recordAudit({ req, action: 'PERMISSION_CHANGED', entityType: 'Role', entityId: role.id, metadata: { permissionIds } });
    const updated = await Role.findByPk(role.id, { include: [{ model: Permission, as: 'permissions' }] });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to set role permissions.', details: err.message });
  }
}

async function listPermissions(req, res) {
  try {
    const permissions = await Permission.findAll({ order: [['resource', 'ASC'], ['action', 'ASC']] });
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list permissions.', details: err.message });
  }
}

// Lightweight catalog for org admins (invite dropdown) — no permission payloads.
async function listRoleCatalog(req, res) {
  try {
    const roles = await Role.findAll({
      where: {},
      attributes: ['id', 'name', 'description', 'isSystem'],
      order: [['name', 'ASC']],
    });
    // Hide platform-only super admin from org invite lists
    res.json(roles.filter((r) => r.name !== 'SUPER_ADMIN'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to list role catalog.', details: err.message });
  }
}

module.exports = { listRoles, createRole, updateRole, deleteRole, setRolePermissions, listPermissions, listRoleCatalog };


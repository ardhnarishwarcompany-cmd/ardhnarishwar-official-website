import { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import SuperAdminGuard from './SuperAdminGuard';
import { listAllRoles, listAllPermissions, createRole, deleteRole, setRolePermissions } from '../api/client';

function RolesPermissionsInner() {
  const [roles, setRoles] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [error, setError] = useState('');

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [checked, setChecked] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  function load() {
    Promise.all([listAllRoles(), listAllPermissions()])
      .then(([r, p]) => {
        setRoles(r);
        setPermissions(p);
        if (!selectedRoleId && r.length) selectRole(r[0]);
      })
      .catch((e) => setError(e.response?.data?.error || e.message));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  function selectRole(role) {
    setSelectedRoleId(role.id);
    setChecked(new Set((role.permissions || []).map((p) => p.id)));
  }

  const selectedRole = roles?.find((r) => r.id === selectedRoleId);

  const resources = useMemo(() => {
    if (!permissions) return [];
    return [...new Set(permissions.map((p) => p.resource))].sort();
  }, [permissions]);
  const actions = useMemo(() => {
    if (!permissions) return [];
    return [...new Set(permissions.map((p) => p.action))];
  }, [permissions]);

  function permissionId(resource, action) {
    return permissions.find((p) => p.resource === resource && p.action === action)?.id;
  }

  function toggle(id) {
    if (id === undefined) return;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await setRolePermissions(selectedRoleId, [...checked]);
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateRole(e) {
    e.preventDefault();
    setFormError('');
    if (!newRoleName.trim()) { setFormError('Role name is required.'); return; }
    setCreating(true);
    try {
      const role = await createRole({ name: newRoleName.trim(), description: newRoleDesc.trim() });
      setNewRoleName('');
      setNewRoleDesc('');
      setShowNewRole(false);
      setRoles((prev) => [...prev, { ...role, permissions: [] }]);
      selectRole({ ...role, permissions: [] });
    } catch (e) {
      setFormError(e.response?.data?.error || e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteRole(role) {
    if (!confirm(`Delete role "${role.name}"? This can't be undone.`)) return;
    try {
      await deleteRole(role.id);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      if (selectedRoleId === role.id) setSelectedRoleId(null);
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Roles &amp; Permissions</h1>
        <button type="button" className="admin-btn admin-btn-gold" onClick={() => setShowNewRole((v) => !v)}>
          {showNewRole ? 'Cancel' : '+ New Role'}
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {showNewRole && (
        <form onSubmit={handleCreateRole} className="admin-card" style={{ padding: 20, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {formError && <div className="admin-alert admin-alert-error" style={{ width: '100%' }}>{formError}</div>}
          <div>
            <label style={{ fontSize: 13 }}>Role name *</label>
            <input className="admin-input" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g. AUDITOR" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 13 }}>Description</label>
            <input className="admin-input" style={{ width: '100%' }} value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} />
          </div>
          <button type="submit" className="admin-btn admin-btn-gold" disabled={creating}>{creating ? 'Creating…' : 'Create'}</button>
        </form>
      )}

      {!roles || !permissions ? (
        <p className="admin-muted">Loading…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 240px) 1fr', gap: 20 }}>
          <div className="admin-card" style={{ padding: 8 }}>
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => selectRole(role)}
                style={{
                  padding: '10px 12px', borderRadius: 6, cursor: 'pointer', marginBottom: 4,
                  background: role.id === selectedRoleId ? 'rgba(201,155,97,0.14)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{role.name}</span>
                  {!role.isSystem && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteRole(role); }}
                      style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
                {role.description && <p className="admin-muted" style={{ fontSize: 12, marginTop: 2 }}>{role.description}</p>}
              </div>
            ))}
          </div>

          <div className="admin-card" style={{ padding: 20, overflowX: 'auto' }}>
            {!selectedRole ? (
              <p className="admin-muted">Select a role to edit its permissions.</p>
            ) : selectedRole.name === 'SUPER_ADMIN' ? (
              <p className="admin-muted">SUPER_ADMIN implicitly has every permission across every organization — there's nothing to configure here.</p>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{selectedRole.name}</h2>
                  <button type="button" className="admin-btn admin-btn-gold" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save permissions'}
                  </button>
                </div>
                <table className="admin-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Resource</th>
                      {actions.map((a) => <th key={a} style={{ textAlign: 'center' }}>{a}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource) => (
                      <tr key={resource}>
                        <td style={{ fontWeight: 600 }}>{resource}</td>
                        {actions.map((action) => {
                          const id = permissionId(resource, action);
                          if (id === undefined) return <td key={action}></td>;
                          return (
                            <td key={action} style={{ textAlign: 'center' }}>
                              <input type="checkbox" checked={checked.has(id)} onChange={() => toggle(id)} />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="admin-muted" style={{ fontSize: 12, marginTop: 10 }}>
                  Tip: MANAGE covers VIEW/CREATE/EDIT/DELETE/ASSIGN for that resource automatically.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function RolesPermissions() {
  return (
    <SuperAdminGuard>
      <RolesPermissionsInner />
    </SuperAdminGuard>
  );
}
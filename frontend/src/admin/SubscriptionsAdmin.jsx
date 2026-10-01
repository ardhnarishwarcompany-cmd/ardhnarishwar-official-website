import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import SuperAdminGuard from './SuperAdminGuard';
import {
  listSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  listAllOrganizations,
  getOrgSubscription,
  assignSubscriptionPlan,
} from '../api/client';

const BILLING_CYCLES = ['TRIAL', 'MONTHLY', 'YEARLY'];
const SUB_STATUSES = ['TRIAL', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED'];

function emptyPlanForm() {
  return { name: '', description: '', price: '', billingCycle: 'MONTHLY', maxUsers: '', maxLeads: '', features: '' };
}

function SubscriptionsAdminInner() {
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState('');

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState(emptyPlanForm());
  const [savingPlan, setSavingPlan] = useState(false);
  const [planFormError, setPlanFormError] = useState('');
  const [editingPlanId, setEditingPlanId] = useState(null);

  const [orgs, setOrgs] = useState(null);
  const [orgId, setOrgId] = useState('');
  const [currentSub, setCurrentSub] = useState(undefined); // undefined = loading, null = none
  const [assignPlanId, setAssignPlanId] = useState('');
  const [assignStatus, setAssignStatus] = useState('ACTIVE');
  const [assignEndDate, setAssignEndDate] = useState('');
  const [assignAutoRenew, setAssignAutoRenew] = useState(false);
  const [assigning, setAssigning] = useState(false);

  function loadPlans() {
    listSubscriptionPlans().then(setPlans).catch((e) => setError(e.response?.data?.error || e.message));
  }

  useEffect(() => {
    loadPlans();
    listAllOrganizations({ limit: 100 })
      .then((r) => {
        setOrgs(r.data);
        if (r.data.length) setOrgId(String(r.data[0].id));
      })
      .catch((e) => setError(e.response?.data?.error || e.message));
  }, []);

  useEffect(() => {
    if (!orgId) return;
    setCurrentSub(undefined);
    getOrgSubscription(orgId)
      .then(setCurrentSub)
      .catch(() => setCurrentSub(null));
  }, [orgId]);

  async function handlePlanSubmit(e) {
    e.preventDefault();
    setPlanFormError('');
    if (!planForm.name || planForm.price === '') {
      setPlanFormError('Name and price are required.');
      return;
    }
    setSavingPlan(true);
    const payload = {
      name: planForm.name,
      description: planForm.description,
      price: Number(planForm.price),
      billingCycle: planForm.billingCycle,
      features: planForm.features.split(',').map((f) => f.trim()).filter(Boolean),
      limits: {
        ...(planForm.maxUsers !== '' ? { maxUsers: Number(planForm.maxUsers) } : {}),
        ...(planForm.maxLeads !== '' ? { maxLeads: Number(planForm.maxLeads) } : {}),
      },
    };
    try {
      if (editingPlanId) {
        const updated = await updateSubscriptionPlan(editingPlanId, payload);
        setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createSubscriptionPlan(payload);
        setPlans((prev) => [...prev, created]);
      }
      setPlanForm(emptyPlanForm());
      setEditingPlanId(null);
      setShowPlanForm(false);
    } catch (e) {
      setPlanFormError(e.response?.data?.error || e.message);
    } finally {
      setSavingPlan(false);
    }
  }

  function startEditPlan(plan) {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      price: String(plan.price),
      billingCycle: plan.billingCycle,
      maxUsers: plan.limits?.maxUsers ?? '',
      maxLeads: plan.limits?.maxLeads ?? '',
      features: (plan.features || []).join(', '),
    });
    setShowPlanForm(true);
  }

  async function togglePlanStatus(plan) {
    const status = plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await updateSubscriptionPlan(plan.id, { status });
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!assignPlanId) return;
    setAssigning(true);
    try {
      const sub = await assignSubscriptionPlan(orgId, {
        planId: assignPlanId,
        status: assignStatus,
        endDate: assignEndDate || null,
        autoRenew: assignAutoRenew,
      });
      setCurrentSub(sub);
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    } finally {
      setAssigning(false);
    }
  }

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Subscriptions</h1>

      {error && <div className="admin-alert admin-alert-error" style={{ marginTop: 12 }}>{error}</div>}

      {/* Plans */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Plans</h2>
        <button
          type="button"
          className="admin-btn admin-btn-gold"
          onClick={() => { setShowPlanForm((v) => !v); setEditingPlanId(null); setPlanForm(emptyPlanForm()); }}
        >
          {showPlanForm ? 'Cancel' : '+ New Plan'}
        </button>
      </div>

      {showPlanForm && (
        <form onSubmit={handlePlanSubmit} className="admin-card" style={{ padding: 20, marginBottom: 20, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {planFormError && <div className="admin-alert admin-alert-error" style={{ gridColumn: '1 / -1' }}>{planFormError}</div>}
          <div>
            <label style={{ fontSize: 13 }}>Name *</label>
            <input className="admin-input" value={planForm.name} onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13 }}>Price (INR) *</label>
            <input className="admin-input" type="number" min="0" value={planForm.price} onChange={(e) => setPlanForm((f) => ({ ...f, price: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13 }}>Billing cycle</label>
            <select className="admin-input" value={planForm.billingCycle} onChange={(e) => setPlanForm((f) => ({ ...f, billingCycle: e.target.value }))}>
              {BILLING_CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13 }}>Max users</label>
            <input className="admin-input" type="number" min="0" value={planForm.maxUsers} onChange={(e) => setPlanForm((f) => ({ ...f, maxUsers: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13 }}>Max leads</label>
            <input className="admin-input" type="number" min="0" value={planForm.maxLeads} onChange={(e) => setPlanForm((f) => ({ ...f, maxLeads: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 13 }}>Description</label>
            <input className="admin-input" style={{ width: '100%' }} value={planForm.description} onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 13 }}>Features (comma separated)</label>
            <input className="admin-input" style={{ width: '100%' }} value={planForm.features} onChange={(e) => setPlanForm((f) => ({ ...f, features: e.target.value }))} placeholder="crm, hrms, attendance" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="admin-btn admin-btn-gold" disabled={savingPlan}>
              {savingPlan ? 'Saving…' : editingPlanId ? 'Update plan' : 'Create plan'}
            </button>
          </div>
        </form>
      )}

      {!plans ? (
        <p className="admin-muted">Loading plans…</p>
      ) : (
        <div className="admin-card" style={{ overflowX: 'auto', marginBottom: 32 }}>
          <table className="admin-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Price</th>
                <th>Billing</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td style={{ fontWeight: 600 }}>{plan.name}</td>
                  <td>₹{plan.price}</td>
                  <td>{plan.billingCycle}</td>
                  <td className="admin-muted">{plan.status}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => startEditPlan(plan)}>Edit</button>
                    <button type="button" className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => togglePlanStatus(plan)}>
                      {plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign to organization */}
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Assign a plan to an organization</h2>
      {!orgs ? (
        <p className="admin-muted">Loading organizations…</p>
      ) : orgs.length === 0 ? (
        <p className="admin-muted">No organizations yet.</p>
      ) : (
        <div className="admin-card" style={{ padding: 20 }}>
          <select className="admin-input" value={orgId} onChange={(e) => setOrgId(e.target.value)} style={{ marginBottom: 12, maxWidth: 320 }}>
            {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>

          <p className="admin-muted" style={{ marginBottom: 16 }}>
            {currentSub === undefined && 'Loading current subscription…'}
            {currentSub === null && 'No subscription assigned yet.'}
            {currentSub && `Current: ${currentSub.plan?.name || 'Plan #' + currentSub.planId} — ${currentSub.status}${currentSub.endDate ? ' · ends ' + new Date(currentSub.endDate).toLocaleDateString() : ''}`}
          </p>

          <form onSubmit={handleAssign} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 13 }}>Plan</label>
              <select className="admin-input" value={assignPlanId} onChange={(e) => setAssignPlanId(e.target.value)} required>
                <option value="">Choose a plan…</option>
                {plans?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13 }}>Status</label>
              <select className="admin-input" value={assignStatus} onChange={(e) => setAssignStatus(e.target.value)}>
                {SUB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13 }}>End date</label>
              <input className="admin-input" type="date" value={assignEndDate} onChange={(e) => setAssignEndDate(e.target.value)} />
            </div>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={assignAutoRenew} onChange={(e) => setAssignAutoRenew(e.target.checked)} />
              Auto-renew
            </label>
            <button type="submit" className="admin-btn admin-btn-gold" disabled={assigning}>
              {assigning ? 'Assigning…' : 'Assign plan'}
            </button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

export default function SubscriptionsAdmin() {
  return (
    <SuperAdminGuard>
      <SubscriptionsAdminInner />
    </SuperAdminGuard>
  );
}
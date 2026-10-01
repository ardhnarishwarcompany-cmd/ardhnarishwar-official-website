import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { getSettings, updateSettings } from '../api/client';

const empty = {
  jobPortalUrl: '',
  attendanceUrl: '',
  hrmsUrl: '',
  contactEmail: '',
  contactPhone: '',
  officeAddress: '',
  linkedinUrl: '',
  twitterUrl: '',
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
};

const fieldClass =
  'w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold';

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1.5">{label}</label>
      <input
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={fieldClass}
      />
    </div>
  );
}

export default function Settings() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings()
      .then((data) => setForm({ ...empty, ...data }))
      .catch(() => setError('Could not load settings.'))
      .finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const saved = await updateSettings(form);
      setForm({ ...empty, ...saved });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-sm text-muted">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Settings</h1>
      <p className="admin-page-sub">
        Link out to the live Job Portal, Smart Attendance and HRMS products, and manage the
        contact info and social links used across the site — no code changes needed.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-8">
        <div>
          <h2 className="text-sm font-semibold mb-3">Live platforms</h2>
          <p className="text-xs text-muted mb-4">
            These platforms are built and hosted separately. Paste their URLs here and
            "Launch Platform" links will appear on the site automatically — on the matching
            solution page, the homepage and the main navigation.
          </p>
          <div className="space-y-4">
            <Field
              label="Job Portal URL"
              value={form.jobPortalUrl}
              placeholder="https://jobs.ardhnarishwar.com"
              onChange={(e) => update('jobPortalUrl', e.target.value)}
            />
            <Field
              label="Smart Attendance URL"
              value={form.attendanceUrl}
              placeholder="https://attendance.ardhnarishwar.com"
              onChange={(e) => update('attendanceUrl', e.target.value)}
            />
            <Field
              label="HRMS URL"
              value={form.hrmsUrl}
              placeholder="https://hrms.ardhnarishwar.com"
              onChange={(e) => update('hrmsUrl', e.target.value)}
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3">Contact info</h2>
          <div className="space-y-4">
            <Field
              label="Contact email"
              value={form.contactEmail}
              placeholder="info@ardhnarishwar.com"
              onChange={(e) => update('contactEmail', e.target.value)}
            />
            <Field
              label="Contact phone"
              value={form.contactPhone}
              placeholder="+91 ..."
              onChange={(e) => update('contactPhone', e.target.value)}
            />
            <Field
              label="Office address"
              value={form.officeAddress}
              placeholder="City, Country"
              onChange={(e) => update('officeAddress', e.target.value)}
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3">Social links</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="LinkedIn"
              value={form.linkedinUrl}
              placeholder="https://linkedin.com/company/..."
              onChange={(e) => update('linkedinUrl', e.target.value)}
            />
            <Field
              label="Twitter / X"
              value={form.twitterUrl}
              placeholder="https://x.com/..."
              onChange={(e) => update('twitterUrl', e.target.value)}
            />
            <Field
              label="Facebook"
              value={form.facebookUrl}
              placeholder="https://facebook.com/..."
              onChange={(e) => update('facebookUrl', e.target.value)}
            />
            <Field
              label="Instagram"
              value={form.instagramUrl}
              placeholder="https://instagram.com/..."
              onChange={(e) => update('instagramUrl', e.target.value)}
            />
            <Field
              label="YouTube"
              value={form.youtubeUrl}
              placeholder="https://youtube.com/@..."
              onChange={(e) => update('youtubeUrl', e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {saved && !error && <p className="text-sm" style={{ color: '#2f7a4d' }}>Settings saved.</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="text-sm font-semibold text-white bg-soft-orange hover:bg-[var(--soft-orange-dark)] px-5 py-2.5 rounded-sm disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
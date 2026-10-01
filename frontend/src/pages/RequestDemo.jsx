import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitContactForm } from '../api/client';
import { CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function RequestDemo() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: 'I would like a product demo and help setting up our organization workspace.',
  });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus({ type: '', text: '' });
    try {
      await submitContactForm({
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        subject: 'Request Demo',
        message: form.message,
        source: 'request-demo',
      });
      setStatus({
        type: 'ok',
        text: 'Thank you. Our team will contact you shortly. You can also start a free trial and explore CRM now.',
      });
      setForm({ name: '', email: '', phone: '', company: '', message: form.message });
    } catch (err) {
      setStatus({ type: 'err', text: err.response?.data?.error || err.message });
    } finally {
      setBusy(false);
    }
  }

  const journey = [
    'Explore services on the website',
    'Request a demo (this form)',
    'Organization setup on the portal',
    'Subscription & module activation',
    'Invite users & assign roles',
    'Daily operations in CRM (and more modules)',
  ];

  const inputClass =
    'mt-2 w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 outline-none transition focus:border-violet focus:bg-white focus:ring-4 focus:ring-violet/10';
  const labelClass = 'text-[13px] font-semibold text-ink/80';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
      <div className="max-w-2xl mb-12">
        <p className="inline-flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-[0.16em] mb-4">
          <span className="w-6 h-px bg-gold" /> Get started
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4 tracking-tight">Request a <em>demo</em></h1>
        <p className="text-muted text-[16px] leading-relaxed">
          Tell us about your company. We&apos;ll help with organization setup, module activation, and user roles —
          the same path as our platform workflow.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
        <form
          onSubmit={onSubmit}
          className="lg:col-span-3 bg-white border border-line rounded-3xl p-7 sm:p-9 shadow-[0_20px_50px_-24px_rgba(40,27,61,0.18)]"
        >
          {status.text && (
            <div
              className={`flex items-start gap-3 text-sm rounded-xl px-4 py-3 mb-6 ${
                status.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
              }`}
            >
              {status.type === 'ok' ? (
                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              )}
              <span>{status.text}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Full name *</label>
                <input
                  required
                  placeholder="Jane Doe"
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Work email *</label>
                <input
                  type="email"
                  required
                  placeholder="jane@company.com"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  placeholder="+1 (555) 000-0000"
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Company</label>
                <input
                  placeholder="Company name"
                  className={inputClass}
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>What do you need? *</label>
              <textarea
                required
                rows={5}
                className={`${inputClass} resize-none`}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <button
              disabled={busy}
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-ink text-white rounded-xl py-3.5 text-sm font-semibold tracking-wide hover:bg-violet transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? 'Sending…' : 'Submit request'}
              {!busy && <ArrowRight size={16} />}
            </button>
          </div>
        </form>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-paper border border-line rounded-3xl p-7">
            <h2 className="font-bold text-ink text-lg mb-5">Your journey</h2>
            <ol className="space-y-4">
              {journey.map((step, i) => (
                <li key={step} className="flex items-start gap-3.5">
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 1 ? 'bg-violet text-white' : 'bg-white text-muted border border-line'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-sm leading-snug pt-1 ${i === 1 ? 'text-ink font-semibold' : 'text-muted'}`}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-cream border border-gold/40 rounded-3xl p-7">
            <p className="inline-flex items-center gap-2 font-bold text-gold mb-2 text-[15px]">
              <Sparkles size={16} /> Want to try immediately?
            </p>
            <p className="text-gold/80 text-sm leading-relaxed mb-5">
              Create your organization workspace and send your inquiry.
            </p>
            <Link
              to="/portal/register"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-soft-orange hover:bg-[var(--soft-orange-dark)] text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              Start free trial
              <ArrowRight size={15} />
            </Link>
            <p className="mt-4 text-xs text-gold/70">
              Already registered?{' '}
              <Link className="underline font-medium" to="/portal/login">
                Client Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { SendHorizonal, Clock, CheckCircle2 } from 'lucide-react';
import { submitPortalInquiry, listMyPortalInquiries } from '../api/client';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function Inquiry() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  function loadHistory() {
    setHistoryLoading(true);
    listMyPortalInquiries()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!message.trim()) {
      setError('Please describe your requirement.');
      return;
    }
    setLoading(true);
    try {
      await submitPortalInquiry({ subject: subject.trim() || undefined, message: message.trim(), phone: phone.trim() || undefined, priority });
      setSubject('');
      setMessage('');
      setPhone('');
      setPriority('MEDIUM');
      setSuccess(true);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit your inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Submit an Inquiry</h1>
        <p className="text-muted text-sm mt-1">
          Tell us what you need — our team will review it and get back to you.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-line p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg border border-emerald-100">
              <CheckCircle2 size={16} /> Your inquiry has been submitted. We'll be in touch soon.
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
              placeholder="e.g. Need help with onboarding"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Describe your requirement *</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
              placeholder="Tell us what you're looking for..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Contact phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                placeholder="+91 ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-ink hover:bg-teal text-white font-medium py-2.5 px-5 rounded-lg text-sm transition disabled:opacity-60"
          >
            <SendHorizonal size={16} />
            {loading ? 'Submitting…' : 'Submit inquiry'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-line p-6">
        <h2 className="text-sm font-semibold text-ink mb-3">Your past inquiries</h2>
        {historyLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted">No inquiries submitted yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {history.map((h) => (
              <li key={h.id} className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{h.requirement}</p>
                  <p className="text-xs text-muted flex items-center gap-1 mt-1">
                    <Clock size={12} /> {new Date(h.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-paper-2 text-muted">
                  {h.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

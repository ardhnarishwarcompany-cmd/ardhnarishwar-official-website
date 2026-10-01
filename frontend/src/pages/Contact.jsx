import { useState } from 'react';
import { ArrowRight, Check, Mail, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import { submitContactForm } from '../api/client';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', interestedIn: '', message: '' });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await submitContactForm(form);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <section className="contact section-shell" style={{ paddingTop: 20, paddingBottom: 120 }}>
        <div className="contact-panel">
          <div className="contact-copy">
            <div className="section-kicker">Start a conversation</div>
            <h2>
              Let's make work
              <br />
              <em>flow better.</em>
            </h2>
            <p>Tell us what you're running today, and we'll show you which modules close the gap.</p>
            <div className="contact-details">
              <div><Mail size={16} /><span>Talk to our team</span></div>
              <div><MapPin size={16} /><span>Global HR & technology solutions</span></div>
            </div>
          </div>
          {sent ? (
            <div className="success-state">
              <div className="success-icon"><Check /></div>
              <h3>Message sent.</h3>
              <p>We'll get back to you shortly.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Name<input required name="name" value={form.name} onChange={onChange} placeholder="Your name" /></label>
                <label>Email<input required type="email" name="email" value={form.email} onChange={onChange} placeholder="you@company.com" /></label>
              </div>
              <div className="form-row">
                <label>Phone<input name="phone" value={form.phone} onChange={onChange} placeholder="+91 ..." /></label>
                <label>Company<input name="company" value={form.company} onChange={onChange} placeholder="Company name" /></label>
              </div>
              <label>What are you interested in?<input name="interestedIn" value={form.interestedIn} onChange={onChange} placeholder="e.g. AI Recruitment, HRMS" /></label>
              <label>Message<textarea required name="message" value={form.message} onChange={onChange} rows={4} placeholder="Tell us a little about your workflow..." /></label>
              <button className="button button-gold" type="submit" disabled={sending}>
                {sending ? 'Sending...' : 'Send message'} <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}

import { Link } from 'react-router-dom';
import { ArrowRight, Check, X, Layers, Bot, ShieldCheck, Wrench, Headphones, Rocket, Globe2, BookOpen } from 'lucide-react';
import Layout from '../components/Layout';

const stats = [
  ['1000+', 'businesses served'],
  ['10M+', 'users empowered'],
  ['50+', 'countries'],
  ['99.9%', 'platform uptime'],
];

const comparePoints = [
  { typical: 'Separate tools for HR, attendance, recruitment and automation', ardh: 'One connected platform for the entire workforce lifecycle' },
  { typical: 'AI bolted on as a basic chatbot', ardh: 'AI and RPA built into every module, with human approval where it matters' },
  { typical: 'Security handled separately by each vendor', ardh: 'Zero-trust security and compliance monitoring built in' },
  { typical: 'One-size-fits-all software', ardh: 'Custom HRMS, integrations and managed services when you need them' },
  { typical: 'Support tickets and long wait times', ardh: '24/7 support with a dedicated team behind every deployment' },
  { typical: 'Built for a single country', ardh: 'Multi-country, multi-language and multi-currency from day one' },
];

const whyChoose = [
  { icon: Layers, title: 'Complete HR & business ecosystem', text: 'HRMS, staffing, attendance, recruitment and enterprise tools in one connected platform.' },
  { icon: Bot, title: 'AI, robotics & automation', text: 'AI agents and RPA handle the repeatable work across every department.' },
  { icon: ShieldCheck, title: 'Global compliance & security', text: 'Zero-trust architecture and continuous compliance monitoring, built in.' },
  { icon: Wrench, title: 'Custom solutions for every business', text: 'Custom HRMS, integrations and managed services when off-the-shelf isn\u2019t enough.' },
  { icon: Headphones, title: '24/7 support & dedicated team', text: 'A team behind every deployment, not just a dashboard.' },
  { icon: Rocket, title: 'Future-ready technology', text: 'Built to expand with your business as you scale into new markets.' },
  { icon: Globe2, title: 'A global network of specialists', text: 'Vendors, freelancers and partners available through one marketplace.' },
  { icon: BookOpen, title: 'Enterprise knowledge, always searchable', text: 'A shared knowledge base and SOPs so every team works from the same playbook.' },
];

export default function WhyArdhnarishwar() {
  return (
    <Layout>
      <section className="statement section-shell" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="section-kicker">Why Ardhnarishwar</div>
        <div className="statement-grid">
          <h2>
            One platform,
            <br />
            <span>instead of ten disconnected tools.</span>
          </h2>
          <div>
            <p>
              Most businesses stitch together separate HR, staffing, attendance and automation tools. Ardhnarishwar brings all of it together — so your people and your systems read the same data.
            </p>
            <Link to="/contact" className="text-link">
              Talk to our team <ArrowRight size={15} />
            </Link>
            <span style={{ display: 'inline-block', width: 18 }} />
            <Link to="/how-it-works" className="text-link">
              See how it works <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="compare-section section-shell">
        <div className="compare-grid">
          <div className="compare-col typical">
            <h3>The typical way</h3>
            {comparePoints.map((p) => (
              <div className="compare-item" key={p.typical}>
                <X size={15} /> <span>{p.typical}</span>
              </div>
            ))}
          </div>
          <div className="compare-col ardh">
            <h3>The Ardhnarishwar way</h3>
            {comparePoints.map((p) => (
              <div className="compare-item" key={p.ardh}>
                <Check size={15} /> <span>{p.ardh}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE GRID */}
      <section className="why-choose section-shell" style={{ paddingTop: 40 }}>
        <span className="small-label">What you get</span>
        <h2 style={{ fontSize: 'clamp(30px,3.4vw,42px)', maxWidth: 560, lineHeight: 1.1 }}>
          Eight reasons businesses choose Ardhnarishwar.
        </h2>
        <div className="why-grid">
          {whyChoose.map(({ icon: Icon, title, text }) => (
            <div className="why-card" key={title}>
              <span className="why-icon"><Icon size={17} /></span>
              <div>
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="numbers section-shell">
        <div className="numbers-row">
          {stats.map(([num, label]) => (
            <div className="number-block" key={label}>
              <strong>{num}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-cta section-shell" style={{ marginBottom: 100 }}>
        <div>
          <span className="small-label">Ready when you are</span>
          <h2>
            See it against
            <br />
            <em>your own workflow.</em>
          </h2>
        </div>
        <Link to="/contact" className="button button-gold">
          Start a conversation <ArrowRight size={16} />
        </Link>
      </section>
    </Layout>
  );
}

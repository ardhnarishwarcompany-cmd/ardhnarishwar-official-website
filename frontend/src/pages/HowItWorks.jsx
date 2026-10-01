import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

const workflows = {
  business: {
    label: 'Core Business Workflow',
    steps: [
      { title: 'Website visitor', text: 'Someone lands on the site to explore what Ardhnarishwar offers.' },
      { title: 'Explore service', text: 'They browse the modules relevant to their business.' },
      { title: 'Request demo / submit requirement', text: 'They share what they need through the contact form.' },
      { title: 'Sales or HR consultation', text: 'Our team understands the specific workflow and gaps.' },
      { title: 'Client organization setup', text: 'The organization is set up on the platform.' },
      { title: 'Subscription / module activation', text: 'Relevant modules are activated for that organization.' },
      { title: 'User creation', text: 'Accounts are created for HR, managers, recruiters and employees.' },
      { title: 'Role assignment', text: 'Each user gets access matched to their role.' },
      { title: 'Daily operations', text: 'The team runs attendance, HR, recruitment and more from one place.' },
      { title: 'AI & automation', text: 'Repeatable, data-heavy work is handled by AI and RPA.' },
      { title: 'Analytics', text: 'Dashboards surface what\u2019s working and what needs attention.' },
      { title: 'Support', text: 'A dedicated team is available whenever something needs help.' },
      { title: 'Expansion into additional services', text: 'As needs grow, more modules are added to the same platform.' },
    ],
  },
  recruitment: {
    label: 'Recruitment & Staffing Workflow',
    steps: [
      { title: 'Client requirement', text: 'A client shares the role and profile they need to hire for.' },
      { title: 'Job requisition', text: 'The requirement is turned into a formal job requisition.' },
      { title: 'Candidate sourcing', text: 'Candidates are sourced from the database and open market.' },
      { title: 'Job portal / database', text: 'Applications come in through the job portal and candidate database.' },
      { title: 'Resume screening', text: 'Resumes are screened against the role\u2019s requirements.' },
      { title: 'AI assistance', text: 'AI ranks candidates and flags skill gaps to speed up shortlisting.' },
      { title: 'Recruiter review', text: 'A recruiter reviews the AI-shortlisted candidates.' },
      { title: 'Interview', text: 'Shortlisted candidates go through interviews.' },
      { title: 'Client review', text: 'The client reviews the interviewed candidates.' },
      { title: 'Selection', text: 'The client selects the candidate to move forward with.' },
      { title: 'Offer', text: 'An offer is extended to the selected candidate.' },
      { title: 'Joining', text: 'The candidate joins and onboarding begins.' },
      { title: 'Placement tracking', text: 'The placement is tracked through to completion.' },
    ],
  },
};

export default function HowItWorks() {
  const [active, setActive] = useState('business');
  const flow = workflows[active];

  return (
    <Layout>
      <section className="statement section-shell" style={{ paddingTop: 40, paddingBottom: 30 }}>
        <div className="section-kicker">How it works</div>
        <div className="statement-grid">
          <h2>
            From first visit
            <br />
            <span>to placement tracking.</span>
          </h2>
          <div>
            <p>
              Two workflows run underneath the platform \u2014 how a business gets onboarded, and how a hire actually happens.
            </p>
            <Link to="/contact" className="text-link">
              Talk to our team <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="workflow-tabs">
          {Object.entries(workflows).map(([key, w]) => (
            <button
              key={key}
              type="button"
              className={active === key ? 'is-active' : ''}
              onClick={() => setActive(key)}
            >
              {w.label}
            </button>
          ))}
        </div>

        <div className="workflow-list">
          {flow.steps.map((s, i) => (
            <div className="workflow-step" key={s.title}>
              <span className="workflow-num">{i + 1}</span>
              <div>
                <h4>{s.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginTop: 5, maxWidth: 480 }}>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-cta section-shell" style={{ marginTop: 90, marginBottom: 100 }}>
        <div>
          <span className="small-label">Ready when you are</span>
          <h2>
            See this workflow
            <br />
            <em>run on your data.</em>
          </h2>
        </div>
        <Link to="/contact" className="button button-gold">
          Start a conversation <ArrowRight size={16} />
        </Link>
      </section>
    </Layout>
  );
}

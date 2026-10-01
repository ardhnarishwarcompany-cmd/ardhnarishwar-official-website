import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Layout from '../components/Layout';
import { getTeam } from '../api/client';
import peopleOrbitImg from '../assets/images/team-people-network.png';

const values = [
  'Businesses run on people first.',
  'Technology should make work easier, not add another system to babysit.',
  'AI handles repeatable work while people keep the judgment calls.',
];

export default function Team() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    getTeam()
      .then((data) => setMembers(Array.isArray(data) ? data : data?.team || data?.data || []))
      .catch(() => setMembers([]));
  }, []);

  return (
    <Layout>
      <main className="team-page">
        <section className="team-hero section-shell">
          <div>
            <Link to="/" className="back-link"><ArrowLeft size={14} /> Back home</Link>
            <span className="detail-kicker">The people behind the platform</span>
            <h1>
              Built by people who believe work can feel <em>more human.</em>
            </h1>
            <p className="detail-intro">
              Ardhnarishwar Global Business Solutions is a global HR, staffing, workforce technology, AI and enterprise solutions provider.
            </p>
          </div>
          <div className="team-portrait">
            <img src={peopleOrbitImg} alt="Connected workforce" />
            <span>Human intelligence, amplified</span>
          </div>
        </section>

        <section className="team-beliefs section-shell">
          <div className="section-kicker">What guides us</div>
          <div className="belief-grid">
            <div>
              <h2>
                One platform.
                <br />
                <em>Many possibilities.</em>
              </h2>
              <p>
                Every module we build starts from a real workflow a recruiter, manager or employee already has. We make the system around the work — not the other way around.
              </p>
            </div>
            <div className="belief-list">
              {values.map((v) => (
                <div className="belief-line" key={v}>
                  <span><Check size={14} /></span>{v}
                </div>
              ))}
            </div>
          </div>
        </section>

        {members.length > 0 && (
          <section className="section-shell" style={{ paddingBottom: 100 }}>
            <div className="section-kicker">The team</div>
            <div className="solution-grid">
              {members.map((m, i) => (
                <div key={m._id || i} className={`solution-card ${i % 2 === 0 ? 'lavender' : 'cream'}`}>
                  {m.photo && (
                    <img src={m.photo} alt={m.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 16 }} />
                  )}
                  <h3 style={{ fontSize: 20 }}>{m.name}</h3>
                  <p style={{ color: '#8b7e94', fontSize: 13 }}>{m.role || m.title}</p>
                  {m.bio && <p style={{ marginTop: 10 }}>{m.bio}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="team-metrics section-shell">
          <div><strong>1000+</strong><span>businesses served</span></div>
          <div><strong>10M+</strong><span>users empowered</span></div>
          <div><strong>50+</strong><span>countries</span></div>
          <div><strong>99.9%</strong><span>platform uptime</span></div>
        </section>

        <section className="detail-cta section-shell">
          <div>
            <span className="small-label">Work with us</span>
            <h2>
              Good systems make
              <br />
              <em>space for good work.</em>
            </h2>
          </div>
          <Link to="/contact" className="button button-gold">
            Let's talk <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    </Layout>
  );
}
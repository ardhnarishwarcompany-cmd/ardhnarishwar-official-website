import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import peopleOrbitImg from '../assets/images/people-orbit_1b7b3c3b.png';

export default function About() {
  return (
    <Layout>
      <section className="statement section-shell" style={{ paddingTop: 40 }}>
        <div className="section-kicker">About Ardhnarishwar</div>
        <div className="statement-grid">
          <h2>
            Most HR tools handle people.
            <br />
            <span>Most automation tools handle process.</span>
          </h2>
          <div>
            <p>
              Ardhnarishwar is built so both sides read the same data and act on the same plan. We bring HR, staffing, attendance and recruitment together with AI and automation.
            </p>
            <Link to="/contact" className="text-link">
              See how it fits your workflow <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="image-feature">
          <div className="image-feature-copy">
            <span className="small-label">Human intelligence, amplified</span>
            <h3>Technology should make the work feel more human.</h3>
            <p>
              Businesses run on people first. Every module starts from a real workflow a recruiter, manager or employee already has — then removes the friction around it.
            </p>
          </div>
          <div className="image-feature-art">
            <img src={peopleOrbitImg} alt="Connected workforce" />
            <div className="image-caption">A connected workforce, by design</div>
          </div>
        </div>
      </section>

      <section className="detail-cta section-shell" style={{ marginBottom: 100 }}>
        <div>
          <span className="small-label">Ready when you are</span>
          <h2>
            Make the next move
            <br />
            <em>feel lighter.</em>
          </h2>
        </div>
        <Link to="/contact" className="button button-gold">
          Start a conversation <ArrowRight size={16} />
        </Link>
      </section>
    </Layout>
  );
}

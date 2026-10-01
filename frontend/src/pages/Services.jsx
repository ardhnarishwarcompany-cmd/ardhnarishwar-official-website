import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import { LoadingState, ErrorState } from '../components/States';
import { getServices, mediaUrl } from '../api/client';

export default function Services() {
  const [services, setServices] = useState(null);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    getServices()
      .then((data) => setServices(Array.isArray(data) ? data : data?.services || data?.data || []))
      .catch(() => setError(true));
  }, []);

  const categories = useMemo(() => {
    if (!services) return ['All'];
    return ['All', ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];
  }, [services]);

  const visibleServices = useMemo(() => {
    if (!services) return [];
    return activeCategory === 'All' ? services : services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  return (
    <Layout>
      <section className="section-shell" style={{ paddingTop: 40, paddingBottom: 120 }}>
        <div className="section-kicker">Solutions</div>
        <div className="section-head" style={{ marginBottom: 30 }}>
          <div>
            <h2>
              Everything your
              <br />
              <em>workforce</em> needs.
            </h2>
          </div>
          <p>
            Connected modules covering the full workforce lifecycle — from attendance to AI-assisted hiring to enterprise automation.
          </p>
        </div>

        {services && categories.length > 1 && (
          <div className="insight-filters" style={{ marginBottom: 40 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={activeCategory === cat ? 'is-active' : ''}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {error && <ErrorState />}
        {!error && !services && <LoadingState />}
        {services && (
          <div className="solution-grid">
            {visibleServices.map((s, i) => (
              <Link
                key={s._id || s.slug || i}
                to={`/services/${s.slug || s._id}`}
                className={`solution-card ${i % 2 === 0 ? 'lavender' : 'cream'}`}
                onPointerMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
                  const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
                  e.currentTarget.style.setProperty('--tilt-x', `${rx}deg`);
                  e.currentTarget.style.setProperty('--tilt-y', `${ry}deg`);
                }}
                onPointerLeave={(e) => {
                  e.currentTarget.style.setProperty('--tilt-x', '0deg');
                  e.currentTarget.style.setProperty('--tilt-y', '0deg');
                }}
              >
                {s.imageUrl && (
                  <div className="solution-card-image">
                    <img src={mediaUrl(s.imageUrl)} alt={s.title || s.name || ''} />
                  </div>
                )}
                <span className="solution-number">{String(i + 1).padStart(2, '0')}</span>
                {s.externalUrl && (
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 600, color: 'var(--color-teal)',
                      marginBottom: 6,
                    }}
                  >
                    <ExternalLink size={11} /> Live platform
                  </span>
                )}
                <h3>{s.title || s.name}</h3>
                <p>{s.shortDescription || s.description || s.summary || ''}</p>
                <span className="card-arrow"><ArrowRight size={14} /></span>
              </Link>
            ))}
            {visibleServices.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>No solutions in this category yet.</p>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
}
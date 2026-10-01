import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getServices, getCandidate } from '../api/client';

export default function CandidateServices() {
  const candidate = getCandidate();
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
    // Show all published services (no accessType filter)
    return ['All', ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];
  }, [services]);

  // Show all services to candidates (full catalogue)
  const candidateServices = useMemo(() => {
    if (!services) return [];
    return services;
  }, [services]);

  const visibleServices = useMemo(() => {
    if (!candidateServices.length && !services) return [];
    const list = candidateServices;
    return activeCategory === 'All' ? list : list.filter((s) => s.category === activeCategory);
  }, [candidateServices, services, activeCategory]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Welcome{candidate?.name ? `, ${candidate.name}` : ''} 👋</h1>
        <p className="text-muted text-sm mt-1">Explore the services Ardhnarishwar offers — from hiring to HR automation.</p>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                activeCategory === cat
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white text-muted border-line hover:border-line'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          Couldn't load services right now. Please try again shortly.
        </div>
      )}

      {!error && !services && (
        <div className="text-muted text-sm py-12 text-center">Loading services…</div>
      )}

      {services && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleServices.map((s) => (
            <Link
              key={s.id || s.slug}
              to={`/services/${s.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl border border-line p-5 hover:shadow-md hover:border-gold transition group"
            >
              {s.category && (
                <span className="inline-block text-[11px] uppercase tracking-wide font-medium text-gold bg-cream rounded-full px-2.5 py-1 mb-3">
                  {s.category}
                </span>
              )}
              <h3 className="font-semibold text-ink mb-1.5">{s.title}</h3>
              {s.shortDescription && (
                <p className="text-sm text-muted line-clamp-3">{s.shortDescription}</p>
              )}
              <span className="inline-flex items-center gap-1 text-sm text-ink font-medium mt-4 group-hover:text-gold">
                Learn more <ArrowRight size={14} />
              </span>
            </Link>
          ))}
          {visibleServices.length === 0 && (
            <p className="text-muted text-sm col-span-full text-center py-12">No services found in this category.</p>
          )}
        </div>
      )}
    </div>
  );
}

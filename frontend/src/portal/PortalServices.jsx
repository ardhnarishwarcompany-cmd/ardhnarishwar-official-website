import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Lock } from 'lucide-react';
import { getServices, getPlatformUser } from '../api/client';

// Landing page shown right after an organization user signs in from a
// solution's "Access This Service" button on the public site. Nothing here
// launches automatically — the visitor sees this list first and chooses to
// launch a platform explicitly, rather than being bounced straight from the
// public page into an external product.
export default function PortalServices() {
  const location = useLocation();
  const user = getPlatformUser();
  const highlightSlug = location.state?.highlightSlug;
  const cardRefs = useRef({});

  const [services, setServices] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getServices()
      .then((data) => setServices(Array.isArray(data) ? data : data?.services || data?.data || []))
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (highlightSlug && cardRefs.current[highlightSlug]) {
      cardRefs.current[highlightSlug].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [services, highlightSlug]);

  const orgServices = useMemo(() => {
    if (!services) return [];
    // 'both' services are reachable by an organization login too.
    return services.filter((s) => ['organization', 'both'].includes(s.accessType || 'organization'));
  }, [services]);

  function launch(s) {
    if (s.externalUrl) window.open(s.externalUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-ink">
          Welcome{user?.name ? `, ${user.name}` : ''} 👋
        </h1>
        <p className="text-muted text-sm mt-1">
          Here's everything available to your organization. Launch a platform when you're ready.
        </p>
      </div>

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
          {orgServices.map((s) => {
            const isHighlighted = s.slug === highlightSlug;
            return (
              <div
                key={s.id || s.slug}
                ref={(el) => { cardRefs.current[s.slug] = el; }}
                className={`bg-white rounded-xl border p-5 transition ${
                  isHighlighted ? 'border-gold shadow-md ring-2 ring-gold/30' : 'border-line'
                }`}
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
                <div className="flex items-center gap-3 mt-4">
                  {s.externalUrl ? (
                    <button
                      type="button"
                      onClick={() => launch(s)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-ink hover:bg-teal px-3.5 py-2 rounded-lg transition"
                    >
                      Launch Platform <ExternalLink size={14} />
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <Lock size={12} /> Not yet available
                    </span>
                  )}
                  <Link
                    to={`/services/${s.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
                  >
                    Details <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
          {orgServices.length === 0 && (
            <p className="text-muted text-sm col-span-full text-center py-12">
              No services are available to your organization yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
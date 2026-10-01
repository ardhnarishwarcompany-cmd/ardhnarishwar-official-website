import { useEffect, useRef, useState } from 'react';

export default function Reveal({ children, className = '', delay = 0, y = 40 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    // Prefer GSAP if available
    let killed = false;
    import('gsap')
      .then(({ gsap }) =>
        import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
          if (killed) return;
          gsap.registerPlugin(ScrollTrigger);
          gsap.fromTo(
            el,
            { opacity: 0, y },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              delay,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none none',
              },
            }
          );
        })
      )
      .catch(() => {
        // Fallback: IntersectionObserver
        const obs = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisible(true);
              obs.disconnect();
            }
          },
          { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
      });

    return () => {
      killed = true;
    };
  }, [delay, y]);

  return (
    <div
      ref={ref}
      className={`reveal-base ${visible ? 'is-visible' : ''} ${className}`}
      style={{
        opacity: visible ? 1 : undefined,
        transform: visible ? 'none' : undefined,
        transition: `opacity 0.9s cubic-bezier(0.23,1,0.32,1) ${delay}s, transform 0.9s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

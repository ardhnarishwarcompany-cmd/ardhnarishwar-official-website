import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function FloatingVisual({
  src,
  video,
  poster,
  withSound = false,
  alt = '',
  className = '',
  float = true,
  rotate = false,
  parallax = false,
  style = {},
}) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let animId;
    let start = performance.now();
    const amp = float ? 10 : 0;
    const rotAmp = rotate ? 5 : 0;

    const tick = (now) => {
      const t = (now - start) / 1000;
      const y = Math.sin(t * 0.7) * amp;
      const r = Math.sin(t * 0.35) * rotAmp;
      el.style.transform = `translateY(${y}px) rotate(${r}deg)`;
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    let onMove;
    if (parallax) {
      onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / window.innerWidth;
        const dy = (e.clientY - cy) / window.innerHeight;
        el.style.setProperty('--px', `${dx * 16}px`);
        el.style.setProperty('--py', `${dy * 12}px`);
      };
      window.addEventListener('mousemove', onMove, { passive: true });
    }

    return () => {
      cancelAnimationFrame(animId);
      if (onMove) window.removeEventListener('mousemove', onMove);
    };
  }, [float, rotate, parallax]);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    if (!next) {
      // Unmuting happens directly from a user click, so play() is allowed to include audio.
      v.play().catch(() => {});
    }
    setMuted(next);
  };

  return (
    <div
      ref={ref}
      className={`floating-visual ${className}`}
      style={{
        ...style,
        transform: 'translate(var(--px, 0), var(--py, 0))',
        transition: parallax ? 'transform 0.6s ease-out' : undefined,
      }}
    >
      {video ? (
        <>
          <video
            ref={videoRef}
            src={video}
            poster={poster}
            autoPlay
            muted={muted}
            loop
            playsInline
            preload="metadata"
          />
          {withSound && (
            <button
              type="button"
              className="visual-sound-toggle"
              onClick={toggleSound}
              aria-label={muted ? 'Unmute video' : 'Mute video'}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
        </>
      ) : (
        <img src={src} alt={alt} loading="lazy" draggable={false} />
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Briefcase,
  Cpu,
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Layers,
  Rocket,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const SCENES = [
  {
    id: 'build',
    title: 'BUILDING BETTER BUSINESS',
    subtitle: 'Strategic solutions designed to move businesses forward.',
  },
  {
    id: 'connect',
    title: 'SOLUTIONS THAT CONNECT',
    subtitle: 'Technology, people and strategy working together.',
  },
  {
    id: 'growth',
    title: 'FROM VISION TO GROWTH',
    subtitle: 'Turning ambitious ideas into measurable business outcomes.',
  },
];

const ECOSYSTEM_ICONS = [
  { Icon: Target, label: 'Strategy' },
  { Icon: Cpu, label: 'Technology' },
  { Icon: Briefcase, label: 'Consulting' },
  { Icon: TrendingUp, label: 'Growth' },
  { Icon: Users, label: 'People' },
  { Icon: Layers, label: 'Operations' },
  { Icon: BarChart3, label: 'Analytics' },
  { Icon: Rocket, label: 'Execution' },
];

function ScrollCharacter({ char, index, total, progress, reduced }) {
  const mid = (total - 1) / 2;
  const dist = index - mid;
  const absDist = Math.abs(dist);

  // Motion values driven by progress (0 → 1)
  const x = reduced ? 0 : dist * 55 * (1 - progress);
  const y = reduced ? 0 : (absDist % 2 === 0 ? -1 : 1) * 18 * (1 - progress);
  const rotate = reduced ? 0 : dist * 12 * (1 - progress);
  const scale = reduced ? 1 : 0.78 + 0.22 * progress;
  const opacity = reduced ? 1 : 0.35 + 0.65 * progress;

  return (
    <span
      className="scroll-char"
      style={{
        display: 'inline-block',
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`,
        opacity,
        willChange: 'transform, opacity',
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
}

function SceneTitle({ text, progress, reduced }) {
  const chars = text.split('');
  return (
    <h2 className="scroll-story-title" aria-label={text}>
      {chars.map((c, i) => (
        <ScrollCharacter
          key={`${text}-${i}`}
          char={c}
          index={i}
          total={chars.length}
          progress={progress}
          reduced={reduced}
        />
      ))}
    </h2>
  );
}

export default function ArdhnarishwarScrollStory() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeScene, setActiveScene] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(prefersReduced);
    if (prefersReduced) {
      setProgress(1);
      return;
    }

    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: sticky,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);
          if (p < 0.33) setActiveScene(0);
          else if (p < 0.66) setActiveScene(1);
          else setActiveScene(2);
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Per-scene local progress 0→1
  const sceneProgress = (idx) => {
    if (reduced) return 1;
    const start = idx / 3;
    const end = (idx + 1) / 3;
    if (progress <= start) return 0;
    if (progress >= end) return 1;
    return (progress - start) / (end - start);
  };

  const scene0 = sceneProgress(0);
  const scene1 = sceneProgress(1);
  const scene2 = sceneProgress(2);

  return (
    <section
      ref={sectionRef}
      className="ardh-scroll-story"
      id="business-journey"
      aria-label="Business journey"
    >
      <div ref={stickyRef} className="ardh-scroll-story-sticky">
        <div className="ardh-scroll-story-inner">
          {/* Ambient background */}
          <div className="ardh-scroll-bg" aria-hidden="true" />

          {/* Scene 1 — Convergence text */}
          <div
            className={`ardh-scene ardh-scene-1 ${activeScene === 0 ? 'is-active' : ''}`}
            style={{ opacity: activeScene === 0 ? 1 : 0, pointerEvents: activeScene === 0 ? 'auto' : 'none' }}
          >
            <div className="ardh-scene-kicker">The Journey</div>
            <SceneTitle text={SCENES[0].title} progress={scene0} reduced={reduced} />
            <p className="ardh-scene-subtitle" style={{ opacity: 0.4 + 0.6 * scene0 }}>
              {SCENES[0].subtitle}
            </p>
          </div>

          {/* Scene 2 — Ecosystem icons converge */}
          <div
            className={`ardh-scene ardh-scene-2 ${activeScene === 1 ? 'is-active' : ''}`}
            style={{ opacity: activeScene === 1 ? 1 : 0, pointerEvents: activeScene === 1 ? 'auto' : 'none' }}
          >
            <div className="ardh-scene-kicker">Connected Platform</div>
            <SceneTitle text={SCENES[1].title} progress={scene1} reduced={reduced} />
            <p className="ardh-scene-subtitle" style={{ opacity: 0.4 + 0.6 * scene1 }}>
              {SCENES[1].subtitle}
            </p>
            <div className="ardh-icon-ring" aria-hidden="true">
              {ECOSYSTEM_ICONS.map(({ Icon, label }, i) => {
                const angle = (i / ECOSYSTEM_ICONS.length) * Math.PI * 2 - Math.PI / 2;
                const radius = reduced ? 0 : 140 * (1 - scene1);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const scale = reduced ? 1 : 0.7 + 0.3 * scene1;
                return (
                  <div
                    key={label}
                    className="ardh-icon-node"
                    style={{
                      transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                      opacity: 0.5 + 0.5 * scene1,
                    }}
                    title={label}
                  >
                    <Icon size={22} strokeWidth={1.6} />
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scene 3 — Vision → Growth */}
          <div
            className={`ardh-scene ardh-scene-3 ${activeScene === 2 ? 'is-active' : ''}`}
            style={{ opacity: activeScene === 2 ? 1 : 0, pointerEvents: activeScene === 2 ? 'auto' : 'none' }}
          >
            <div className="ardh-scene-kicker">Transformation</div>
            <SceneTitle text={SCENES[2].title} progress={scene2} reduced={reduced} />
            <p className="ardh-scene-subtitle" style={{ opacity: 0.4 + 0.6 * scene2 }}>
              {SCENES[2].subtitle}
            </p>
            <div className="ardh-steps" aria-hidden="true">
              {['VISION', 'STRATEGY', 'EXECUTION', 'GROWTH'].map((step, i) => {
                const stepP = Math.max(0, Math.min(1, (scene2 - i * 0.2) / 0.35));
                return (
                  <div
                    key={step}
                    className="ardh-step"
                    style={{
                      opacity: 0.3 + 0.7 * stepP,
                      transform: `translateY(${(1 - stepP) * 24}px) scale(${0.9 + 0.1 * stepP})`,
                    }}
                  >
                    <span className="ardh-step-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ardh-step-label">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="ardh-scroll-progress" aria-hidden="true">
            <div className="ardh-scroll-progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

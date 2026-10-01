import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 3D vector & image assets from project
import heroOrbSvg from '../../assets/3d/01_hero_workforce_orb.svg';
import humanSculptureSvg from '../../assets/3d/02_human_centered_sculpture.svg';
import securityTrustSvg from '../../assets/3d/07_security_trust.svg';
import insightsDocSvg from '../../assets/3d/08_insights_document.svg';
import ctaGoldenOrbSvg from '../../assets/3d/09_cta_golden_orb.svg';

// Service icon assets
import iconHrWorkforce from '../../assets/icons/01_HR_Workforce_Management.png';
import iconSmartAttendance from '../../assets/icons/02_Smart_Attendance.png';
import iconAiRecruitment from '../../assets/icons/03_AI_Recruitment.png';
import iconRoboticsAutomation from '../../assets/icons/06_Robotics_Automation.png';
import iconAnalytics from '../../assets/icons/09_Analytics_Business_Intelligence.png';
import iconPersonalAi from '../../assets/icons/11_Personal_AI.png';
import iconCrm from '../../assets/icons/07_CRM_Customer_Support.png';

gsap.registerPlugin(ScrollTrigger);

// 8 radial ecosystem nodes for Stage 3 & 4
const ECOSYSTEM_NODES = [
  { id: 'recruitment', label: 'Recruitment', icon: iconAiRecruitment, angle: 0, tag: 'AI Screening' },
  { id: 'workforce', label: 'Workforce', icon: iconHrWorkforce, angle: 45, tag: 'Real-time Sync' },
  { id: 'ai', label: 'AI Assistants', icon: iconPersonalAi, angle: 90, tag: 'Natural Language' },
  { id: 'automation', label: 'Automation', icon: iconRoboticsAutomation, angle: 135, tag: 'RPA Workflows' },
  { id: 'analytics', label: 'Analytics', icon: iconAnalytics, angle: 180, tag: 'Predictive Insights' },
  { id: 'experience', label: 'Employee Care', icon: humanSculptureSvg, angle: 225, tag: 'Self-Service' },
  { id: 'crm', label: 'CRM & Talent', icon: iconCrm, angle: 270, tag: 'Client & Candidate' },
  { id: 'reporting', label: 'Governance', icon: securityTrustSvg, angle: 315, tag: 'Compliance' },
];

export default function CinematicScrollStory() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const [activeStage, setActiveStage] = useState(1);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReducedMotion(prefersReduced);
    if (prefersReduced) return;

    const container = containerRef.current;
    const sticky = stickyRef.current;
    if (!container || !sticky) return;

    const ctx = gsap.context(() => {
      // Main Scrubbed Timeline pinned across the 450vh scroll duration
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          pin: sticky,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.20) setActiveStage(1);
            else if (p < 0.40) setActiveStage(2);
            else if (p < 0.65) setActiveStage(3);
            else if (p < 0.85) setActiveStage(4);
            else setActiveStage(5);
          },
        },
      });

      // Quick helper references
      const story1 = '.story-beat-1';
      const story2 = '.story-beat-2';
      const story3 = '.story-beat-3';
      const story4 = '.story-beat-4';
      const story5 = '.story-beat-5';

      const centralCore = '.cinematic-core-wrapper';
      const stageCenter = '.cinematic-stage-center';
      const modularNodes = '.modular-cluster-node';
      const ecoNodes = '.eco-node-item';
      const connectionLines = '.eco-connection-path';
      const telemetryCards = '.telemetry-floating-card';
      const finalOrb = '.cinematic-final-orb';
      const ambientGlow = '.cinematic-ambient-glow';
      const progressBar = '.cinematic-progress-fill';

      const isDesktop = typeof window !== 'undefined' && window.innerWidth > 860;
      const shiftX = isDesktop ? 230 : 0;
      const initialY = isDesktop ? 0 : -50;

      // Set initial states - stage starts shifted to the right so left text is 100% clean
      gsap.set(stageCenter, { x: shiftX, y: initialY });
      gsap.set(story1, { opacity: 1, y: 0, filter: 'blur(0px)' });
      gsap.set([story2, story3, story4, story5], { opacity: 0, y: 40, filter: 'blur(10px)', pointerEvents: 'none' });
      gsap.set(modularNodes, { scale: 0.2, opacity: 0 });
      gsap.set(ecoNodes, { scale: 0, opacity: 0 });
      gsap.set(connectionLines, { strokeDashoffset: 600, opacity: 0 });
      gsap.set(telemetryCards, { opacity: 0, y: 25, scale: 0.9 });
      gsap.set(finalOrb, { opacity: 0, scale: 0.4 });
      gsap.set(progressBar, { scaleY: 0 });

      // Progress bar tracks entire timeline
      tl.to(progressBar, { scaleY: 1, ease: 'none', duration: 10 }, 0);

      // Orbital ambient slow continuous spin handled alongside scrub
      tl.to('.ring-outer', { rotation: 180, ease: 'none', duration: 10 }, 0);
      tl.to('.ring-inner', { rotation: -240, ease: 'none', duration: 10 }, 0);
      tl.to('.ring-mid', { rotation: 120, ease: 'none', duration: 10 }, 0);

      /* ========================================================
         STAGE 1 -> STAGE 2 TRANSITION (Progress: 0.0 -> 0.25)
         "Human Intelligence" -> "The System Opens"
         ======================================================== */
      tl.to(story1, {
        opacity: 0,
        y: -30,
        filter: 'blur(8px)',
        duration: 0.8,
        ease: 'power2.in',
      }, 1.2);

      tl.to(story2, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        pointerEvents: 'auto',
        duration: 1.0,
        ease: 'power2.out',
      }, 1.8);

      tl.to(centralCore, {
        scale: 1.05,
        duration: 1.5,
        ease: 'power1.inOut',
      }, 1.2);

      tl.to(ambientGlow, {
        opacity: 0.85,
        scale: 1.25,
        background: 'radial-gradient(circle, rgba(91, 59, 130, 0.45) 0%, rgba(201, 155, 97, 0.18) 45%, transparent 70%)',
        duration: 1.5,
      }, 1.2);

      // Modular nodes emerge radially with tighter bounds so they stay well clear of text
      tl.to('.mod-node-1', { x: -110, y: -90, scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }, 1.5);
      tl.to('.mod-node-2', { x: 110, y: -80, scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }, 1.6);
      tl.to('.mod-node-3', { x: -130, y: 30, scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }, 1.7);
      tl.to('.mod-node-4', { x: 130, y: 40, scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }, 1.8);
      tl.to('.mod-node-5', { x: -90, y: 115, scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }, 1.9);
      tl.to('.mod-node-6', { x: 90, y: 125, scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }, 2.0);

      /* ========================================================
         STAGE 2 -> STAGE 3 TRANSITION (Progress: 0.25 -> 0.50)
         "The System Opens" -> "Intelligent Ecosystem"
         StageCenter glides LEFT, opening the entire RIGHT for text
         ======================================================== */
      tl.to(story2, {
        opacity: 0,
        y: -30,
        filter: 'blur(8px)',
        pointerEvents: 'none',
        duration: 0.8,
        ease: 'power2.in',
      }, 3.0);

      tl.to(modularNodes, {
        opacity: 0,
        scale: 0.5,
        duration: 0.7,
      }, 3.0);

      // Smoothly shift stage visual to the left so right-side copy has complete open clearance
      if (isDesktop) {
        tl.to(stageCenter, {
          x: -shiftX,
          y: 0,
          duration: 1.2,
          ease: 'power2.inOut',
        }, 2.8);
      }

      tl.to(story3, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        pointerEvents: 'auto',
        duration: 1.0,
        ease: 'power2.out',
      }, 3.4);

      tl.to(centralCore, {
        scale: 0.92,
        duration: 1.0,
        ease: 'power2.out',
      }, 3.2);

      // 8 radial ecosystem nodes positioned at compact radius (170px)
      ECOSYSTEM_NODES.forEach((node, idx) => {
        const rad = (node.angle * Math.PI) / 180;
        const radius = isDesktop ? 170 : 130;
        const targetX = Math.round(Math.cos(rad) * radius);
        const targetY = Math.round(Math.sin(rad) * radius);

        tl.to(`.eco-node-${node.id}`, {
          x: targetX,
          y: targetY,
          scale: 1,
          opacity: 1,
          duration: 1.0,
          ease: 'back.out(1.3)',
        }, 3.2 + idx * 0.07);
      });

      tl.to(connectionLines, {
        strokeDashoffset: 0,
        opacity: 0.7,
        duration: 1.2,
        ease: 'power2.out',
      }, 3.4);

      /* ========================================================
         STAGE 3 -> STAGE 4 TRANSITION (Progress: 0.50 -> 0.75)
         "Intelligent Ecosystem" -> "Automation & Intelligence"
         StageCenter glides RIGHT, opening the entire LEFT for text
         ======================================================== */
      tl.to(story3, {
        opacity: 0,
        y: -30,
        filter: 'blur(8px)',
        pointerEvents: 'none',
        duration: 0.8,
        ease: 'power2.in',
      }, 5.2);

      // Smoothly shift stage visual back to the right so left-side copy has complete open clearance
      if (isDesktop) {
        tl.to(stageCenter, {
          x: shiftX,
          y: 0,
          duration: 1.2,
          ease: 'power2.inOut',
        }, 5.0);
      }

      tl.to(story4, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        pointerEvents: 'auto',
        duration: 1.0,
        ease: 'power2.out',
      }, 5.6);

      tl.to('.eco-node-ai, .eco-node-automation, .eco-node-analytics', {
        scale: 1.15,
        filter: 'drop-shadow(0 0 16px rgba(201, 155, 97, 0.7))',
        duration: 0.8,
      }, 5.4);

      tl.to('.eco-node-item:not(.eco-node-ai):not(.eco-node-automation):not(.eco-node-analytics)', {
        opacity: 0.3,
        scale: 0.85,
        duration: 0.8,
      }, 5.4);

      tl.to('.connection-line-active', {
        stroke: '#C99B61',
        strokeWidth: 2.2,
        opacity: 0.95,
        duration: 0.8,
      }, 5.4);

      tl.to('.telemetry-card-1', { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' }, 5.7);
      tl.to('.telemetry-card-2', { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' }, 5.9);
      tl.to('.telemetry-card-3', { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' }, 6.1);

      /* ========================================================
         STAGE 4 -> STAGE 5 TRANSITION (Progress: 0.75 -> 1.0)
         "Automation & Intelligence" -> "Reassembly / People First"
         StageCenter centers and raises up, text sits cleanly underneath
         ======================================================== */
      tl.to(story4, {
        opacity: 0,
        y: -30,
        filter: 'blur(8px)',
        pointerEvents: 'none',
        duration: 0.8,
        ease: 'power2.in',
      }, 7.5);

      tl.to(telemetryCards, {
        opacity: 0,
        y: -20,
        scale: 0.9,
        duration: 0.6,
      }, 7.5);

      // Smoothly center the visual and raise it upward
      tl.to(stageCenter, {
        x: 0,
        y: isDesktop ? -135 : -100,
        scale: 0.9,
        duration: 1.3,
        ease: 'power2.inOut',
      }, 7.5);

      tl.to(ecoNodes, {
        x: 0,
        y: 0,
        scale: 0.1,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.inOut',
      }, 7.7);

      tl.to(connectionLines, {
        opacity: 0,
        strokeDashoffset: 600,
        duration: 0.9,
      }, 7.7);

      tl.to(centralCore, {
        opacity: 0,
        scale: 0.6,
        duration: 0.8,
      }, 7.9);

      tl.to(finalOrb, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'back.out(1.3)',
      }, 8.1);

      tl.to(ambientGlow, {
        opacity: 0.9,
        scale: 1.4,
        background: 'radial-gradient(circle, rgba(201, 155, 97, 0.42) 0%, rgba(59, 36, 93, 0.35) 45%, transparent 72%)',
        duration: 1.3,
      }, 8.0);

      tl.to(story5, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        pointerEvents: 'auto',
        duration: 1.1,
        ease: 'power2.out',
      }, 8.4);
    }, container);

    return () => ctx.revert();
  }, [isReducedMotion]);

  return (
    <section
      ref={containerRef}
      id="cinematic-story"
      className="cinematic-story-container"
      aria-label="Ardhnarishwar Scrollytelling Story"
    >
      {/* Sticky 100vh Viewport */}
      <div ref={stickyRef} className="cinematic-viewport">
        {/* Subtle grid background & luxury atmospheric glows */}
        <div className="cinematic-grid-overlay" />
        <div className="cinematic-ambient-glow" />

        {/* Floating background particles */}
        <div className="cinematic-stars-layer">
          <div className="star star-1" />
          <div className="star star-2" />
          <div className="star star-3" />
          <div className="star star-4" />
        </div>

        {/* Vertical story progress indicator */}
        <div className="cinematic-progress-bar" aria-hidden="true">
          <div className="cinematic-progress-track">
            <div className="cinematic-progress-fill" />
          </div>
          <div className="cinematic-stages-indicator">
            {[
              { num: '01', title: 'Human Core' },
              { num: '02', title: 'Modular Systems' },
              { num: '03', title: 'Ecosystem' },
              { num: '04', title: 'Automation' },
              { num: '05', title: 'Synthesis' },
            ].map((s, idx) => (
              <div
                key={s.num}
                className={`stage-dot-wrap ${activeStage === idx + 1 ? 'is-active' : ''}`}
                title={s.title}
              >
                <span className="stage-dot" />
                <span className="stage-num-label">{s.num}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Central Stage: 3D Visual & Interactive Nodes */}
        <div className="cinematic-stage-center">
          {/* Orbital rings */}
          <div className="cinematic-orbital-ring ring-outer" />
          <div className="cinematic-orbital-ring ring-mid" />
          <div className="cinematic-orbital-ring ring-inner" />

          {/* Dynamic SVG Connection lines for Stage 3 & 4 */}
          <svg className="cinematic-svg-connections" viewBox="0 0 600 600">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C99B61" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#DCCCEF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3B245D" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {ECOSYSTEM_NODES.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              const radius = 170;
              const x2 = 300 + Math.cos(rad) * radius;
              const y2 = 300 + Math.sin(rad) * radius;
              const isActive = ['ai', 'automation', 'analytics'].includes(node.id);
              return (
                <line
                  key={`line-${node.id}`}
                  x1="300"
                  y1="300"
                  x2={x2}
                  y2={y2}
                  className={`eco-connection-path ${isActive ? 'connection-line-active' : ''}`}
                  stroke={isActive ? '#C99B61' : 'url(#lineGrad)'}
                  strokeWidth={isActive ? '1.8' : '1.2'}
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* Central Intelligent Core Wrapper (Stage 1 & 2) */}
          <div className="cinematic-core-wrapper">
            <div className="core-glow-pulse" />
            <div className="core-inner-frame">
              <img
                src={heroOrbSvg}
                alt="Central Workforce Orb"
                className="core-svg-img"
                loading="eager"
              />
              <div className="core-center-badge">
                <span className="core-beacon" />
                <span>Ardhnarishwar</span>
              </div>
            </div>
          </div>

          {/* Modular Cluster Nodes (Stage 2: "The System Opens") */}
          <div className="modular-cluster-layer">
            <div className="modular-cluster-node mod-node-1">
              <img src={iconHrWorkforce} alt="" />
              <span>HR & Teams</span>
            </div>
            <div className="modular-cluster-node mod-node-2">
              <img src={iconSmartAttendance} alt="" />
              <span>Smart Attendance</span>
            </div>
            <div className="modular-cluster-node mod-node-3">
              <img src={iconAiRecruitment} alt="" />
              <span>AI Recruitment</span>
            </div>
            <div className="modular-cluster-node mod-node-4">
              <img src={iconRoboticsAutomation} alt="" />
              <span>RPA Engine</span>
            </div>
            <div className="modular-cluster-node mod-node-5">
              <img src={iconAnalytics} alt="" />
              <span>Analytics</span>
            </div>
            <div className="modular-cluster-node mod-node-6">
              <img src={insightsDocSvg} alt="" />
              <span>Intelligence</span>
            </div>
          </div>

          {/* 8-Point Radial Ecosystem Nodes (Stage 3 & 4) */}
          <div className="ecosystem-radial-layer">
            {ECOSYSTEM_NODES.map((node) => (
              <div
                key={node.id}
                className={`eco-node-item eco-node-${node.id}`}
                data-id={node.id}
              >
                <div className="eco-node-pill">
                  <div className="eco-node-icon-wrap">
                    <img src={node.icon} alt={node.label} />
                  </div>
                  <div className="eco-node-text">
                    <strong>{node.label}</strong>
                    <small>{node.tag}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Telemetry live cards (Stage 4: "Automation & Intelligence") */}
          <div className="telemetry-layer">
            <div className="telemetry-floating-card telemetry-card-1">
              <div className="telemetry-header">
                <span className="telemetry-dot dot-green" />
                <span className="telemetry-title">AI Sourcing Pipeline</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-val">99.4%</span>
                <span className="stat-desc">Repetitive admin eliminated</span>
              </div>
            </div>

            <div className="telemetry-floating-card telemetry-card-2">
              <div className="telemetry-header">
                <span className="telemetry-dot dot-gold" />
                <span className="telemetry-title">Autonomous Workflow</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-val">Real-time</span>
                <span className="stat-desc">Biometric & payroll sync</span>
              </div>
            </div>

            <div className="telemetry-floating-card telemetry-card-3">
              <div className="telemetry-header">
                <span className="telemetry-dot dot-purple" />
                <span className="telemetry-title">Decision Protocol</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-val">Human in Loop</span>
                <span className="stat-desc">AI recommends · Leaders decide</span>
              </div>
            </div>
          </div>

          {/* Final Reassembled Synthesis Orb (Stage 5) */}
          <div className="cinematic-final-orb">
            <div className="final-orb-halo" />
            <img
              src={ctaGoldenOrbSvg}
              alt="Harmonious Unified Ecosystem"
              className="final-orb-img"
            />
            <div className="final-orb-emblem">
              <span className="emblem-core-ring" />
              <span className="emblem-text">Human + Machine</span>
            </div>
          </div>
        </div>

        {/* Editorial Story Beats (Scrubbed overlay text) */}
        <div className="cinematic-story-overlay">
          {/* BEAT 1: Human Intelligence (0–20%) */}
          <div className="story-beat story-beat-1 align-left">
            <div className="story-kicker">
              <span className="kicker-bullet" />
              Stage 01 // Origin & Philosophy
            </div>
            <h2 className="story-headline">
              Where people-work
              <br />
              <em>meets</em> machine-work.
            </h2>
            <p className="story-lead">
              One connected ecosystem for people, processes and intelligent automation.
              Technology designed not to replace human talent, but to elevate it.
            </p>
            <div className="story-pill-row">
              <span className="story-tag">Human-First Design</span>
              <span className="story-tag">Ethical AI Core</span>
              <span className="story-tag">Unified Operations</span>
            </div>
            <div className="scroll-prompt">
              <span className="mouse-wheel-icon" />
              <span>Scroll to explore the architecture</span>
            </div>
          </div>

          {/* BEAT 2: The System Opens (20–40%) */}
          <div className="story-beat story-beat-2 align-left">
            <div className="story-kicker">
              <span className="kicker-bullet" />
              Stage 02 // Modular Architecture
            </div>
            <h2 className="story-headline">
              Technology that works
              <br />
              <em>around people</em>.
            </h2>
            <p className="story-lead">
              Connect the workflows your people already use, then remove the friction
              between them. Every department operates in sync without fragmented silos.
            </p>
            <div className="story-pill-row">
              <span className="story-tag">Zero Context-Switching</span>
              <span className="story-tag">Continuous Synchrony</span>
            </div>
          </div>

          {/* BEAT 3: Intelligent Ecosystem (40–65%) */}
          <div className="story-beat story-beat-3 align-right">
            <div className="story-kicker">
              <span className="kicker-bullet" />
              Stage 03 // The Connected Operating Layer
            </div>
            <h2 className="story-headline">
              One intelligent
              <br />
              <em>core</em>.
            </h2>
            <p className="story-lead">
              Recruitment, workforce, automation, analytics and employee experience
              connected through one harmonious operating layer. Eight disciplines,
              one shared intelligence.
            </p>
            <div className="story-pill-row">
              <span className="story-tag">Recruitment</span>
              <span className="story-tag">Workforce</span>
              <span className="story-tag">Analytics</span>
              <span className="story-tag">Security</span>
            </div>
          </div>

          {/* BEAT 4: Automation & Intelligence (65–85%) */}
          <div className="story-beat story-beat-4 align-left">
            <div className="story-kicker">
              <span className="kicker-bullet" />
              Stage 04 // Autonomous Precision
            </div>
            <h2 className="story-headline">
              Let technology handle
              <br />
              the <em>repeatable work</em>.
            </h2>
            <p className="story-lead">
              AI and automation take care of repetitive processes so your teams can
              focus on judgment, relationships and strategic growth.
            </p>
            <div className="story-quote-card">
              <Sparkles size={16} className="text-[#C99B61] shrink-0" />
              <span>“AI assists. Humans decide.”</span>
            </div>
          </div>

          {/* BEAT 5: Reassembly / Final Synthesis (85–100%) */}
          <div className="story-beat story-beat-5 align-center">
            <div className="story-kicker justify-center">
              <span className="kicker-bullet" />
              Stage 05 // Complete Ecosystem
            </div>
            <h2 className="story-headline text-center">
              People first.
              <br />
              <em>Intelligence built in.</em>
            </h2>
            <p className="story-lead text-center max-w-xl mx-auto">
              One platform. Connected workflows. Smarter ways to work. Experience
              enterprise software built with the quiet confidence of human craftsmanship.
            </p>
            <div className="story-action-group">
              <Link to="/services" className="cinematic-cta-primary">
                <span>Explore solutions</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/why-ardhnarishwar" className="cinematic-cta-secondary">
                <span>Why Ardhnarishwar</span>
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

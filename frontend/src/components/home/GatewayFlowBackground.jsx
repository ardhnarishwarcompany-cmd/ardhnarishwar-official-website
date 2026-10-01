import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * GatewayFlowBackground
 * ----------------------
 * A subtle, premium canvas animation for the hero section: soft bezier
 * "flow" paths entering from the left and right edges and converging
 * toward the centre, with fine dotted particles travelling along them.
 *
 * - Purely decorative: absolutely positioned, `pointer-events: none`,
 *   and does not participate in layout (no effect on hero height).
 * - Theme-aware: reads `resolvedTheme` from the existing ThemeContext
 *   and re-tunes colours/opacity without remounting or resetting the
 *   animation loop.
 * - Respects `prefers-reduced-motion`: falls back to a very slow,
 *   low-amplitude drift instead of full motion.
 * - No React state is touched per-frame; all per-frame work happens
 *   inside a single requestAnimationFrame loop via refs, so this never
 *   triggers component re-renders.
 */
export default function GatewayFlowBackground({
  density = 1,
  className = '',
}) {
  const canvasRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);

  // Keep the live theme available to the animation loop without
  // restarting it — colours update smoothly on the next frame.
  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;
    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener?.('change', handleMotionChange);

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    /** One flowing gateway path: a cubic bezier from an edge toward the
     * convergence zone, plus the particles that travel along it. */
    class FlowPath {
      constructor(side, index, total, target) {
        this.side = side; // 'left' | 'right'
        this.reset(index, total, true, target);
      }

      reset(index, total, initial = false, target) {
        const fromX = this.side === 'left' ? -0.06 : 1.06;
        const fromY = 0.14 + Math.random() * 0.72;
        // Convergence target: the left and right path sharing this row
        // (same index) are handed the exact same target point by
        // buildPaths below, so they physically cross at that point
        // rather than each side converging on its own independently
        // random spot — that's what was leaving a dead strip down the
        // centre. A tiny bit of independent jitter keeps it organic
        // without reopening the gap.
        const targetX = target.x + (Math.random() - 0.5) * 0.02;
        const targetY = target.y + (Math.random() - 0.5) * 0.02;

        this.p0 = { x: fromX, y: fromY };
        this.p3 = { x: targetX, y: targetY };

        const bow = 0.18 + Math.random() * 0.14;
        this.p1 = {
          x: fromX + (this.side === 'left' ? 1 : -1) * bow,
          y: fromY + (Math.random() - 0.5) * 0.22,
        };
        this.p2 = {
          x: targetX + (this.side === 'left' ? -1 : 1) * bow * 1.4,
          y: targetY + (Math.random() - 0.5) * 0.18,
        };

        this.life = 0;
        this.duration = 16 + Math.random() * 10; // seconds for one full pass
        this.lineAlpha = 0.16 + Math.random() * 0.14;
        this.particleCount = 2 + Math.floor(Math.random() * 2);
        this.particles = Array.from({ length: this.particleCount }, (_, i) => ({
          t: initial ? Math.random() : i / this.particleCount,
          speedJitter: 0.85 + Math.random() * 0.3,
          size: 1.1 + Math.random() * 1.3,
        }));
      }

      pointAt(t) {
        const u = 1 - t;
        const x =
          u * u * u * this.p0.x +
          3 * u * u * t * this.p1.x +
          3 * u * t * t * this.p2.x +
          t * t * t * this.p3.x;
        const y =
          u * u * u * this.p0.y +
          3 * u * u * t * this.p1.y +
          3 * u * t * t * this.p2.y +
          t * t * t * this.p3.y;
        return { x: x * width, y: y * height };
      }

      draw(ctx2, dt, colors, motionScale) {
        this.life += dt;
        if (this.life > this.duration) {
          this.life = 0;
        }

        // Draw the guiding curve, faint. A soft glow (dark theme only,
        // via colors.glow) is applied through shadowBlur/shadowColor.
        ctx2.save();
        if (colors.glow) {
          ctx2.shadowBlur = 5;
          ctx2.shadowColor = colors.glow;
        }
        ctx2.beginPath();
        ctx2.moveTo(this.p0.x * width, this.p0.y * height);
        ctx2.bezierCurveTo(
          this.p1.x * width,
          this.p1.y * height,
          this.p2.x * width,
          this.p2.y * height,
          this.p3.x * width,
          this.p3.y * height
        );
        ctx2.strokeStyle = colors.line(this.lineAlpha);
        ctx2.lineWidth = 1;
        ctx2.stroke();
        ctx2.restore();

        // Advance and draw particles along the curve.
        this.particles.forEach((p) => {
          p.t += (dt / this.duration) * p.speedJitter * motionScale;
          if (p.t > 1) p.t -= 1;
          const pos = this.pointAt(p.t);
          // Fade in/out near the ends so particles don't "pop".
          const edgeFade = Math.min(1, p.t * 6, (1 - p.t) * 6);
          ctx2.save();
          if (colors.glow) {
            ctx2.shadowBlur = 9;
            ctx2.shadowColor = colors.glow;
          }
          ctx2.beginPath();
          ctx2.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
          ctx2.fillStyle = colors.particle(0.55 * edgeFade);
          ctx2.fill();
          ctx2.restore();
        });
      }
    }

    const PATHS_PER_SIDE_BASE = 5;
    let paths = [];

    // One shared convergence point per row, reused by both the left- and
    // right-originating path at that row so they cross at the identical
    // spot — this is what guarantees a continuous, gapless meeting in the
    // centre instead of two independently-random clusters.
    const makeRowTargets = (perSide) =>
      Array.from({ length: perSide }, (_, i) => {
        const spread = (i - (perSide - 1) / 2) / Math.max(perSide - 1, 1);
        return {
          x: 0.5 + (Math.random() - 0.5) * 0.05,
          y: 0.42 + spread * 0.22 + (Math.random() - 0.5) * 0.03,
        };
      });

    const buildPaths = () => {
      const isSmall = width < 720;
      const perSide = Math.max(2, Math.round(PATHS_PER_SIDE_BASE * density * (isSmall ? 0.55 : 1)));
      const rowTargets = makeRowTargets(perSide);
      paths = [
        ...Array.from({ length: perSide }, (_, i) => new FlowPath('left', i, perSide, rowTargets[i])),
        ...Array.from({ length: perSide }, (_, i) => new FlowPath('right', i, perSide, rowTargets[i])),
      ];
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildPaths();
    };

    // Theme-aware colour helpers. Kept as functions (not fixed strings) so
    // the running animation can switch palettes instantly on theme change.
    const colorsFor = (theme) => {
      if (theme === 'dark') {
        // Brand gold (matches --gold: #E0B87A used across dark mode),
        // with a soft glow via colors.glow (applied as shadowBlur/Color).
        return {
          line: (a) => `rgba(224, 184, 122, ${a * 0.6})`,
          particle: (a) => `rgba(238, 205, 150, ${a})`,
          glow: 'rgba(224, 184, 122, 0.85)',
        };
      }
      return {
        line: (a) => `rgba(59, 36, 93, ${a * 0.5})`,
        particle: (a) => `rgba(40, 27, 61, ${a * 0.85})`,
        glow: null,
      };
    };

    let rafId = null;
    let lastTime = performance.now();

    const frame = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);
      const colors = colorsFor(themeRef.current);
      const motionScale = prefersReducedMotion ? 0.12 : 1;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      paths.forEach((p) => p.draw(ctx, dt, colors, motionScale));

      rafId = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(() => resize());
    resize();
    ro.observe(canvas.parentElement);
    rafId = requestAnimationFrame(frame);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      reducedMotionQuery.removeEventListener?.('change', handleMotionChange);
    };
    // Intentionally run once — theme changes are read live via themeRef,
    // no need to tear down and rebuild the canvas/animation loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`gateway-flow-canvas ${className}`}
    />
  );
}
import { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function TiltCard({
  to,
  children,
  className = '',
  maxTilt = 6,
  ...rest
}) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ry = ((e.clientX - r.left) / r.width - 0.5) * maxTilt;
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -maxTilt;
    el.style.setProperty('--tilt-x', `${rx}deg`);
    el.style.setProperty('--tilt-y', `${ry}deg`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  };

  const common = {
    ref,
    className: `tilt-card ${className}`,
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    ...rest,
  };

  if (to) {
    return (
      <Link to={to} {...common}>
        {children}
      </Link>
    );
  }
  return <div {...common}>{children}</div>;
}

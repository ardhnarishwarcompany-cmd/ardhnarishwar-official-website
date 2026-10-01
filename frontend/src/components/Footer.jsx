import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSettings } from '../api/client';
import AnimatedFooter from './AnimatedFooter';
import SocialFlipButton from './SocialFlipButton';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  const platformLinks = [
    { label: 'Job Portal', url: settings?.jobPortalUrl },
    { label: 'Smart Attendance', url: settings?.attendanceUrl },
    { label: 'HRMS', url: settings?.hrmsUrl },
  ].filter((p) => p.url);

  const socialLinks = {
    linkedin: settings?.linkedinUrl,
    twitter: settings?.twitterUrl,
    facebook: settings?.facebookUrl,
    instagram: settings?.instagramUrl,
    youtube: settings?.youtubeUrl,
  };
  const hasSocials = Object.values(socialLinks).some(Boolean);

  return (
    <footer className="footer-wrap">
      {/* Cinematic ASCII-hands reveal banner */}
      <div className="relative h-[60vh] min-h-[380px] w-full overflow-hidden">
        <AnimatedFooter
          headingLines={['Ardhnarishwar']}
          leftImage="/animated-footer/hand-left.jpg"
          rightImage="/animated-footer/hand-right.jpg"
        />
      </div>

      {/* Existing footer content: links, socials, bottom bar */}
      <div className="footer section-shell">
        <div className="footer-top">
          <div>
            <Link to="/" className="brand footer-brand">
              <span className="brand-mark"><span /><span /></span>
              <span>Ardhnarishwar</span>
            </Link>
            <p>
              A global HR, staffing, workforce technology and AI solutions provider. One platform, multiple intelligent business solutions.
            </p>
            {(settings?.contactEmail || settings?.contactPhone || settings?.officeAddress) && (
              <p style={{ marginTop: 14, fontSize: 13, lineHeight: 1.8 }}>
                {settings?.contactEmail && <span style={{ display: 'block' }}>{settings.contactEmail}</span>}
                {settings?.contactPhone && <span style={{ display: 'block' }}>{settings.contactPhone}</span>}
                {settings?.officeAddress && <span style={{ display: 'block' }}>{settings.officeAddress}</span>}
              </p>
            )}
            {hasSocials && (
              <div style={{ marginTop: 16 }}>
                <SocialFlipButton links={socialLinks} />
              </div>
            )}
          </div>
          <div className="footer-links">
            <div>
              <b>Solutions</b>
              <Link to="/services">HRMS & Attendance</Link>
              <Link to="/services">Staffing & Job Portal</Link>
              <Link to="/services">AI Recruitment</Link>
              <Link to="/services">Automation & CRM</Link>
            </div>
            {platformLinks.length > 0 && (
              <div>
                <b>Platforms</b>
                {platformLinks.map((p) => (
                  <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.label}
                  </a>
                ))}
              </div>
            )}
            <div>
              <b>Company</b>
              <Link to="/about">About</Link>
              <Link to="/team">Team</Link>
              <Link to="/blog">Insights</Link>
              <Link to="/careers">Careers</Link>
            </div>
            <div>
              <b>Support</b>
              <Link to="/faq">FAQ</Link>
              <Link to="/request-demo">Contact</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Ardhnarishwar Global Business Solutions</span>
          <span>Technology + Human Intelligence = Endless Possibilities</span>
        </div>
      </div>
    </footer>
  );
}
'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [filled, setFilled] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFilled(true), 150)
    const t2 = setTimeout(() => setLogoVisible(true), 2100)
    const t3 = setTimeout(() => setFading(true), 2900)
    const t4 = setTimeout(onDone, 3600)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [onDone])

  return (
    <div
      onClick={() => { setFading(true); setTimeout(onDone, 700) }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at 24% 20%, rgba(216,234,176,0.58) 0%, transparent 26%), radial-gradient(circle at 78% 72%, rgba(214,102,18,0.10) 0%, transparent 28%), linear-gradient(180deg, #fbf7ef 0%, #eadcc8 100%)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.7s ease',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <style>{`
        .splash-bean {
          position: absolute;
          width: 18px;
          height: 11px;
          border-radius: 999px;
          background: #556341;
          opacity: 0.22;
          transform: rotate(-24deg);
          animation: splashBeanFloat 4.2s ease-in-out infinite;
        }

        .splash-bean::after {
          content: '';
          position: absolute;
          inset: 2px 8px 2px 7px;
          border-radius: 999px;
          background: rgba(255,255,255,0.32);
        }

        .splash-cup-stage {
          position: relative;
          width: 240px;
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: splashCupDrift 3.6s ease-in-out infinite;
        }

        .splash-glow {
          animation: splashGlowPulse 2.8s ease-in-out infinite;
        }

        .splash-steam {
          position: absolute;
          top: 20px;
          width: 8px;
          height: 48px;
          border-radius: 999px;
          border-left: 2px solid rgba(111,88,53,0.24);
          filter: blur(0.2px);
          opacity: 0;
          animation: splashSteamRise 2.6s ease-in-out infinite;
        }

        .splash-cup {
          filter: drop-shadow(0 20px 28px rgba(63,38,24,0.16));
        }

        .splash-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          margin: 0 3px;
          border-radius: 999px;
          background: #8fae5a;
          animation: splashDot 1.1s ease-in-out infinite;
        }

        .splash-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .splash-dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes splashCupDrift {
          0%, 100% { transform: translateY(0) rotate(-0.8deg); }
          50% { transform: translateY(-8px) rotate(0.8deg); }
        }

        @keyframes splashGlowPulse {
          0%, 100% { transform: scale(0.94); opacity: 0.72; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        @keyframes splashSteamRise {
          0% { transform: translateY(20px) scaleY(0.65); opacity: 0; }
          30% { opacity: 0.6; }
          100% { transform: translateY(-28px) scaleY(1.1); opacity: 0; }
        }

        @keyframes splashBeanFloat {
          0%, 100% { transform: translateY(0) rotate(-24deg); }
          50% { transform: translateY(-18px) rotate(-8deg); }
        }

        @keyframes splashDot {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
      <span className="splash-bean" style={{ left: '18%', top: '24%', animationDelay: '0.2s' }} />
      <span className="splash-bean" style={{ right: '18%', top: '30%', animationDelay: '1.1s', transform: 'rotate(18deg)' }} />
      <span className="splash-bean" style={{ left: '24%', bottom: '22%', animationDelay: '1.8s', transform: 'rotate(12deg)' }} />
      <span className="splash-bean" style={{ right: '20%', bottom: '18%', animationDelay: '2.4s' }} />

      <div style={{
        position: 'absolute',
        top: 36,
        border: '1px solid rgba(143,174,90,0.18)',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.36)',
        color: '#556341',
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: '0.12em',
        padding: '8px 12px',
        backdropFilter: 'blur(10px)',
      }}>
        SPECIALTY COFFEE MAP
      </div>

      <div className="splash-cup-stage">
        <span className="splash-steam" style={{ left: 88, animationDelay: '0.35s' }} />
        <span className="splash-steam" style={{ left: 124, height: 58, animationDelay: '0.8s' }} />
        <span className="splash-steam" style={{ left: 150, animationDelay: '1.2s' }} />

      {/* Warm glow behind cup */}
      <div className="splash-glow" style={{
        position: 'absolute',
        width: 240, height: 240,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(214,102,18,0.15) 0%, rgba(143,174,90,0.10) 42%, transparent 72%)',
        pointerEvents: 'none',
      }} />

      {/* Cup SVG */}
      <svg className="splash-cup" width="160" height="220" viewBox="0 0 160 220" style={{ overflow: 'visible' }}>
        <defs>
          {/* Cup interior clip */}
          <clipPath id="sc-cup-clip">
            <polygon points="22,30 138,30 123,196 37,196" />
          </clipPath>

          {/* Coffee gradient */}
          <linearGradient id="sc-coffee" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2d1206" />
            <stop offset="100%" stopColor="#150803" />
          </linearGradient>

          {/* Cup glass left-edge shimmer */}
          <linearGradient id="sc-glass-shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(158,111,62,0.18)" />
            <stop offset="100%" stopColor="rgba(158,111,62,0)" />
          </linearGradient>

          {/* Straw gradient */}
          <linearGradient id="sc-straw" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(120,70,30,0.80)" />
            <stop offset="40%" stopColor="rgba(120,70,30,0.55)" />
            <stop offset="100%" stopColor="rgba(120,70,30,0.35)" />
          </linearGradient>
        </defs>

        {/* ── Cup body (glass tint background) ── */}
        <polygon
          points="22,30 138,30 123,196 37,196"
          fill="rgba(158,111,62,0.07)"
        />

        {/* ── Coffee fill (rises from bottom) ── */}
        <g clipPath="url(#sc-cup-clip)">
          <rect
            x="0" y="80" width="160" height="116"
            fill="url(#sc-coffee)"
            style={{
              transformOrigin: '80px 196px',
              transform: filled ? 'scaleY(1)' : 'scaleY(0)',
              transition: 'transform 2.0s cubic-bezier(0.12, 0, 0.08, 1)',
            }}
          />

          {/* Coffee surface (darker rim on top of fill) */}
          <ellipse
            cx="80" cy="80" rx="52" ry="5"
            fill="rgba(15,6,2,0.55)"
            style={{
              opacity: filled ? 1 : 0,
              transition: 'opacity 0.4s ease 1.8s',
            }}
          />

          {/* Bubbles rising in coffee */}
          <circle cx="58"  cy="175" r="3.5" fill="rgba(50,22,8,0.9)" className="sc-bubble" style={{ animationDelay: '2.2s' }} />
          <circle cx="92"  cy="182" r="2.5" fill="rgba(50,22,8,0.9)" className="sc-bubble" style={{ animationDelay: '2.6s' }} />
          <circle cx="74"  cy="170" r="2"   fill="rgba(50,22,8,0.9)" className="sc-bubble" style={{ animationDelay: '3.0s' }} />
          <circle cx="108" cy="178" r="3"   fill="rgba(50,22,8,0.9)" className="sc-bubble" style={{ animationDelay: '2.9s' }} />
        </g>

        {/* ── Ice cubes (rendered above coffee, still clipped to cup) ── */}
        <g clipPath="url(#sc-cup-clip)">
          {/* Ice 1 — large, center-left, sits in coffee */}
          <g transform="rotate(-11, 76, 138)">
            <rect x="50" y="118" width="52" height="40" rx="7"
              fill="rgba(195,232,255,0.82)" stroke="rgba(255,255,255,0.92)" strokeWidth="1.5" />
            {/* inner crystal highlights */}
            <rect x="56" y="123" width="18" height="11" rx="4" fill="rgba(255,255,255,0.52)" />
            <rect x="58" y="138" width="10" height="6"  rx="3" fill="rgba(255,255,255,0.30)" />
          </g>

          {/* Ice 2 — medium, left side */}
          <g transform="rotate(9, 52, 110)">
            <rect x="34" y="96" width="36" height="28" rx="6"
              fill="rgba(205,236,255,0.78)" stroke="rgba(255,255,255,0.90)" strokeWidth="1.5" />
            <rect x="39" y="101" width="13" height="8" rx="3" fill="rgba(255,255,255,0.50)" />
          </g>

          {/* Ice 3 — medium, right side */}
          <g transform="rotate(-6, 106, 125)">
            <rect x="90" y="110" width="32" height="30" rx="6"
              fill="rgba(200,234,255,0.75)" stroke="rgba(255,255,255,0.90)" strokeWidth="1.5" />
            <rect x="95" y="115" width="11" height="8" rx="3" fill="rgba(255,255,255,0.48)" />
          </g>

          {/* Ice 4 — small, back center (half-submerged look) */}
          <g transform="rotate(14, 78, 92)">
            <rect x="62" y="82" width="28" height="20" rx="5"
              fill="rgba(210,240,255,0.62)" stroke="rgba(255,255,255,0.80)" strokeWidth="1" />
            <rect x="66" y="85" width="9"  height="6"  rx="2" fill="rgba(255,255,255,0.40)" />
          </g>
        </g>

        {/* ── Cup glass shine (left-edge highlight) ── */}
        <polygon
          points="22,30 36,30 24,192 20,192"
          fill="url(#sc-glass-shine)"
        />

        {/* ── Cup outline ── */}
        <polygon
          points="22,30 138,30 123,196 37,196"
          fill="none"
          stroke="rgba(120,70,30,0.45)"
          strokeWidth="2.5"
        />

        {/* Cup rim line */}
        <line x1="22" y1="30" x2="138" y2="30"
          stroke="rgba(120,70,30,0.60)" strokeWidth="3" strokeLinecap="round" />

        {/* Cup bottom line */}
        <line x1="37" y1="196" x2="123" y2="196"
          stroke="rgba(120,70,30,0.40)" strokeWidth="2.5" strokeLinecap="round" />

        {/* ── Straw ── */}
        <rect x="107" y="-14" width="10" height="150" rx="5" fill="url(#sc-straw)" />
        {/* straw inner highlight */}
        <rect x="109" y="-12" width="3" height="146" rx="1.5" fill="rgba(255,255,255,0.40)" />

        {/* ── Condensation drops on cup exterior ── */}
        {/* left side */}
        <ellipse cx="28"  cy="115" rx="3"   ry="5.5" fill="rgba(100,55,20,0.22)" />
        <ellipse cx="16"  cy="148" rx="2.5" ry="4.5" fill="rgba(100,55,20,0.16)" />
        <ellipse cx="22"  cy="168" rx="2"   ry="3.5" fill="rgba(100,55,20,0.13)" />
        {/* water drip from left drop */}
        <path d="M28,120 Q29.5,130 28,138 Q26.5,130 28,120" fill="rgba(100,55,20,0.18)" />

        {/* right side */}
        <ellipse cx="146" cy="100" rx="2.5" ry="4.5" fill="rgba(100,55,20,0.20)" />
        <ellipse cx="138" cy="132" rx="3"   ry="5"   fill="rgba(100,55,20,0.16)" />
        <ellipse cx="148" cy="158" rx="2"   ry="3.5" fill="rgba(100,55,20,0.12)" />
      </svg>
      </div>

      {/* ── Brand logo ── */}
      <div style={{
        marginTop: 10,
        opacity: logoVisible ? 1 : 0,
        transform: logoVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.65s ease, transform 0.65s ease',
        textAlign: 'center',
        fontFamily: 'inherit',
      }}>
        <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#2C2C2C', margin: 0 }}>
          원<span style={{ color: '#8FAE5A' }}>두</span>로
        </p>
        <p style={{ fontSize: 12, color: 'rgba(100,65,30,0.55)', marginTop: 6, letterSpacing: '0.06em' }}>
          스페셜티 커피 큐레이션
        </p>
        <p style={{ margin: '14px 0 0', height: 8 }}>
          <span className="splash-dot" />
          <span className="splash-dot" />
          <span className="splash-dot" />
        </p>
      </div>

      {/* tap to skip */}
      <p style={{
        position: 'absolute', bottom: 32,
        fontSize: 11, color: 'rgba(100,65,30,0.40)',
        letterSpacing: '0.08em',
        opacity: logoVisible ? 1 : 0,
        transition: 'opacity 0.5s ease 0.3s',
      }}>
        탭하여 건너뛰기
      </p>
    </div>
  )
}

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
        background: '#EDE0CF',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.7s ease',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Warm glow behind cup */}
      <div style={{
        position: 'absolute',
        width: 240, height: 240,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(158,111,62,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Cup SVG */}
      <svg width="160" height="220" viewBox="0 0 160 220" style={{ overflow: 'visible' }}>
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

      {/* ── Brand logo ── */}
      <div style={{
        marginTop: 32,
        opacity: logoVisible ? 1 : 0,
        transform: logoVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.65s ease, transform 0.65s ease',
        textAlign: 'center',
        fontFamily: 'inherit',
      }}>
        <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#2C2C2C', margin: 0 }}>
          co<span style={{ color: '#9E6F3E' }}>FFFFF</span>e map
        </p>
        <p style={{ fontSize: 12, color: 'rgba(100,65,30,0.55)', marginTop: 6, letterSpacing: '0.06em' }}>
          안산 스페셜티 커피 큐레이션
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

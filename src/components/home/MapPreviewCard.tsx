'use client'

import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

const MARKERS = [
  { x: '22%', y: '62%', label: '드리프트', delay: 0 },
  { x: '44%', y: '38%', label: '로스터리', delay: 0.4, primary: true },
  { x: '66%', y: '55%', label: '스페셜티', delay: 0.8 },
  { x: '55%', y: '72%', label: '푸어오버', delay: 1.2 },
  { x: '78%', y: '28%', label: '원두카페', delay: 0.6 },
]

export default function MapPreviewCard() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[1.5rem]">
      {/* 지도 배경 */}
      <div className="absolute inset-0" style={{ background: '#dfe8cc' }}>
        {/* 블록 격자 */}
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="52" height="52" patternUnits="userSpaceOnUse">
              <rect width="52" height="52" fill="none" />
              <rect x="4" y="4" width="44" height="44" rx="3" fill="rgba(255,255,255,0.18)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* 주요 도로 (굵은 흰 선) */}
          <line x1="0" y1="47%" x2="100%" y2="47%" stroke="white" strokeWidth="8" strokeOpacity="0.75" />
          <line x1="38%" y1="0" x2="38%" y2="100%" stroke="white" strokeWidth="8" strokeOpacity="0.75" />

          {/* 보조 도로 */}
          <line x1="0" y1="22%" x2="100%" y2="22%" stroke="white" strokeWidth="3" strokeOpacity="0.45" />
          <line x1="0" y1="72%" x2="100%" y2="72%" stroke="white" strokeWidth="3" strokeOpacity="0.45" />
          <line x1="62%" y1="0" x2="62%" y2="100%" stroke="white" strokeWidth="3" strokeOpacity="0.45" />
          <line x1="18%" y1="0" x2="18%" y2="100%" stroke="white" strokeWidth="3" strokeOpacity="0.45" />

          {/* 루트 선 (마커 연결) */}
          <polyline
            points="22%,62% 44%,38% 66%,55% 78%,28%"
            stroke="#c87030"
            strokeWidth="2"
            strokeDasharray="6,4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </svg>

        {/* 공원/구역 블롭 */}
        <div
          className="absolute rounded-full opacity-40"
          style={{ left: '58%', top: '14%', width: 72, height: 54, background: '#8fae5a', filter: 'blur(6px)' }}
        />
        <div
          className="absolute rounded-full opacity-30"
          style={{ left: '6%', top: '56%', width: 56, height: 44, background: '#8fae5a', filter: 'blur(8px)' }}
        />
      </div>

      {/* 마커 */}
      {MARKERS.map(({ x, y, label, delay, primary }) => (
        <motion.div
          key={label}
          className="absolute z-10"
          style={{ left: x, top: y, transform: 'translate(-50%, -100%)' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
            style={
              primary
                ? { background: '#5a2e11', color: '#f3eee7' }
                : { background: 'rgba(255,255,255,0.92)', color: '#2d1a10', border: '1px solid rgba(90,46,17,0.15)' }
            }
          >
            <MapPin size={8} style={{ color: primary ? '#8fae5a' : '#c87030' }} />
            {label}
          </div>
          <div
            className="mx-auto w-0.5"
            style={{ height: 10, background: primary ? '#5a2e11' : '#c87030', opacity: 0.6 }}
          />
          <div
            className="mx-auto h-1.5 w-1.5 rounded-full border border-white"
            style={{ background: primary ? '#5a2e11' : '#c87030' }}
          />
        </motion.div>
      ))}

      {/* 부드러운 테두리 페이드 */}
      <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] shadow-[inset_0_0_48px_16px_rgba(243,237,231,0.5)]" />
    </div>
  )
}

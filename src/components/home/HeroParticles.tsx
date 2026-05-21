'use client'

import { motion } from 'framer-motion'

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${4 + (i * 6.7) % 92}%`,
  width: 5 + (i * 4) % 10,
  height: Math.round((5 + (i * 4) % 10) * 0.62),
  duration: 12 + (i * 1.8) % 10,
  delay: -(i * 1.55),
  opacity: 0.1 + (i * 0.016) % 0.22,
}))

export default function HeroParticles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#b06828]"
          style={{
            left: p.left,
            top: '-3%',
            width: p.width,
            height: p.height,
            opacity: p.opacity,
          }}
          animate={{ y: '108vh' }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

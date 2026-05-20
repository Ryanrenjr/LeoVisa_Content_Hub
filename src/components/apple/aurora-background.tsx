'use client'

import { motion } from 'framer-motion'

// URL-encoded SVG noise (fractalNoise filter, 200×200, seamlessly tiled)
const NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`

const blobs = [
  { id: 1, rgb: '0, 113, 227',   alpha: 0.15, size: 800, left: '10%', top: '5%',  dur: 25, dx: 100,  dy: 80 },
  { id: 2, rgb: '110, 63, 251',  alpha: 0.12, size: 700, left: '55%', top: '15%', dur: 32, dx: -80,  dy: 100 },
  { id: 3, rgb: '255, 107, 157', alpha: 0.08, size: 600, left: '70%', top: '50%', dur: 22, dx: -100, dy: -60 },
  { id: 4, rgb: '52, 211, 153',  alpha: 0.10, size: 750, left: '5%',  top: '60%', dur: 28, dx: 80,   dy: -100 },
]

export function AuroraBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -1, backgroundColor: '#F5F5F7', overflow: 'hidden' }}
    >
      {blobs.map((b) => (
        <motion.div
          key={b.id}
          animate={{
            x: [0, b.dx, 0, -b.dx, 0],
            y: [0, b.dy, -b.dy, 0, 0],
          }}
          transition={{
            duration: b.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
          style={{
            position: 'absolute',
            left: b.left,
            top: b.top,
            // offset by half-size so the percentage positions are centers
            marginLeft: `-${b.size / 2}px`,
            marginTop: `-${b.size / 2}px`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle at center, rgba(${b.rgb}, ${b.alpha}) 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
        />
      ))}

      {/* Subtle noise grain */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: NOISE_BG, opacity: 0.025 }}
      />
    </div>
  )
}

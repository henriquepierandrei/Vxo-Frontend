import React, { useRef, useEffect, useState, useCallback } from 'react'

interface Star {
  id: number
  size: number
  left: number
  top: number
  duration: number
  delay: number
  isCross: boolean
  isWaveActive: boolean
  waveScale: number
  waveGlow: boolean
}

interface StarsProps {
  totalStars?: number
  enableWaves?: boolean
  enableGroupAlternation?: boolean
}

const StarsEffect: React.FC<StarsProps> = ({
  totalStars = 250,
  enableWaves = true,
  enableGroupAlternation = true
}) => {
  const [stars, setStars] = useState<Star[]>([])
  const starRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize stars
  useEffect(() => {
    const initialStars: Star[] = []

    for (let i = 0; i < totalStars; i++) {
      const sizeRandom = Math.random()
      let starSize: number
      let isCross = false

      if (sizeRandom < 0.5) {
        starSize = Math.random() * 2 + 1
      } else if (sizeRandom < 0.85) {
        starSize = Math.random() * 2 + 3
      } else {
        starSize = Math.random() * 3 + 5
        isCross = true
      }

      initialStars.push({
        id: i,
        size: starSize,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 3 + 1.5,
        delay: Math.random() * 5,
        isCross,
        isWaveActive: false,
        waveScale: 1,
        waveGlow: false
      })
    }

    setStars(initialStars)
  }, [totalStars])

  // Group alternation effect
  useEffect(() => {
    if (!enableGroupAlternation || stars.length === 0) return

    const alternateGroups = () => {
      const groupSize = Math.floor(Math.random() * 30) + 10
      const startIndex = Math.floor(Math.random() * (totalStars - groupSize))

      setStars(prevStars =>
        prevStars.map((star, index) => {
          if (index >= startIndex && index < startIndex + groupSize) {
            return {
              ...star,
              duration: Math.random() * 2 + 0.8,
              delay: Math.random() * 0.5
            }
          }
          return star
        })
      )
    }

    const interval = setInterval(alternateGroups, 2000)
    return () => clearInterval(interval)
  }, [enableGroupAlternation, totalStars, stars.length])

  // Wave effect
  const createWave = useCallback(() => {
    if (!containerRef.current) return

    const centerX = Math.random() * window.innerWidth
    const centerY = Math.random() * window.innerHeight
    const maxRadius = 400

    starRefs.current.forEach((starElement, id) => {
      if (!starElement) return

      const rect = starElement.getBoundingClientRect()
      const starX = rect.left + rect.width / 2
      const starY = rect.top + rect.height / 2
      const distance = Math.sqrt((starX - centerX) ** 2 + (starY - centerY) ** 2)

      if (distance < maxRadius) {
        const delayMs = (distance / maxRadius) * 800

        setTimeout(() => {
          setStars(prevStars =>
            prevStars.map(star =>
              star.id === id
                ? { ...star, isWaveActive: true, waveGlow: true, waveScale: 2 }
                : star
            )
          )

          setTimeout(() => {
            setStars(prevStars =>
              prevStars.map(star =>
                star.id === id
                  ? { ...star, isWaveActive: false, waveGlow: false, waveScale: 1 }
                  : star
              )
            )
          }, 400)
        }, delayMs)
      }
    })
  }, [])

  useEffect(() => {
    if (!enableWaves || stars.length === 0) return

    let timeoutId: ReturnType<typeof setTimeout>

    const scheduleWave = () => {
      const delay = Math.random() * 6000 + 6000
      timeoutId = setTimeout(() => {
        createWave()
        scheduleWave()
      }, delay)
    }

    scheduleWave()

    return () => clearTimeout(timeoutId)
  }, [enableWaves, createWave, stars.length])

  const setStarRef = useCallback((id: number, element: HTMLDivElement | null) => {
    if (element) {
      starRefs.current.set(id, element)
    } else {
      starRefs.current.delete(id)
    }
  }, [])

  return (
    <>
      <style>{`
        .stars-sky {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .star {
          position: absolute;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.6);
          animation: twinkle var(--duration) ease-in-out infinite alternate;
          animation-delay: var(--delay);
        }

        .star::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200%;
          height: 200%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
        }

        .star.cross::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: rotateCross 4s linear infinite;
        }

        .star.wave-active {
          transition: box-shadow 0.3s, transform 0.3s;
        }

        .star.wave-glow {
          box-shadow: 0 0 15px 5px rgba(255, 255, 255, 0.9) !important;
        }

        @keyframes twinkle {
          0% {
            opacity: 0.1;
            transform: scale(0.5);
            filter: blur(1px);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
            filter: blur(0px);
          }
          100% {
            opacity: 0.2;
            transform: scale(0.8);
            filter: blur(0.5px);
          }
        }

        @keyframes rotateCross {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(180deg); }
        }
      `}</style>

      <div className="stars-sky" ref={containerRef}>
        {stars.map(star => (
          <div
            key={star.id}
            ref={(el) => setStarRef(star.id, el)}
            className={`star ${star.isCross ? 'cross' : ''} ${star.isWaveActive ? 'wave-active' : ''} ${star.waveGlow ? 'wave-glow' : ''}`}
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              '--duration': `${star.duration}s`,
              '--delay': `${star.delay}s`,
              transform: star.isWaveActive ? `scale(${star.waveScale})` : undefined
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  )
}

export default StarsEffect
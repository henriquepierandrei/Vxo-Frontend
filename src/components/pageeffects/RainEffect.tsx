import React, { useRef, useEffect, useCallback } from 'react'

interface Raindrop {
  x: number
  y: number
  length: number
  width: number
  speed: number
  opacity: number
  depth: number
  windOffset: number
}

interface Splash {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
}

interface LayerConfig {
  speed: number
  count: number
  maxLength: number
  minLength: number
  maxWidth: number
  depth: number
}

interface Layer extends LayerConfig {
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
  raindrops: Raindrop[]
}

const Rain: React.FC = () => {
  const rainBackRef = useRef<HTMLCanvasElement>(null)
  const rainMidRef = useRef<HTMLCanvasElement>(null)
  const rainFrontRef = useRef<HTMLCanvasElement>(null)
  const splashRef = useRef<HTMLCanvasElement>(null)
  const lightningFlashRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const layersRef = useRef<Layer[]>([])
  const splashesRef = useRef<Splash[]>([])
  const mouseWindRef = useRef(0)
  const animationRef = useRef<number | null>(null)

  const intensity = 0.9
  const wind = 0.25
  const splashIntensity = 0.5
  const lightningEnabled = true

  const resizeCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  }, [])

  const getRaindropCount = useCallback((baseCount: number): number => {
    const area = window.innerWidth * window.innerHeight
    const density = baseCount / (1920 * 1080)
    return Math.floor(area * density * intensity)
  }, [])

  const createRaindrop = useCallback((layer: Layer, randomY = false): Raindrop => {
    const length = Math.random() * (layer.maxLength - layer.minLength) + layer.minLength
    const canvasWidth = layer.canvas?.width || window.innerWidth
    const canvasHeight = layer.canvas?.height || window.innerHeight

    return {
      x: Math.random() * (canvasWidth + 100) - 50,
      y: randomY ? Math.random() * canvasHeight : -length,
      length,
      width: Math.random() * layer.maxWidth + 0.4,
      speed: layer.speed + Math.random() * 5,
      opacity: Math.random() * 0.25 + 0.45,
      depth: layer.depth,
      windOffset: 0
    }
  }, [])

  const createRaindrops = useCallback((layer: Layer) => {
    const count = getRaindropCount(layer.count)
    layer.raindrops = []

    for (let i = 0; i < count; i++) {
      layer.raindrops.push(createRaindrop(layer, true))
    }
  }, [getRaindropCount, createRaindrop])

  const createSplash = useCallback((x: number, y: number) => {
    const particleCount = Math.floor(Math.random() * 4) + 3

    for (let i = 0; i < particleCount; i++) {
      splashesRef.current.push({
        x: x + (Math.random() - 0.5) * 3,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -(Math.random() * 2.5 + 1.5),
        size: Math.random() * 2 + 0.8,
        opacity: 0.7,
        life: 1
      })
    }
  }, [])

  const updateRaindrop = useCallback((drop: Raindrop, layer: Layer) => {
    const windEffect = (wind + mouseWindRef.current * drop.depth) * 1.2
    drop.windOffset += (windEffect - drop.windOffset) * 0.06

    drop.y += drop.speed
    drop.x += drop.windOffset

    const canvasHeight = layer.canvas?.height || window.innerHeight
    const canvasWidth = layer.canvas?.width || window.innerWidth

    if (drop.y > canvasHeight) {
      if (Math.random() < splashIntensity && drop.depth > 0.5) {
        createSplash(drop.x, canvasHeight)
      }

      Object.assign(drop, createRaindrop(layer))
    }

    if (drop.x > canvasWidth + 50) {
      drop.x = -50
      drop.y = Math.random() * -100
    } else if (drop.x < -50) {
      drop.x = canvasWidth + 50
      drop.y = Math.random() * -100
    }
  }, [createRaindrop, createSplash])

  const drawRaindrop = useCallback((drop: Raindrop, ctx: CanvasRenderingContext2D) => {
    ctx.save()

    const gradient = ctx.createLinearGradient(
      drop.x,
      drop.y,
      drop.x + drop.windOffset * 0.4,
      drop.y + drop.length
    )

    gradient.addColorStop(0, `rgba(180, 200, 220, ${drop.opacity * 0.3})`)
    gradient.addColorStop(0.3, `rgba(200, 220, 240, ${drop.opacity * 0.7})`)
    gradient.addColorStop(1, `rgba(230, 240, 250, ${drop.opacity})`)

    ctx.strokeStyle = gradient
    ctx.lineWidth = drop.width
    ctx.lineCap = 'round'

    ctx.beginPath()
    ctx.moveTo(drop.x, drop.y)
    ctx.lineTo(drop.x + drop.windOffset * 0.4, drop.y + drop.length)
    ctx.stroke()

    if (drop.width > 1 && drop.depth > 0.5) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${drop.opacity * 0.2})`
      ctx.lineWidth = drop.width * 0.4
      ctx.beginPath()
      ctx.moveTo(drop.x, drop.y + drop.length * 0.3)
      ctx.lineTo(drop.x + drop.windOffset * 0.4, drop.y + drop.length * 0.7)
      ctx.stroke()
    }

    ctx.restore()
  }, [])

  const updateSplash = useCallback((splash: Splash) => {
    splash.vy += 0.18
    splash.x += splash.vx
    splash.y += splash.vy
    splash.life -= 0.018
    splash.opacity = splash.life * 0.7
    splash.size *= 0.96
  }, [])

  const drawSplash = useCallback((splash: Splash, ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createRadialGradient(
      splash.x, splash.y, 0,
      splash.x, splash.y, splash.size
    )
    gradient.addColorStop(0, `rgba(200, 220, 240, ${splash.opacity})`)
    gradient.addColorStop(0.6, `rgba(200, 220, 240, ${splash.opacity * 0.5})`)
    gradient.addColorStop(1, `rgba(200, 220, 240, 0)`)

    ctx.beginPath()
    ctx.arc(splash.x, splash.y, splash.size, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }, [])

  const lightning = useCallback(() => {
    const flash = lightningFlashRef.current
    const body = bodyRef.current

    if (!flash || !body) return

    flash.style.transition = 'none'
    flash.style.opacity = '1'
    body.classList.add('lightning')

    setTimeout(() => {
      flash.style.transition = 'opacity 0.3s ease-out'
      flash.style.opacity = '0'
      body.classList.remove('lightning')
    }, 140)

    if (Math.random() > 0.5) {
      setTimeout(() => {
        flash.style.transition = 'none'
        flash.style.opacity = '0.5'

        setTimeout(() => {
          flash.style.transition = 'opacity 0.25s ease-out'
          flash.style.opacity = '0'
        }, 90)
      }, 220)
    }
  }, [])

  const animate = useCallback(() => {
    layersRef.current.forEach(layer => {
      if (!layer.ctx || !layer.canvas) return

      layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)

      layer.raindrops.forEach(drop => {
        updateRaindrop(drop, layer)
        drawRaindrop(drop, layer.ctx!)
      })
    })

    const splashCanvas = splashRef.current
    const splashCtx = splashCanvas?.getContext('2d')

    if (splashCtx && splashCanvas) {
      splashCtx.clearRect(0, 0, splashCanvas.width, splashCanvas.height)

      splashesRef.current = splashesRef.current.filter(splash => {
        updateSplash(splash)
        if (splash.life > 0) {
          drawSplash(splash, splashCtx)
          return true
        }
        return false
      })
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [updateRaindrop, drawRaindrop, updateSplash, drawSplash])

  useEffect(() => {
    const layerConfigs: LayerConfig[] = [
      { speed: 10, count: 80, maxLength: 15, minLength: 8, maxWidth: 1, depth: 0.3 },
      { speed: 14, count: 120, maxLength: 22, minLength: 12, maxWidth: 1.3, depth: 0.6 },
      { speed: 18, count: 80, maxLength: 30, minLength: 18, maxWidth: 1.6, depth: 1 }
    ]

    const canvasRefs = [rainBackRef.current, rainMidRef.current, rainFrontRef.current]

    layersRef.current = layerConfigs.map((config, index) => ({
      ...config,
      canvas: canvasRefs[index],
      ctx: canvasRefs[index]?.getContext('2d', { alpha: true }) || null,
      raindrops: []
    }))

    layersRef.current.forEach(layer => {
      resizeCanvas(layer.canvas)
      createRaindrops(layer)
    })

    resizeCanvas(splashRef.current)

    const handleResize = () => {
      layersRef.current.forEach(layer => {
        resizeCanvas(layer.canvas)
        createRaindrops(layer)
      })
      resizeCanvas(splashRef.current)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const targetWind = (e.clientX / window.innerWidth - 0.5) * 0.4
      mouseWindRef.current += (targetWind - mouseWindRef.current) * 0.08
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('mousemove', handleMouseMove)

    animate()

    // Lightning effect
    const triggerLightning = () => {
      if (!lightningEnabled) {
        setTimeout(triggerLightning, 2000)
        return
      }

      const delay = Math.random() * 12000 + 8000

      setTimeout(() => {
        lightning()
        triggerLightning()
      }, delay)
    }

    triggerLightning()

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [resizeCanvas, createRaindrops, animate, lightning])

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .rain-wrapper {
          min-height: 100vh;
          overflow-x: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          transition: background 0.4s ease;
        }

        .rain-wrapper.lightning {
          background: linear-gradient(to bottom, #3e4a5a, #4d5e70, #576876);
        }

        .rain-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
        }

        .rain-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .rain-layer-back {
          filter: blur(1.5px);
          opacity: 0.4;
        }

        .rain-layer-mid {
          filter: blur(0.5px);
          opacity: 0.65;
        }

        .rain-layer-front {
          opacity: 0.85;
        }

        .splash-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.6;
        }

        .fog-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, transparent 0%, rgba(120, 140, 160, 0.12) 100%);
          opacity: 0.7;
          animation: fogMove 25s ease-in-out infinite;
        }

        @keyframes fogMove {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); }
          50% { transform: translateX(15px) translateY(8px) scale(1.03); }
        }

        .lightning-flash {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.2), transparent 65%);
          opacity: 0;
          pointer-events: none;
          z-index: 9998;
          transition: opacity 0.1s ease-out;
        }
      `}</style>

      <div ref={bodyRef} className="rain-wrapper">
        <div ref={lightningFlashRef} className="lightning-flash" />

        <div className="rain-container">
          <div className="fog-layer" />
          <canvas ref={rainBackRef} className="rain-layer rain-layer-back" />
          <canvas ref={rainMidRef} className="rain-layer rain-layer-mid" />
          <canvas ref={rainFrontRef} className="rain-layer rain-layer-front" />
          <canvas ref={splashRef} className="splash-layer" />
        </div>
      </div>
    </>
  )
}

export default Rain
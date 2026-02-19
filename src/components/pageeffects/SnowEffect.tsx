import React, { useRef, useEffect, useState, useCallback } from 'react'

interface Snowflake {
  x: number
  y: number
  size: number
  speed: number
  wind: number
  rotation: number
  rotationSpeed: number
  opacity: number
  swingSpeed: number
  swingDistance: number
  initialX: number
  depth: number
  velX: number
  velY: number
  mass: number
}

interface LayerConfig {
  speed: number
  count: number
  maxSize: number
  minSize: number
  blur: number
  depth: number
}

interface Layer extends LayerConfig {
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
  snowflakes: Snowflake[]
}

interface SnowProps {
  showControls?: boolean
  initialWind?: number
  initialIntensity?: number
}

const SnowEffect: React.FC<SnowProps> = ({
  showControls = true,
  initialWind = 0.5,
  initialIntensity = 1
}) => {
  const snowBackRef = useRef<HTMLCanvasElement>(null)
  const snowMidRef = useRef<HTMLCanvasElement>(null)
  const snowFrontRef = useRef<HTMLCanvasElement>(null)

  const layersRef = useRef<Layer[]>([])
  const animationRef = useRef<number | null>(null)
  const windTimeRef = useRef(0)
  const windVariationRef = useRef(0)
  const mouseWindRef = useRef(0)

  const [wind, setWind] = useState(initialWind)
  const [snowIntensity, setSnowIntensity] = useState(initialIntensity)

  const windRef = useRef(wind)
  const snowIntensityRef = useRef(snowIntensity)

  useEffect(() => {
    windRef.current = wind
  }, [wind])

  useEffect(() => {
    snowIntensityRef.current = snowIntensity
  }, [snowIntensity])

  const resizeCanvas = useCallback((layer: Layer) => {
    if (layer.canvas) {
      layer.canvas.width = window.innerWidth
      layer.canvas.height = window.innerHeight
    }
  }, [])

  const getSnowflakeCount = useCallback((baseCount: number): number => {
    const area = window.innerWidth * window.innerHeight
    const density = baseCount / (1920 * 1080)
    return Math.floor(area * density * snowIntensityRef.current)
  }, [])

  const createSnowflake = useCallback((layer: Layer, randomY = false): Snowflake => {
    const size = Math.random() * (layer.maxSize - layer.minSize) + layer.minSize
    const canvasWidth = layer.canvas?.width || window.innerWidth
    const canvasHeight = layer.canvas?.height || window.innerHeight

    return {
      x: Math.random() * canvasWidth,
      y: randomY ? Math.random() * canvasHeight : -20,
      size,
      speed: (Math.random() * 0.5 + 0.5) * layer.speed,
      wind: 0,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.4 + 0.6,
      swingSpeed: Math.random() * 0.01 + 0.005,
      swingDistance: Math.random() * 50 + 20,
      initialX: 0,
      depth: layer.depth,
      velX: 0,
      velY: 0,
      mass: size / 2
    }
  }, [])

  const createSnowflakes = useCallback((layer: Layer) => {
    const count = getSnowflakeCount(layer.count)
    layer.snowflakes = []

    for (let i = 0; i < count; i++) {
      layer.snowflakes.push(createSnowflake(layer, true))
    }
  }, [getSnowflakeCount, createSnowflake])

  const updateWind = useCallback(() => {
    windTimeRef.current += 0.01
    const turbulence1 = Math.sin(windTimeRef.current) * 0.3
    const turbulence2 = Math.sin(windTimeRef.current * 2.3) * 0.15
    const turbulence3 = Math.sin(windTimeRef.current * 0.5) * 0.5

    windVariationRef.current = (turbulence1 + turbulence2 + turbulence3) * windRef.current
  }, [])

  const updateSnowflake = useCallback((flake: Snowflake, layer: Layer) => {
    const mouseWindEffect = (mouseWindRef.current || 0) * flake.depth

    // Physics
    const gravity = 0.05 * flake.mass
    const windForce = (windVariationRef.current + mouseWindEffect) * 0.1
    const airResistance = 0.99

    flake.velY += gravity
    flake.velX += windForce

    flake.velX *= airResistance
    flake.velY *= airResistance

    // Natural swing movement
    const swing = Math.sin(flake.y * flake.swingSpeed) * flake.swingDistance * 0.01

    // Update position
    flake.y += flake.velY + flake.speed
    flake.x += flake.velX + swing

    // Realistic rotation
    flake.rotation += flake.rotationSpeed + flake.velX * 0.5

    const canvasHeight = layer.canvas?.height || window.innerHeight
    const canvasWidth = layer.canvas?.width || window.innerWidth

    // Reset when off screen
    if (flake.y > canvasHeight + 20) {
      Object.assign(flake, createSnowflake(layer))
    }

    // Wrap around edges
    if (flake.x > canvasWidth + 50) {
      flake.x = -50
    } else if (flake.x < -50) {
      flake.x = canvasWidth + 50
    }
  }, [createSnowflake])

  const drawSnowflake = useCallback((flake: Snowflake, ctx: CanvasRenderingContext2D) => {
    ctx.save()
    ctx.translate(flake.x, flake.y)
    ctx.rotate((flake.rotation * Math.PI) / 180)

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flake.size)
    gradient.addColorStop(0, `rgba(255, 255, 255, ${flake.opacity})`)
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${flake.opacity * 0.8})`)
    gradient.addColorStop(1, `rgba(255, 255, 255, 0)`)

    // Draw main circle
    ctx.beginPath()
    ctx.arc(0, 0, flake.size, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // Add details for larger flakes
    if (flake.size > 2.5) {
      // Draw simple star shape
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const x = Math.cos(angle) * flake.size * 0.7
        const y = Math.sin(angle) * flake.size * 0.7

        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.3})`
      ctx.fill()

      // Central glow
      ctx.beginPath()
      ctx.arc(0, 0, flake.size * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.9})`
      ctx.fill()
    }

    ctx.restore()
  }, [])

  const animate = useCallback(() => {
    updateWind()

    layersRef.current.forEach(layer => {
      if (!layer.ctx || !layer.canvas) return

      layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)

      layer.snowflakes.forEach(flake => {
        updateSnowflake(flake, layer)
        drawSnowflake(flake, layer.ctx!)
      })
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [updateWind, updateSnowflake, drawSnowflake])

  // Recreate snowflakes when intensity changes
  useEffect(() => {
    layersRef.current.forEach(layer => {
      createSnowflakes(layer)
    })
  }, [snowIntensity, createSnowflakes])

  useEffect(() => {
    const layerConfigs: LayerConfig[] = [
      { speed: 0.3, count: 30, maxSize: 2.5, minSize: 1, blur: 3, depth: 0.3 },
      { speed: 0.7, count: 40, maxSize: 3.5, minSize: 1.5, blur: 1, depth: 0.6 },
      { speed: 1.2, count: 50, maxSize: 5, minSize: 2, blur: 0, depth: 1 }
    ]

    const canvasRefs = [snowBackRef.current, snowMidRef.current, snowFrontRef.current]

    layersRef.current = layerConfigs.map((config, index) => ({
      ...config,
      canvas: canvasRefs[index],
      ctx: canvasRefs[index]?.getContext('2d', { alpha: true }) || null,
      snowflakes: []
    }))

    layersRef.current.forEach(layer => {
      resizeCanvas(layer)
      createSnowflakes(layer)
    })

    const handleResize = () => {
      layersRef.current.forEach(layer => {
        resizeCanvas(layer)
        createSnowflakes(layer)
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX / window.innerWidth - 0.5) * 0.5
      mouseWindRef.current = moveX
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('mousemove', handleMouseMove)

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [resizeCanvas, createSnowflakes, animate])

  return (
    <>
      <style>{`
        .snow-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
        }

        .snow-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .snow-layer-back {
          filter: blur(3px);
          opacity: 0.4;
        }

        .snow-layer-mid {
          filter: blur(1px);
          opacity: 0.7;
        }

        .snow-layer-front {
          filter: blur(0px);
          opacity: 1;
        }

        .snow-controls {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.5);
          padding: 15px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
          z-index: 10000;
          pointer-events: auto;
        }

        .snow-controls label {
          display: block;
          color: white;
          font-size: 12px;
          margin-bottom: 5px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .snow-controls input {
          width: 100%;
          margin-bottom: 10px;
        }
      `}</style>

      <div className="snow-container">
        <canvas
          ref={snowBackRef}
          className="snow-layer snow-layer-back"
        />
        <canvas
          ref={snowMidRef}
          className="snow-layer snow-layer-mid"
        />
        <canvas
          ref={snowFrontRef}
          className="snow-layer snow-layer-front"
        />
      </div>

      {showControls && (
        <div className="snow-controls">
          <label>Intensidade do Vento</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={wind}
            onChange={(e) => setWind(parseFloat(e.target.value))}
          />
          <label>Intensidade da Neve</label>
          <input
            type="range"
            min="0.3"
            max="2"
            step="0.1"
            value={snowIntensity}
            onChange={(e) => setSnowIntensity(parseFloat(e.target.value))}
          />
        </div>
      )}
    </>
  )
}

export default SnowEffect;
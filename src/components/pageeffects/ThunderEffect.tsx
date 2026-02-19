import React, { useEffect, useRef } from 'react';

interface LightningPath {
  x: number;
  y: number;
}

interface LightningOptions {
  x: number;
  y: number;
  xRange: number;
  yRange: number;
  path: LightningPath[];
  ttl: number;
}

class Lightning {
  x: number;
  y: number;
  xRange: number;
  yRange: number;
  path: LightningPath[];
  ttl: number;
  opacity: number;

  constructor({ x, y, xRange, yRange, path, ttl }: LightningOptions) {
    this.x = x;
    this.y = y;
    this.xRange = xRange;
    this.yRange = yRange;
    this.path = path;
    this.ttl = ttl;
    this.opacity = 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.save();
    ctx.strokeStyle = ctx.shadowColor = '#e3eaef';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'miter';
    ctx.globalAlpha = this.opacity;
    ctx.moveTo(this.x, this.y);

    for (let pc = 0; pc < this.path.length; pc++) {
      ctx.lineTo(this.path[pc].x, this.path[pc].y);
    }

    ctx.stroke();
    ctx.restore();
    ctx.closePath();
  }

  update(ctx: CanvasRenderingContext2D) {
    this.path.push({
      x: this.path[this.path.length - 1].x + getRandomArbitrary(-this.xRange, this.xRange, 2),
      y: this.path[this.path.length - 1].y + getRandomArbitrary(0, this.yRange, 2)
    });

    this.ttl -= 1;
    this.opacity -= (1 / this.ttl);
    if (this.opacity < 0) this.opacity = 0;

    this.draw(ctx);
  }

  static createNewLightning(canvasWidth: number, canvasHeight: number): Lightning {
    const options: LightningOptions = {
      x: getRandomInt(100, canvasWidth - 100),
      y: getRandomInt(0, canvasHeight / 4),
      xRange: getRandomArbitrary(5, 30, 2),
      yRange: getRandomArbitrary(10, 25, 2),
      path: [],
      ttl: getRandomInt(50, 500)
    };
    options.path = [{ x: options.x, y: options.y }];
    return new Lightning(options);
  }
}

const getRandomArbitrary = (min: number, max: number, roundN: number = 0): number => {
  const roundMultiplier = Number(`1e${roundN}`);
  return Math.floor((Math.random() * (max - min) + min) * roundMultiplier) / roundMultiplier;
};

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const ThunderEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightningsRef = useRef<Set<Lightning>>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const tickerRef = useRef<number>(0);
  const randomSpawnRateRef = useRef<number>(1);

  const init = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    lightningsRef.current.clear();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = () => {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      ctx.fillStyle = 'rgba(13, 13, 13, 1)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      for (let lightning of lightningsRef.current) {
        if (lightning.ttl === 0) {
          lightningsRef.current.delete(lightning);
        } else {
          lightning.update(ctx);
        }
      }

      if (tickerRef.current % randomSpawnRateRef.current === 0) {
        tickerRef.current = 0;
        const lightning = Lightning.createNewLightning(canvasWidth, canvasHeight);
        lightningsRef.current.add(lightning);
        randomSpawnRateRef.current = getRandomInt(50, 150);
      }

      tickerRef.current++;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resizeCanvas();
    init(canvas, ctx);

    const handleResize = () => {
      resizeCanvas();
      init(canvas, ctx);
    };

    const handleClick = () => {
      init(canvas, ctx);
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
    />
  );
};

export default ThunderEffect;
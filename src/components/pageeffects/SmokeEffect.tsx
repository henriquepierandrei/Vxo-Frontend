import React, { useRef, useEffect, useCallback } from 'react'

const WhiteSmoke: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number| null>(null)
  const touchesRef = useRef<Map<string, { clientX: number; clientY: number }>>(new Map())
  const glRef = useRef<WebGL2RenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const bufferRef = useRef<WebGLBuffer | null>(null)
  const uniformsRef = useRef<{
    time: WebGLUniformLocation | null
    resolution: WebGLUniformLocation | null
    pointerCount: WebGLUniformLocation | null
  }>({
    time: null,
    resolution: null,
    pointerCount: null
  })

  const dpr = Math.max(1, 0.5 * (typeof window !== 'undefined' ? window.devicePixelRatio : 1))

  const vertexSource = `#version 300 es
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    in vec2 position;
    void main(void) {
        gl_Position = vec4(position, 0., 1.);
    }`

  const fragmentSource = `#version 300 es
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    out vec4 fragColor;
    uniform vec2 resolution;
    uniform float time;
    
    const vec3 re=vec3(6,1,1)*1.5;
    #define T time
    
    float box(vec3 p,vec3 s,float r) {
        p=abs(p)-s;
        return length(p*0.05)-0.6;
    }
    
    float mat=.0;
    float map(vec3 p){
        float rm=-box(p,re,0.5);
        return rm;
    }
    
    vec3 ce(vec2 uv) {
        vec2 n=vec2(1,1),q=vec2(0);
        uv*=0.4;
        float d=dot(uv,uv), s=9.3, a=0.005, b=0.9, t=T*0.2;
        uv.yx-=T*0.03;
        mat2 m=mat2(-.6,.8,-.8,-.6)*.9;
        
        for (float i=.0; i<130.; i++) {
            uv*=m;
            n*=m+cos(T*0.5)*0.8;
            q=uv*s-t+b+i+n;
            a+=dot(cos(q)/s,vec2(3));
            n-=sin(q);
            s*=1.82;
        }
        
        vec3 col = vec3(1.0, 1.0, 1.0) * (a * 0.8 + 0.4);
        col *= vec3(0.95, 0.95, 1.0);
        
        return col;
    }
    
    vec3 nm(vec3 p){
        vec3 n=22.4-vec3(1);
        return n;
    }
    
    void main() {
        vec2 uv=(gl_FragCoord.xy-.5*resolution)/888.8;
        
        vec3 col=vec3(0.8, 0.8, 0.85);
        
        vec3 ro=vec3(0,.5,1.6);
        vec3 rd=normalize(vec3(uv,1));
        vec3 p=ro;
        float dd=.0;
        
        for (float i=.0; i<200.0; i++){
            float d=map(p);
            if (d<1e-2) {
                vec3 n=nm(p);
                if (p.z>(1.0)) {
                    vec3 smoke = ce(p.xy*0.1);
                    col = mix(col, smoke, 0.9);
                    col *= 0.9 + 0.2 * sin(T * 0.5);
                }
                break;
            }
            p+=rd*d;
            dd+=d;
        }
        
        col = pow(col, vec3(0.9));
        
        float alpha = 1.0 - (dd * 0.01);
        alpha = clamp(alpha, 0.0, 1.0);
        
        fragColor=vec4(col * alpha, alpha);
    }`

  const compile = useCallback((gl: WebGL2RenderingContext, shader: WebGLShader, source: string) => {
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
    }
  }, [])

  const setup = useCallback((gl: WebGL2RenderingContext) => {
    const vs = gl.createShader(gl.VERTEX_SHADER)
    const fs = gl.createShader(gl.FRAGMENT_SHADER)

    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return

    compile(gl, vs, vertexSource)
    compile(gl, fs, fragmentSource)

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
    }

    const vertices = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    programRef.current = program
    bufferRef.current = buffer
    uniformsRef.current = {
      time: gl.getUniformLocation(program, 'time'),
      resolution: gl.getUniformLocation(program, 'resolution'),
      pointerCount: gl.getUniformLocation(program, 'pointerCount')
    }
  }, [compile, vertexSource, fragmentSource])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    const gl = glRef.current
    if (!canvas || !gl) return

    const { innerWidth: width, innerHeight: height } = window
    canvas.width = width * dpr
    canvas.height = height * dpr
    gl.viewport(0, 0, width * dpr, height * dpr)
  }, [dpr])

  const draw = useCallback((now: number) => {
    const gl = glRef.current
    const canvas = canvasRef.current
    const program = programRef.current
    const buffer = bufferRef.current
    const uniforms = uniformsRef.current

    if (!gl || !canvas || !program || !buffer) return

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    if (uniforms.time) gl.uniform1f(uniforms.time, now * 0.001)
    if (uniforms.pointerCount) gl.uniform1i(uniforms.pointerCount, touchesRef.current.size)
    if (uniforms.resolution) gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)

    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }, [])

  const loop = useCallback((now: number) => {
    draw(now)
    animationRef.current = requestAnimationFrame(loop)
  }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2')
    if (!gl) {
      console.error('WebGL2 not supported')
      return
    }

    glRef.current = gl

    setup(gl)
    resize()
    loop(0)

    const handleResize = () => resize()
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      touchesRef.current.set('mouse', {
        clientX: e.clientX,
        clientY: e.clientY
      })
    }

    const handleMouseLeave = () => {
      touchesRef.current.delete('mouse')
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [setup, resize, loop])

  return (
    <>
      <style>{`
        .smoke-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
        }

        .smoke-canvas {
          width: 100%;
          height: auto;
          object-fit: contain;
          position: fixed;
          bottom: 0;
          left: 0;
          z-index: 10;
          touch-action: none;
        }

        .smoke-content {
          position: relative;
          z-index: 20;
          color: white;
          text-align: center;
          padding: 50px;
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
        }

        .smoke-content h1 {
          font-family: Arial, sans-serif;
          font-size: 3em;
          margin: 0;
        }
      `}</style>

      <div className="smoke-container">
        <div className="smoke-content">
          <h1>FUMAÇA BRANCA</h1>
        </div>

        <canvas
          ref={canvasRef}
          className="smoke-canvas"
          width={1600}
          height={900}
        />
      </div>
    </>
  )
}

export default WhiteSmoke
import { useEffect, useRef } from 'react'
import useShaderSources from './useShaderSources'
import useWindowSize from './useWindowSize'

function App() {
  const ref = useRef()
  const [vertexShaderSource, fragmentShaderSource] = useShaderSources()
  const [width, height] = useWindowSize()

  useEffect(() => {
    const current = ref.current
    if (!current || !vertexShaderSource || !fragmentShaderSource) return

    const canvas = current as HTMLCanvasElement
    const gl = canvas.getContext('webgl')
    if (!gl) throw Error('no webgl')

    canvas.width = width
    canvas.height = height

    const program = createProgram(
      gl,
      createShader(gl, gl.VERTEX_SHADER, vertexShaderSource),
      createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource),
    )

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      'a_position',
    )
    const positionBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    const positions = [0, 0, 0, 0.5, 0.7, 0]
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.STATIC_DRAW,
    )
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(
      positionAttributeLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    )

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }, [ref, width, height, vertexShaderSource, fragmentShaderSource])

  return (
    <canvas
      ref={ref}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}

function createShader(
  gl: WebGLRenderingContext,
  type: GLenum,
  source: string,
) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  }

  const message = gl.getShaderInfoLog(shader)
  gl.deleteShader(shader)
  if (message.length > 0) {
    throw message
  } else {
    throw Error(
      `Error compiling ${
        type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'
      } shader`,
    )
  }
}

function createProgram(gl, ...shaders) {
  const program = gl.createProgram()
  shaders.forEach((shader) => gl.attachShader(program, shader))
  gl.linkProgram(program)
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program
  }

  const message = gl.getProgramInfoLog(program)
  gl.deleteProgram(program)
  throw Error(message)
}

export default App

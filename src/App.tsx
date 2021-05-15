import { RefObject, useEffect, useRef } from 'react'
import useShaders from './useShaders'
import useWindowSize from './useWindowSize'

function App() {
  const ref = useRef() as RefObject<HTMLCanvasElement>
  const canvas = ref.current
  const gl = canvas && canvas.getContext('webgl')
  const [width, height] = useWindowSize()
  const [error, vertexShader, fragmentShader] = useShaders(gl)
  useEffect(() => {
    if (!canvas || !gl || !vertexShader || !fragmentShader) return

    canvas.width = width
    canvas.height = height

    const program = createProgram(gl, vertexShader, fragmentShader)

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
  }, [gl, canvas, width, height, vertexShader, fragmentShader])

  return error ? (
    <p>{error.message}</p>
  ) : (
    <canvas
      ref={ref}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
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

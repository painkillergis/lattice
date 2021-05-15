import { RefObject, useEffect, useRef } from 'react'
import useProgram from './useProgram'
import useWindowSize from './useWindowSize'

function App() {
  const ref = useRef() as RefObject<HTMLCanvasElement>
  const canvas = ref.current
  const gl = canvas && canvas.getContext('webgl')
  const [width, height] = useWindowSize()
  const [error, program] = useProgram(gl)
  useEffect(() => {
    if (!canvas || !gl || !program) return

    canvas.width = width
    canvas.height = height

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
  }, [gl, canvas, width, height, program])

  return error ? (
    <p>{error.message}</p>
  ) : (
    <canvas
      ref={ref}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}

export default App

import { useEffect, useMemo, useState } from 'react'
import vertexShaderSourcePath from './shaders/vertex.glsl'
import fragmentShaderSourcePath from './shaders/fragment.glsl'

function useProgram(gl: WebGLRenderingContext): [Error, WebGLProgram] {
  const [error, vertexShader, fragmentShader] = useShaders(gl)
  return useMemo(() => {
    if (!gl || !vertexShader || !fragmentShader || error)
      return [error, undefined]
    return createProgram(gl, vertexShader, fragmentShader)
  }, [gl, vertexShader, fragmentShader, error])
}

function useShaders(
  gl: WebGLRenderingContext,
): [Error, WebGLShader, WebGLShader] {
  const [vertexShaderSourceError, vertexShaderSource] = useShaderSource(
    vertexShaderSourcePath,
  )
  const [vertexShaderError, vertexShader] = useShader(
    gl,
    (gl) => gl.VERTEX_SHADER,
    vertexShaderSource,
  )

  const [fragmentShaderSourceError, fragmentShaderSource] =
    useShaderSource(fragmentShaderSourcePath)
  const [fragmentShaderError, fragmentShader] = useShader(
    gl,
    (gl) => gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  )

  return [
    vertexShaderSourceError ||
      vertexShaderError ||
      fragmentShaderSourceError ||
      fragmentShaderError,
    vertexShader,
    fragmentShader,
  ]
}

function useShaderSource(sourcePath): [Error, string] {
  const [error, setError] = useState()
  const [source, setSource] = useState('')
  useEffect(() => {
    fetch(sourcePath)
      .then((response) => response.text())
      .then((newSource) => setSource(newSource))
      .catch((error) => setError(error))
  }, [sourcePath])

  return [error, source]
}

function useShader(gl, typeFn, source): [Error, WebGLShader] {
  return useMemo(() => {
    if (!gl || !source) return [undefined, undefined]
    return createShader(gl, typeFn(gl), source)
  }, [gl, typeFn, source])
}

function createShader(
  gl: WebGLRenderingContext,
  type: GLenum,
  source: string,
): [Error, WebGLShader] {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return [undefined, shader]
  }

  const message = gl.getShaderInfoLog(shader)
  gl.deleteShader(shader)
  if (message.length > 0) {
    return [Error(message), undefined]
  } else {
    return [
      Error(
        `Error compiling ${
          type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'
        } shader`,
      ),
      undefined,
    ]
  }
}

function createProgram(gl, ...shaders): [Error, WebGLProgram] {
  const program = gl.createProgram()
  shaders.forEach((shader) => gl.attachShader(program, shader))
  gl.linkProgram(program)
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return [undefined, program]
  }

  const message = gl.getProgramInfoLog(program)
  gl.deleteProgram(program)
  if (message.length > 0) {
    return [Error(message), undefined]
  } else {
    return [Error(`Error linking program`), undefined]
  }
}

export default useProgram

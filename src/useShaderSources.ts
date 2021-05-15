import { useEffect, useState } from 'react'
import vertexShaderSourcePath from './shaders/vertex.glsl'
import fragmentShaderSourcePath from './shaders/fragment.glsl'

function useShaderSources(): [Error, string, string] {
  const [vertexError, vertexSource] = useShaderSource(
    vertexShaderSourcePath,
  )
  const [fragmentError, fragmentSource] = useShaderSource(
    fragmentShaderSourcePath,
  )
  return [vertexError || fragmentError, vertexSource, fragmentSource]
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

export default useShaderSources

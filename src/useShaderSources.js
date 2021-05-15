import { useEffect, useReducer } from 'react'
import vertexShaderSourcePath from './shaders/vertex.glsl'
import fragmentShaderSourcePath from './shaders/fragment.glsl'

const initialState = [undefined, undefined]

function reducer(state, action) {
  switch (action.type) {
    case 'newShaderSource':
      return action.payload.type === 'vertex'
        ? [action.payload.source, state[1]]
        : [state[0], action.payload.source]
    default:
      throw Error(`irreducible type ${action.type}`)
  }
}

function useShaderSources() {
  const [state, dispatch] = useReducer(reducer, initialState)
  useEffect(() => {
    ;[
      { type: 'vertex', sourcePath: vertexShaderSourcePath },
      { type: 'fragment', sourcePath: fragmentShaderSourcePath },
    ].forEach(({ type, sourcePath }) => {
      fetch(sourcePath)
        .then((response) => response.text())
        .then((source) =>
          dispatch({
            type: 'newShaderSource',
            payload: { type, source },
          }),
        )
        .catch((error) =>
          dispatch({
            type: 'newShaderSourceError',
            payload: { type, error },
          }),
        )
    })
  }, [])
  return state
}

export default useShaderSources

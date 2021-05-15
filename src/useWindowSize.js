import { useEffect, useState } from 'react'

function useWindowSize() {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight])
  useEffect(() => {
    const onResize = () => setSize([window.innerWidth, window.innerHeight])
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

export default useWindowSize

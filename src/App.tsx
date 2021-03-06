import { useEffect, useRef, useState } from 'react'
import Notifications, { Notification } from './components/Notifications'
import GameEngine, { Action, Vector2 } from './GameEngine'
import useCanvasEffect from './hooks/useCanvasEffect'

const gameEngine = new GameEngine()

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useCanvasEffect((canvas) => gameEngine.setCanvas(canvas), canvasRef)

  const [money, setMoney] = useState(0)
  const [moneyRate, setMoneyRate] = useState(0)
  const [towers, setTowers] = useState([])
  const [customers, setCustomers] = useState([])
  const [message, setMessage] = useState<string>()
  const lastMoney = useRef(money)
  useEffect(() => {
    const eventListener = (action: Action) => {
      switch (action.type) {
        case 'purchaseFailed':
          return setMessage(
            `Insufficient funds. An additional ${action.payload.additionalMoneyRequired} is required.`,
          )
        case 'updateMoney':
          setMoneyRate(action.payload - lastMoney.current)
          lastMoney.current = action.payload
          return setMoney(action.payload)
        case 'updateTowers':
          return setTowers(action.payload)
        case 'updateCustomers':
          return setCustomers(action.payload)
        default:
          throw new Error(`irreducible type '${action.type}'`)
      }
    }
    gameEngine.addEventListener(eventListener)
    return () => gameEngine.removeEventListener(eventListener)
  }, [])

  const panning = useRef<Boolean>(false)
  useCanvasEffect((canvas) => {
    const startPanning = () => (panning.current = true)
    const finishPanning = () => (panning.current = false)

    canvas.addEventListener('mousedown', startPanning)
    canvas.addEventListener('mouseup', finishPanning)
    canvas.addEventListener('mouseleave', finishPanning)

    return () => {
      canvas.removeEventListener('mousedown', startPanning)
      canvas.removeEventListener('mouseup', finishPanning)
      canvas.removeEventListener('mouseleave', finishPanning)
    }
  }, canvasRef)

  const lastMouseLocation = useRef<Vector2>()
  useCanvasEffect((canvas) => {
    const onMouseMove = (e: MouseEvent) => {
      if (panning.current && lastMouseLocation.current) {
        gameEngine.pan({
          x: e.pageX - lastMouseLocation.current.x,
          y: e.pageY - lastMouseLocation.current.y,
        })
      }
      lastMouseLocation.current = { x: e.pageX, y: e.pageY }
    }
    canvas.addEventListener('mousemove', onMouseMove)

    return () => canvas.removeEventListener('mousemove', onMouseMove)
  }, canvasRef)

  useCanvasEffect((canvas) => {
    const onWheel = (e: WheelEvent) => {
      gameEngine.zoom(e.deltaY)
    }
    canvas.addEventListener('wheel', onWheel)
    return () => canvas.removeEventListener('wheel', onWheel)
  }, canvasRef)

  const lastMouseDownEvent = useRef<MouseEvent>()
  useCanvasEffect((canvas) => {
    const onMouseDown = (e: MouseEvent) => (lastMouseDownEvent.current = e)
    const onMouseUp = (e: MouseEvent) => {
      const dx = e.pageX - lastMouseDownEvent.current!.pageX
      const dy = e.pageY - lastMouseDownEvent.current!.pageY
      if (Math.sqrt(dx ** 2 + dy ** 2) < 8) {
        gameEngine.purchaseTower({
          x: e.pageX,
          y: e.pageY,
        })
      }
    }
    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mouseup', onMouseUp)
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mouseup', onMouseUp)
    }
  }, canvasRef)

  return (
    <>
      <div
        id="hud"
        style={{ position: 'fixed', padding: '0.5em', color: 'white' }}
      >
        <div>
          Money: {money} ({moneyRate}/s){' '}
        </div>
        <div>Towers: {towers.length}</div>
        <div>
          Upkeep:{' '}
          {towers.reduce(
            (upkeep, { baseUpkeep }) => upkeep + baseUpkeep,
            0,
          )}
          /s
        </div>
        <div>Customers: {customers.length}</div>
      </div>
      <Notifications>
        <Notification
          dismiss={() => setMessage(undefined)}
          message={message}
        />
      </Notifications>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </>
  )
}

export default App

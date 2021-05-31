class GameEngine {
  canvas?: HTMLCanvasElement
  customers: Array<Customer> = []
  towers: Array<Tower> = []

  constructor() {
    this.towers = Array(1)
      .fill(null)
      .map(() => {
        const magnitude = 64
        const angle = Math.random() * Math.PI * 2
        return {
          location: {
            x: Math.sin(angle) * magnitude,
            y: Math.cos(angle) * magnitude,
          },
        }
      })

    this.customers = Array(100)
      .fill(null)
      .map(() => {
        const magnitude = Math.random() ** 2 * 512
        const angle = Math.random() * Math.PI * 2
        return {
          location: {
            x: Math.sin(angle) * magnitude,
            y: Math.cos(angle) * magnitude,
          },
          isServiced: false,
        }
      })
      .map((customer) => ({
        ...customer,
        isServiced: this.towers.some(
          (tower) => magnitude(tower.location, customer.location) <= 64,
        ),
      }))
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    window.addEventListener('resize', this.render.bind(this))
    this.render()
  }

  render() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.canvas!.width = width
    this.canvas!.height = height

    const context = this.canvas!.getContext('2d')!

    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    this.customers
      .map((customer) => ({
        ...customer,
        location: toScreenLocation(width, height, customer.location),
      }))
      .filter(({ location }) =>
        contains(
          { left: 0, top: 0, right: width, bottom: height },
          location,
        ),
      )
      .forEach(({ location, isServiced }) => {
        context.fillStyle = isServiced ? 'green' : 'gray'
        context.beginPath()
        context.ellipse(location.x, location.y, 4, 4, 0, 0, Math.PI * 2)
        context.fill()
      })

    context.strokeStyle = 'green'
    this.towers
      .map((tower) => ({
        ...tower,
        location: toScreenLocation(width, height, tower.location),
      }))
      .filter(({ location }) =>
        contains(
          { left: 0, top: 0, right: width, bottom: height },
          location,
        ),
      )
      .forEach(({ location }) => {
        context.beginPath()
        context.ellipse(location.x, location.y, 64, 64, 0, 0, Math.PI * 2)
        context.stroke()
      })
  }
}

interface Vector2 {
  x: number
  y: number
}

function toScreenLocation(
  width: number,
  height: number,
  { x, y }: Vector2,
): Vector2 {
  return {
    x: width / 2 + x,
    y: height / 2 - y,
  }
}

interface Customer {
  location: Vector2
  isServiced: Boolean
}

interface Tower {
  location: Vector2
}

interface Envelope {
  left: number
  top: number
  right: number
  bottom: number
}

function contains(envelope: Envelope, location: Vector2) {
  return (
    location.x >= envelope.left &&
    location.x <= envelope.right &&
    location.y >= envelope.top &&
    location.y <= envelope.bottom
  )
}

function magnitude(p1: Vector2, p2: Vector2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

export default GameEngine
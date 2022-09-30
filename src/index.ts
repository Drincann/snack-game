type a = HTMLCanvasElement['width']
const createContext = ({ canvasProps, rootSelector }: {
  canvasProps?: { [key in keyof HTMLCanvasElement]?: HTMLCanvasElement[key] }
  rootSelector?: string
} = {}): {
  context: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
} => {
  // push canvas 
  const canvas = document.createElement('canvas')
  canvas.id = 'canvas'
  // asign canvas props
  if (canvasProps) {
    Object.keys(canvasProps).forEach(key => {
      // @ts-ignore-next-line        
      canvas[key] = canvasProps[key]
    })
  }
  // append canvas to root
  document.querySelector(rootSelector ?? 'body')?.appendChild(canvas)
  return {
    context: canvas.getContext('2d') as CanvasRenderingContext2D,
    canvas
  }
}

const { context: ctx, canvas } = createContext({
  rootSelector: '.root',
  canvasProps: {
    width: 800,
    height: 600
  }
});

// background
let calculateWhenFrame = 100
let fps = 0, lastRenderTime = Date.now(), frameCount = 0
const refresh = (color?: string) => {
  ctx.fillStyle = color ?? 'black'
  ctx.fillRect(0, 0, 800, 600)
  // culculate fps
  const now = Date.now();
  frameCount++;
  if (now - lastRenderTime > calculateWhenFrame) {
    fps = Math.round(frameCount / (now - lastRenderTime) * 1000)
    lastRenderTime = now
    frameCount = 0
  }

  ctx.fillStyle = 'white'
  ctx.font = '20px Arial'
  ctx.fillText(`fps: ${fps.toFixed(2)}`, 10, 30)

}
refresh()

// event
let isMouseDown = false
let xWhenMouseDown = 0
let yWhenMouseDown = 0
canvas.addEventListener('mousedown', e => {
  isMouseDown = true
  xWhenMouseDown = e.offsetX
  yWhenMouseDown = e.offsetY
})

canvas.addEventListener('mouseup', e => {
  isMouseDown = false
  refresh()
})

let directionVector = { x: 0, y: 0 };
const borderWidth = 100;
canvas.addEventListener('mousemove', e => {
  if (isMouseDown) {
    directionVector = {
      x: e.offsetX - xWhenMouseDown,
      y: e.offsetY - yWhenMouseDown,
    }
    // simple draw
    requestAnimationFrame(() => {
      refresh()

      // border circle
      ctx.beginPath()
      ctx.arc(xWhenMouseDown, yWhenMouseDown, borderWidth, 0, Math.PI * 2)
      // opacity
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      // width
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.closePath()

      // line
      // start draw a circle
      // drew when not over border
      ctx.beginPath()
      if (Math.sqrt(directionVector.x ** 2 + directionVector.y ** 2) < borderWidth) {
        ctx.arc(e.offsetX, e.offsetY, 50, 0, Math.PI * 2, true)

      } else {
        /*
        | x^2 + y^2 = borderWidth^2
        | x/y = c
        => x = c * y
        => y = sqrt(borderWidth^2 / (c^2 + 1))
        */
        const c = directionVector.x / directionVector.y;
        const y = Math.sqrt(borderWidth ** 2 / ((c ** 2) + 1)) * (directionVector.y > 0 ? 1 : -1);
        const x = c * y;

        ctx.arc(xWhenMouseDown + x, yWhenMouseDown + y, 50, 0, Math.PI * 2)
      }
      ctx.fillStyle = 'white'
      ctx.fill()

      // border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = 10
      ctx.stroke()
      ctx.closePath()

    })
  }
})

// snake
// ...
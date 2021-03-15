interface xy {
    x: number,
    y: number
}

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')
const handlers: { [key: string]: (e: MouseEvent) => void } = {}

const getPointer = (canvas: HTMLCanvasElement, event: MouseEvent): xy => {
    const rect = canvas.getBoundingClientRect()
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}

const normalizePoint = (canvas: HTMLCanvasElement, point: xy) => {
    point.x = Math.max(0, point.x)
    point.y = Math.max(0, point.y)

    point.x = Math.min(canvas.width, point.x)
    point.y = Math.min(canvas.height, point.y)
    return point
} 

const drawPixel = (ctx: CanvasRenderingContext2D, point: xy, color: string = '#000000') => {
    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.moveTo(point.x, point.y)
    ctx.rect(point.x, point.y, 1, 1)
    ctx.fill()
    ctx.closePath()
    ctx.restore()
}

const drawLine = (ctx: CanvasRenderingContext2D, a: xy, b: xy) => {
    const dx = Math.abs(b.x - a.x)
    const dy = -Math.abs(b.y - a.y)
    const sx = a.x < b.x ? 1 : -1
    const sy = a.y < b.y ? 1 : -1
    let err = dx + dy 

    const p = {x: a.x, y: a.y}

    while (true) {
        drawPixel(ctx, p)

        if (Math.abs(p.x - b.x) < 0.0001 && Math.abs(p.y - b.y) < 0.0001) {
            return
        }

        let err2 = 2 * err

        if (err2 >= dy) {
            err += dy
            p.x += sx
        }

        if (err2 <= dx) {
            err += dx
            p.y += sy
        }
    }
}

const drawLines = (ctx: CanvasRenderingContext2D, lines: Array<{first: xy, last: xy}>) => {
    lines.forEach((l)=> drawLine(ctx, l.first, l.last))
}

const lines: Array<{first: xy, last: xy}> = []

let firstPoint: xy
let drawing = false

const mouseDown = (e: MouseEvent) => {
    const point = normalizePoint(canvas, getPointer(canvas, e))
    firstPoint = point
    drawing = true
}

const mouseMove = (e: MouseEvent) => {
    if (!drawing) { return }
    const point = normalizePoint(canvas, getPointer(canvas, e))

    ctx!.clearRect(0, 0, ctx!.canvas.width, ctx!.canvas.height)

    drawLine(ctx!, firstPoint, point)
    drawLines(ctx!, lines)
}

const mouseUp = (e: MouseEvent) => {
    if (!drawing) { return }

    const point = normalizePoint(canvas, getPointer(canvas, e))

    ctx!.clearRect(0, 0, ctx!.canvas.width, ctx!.canvas.height)

    lines.push({first:firstPoint, last: point})
    drawLines(ctx!, lines)

    drawing = false
}

handlers['mousedown'] = mouseDown
handlers['mousemove'] = mouseMove
handlers['mouseup'] = mouseUp

// @ts-ignore
Object.entries(handlers).forEach(([key, value]) => canvas.addEventListener(key, value))

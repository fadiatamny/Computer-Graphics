
// implementation based on : https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm

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

const distance = (a :xy , b: xy) => {
    const dx = a.x - b.x
    const dy = a.y - b.y

    return Math.sqrt((dx * dx) + (dy * dy))
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

const drawCircle = (ctx: CanvasRenderingContext2D, center: xy, point: xy, color: string = '#000000') => {
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x + point.x, y: center.y+point.y }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x-point.x, y: center.y+point.y }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x+point.x, y: center.y-point.y }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x-point.x, y: center.y-point.y }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x+point.y, y: center.y + point.x }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x-point.y, y: center.y + point.x }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x+point.y, y: center.y - point.x }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x-point.y, y: center.y - point.x }), color);
}

const circleBres = (ctx: CanvasRenderingContext2D, center: xy, radius: number) => {
    let x = 0
    let y = radius
    let d = 3 - 2 * radius

    while (x < y) {
        drawCircle(ctx, center, {x, y})
        if (d < 0) {
            d = d + 4 * x + 6
        } else {
            y--
            d = d + 4 * (x - y) + 10
        }

        drawCircle(ctx, center, {x, y})
        x++
    }

    if (x == y) {
        drawCircle(ctx, center, {x, y})
    }
}

const drawCircles = (ctx: CanvasRenderingContext2D, circles: Array<{first: xy, radius: number}>) => {
    circles.forEach((l)=> circleBres(ctx, l.first, l.radius))
}

const circles: Array<{first: xy, radius: number}> = []

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

    const d = distance(firstPoint, point)
    circleBres(ctx!, firstPoint, d)
    drawCircles(ctx!, circles)
}

const mouseUp = (e: MouseEvent) => {
    if (!drawing) { return }

    const point = normalizePoint(canvas, getPointer(canvas, e))

    ctx!.clearRect(0, 0, ctx!.canvas.width, ctx!.canvas.height)

    const d = distance(firstPoint, point)
    circleBres(ctx!, firstPoint, d)

    circles.push({first:firstPoint, radius: d})
    drawCircles(ctx!, circles)

    drawing = false
}

handlers['mousedown'] = mouseDown
handlers['mousemove'] = mouseMove
handlers['mouseup'] = mouseUp

// @ts-ignore
Object.entries(handlers).forEach(([key, value]) => canvas.addEventListener(key, value))

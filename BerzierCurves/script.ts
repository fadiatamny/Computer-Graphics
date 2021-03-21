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

    point.x = Math.floor(point.x)
    point.y = Math.floor(point.y)

    return point
}

const distance = (a :xy , b: xy) => {
    const dx = a.x - b.x
    const dy = a.y - b.y

    return Math.sqrt((dx * dx) + (dy * dy))
}

const drawPixel = (ctx: CanvasRenderingContext2D, point: xy, options: { color?: string, joint?: boolean } = {}) => {
    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = options.color ?? '#000000'
    ctx.moveTo(point.x, point.y)
    const size = options.joint ? 3 : 1
    ctx.rect(point.x, point.y, size, size)
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

const bezierPoint = (points: xy[], t: number) => {
    const aX = -points[0].x + (3 * points[1].x) + (-3 * points[2].x) + points[3].x
    const aY = -points[0].y + (3 * points[1].y) + (-3 * points[2].y) + points[3].y
    
    const bX = (3 * points[0].x) + (-6 * points[1].x) + (3 * points[2].x)
    const bY = (3 * points[0].y) + (-6 * points[1].y) + (3 * points[2].y)

    const cX = (-3 * points[0].x) + (3 * points[1].x)
    const cY = (-3 * points[0].y) + (3 * points[1].y)

    const x = Math.round((aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + points[0].x)
    const y = Math.round((aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + points[0].y)
    
    return {x, y};
}

const bezierCurve = (ctx: CanvasRenderingContext2D, points: xy[], accuracy: number) => {
    let startPoint = points[0]

    for (let i = 0; i <= accuracy ; i++) {
        const bPoint = bezierPoint(points, i / accuracy)
        debugger
        drawLine(ctx, startPoint, bPoint)
        console.log(startPoint)
        startPoint = bPoint
        console.log(startPoint)
    }
}

const berzierCurves: Array<{ points: xy[], accuracy: number}> = []

let firstPoint: xy
let drawing = false
let done = true

const mouseDown = (e: MouseEvent) => {
}

const mouseMove = (e: MouseEvent) => {

}

const mouseUp = (e: MouseEvent) => {
    if (done) {
        ctx!.clearRect(0, 0, ctx!.canvas.width, ctx!.canvas.height)
        berzierCurves.map((c) => {
            bezierCurve(ctx!, c.points, c.accuracy)
        })
        berzierCurves.push({
            points: [],
            accuracy: 100
        })
        done = false
    }
    if (berzierCurves[berzierCurves.length - 1].points.length == 4) { return }

    const point = normalizePoint(canvas, getPointer(canvas, e))

    berzierCurves[berzierCurves.length - 1].points.push(point)
    drawPixel(ctx!, point, {joint: true, color: 'red'})

    if (berzierCurves[berzierCurves.length - 1].points.length == 4) {
        ctx!.clearRect(0, 0, ctx!.canvas.width, ctx!.canvas.height)
        berzierCurves.map((c) => {
            bezierCurve(ctx!, c.points, c.accuracy)
        })
        berzierCurves[berzierCurves.length - 1].points.map((p) => drawPixel(ctx!, p, {color: 'red', joint: true}))
        done = true
    }
}

handlers['mousedown'] = mouseDown
handlers['mousemove'] = mouseMove
handlers['mouseup'] = mouseUp

// @ts-ignore
Object.entries(handlers).forEach(([key, value]) => canvas.addEventListener(key, value))

interface xy {
    x: number,
    y: number
}

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')
const handlers: { [key: string]: (e: MouseEvent) => void } = {}
const berzierCurves: Array<{ points: xy[], accuracy: number}> = []

let firstPoint: xy
let drawing = false
let done = true

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

const matrixMultipication = (a: number[][], b: number[][]) => {
    const transpose = (a: number[][]) => a[0].map((x, i) => a.map((y) => y[i]))
    const dotproduct = (a: number[], b: number[]) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n)
    const result = (a: number[][], b: number[][]) => a.map((x) => transpose(b).map((y) => dotproduct(x, y)))
    return result(a, b)
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

const bezierPoint = (xMatrix: number[][], yMatrix: number[][], t: number) => {
    const tMatrix: number[][] = [[Math.pow(t, 3), Math.pow(t, 2), t, 1]]

    const x = Math.round(matrixMultipication(tMatrix, xMatrix)[0][0])
    const y = Math.round(matrixMultipication(tMatrix, yMatrix)[0][0])
    
    return {x, y}
}

const bezierCurve = (ctx: CanvasRenderingContext2D, points: xy[], accuracy: number) => {
    const bezierMatrix = [
        [-1, 3, -3, 1],
        [3, -6, 3, 0],
        [-3, 3, 0, 0],
        [1, 0, 0, 0],
    ]
    let xMatrix: number[][] = []
    let yMatrix: number[][] = []

    points.map((p) => {xMatrix.push([p.x]); yMatrix.push([p.y])})
    xMatrix = matrixMultipication(bezierMatrix, xMatrix)
    yMatrix = matrixMultipication(bezierMatrix, yMatrix)

    let startPoint = points[0]

    for (let i = 0; i <= accuracy ; i++) {
        const bPoint = bezierPoint(xMatrix, yMatrix, i / accuracy)
        drawLine(ctx, startPoint, bPoint)
        startPoint = bPoint
    }
}

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

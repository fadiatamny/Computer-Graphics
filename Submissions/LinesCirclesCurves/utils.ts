import { xy } from './models'

export const drawPixel = (ctx: CanvasRenderingContext2D, point: xy, options: { color?: string, joint?: boolean } = {}) => {
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


export const drawCircle = (ctx: CanvasRenderingContext2D, center: xy, point: xy, color: string = '#000000') => {
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x + point.x, y: center.y+point.y }), {color});
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x-point.x, y: center.y+point.y }), {color});
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x+point.x, y: center.y-point.y }), {color});
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x-point.x, y: center.y-point.y }), {color});
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x+point.y, y: center.y + point.x }), {color});
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x-point.y, y: center.y + point.x }), {color});
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x+point.y, y: center.y - point.x }), {color});
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x-point.y, y: center.y - point.x }), {color});
}

export const euclideanDistance = (a :xy , b: xy) => {
    const dx = a.x - b.x
    const dy = a.y - b.y

    return Math.sqrt((dx * dx) + (dy * dy))
}

export const matrixMultipication = (a: number[][], b: number[][]) => {
    const transpose = (a: number[][]) => a[0].map((x, i) => a.map((y) => y[i]))
    const dotproduct = (a: number[], b: number[]) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n)
    const result = (a: number[][], b: number[][]) => a.map((x) => transpose(b).map((y) => dotproduct(x, y)))
    return result(a, b)
}

export const normalizePoint = (canvas: HTMLCanvasElement, point: xy) => {
    point.x = Math.max(0, point.x)
    point.y = Math.max(0, point.y)

    point.x = Math.min(canvas.width - 1, point.x)   // - 1 to keep it within the borders of the canvas
    point.y = Math.min(canvas.height - 1, point.y)  // - 1 to keep it within the borders of the canvas

    point.x = Math.floor(point.x)
    point.y = Math.floor(point.y)

    return point
}

export const getPointer = (element: HTMLCanvasElement | HTMLDivElement, event: MouseEvent): xy => {
    const rect = element.getBoundingClientRect()
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}
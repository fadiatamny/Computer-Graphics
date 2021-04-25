
import { Shape, xy } from './models'
import { matrixMultipication, drawPixel } from './utils'

export default class Curve implements Shape {
    constructor(
        private _points: xy[],
        private _accuracy: number = 100,
        public _color: string = '#000000'
    ) {}

    /**
     * implementation based on : https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
    */
    private _drawLine(ctx: CanvasRenderingContext2D, a: xy, b: xy, color: string) {
        const dx = Math.abs(b.x - a.x)
        const dy = -Math.abs(b.y - a.y)
        const sx = a.x < b.x ? 1 : -1
        const sy = a.y < b.y ? 1 : -1
        let err = dx + dy

        const p = { x: a.x, y: a.y }

        while (true) {
            drawPixel(ctx, p, { color })

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

    private _bezierPoint(xMatrix: number[][], yMatrix: number[][], t: number) {
        const tMatrix: number[][] = [[Math.pow(t, 3), Math.pow(t, 2), t, 1]]

        const x = Math.round(matrixMultipication(tMatrix, xMatrix)[0][0])
        const y = Math.round(matrixMultipication(tMatrix, yMatrix)[0][0])

        return { x, y }
    }

    /**
     * implementation based on what we learned in class using basic matrix multipication and drawing n lines.
     */
    private _bezierCurve(ctx: CanvasRenderingContext2D) {
        if (this._points.length !== 4) { return }

        const bezierMatrix = [
            [-1, 3, -3, 1],
            [3, -6, 3, 0],
            [-3, 3, 0, 0],
            [1, 0, 0, 0],
        ]
        let xMatrix: number[][] = []
        let yMatrix: number[][] = []

        this._points.map((p) => { xMatrix.push([p.x]); yMatrix.push([p.y]) })
        xMatrix = matrixMultipication(bezierMatrix, xMatrix)
        yMatrix = matrixMultipication(bezierMatrix, yMatrix)

        let startPoint = this._points[0]

        for (let i = 0; i <= this._accuracy; i++) {
            const bPoint = this._bezierPoint(xMatrix, yMatrix, i / this._accuracy)
            this._drawLine(ctx, startPoint, bPoint, this._color)
            startPoint = bPoint
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        this._bezierCurve(ctx)
    }

    public switchColor(color: string) {
        this._color = color
    }

    public switchAccuracy(accuracy: number) {
        this._accuracy = accuracy
    }
}

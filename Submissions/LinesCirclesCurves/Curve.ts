
import { xy } from './models'
import { matrixMultipication, drawPixel, normalizePoint, getPointer } from './utils'

export default class Circle {
    private _berzierCurves: Array<{ points: xy[], accuracy: number, color: string }> = []
    private _done: boolean = true
    private _ctx: CanvasRenderingContext2D | null
    private _color: string = '#000000'
    private _accuracy: number = 100
    private _handlers: { [key: string]: (e: MouseEvent) => void } = {}

    constructor(
        private _container: HTMLDivElement,
        private _canvas: HTMLCanvasElement
    ) {
        const rect = _container.getBoundingClientRect()
        _canvas.width = Math.floor(rect.width)
        _canvas.height = Math.floor(rect.height)

        this._ctx = this._canvas.getContext('2d')
        this._berzierCurves = []

        this._handlers['mouseup'] = this._mouseUp.bind(this)
    }

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
    private _bezierCurve(ctx: CanvasRenderingContext2D, points: xy[], accuracy: number, color: string) {
        if (points.length !== 4) { return }

        const bezierMatrix = [
            [-1, 3, -3, 1],
            [3, -6, 3, 0],
            [-3, 3, 0, 0],
            [1, 0, 0, 0],
        ]
        let xMatrix: number[][] = []
        let yMatrix: number[][] = []

        points.map((p) => { xMatrix.push([p.x]); yMatrix.push([p.y]) })
        xMatrix = matrixMultipication(bezierMatrix, xMatrix)
        yMatrix = matrixMultipication(bezierMatrix, yMatrix)

        let startPoint = points[0]

        for (let i = 0; i <= accuracy; i++) {
            const bPoint = this._bezierPoint(xMatrix, yMatrix, i / accuracy)
            this._drawLine(ctx, startPoint, bPoint, color)
            startPoint = bPoint
        }
    }

    private _mouseUp(e: MouseEvent) {
        if (this._done) {
            this.draw()
            this._berzierCurves.push({
                points: [],
                accuracy: this._accuracy,
                color: this._color
            })
            this._done = false
        }

        if (this._berzierCurves[this._berzierCurves.length - 1].points.length == 4) { return }

        const point = normalizePoint(this._canvas, getPointer(this._container, e))

        this._berzierCurves[this._berzierCurves.length - 1].points.push(point)
        drawPixel(this._ctx!, point, { joint: true, color: 'red' })

        if (this._berzierCurves[this._berzierCurves.length - 1].points.length == 4) {
            this.draw()
            this._berzierCurves[this._berzierCurves.length - 1].points.map((p) => drawPixel(this._ctx!, p, { color: 'red', joint: true }))
            this._done = true
        }
    }

    public draw() {
        this._ctx!.clearRect(0, 0, this._ctx!.canvas.width, this._ctx!.canvas.height)
        this._berzierCurves.map((c) => {
            this._bezierCurve(this._ctx!, c.points, c.accuracy, c.color)
        })
    }

    public init() {
        // @ts-ignore
        Object.entries(this._handlers).forEach(([key, value]) => this._container.addEventListener(key, value))
        this._done = true
    }

    public dispose() {
        // @ts-ignore
        Object.entries(this._handlers).forEach(([key, value]) => this._container.removeEventListener(key, value))

        if (!this._done) {
            debugger
            this._done = true
            this.draw()
        }
    }

    public switchColor(color: string) {
        this._color = color
        if (!this._done) {
            this._berzierCurves[this._berzierCurves.length - 1].color = color
        }
    }

    public switchAccuracy(accuracy: number) {
        this._accuracy = accuracy
        if (!this._done) {
            this._berzierCurves[this._berzierCurves.length - 1].accuracy = accuracy
        }
    }

    public clearCanvas() {
        this._ctx?.clearRect(0, 0, this._canvas.width, this._canvas.height)
        this._berzierCurves = []
        this._done = true
    }
}

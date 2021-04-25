
import { xy } from './models'
import { euclideanDistance, drawCircle, normalizePoint, getPointer } from './utils'

export default class Circle {
    private _circles: Array<{ first: xy, radius: number, color: string }>
    private _firstPoint: xy | undefined
    private _drawing: boolean = false
    private _ctx: CanvasRenderingContext2D | null
    private _color: string = '#000000'
    private _handlers: { [key: string]: (e: MouseEvent) => void } = {}

    constructor(
        private _container: HTMLDivElement,
        private _canvas: HTMLCanvasElement
    ) {
        const rect = _container.getBoundingClientRect()
        _canvas.width = Math.floor(rect.width)
        _canvas.height = Math.floor(rect.height)

        this._ctx = this._canvas.getContext('2d')
        this._circles = []

        this._handlers['mousedown'] = this._mouseDown.bind(this)
        this._handlers['mousemove'] = this._mouseMove.bind(this)
        this._handlers['mouseup'] = this._mouseUp.bind(this)
    }

    /**
     * implementation based on: https://www.geeksforgeeks.org/bresenhams-circle-drawing-algorithm/
     */
    private _circleBres(_ctx: CanvasRenderingContext2D, center: xy, radius: number, color: string) {
        let x = 0
        let y = radius
        let d = 3 - 2 * radius

        while (x < y) {
            drawCircle(_ctx, center, { x, y }, color)
            if (d < 0) {
                d = d + 4 * x + 6
            } else {
                y--
                d = d + 4 * (x - y) + 10
            }

            drawCircle(_ctx, center, { x, y }, color)
            x++
        }

        if (x == y) {
            drawCircle(_ctx, center, { x, y }, color)
        }
    }

    private _drawCircles(_ctx: CanvasRenderingContext2D, circles: Array<{ first: xy, radius: number, color: string }>) {
        circles.forEach((l) => this._circleBres(_ctx, l.first, l.radius, l.color))
    }

    private _mouseDown(e: MouseEvent) {
        const point = normalizePoint(this._canvas, getPointer(this._container, e))
        this._firstPoint = point
        this._drawing = true
    }

    private _mouseMove(e: MouseEvent) {
        if (!this._drawing) { return }
        const point = normalizePoint(this._canvas, getPointer(this._container, e))

        this._ctx!.clearRect(0, 0, this._ctx!.canvas.width, this._ctx!.canvas.height)

        const d = euclideanDistance(this._firstPoint!, point)
        this._circleBres(this._ctx!, this._firstPoint!, d, this._color)
        this._drawCircles(this._ctx!, this._circles)
    }

    private _mouseUp(e: MouseEvent) {
        if (!this._drawing) { return }

        const point = normalizePoint(this._canvas, getPointer(this._container, e))

        this._ctx!.clearRect(0, 0, this._ctx!.canvas.width, this._ctx!.canvas.height)

        const d = euclideanDistance(this._firstPoint!, point)
        this._circleBres(this._ctx!, this._firstPoint!, d, this._color)

        this._circles.push({ first: this._firstPoint!, radius: d, color: this._color })
        this._drawCircles(this._ctx!, this._circles)

        this._drawing = false
    }

    public draw() {
        this._ctx!.clearRect(0, 0, this._ctx!.canvas.width, this._ctx!.canvas.height)
        this._drawCircles(this._ctx!, this._circles)
    }

    public init() {
        // @ts-ignore
        Object.entries(this._handlers).forEach(([key, value]) => this._container.addEventListener(key, value))
        this._drawing = false
    }

    public dispose() {
        // @ts-ignore
        Object.entries(this._handlers).forEach(([key, value]) => this._container.removeEventListener(key, value))

        if (this._drawing) {
            this._drawing = false
            this.draw()
        }
    }

    public switchColor(color: string) {
        this._color = color
    }

    public clearCanvas() {
        this._ctx?.clearRect(0, 0, this._canvas.width, this._canvas.height)
        this._circles = []
    }
}

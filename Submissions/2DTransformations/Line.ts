
import { xy } from './models'
import { drawPixel, normalizePoint, getPointer } from './utils'

export default class Line {
    private _lines: Array<{ first: xy, last: xy, color: string }>
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
        this._lines = []

        this._handlers['mousedown'] = this.mouseDown.bind(this)
        this._handlers['mousemove'] = this.mouseMove.bind(this)
        this._handlers['mouseup'] = this.mouseUp.bind(this)
    }

    /**
     * implementation based on : https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
     */
    private drawLine(ctx: CanvasRenderingContext2D, a: xy, b: xy, color: string) {
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

    private drawLines(ctx: CanvasRenderingContext2D, lines: Array<{ first: xy, last: xy, color: string }>) {
        lines.forEach((l) => this.drawLine(ctx, l.first, l.last, l.color))
    }

    private mouseDown(e: MouseEvent) {
        const point = normalizePoint(this._canvas, getPointer(this._container, e))
        this._ctx?.fillRect(point.x, point.y, 1, 1)
        this._firstPoint = point
        this._drawing = true
    }

    private mouseMove(e: MouseEvent) {
        if (!this._drawing) { return }
        const point = normalizePoint(this._canvas, getPointer(this._container, e))

        this._ctx!.clearRect(0, 0, this._ctx!.canvas.width, this._ctx!.canvas.height)

        this.drawLine(this._ctx!, this._firstPoint!, point, this._color)
        this.drawLines(this._ctx!, this._lines)
    }

    private mouseUp(e: MouseEvent) {
        if (!this._drawing) { return }

        const point = normalizePoint(this._canvas, getPointer(this._canvas, e))

        this._ctx!.clearRect(0, 0, this._ctx!.canvas.width, this._ctx!.canvas.height)

        this._lines.push({ first: this._firstPoint!, last: point, color: this._color })
        this.drawLines(this._ctx!, this._lines)

        this._drawing = false
    }

    public draw() {
        this._ctx!.clearRect(0, 0, this._ctx!.canvas.width, this._ctx!.canvas.height)
        this.drawLines(this._ctx!, this._lines)
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
        this._lines = []
    }
}

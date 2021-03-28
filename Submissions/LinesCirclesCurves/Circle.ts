
import { xy } from './models'
import { euclideanDistance, drawCircle, normalizePoint, getPointer } from './utils'

export default class Circle {
    private _circles: Array<{first: xy, radius: number}>
    private _firstPoint: xy | undefined
    private _drawing: boolean = false
    private _ctx: CanvasRenderingContext2D | null
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

        this._handlers['mousedown'] = this.mouseDown.bind(this)
        this._handlers['mousemove'] = this.mouseMove.bind(this)
        this._handlers['mouseup'] = this.mouseUp.bind(this)
    }
    
    private circleBres (_ctx: CanvasRenderingContext2D, center: xy, radius: number) {
        let x = 0
        let y = radius
        let d = 3 - 2 * radius
    
        while (x < y) {
            drawCircle(_ctx, center, {x, y})
            if (d < 0) {
                d = d + 4 * x + 6
            } else {
                y--
                d = d + 4 * (x - y) + 10
            }
    
            drawCircle(_ctx, center, {x, y})
            x++
        }
    
        if (x == y) {
            drawCircle(_ctx, center, {x, y})
        }
    }
    
    private drawCircles (_ctx: CanvasRenderingContext2D, circles: Array<{first: xy, radius: number}>) {
        circles.forEach((l)=> this.circleBres(_ctx, l.first, l.radius))
    }

    private mouseDown (e: MouseEvent) {
        const point = normalizePoint(this._canvas, getPointer(this._container, e))
        this._firstPoint = point
        this._drawing = true
    }
    
    private mouseMove (e: MouseEvent) {
        if (!this._drawing) { return }
        const point = normalizePoint(this._canvas, getPointer(this._container, e))
    
        this._ctx!.clearRect(0, 0, this._ctx!.canvas.width, this._ctx!.canvas.height)
    
        const d = euclideanDistance(this._firstPoint!, point)
        this.circleBres(this._ctx!, this._firstPoint!, d)
        this.drawCircles(this._ctx!, this._circles)
    }
    
    private mouseUp (e: MouseEvent) {
        if (!this._drawing) { return }
    
        const point = normalizePoint(this._canvas, getPointer(this._container, e))
    
        this._ctx!.clearRect(0, 0, this._ctx!.canvas.width, this._ctx!.canvas.height)
    
        const d = euclideanDistance(this._firstPoint!, point)
        this.circleBres(this._ctx!, this._firstPoint!, d)
    
        this._circles.push({first: this._firstPoint!, radius: d})
        this.drawCircles(this._ctx!, this._circles)
    
        this._drawing = false
    }

    public draw () {
        this._ctx!.clearRect(0, 0, this._ctx!.canvas.width, this._ctx!.canvas.height)
        this.drawCircles(this._ctx!, this._circles)
    }

    public init () {
        // @ts-ignore
        Object.entries(this._handlers).forEach(([key, value]) => this._container.addEventListener(key, value))
        this._drawing = false
    }

    public dispose () {
        // @ts-ignore
        Object.entries(this._handlers).forEach(([key, value]) => this._container.removeEventListener(key, value))

        if(this._drawing) {
            this._drawing = false
            this.draw()
        }
    }

    public clearCanvas() {
        this._ctx?.clearRect(0, 0, this._canvas.width, this._canvas.height)
        this._circles = []
    }
}

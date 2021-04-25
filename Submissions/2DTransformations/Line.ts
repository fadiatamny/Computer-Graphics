
import { Shape, xy } from './models'
import { drawPixel } from './utils'

export default class Line implements Shape {
    constructor(
        private _a: xy,
        private _b: xy,
        public _color: string = '#000000'
        ) {}

    /**
     * implementation based on : https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
     */
    private drawLine(ctx: CanvasRenderingContext2D) {
        const dx = Math.abs(this._b.x - this._a.x)
        const dy = -Math.abs(this._b.y - this._a.y)
        const sx = this._a.x < this._b.x ? 1 : -1
        const sy = this._a.y < this._b.y ? 1 : -1
        let err = dx + dy

        const p = { x: this._a.x, y: this._a.y }

        while (true) {
            drawPixel(ctx, p, { color: this._color })

            if (Math.abs(p.x - this._b.x) < 0.0001 && Math.abs(p.y - this._b.y) < 0.0001) {
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

    public draw(ctx: CanvasRenderingContext2D) {
        this.drawLine(ctx)
    }

    public switchColor(color: string) {
        this._color = color
    }
}

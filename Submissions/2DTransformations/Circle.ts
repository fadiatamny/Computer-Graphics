
import { Shape, xy } from './models'
import { drawCircle } from './utils'

export default class Circle implements Shape {
    constructor(
        private _center: xy,
        private _radius: number,
        public _color: string = '#000000'
    ) {}

    /**
     * implementation based on: https://www.geeksforgeeks.org/bresenhams-circle-drawing-algorithm/
     */
    private _circleBres(ctx: CanvasRenderingContext2D) {
        let x = 0
        let y = this._radius
        let d = 3 - 2 * this._radius

        while (x < y) {
            drawCircle(ctx, this._center, { x, y }, this._color)
            if (d < 0) {
                d = d + 4 * x + 6
            } else {
                y--
                d = d + 4 * (x - y) + 10
            }

            drawCircle(ctx, this._center, { x, y }, this._color)
            x++
        }

        if (x == y) {
            drawCircle(ctx, this._center, { x, y }, this._color)
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        this._circleBres(ctx)
    }
    
    public switchColor(color: string) {
        this._color = color
    }
}

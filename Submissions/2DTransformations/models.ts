export interface xy {
    x: number,
    y: number
}

export interface Shape {
    _color: string
    draw: (ctx: CanvasRenderingContext2D) => void
    switchColor: (color: string) => void
}
import { Shape } from "./models";
import { readFile } from "./utils";

const container = document.getElementById('canvasContainer') as HTMLDivElement
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const rect = container.getBoundingClientRect()
canvas.width = Math.floor(rect.width)
canvas.height = Math.floor(rect.height)
const ctx = canvas.getContext('2d')

readFile('./test.txt').then((res: string[]) => {
    console.log(res)
})

let shapes: Shape[] = []

shapes.map((s) => s.draw(ctx!))
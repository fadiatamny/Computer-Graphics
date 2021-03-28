import Line from './Line'
import Circle from './Circle'
import Curve from './Curve'

const container = document.getElementById('canvasContainer') as HTMLDivElement

const lineCanvas = document.getElementById('lineCanvas') as HTMLCanvasElement
const circleCanvas = document.getElementById('circleCanvas') as HTMLCanvasElement
const curveCanvas = document.getElementById('curveCanvas') as HTMLCanvasElement

const lineButton = document.getElementById('lineButton') as HTMLButtonElement
const circleButton = document.getElementById('circleButton') as HTMLButtonElement
const curveButton = document.getElementById('curveButton') as HTMLButtonElement
const clearCanvasesButton = document.getElementById('clearCanvasesButton') as HTMLButtonElement

const lineMachine = new Line(container, lineCanvas)
const circleMachine = new Circle(container, circleCanvas)
const curveMachine = new Curve(container, curveCanvas)

enum WorkState {
    LINE = 'line',
    CIRCLE = 'circle',
    CURVE = 'curve',
    IDLE = 'idle'
}

interface WorkMode {
    state: WorkState,
    machine: Line | Circle | Curve | null
}

let mode: WorkMode = {
    state: WorkState.IDLE,
    machine: null
}



const _switchMode = (state: WorkState) => {
    if (mode.machine && mode.state !== WorkState.IDLE) {
        mode.machine.dispose()
    }
    switch (state) {
        case WorkState.LINE:
            mode.state = WorkState.LINE
            mode.machine = lineMachine
            mode.machine.init()
            break
        case WorkState.CIRCLE:
            mode.state = WorkState.CIRCLE
            mode.machine = circleMachine
            mode.machine.init()
            break
        case WorkState.CURVE:
            mode.state = WorkState.CURVE
            mode.machine = curveMachine
            mode.machine.init()
            break
        default:
            mode.state = WorkState.IDLE
            mode.machine = null
    }
}

const _initButtons = () => {
    lineButton.onclick = () => _switchMode(WorkState.LINE)
    circleButton.onclick = () => _switchMode(WorkState.CIRCLE)
    curveButton.onclick = () => _switchMode(WorkState.CURVE)
    clearCanvasesButton.onclick = _clearAllCanvases
}

const _clearAllCanvases = () => {
    lineMachine.clearCanvas()
    circleMachine.clearCanvas()
    curveMachine.clearCanvas()
}


_initButtons()
_switchMode(WorkState.IDLE)

// @ts-ignore
window.mode = mode
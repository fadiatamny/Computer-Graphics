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

const colorPicker = document.getElementById('lineColor') as HTMLInputElement
const controlLineCountDiv = document.getElementById('controlLineCountDiv') as HTMLDivElement
const controlLineCountInput = document.getElementById('controlLineCountInput') as HTMLInputElement

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

const _initLineMode = () => {
    mode.state = WorkState.LINE
    mode.machine = lineMachine
    mode.machine.init()
}

const _initCircleMode = () => {
    mode.state = WorkState.CIRCLE
    mode.machine = circleMachine
    mode.machine.init()
}

const _initCurveMode = () => {
    mode.state = WorkState.CURVE
    mode.machine = curveMachine
    mode.machine.init()
    controlLineCountDiv.style.display = 'block'
}

const _initIdleMode = () => {
    mode.state = WorkState.IDLE
    mode.machine = null
}

const _switchMode = (state: WorkState) => {
    if (mode.machine && mode.state !== WorkState.IDLE) {
        mode.machine.dispose()
        if (mode.state === WorkState.CURVE) {
            controlLineCountDiv.style.display = 'none'
        }
    }
    switch (state) {
        case WorkState.LINE:
            _initLineMode()
            break
        case WorkState.CIRCLE:
            _initCircleMode()
            break
        case WorkState.CURVE:
            _initCurveMode()
            break
        default:
            _initIdleMode()
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

colorPicker.addEventListener('change', (e) => {
    // @ts-ignore
    lineMachine.switchColor(e.target.value)
    // @ts-ignore
    circleMachine.switchColor(e.target.value)
    // @ts-ignore
    curveMachine.switchColor(e.target.value)
});

controlLineCountDiv.style.display = 'none'

controlLineCountInput.addEventListener('change', (e) => {
    // @ts-ignore
    e.target.value = Math.max(1, e.target.value)
    // @ts-ignore
    e.target.value = Math.min(10000, e.target.value)
    // @ts-ignore
    controlLineCountInput.value = e.target.value
    // @ts-ignore
    curveMachine.switchAccuracy(e.target.value)
})

_initButtons()
_switchMode(WorkState.IDLE)

// @ts-ignore
window.mode = mode
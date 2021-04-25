interface Point {
    x: number,
    y: number,
    z: number
}

const compileShader = (gl: WebGL2RenderingContext, type: number, shader: string) => {
    const s = gl.createShader(type)
    if (!s) throw new Error('Couldnt Create Shader')
    gl.shaderSource(s, shader)
    gl.compileShader(s)

    const status = gl.getShaderParameter(s, gl.COMPILE_STATUS)
    if (!status) throw new Error(`error compiling: ${gl.getShaderInfoLog(s)}`)

    return s
}

const createProgram = (gl: WebGL2RenderingContext, shaders: { vertexShader: WebGLShader, fragmentShader: WebGLShader }) => {
    const { vertexShader, fragmentShader } = shaders
    const program = gl.createProgram()
    if (!program) throw new Error('Couldnt Create program')

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    gl.linkProgram(program)
    const status = gl.getProgramParameter(program, gl.LINK_STATUS)

    if (!status) throw new Error(`error creating program: ${gl.getProgramInfoLog(program)}`)

    return program
}

const createTriangleBuffer = (gl: WebGL2RenderingContext, points: Point[]) => {
    const buffer = gl.createBuffer()
    if (!buffer) throw new Error('Couldnt Create buffer')

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    const pArr = []
    for (const p of points) {
        pArr.push(p.x)
        pArr.push(p.y)
        pArr.push(p.z)
    }

    const arr = new Float32Array(pArr)

    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW)
    return buffer
}

const createRectBuffer = (gl: WebGL2RenderingContext, points: Point[], pointsOrder: Uint32Array) => {
    const bufferVertex = gl.createBuffer()
    const bufferIndex = gl.createBuffer()
    if (!bufferVertex || !bufferIndex) throw new Error('Couldnt Create buffer')

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertex)

    const pArr = []
    for (const p of points) {
        pArr.push(p.x)
        pArr.push(p.y)
        pArr.push(p.z)
    }

    const arr = new Float32Array(pArr)

    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferIndex)

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pointsOrder, gl.STATIC_DRAW)

    return { bufferVertex, bufferIndex }
}

const RUNS = 1

const main = () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    canvas.width = 1920
    canvas.height = 1080
    const gl = canvas.getContext('webgl2')

    if (!gl) {
        console.log('error occured: No context!')
        return
    }

    gl.viewport(0, 0, canvas.width, canvas.height)

    console.log('CTX: ', gl)


    const vertexShaderCode: string = `#version 300 es
        precision lowp float;
        in vec3 Pos;

        void main() 
        {
            gl_Position = vec4(Pos, 1.0); 
        }
    `

    const fragmentShaderCode: string = `#version 300 es
        precision highp float;
        out vec4 Color;

        void main() 
        {
            Color = vec4(1,0.6,0.9,1);
        }
    `

    gl.clearColor(0.3, 0.2, 0.5, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    try {
        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderCode)
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode)
        console.log('Shaders', [vertexShader, fragmentShader])
        const program = createProgram(gl, { vertexShader, fragmentShader })
        gl.useProgram(program)

        //DRAW TRIANGELS
        //
        const drawVerticies = [
            {x: 0.6, y: 0.6, z: 0},
            {x: -0.6, y: 0.6, z: 0},
            {x: -0.6, y: 0, z: 0},
            // {x: 0.6, y: 0.6, z: 0},
            // {x: -0.6, y: 0, z: 0},
            // {x: 0.6, y: 0, z: 0}
        ]

        const buffer = createTriangleBuffer(gl, drawVerticies)
        const vao = gl.createVertexArray()
        if (!vao) throw new Error('vao error')
        gl.bindVertexArray(vao)
        const index = gl.getAttribLocation(program, 'Pos')
        gl.enableVertexAttribArray(index)
        gl.vertexAttribPointer(index, 3, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.drawArrays(gl.TRIANGLES, 0, drawVerticies.length * 3)


        // // DRAW RECT
        // //
        // const drawVerticies = [
        //     { x: 0.6, y: 0.6, z: 0 },
        //     { x: -0.6, y: 0.6, z: 0 },
        //     { x: -0.6, y: 0, z: 0 },
        //     { x: 0.6, y: 0, z: 0 }
        // ]
        // const drawIndicies = new Uint32Array([
        //     0,
        //     1,
        //     2,
        //     2,
        //     3,
        //     0
        // ])

        // const { bufferVertex, bufferIndex } = createRectBuffer(gl, drawVerticies, drawIndicies)
        // const vao = gl.createVertexArray()
        // if (!vao) throw new Error('vao error')
        // gl.bindVertexArray(vao)
        // const index = gl.getAttribLocation(program, 'Pos')
        // gl.enableVertexAttribArray(index)
        // gl.vertexAttribPointer(index, 3, gl.FLOAT, false, 0, 0)
        // gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertex)
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferIndex)
        // console.time('webgl')
        // for (let i = 0; i < RUNS; i++)
        //     gl.drawElements(gl.TRIANGLES, drawIndicies.length, gl.UNSIGNED_INT, 0)
        // console.timeEnd('webgl')
    } catch (e) {
        console.log('ERROR:', e)
        return
    }

    const canvas2 = document.getElementById('canvas2') as HTMLCanvasElement
    canvas2.width = 1920
    canvas2.height = 1080
    const ctx = canvas2.getContext('2d')
    ctx?.clearRect(0, 0, canvas2.width, canvas2.height)
    ctx!.fillStyle = 'red'
    console.time('canvas')
    for (let i = 0; i < RUNS; i++) {
        ctx?.clearRect(0, 0, canvas2.width, canvas2.height)
        ctx?.fillRect(0, 0, canvas2.width, canvas2.height)
    }
    console.timeEnd('canvas')
}

main()
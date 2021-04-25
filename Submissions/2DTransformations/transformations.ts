import { xy } from "./models";
import { matrixMultipication } from "./utils";

export const scale = (points: xy[], scaleX: number, scaleY?: number) => {
    const scaleMatrix = [
        [scaleX, 0, 0],
        [0, scaleY ?? scaleX, 0],
        [0, 0, 1]
    ]

    const scaled = points.map((p) => {
        const mul = matrixMultipication([[p.x, p.y, 1]], scaleMatrix)
        p.x = mul[0][0]
        p.y = mul[0][1]

        return p
    })

    return scaled
}

export const translate = (points: xy[], translateX: number, translateY?: number) => {
    const translationMatrix = [
        [1, 0, 0],
        [0, 1, 0],
        [translateX, translateY ?? translateX, 1]
    ]

    const translated = points.map((p) => {
        const mul = matrixMultipication([[p.x, p.y, 1]], translationMatrix)
        p.x = mul[0][0]
        p.y = mul[0][1]

        return p
    })

    return translated
}

export const rotate = (points: xy[], rotateAngle: number) => {
    const rotationMatrix = [
        [Math.cos(rotateAngle), Math.sin(rotateAngle), 0],
        [-Math.sin(rotateAngle), Math.cos(rotateAngle), 0],
        [0, 0, 1]
    ]

    const rotated = points.map((p) => {
        const mul = matrixMultipication([[p.x, p.y, 1]], rotationMatrix)
        p.x = mul[0][0]
        p.y = mul[0][1]

        return p
    })

    return rotated
}

export const mirror = (points: xy[], flipAxis?: 'x' | 'y') => {
    const mirrorYMatrix = [
        [-1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ]
    const mirrorXMatrix = [
        [1, 0, 0],
        [0, -1, 0],
        [0, 0, 1]
    ]
    const mirrorMatrix = [
        [-1, 0, 0],
        [0, -1, 0],
        [0, 0, 1]
    ]

    const matrix = flipAxis ? 
                            flipAxis === 'x' ? mirrorXMatrix : mirrorYMatrix
                            : mirrorMatrix

    const mirrored = points.map((p) => {
        const mul = matrixMultipication([[p.x, p.y, 1]], matrix)
        p.x = mul[0][0]
        p.y = mul[0][1]

        return p
    })

    return mirrored
}

export const shearing = (points: xy[], value: number, axis: 'x' | 'y') => {
    const shearingXMatrix = [
        [1, 0, 0],
        [value, 1, 0],
        [0, 0, 1]
    ]
    const shearingYMatrix = [
        [1, value, 0],
        [0, 1, 0],
        [0, 0, 1]
    ]

    const sheared = points.map((p) => {
        let mul = matrixMultipication([[p.x, p.y, 1]], axis === 'x' ? shearingXMatrix : shearingYMatrix)
        p.x = mul[0][0]
        p.y = mul[0][1]

        return p
    })

    return sheared
}

export const rotateAroundPoint = (points:xy[], center:xy, rotateAngle: number) => {
    const centerized = translate(points, -center.x, -center.y)
    const rotated = rotate(centerized, rotateAngle)
    const moved = translate(rotated, center.x, center.y)

    return moved
}

export const scaleAroundPoint = (points:xy[], center:xy, scaleX: number, scaleY?: number) => {
    const centerized = translate(points, -center.x, -center.y)
    const rotated = scale(centerized, scaleX, scaleY)
    const moved = translate(rotated, center.x, center.y)

    return moved
}
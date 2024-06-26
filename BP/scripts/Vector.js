
export class Vector {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
    static get up() {
        return new Vector(0, 1, 0)
    }
    static get down() {
        return new Vector(0, -1, 0)
    }
    static get north() {
        return new Vector(-1, 0, 0)
    }
    static get east() {
        return new Vector(0, 0, 1)
    }
    static get south() {
        return new Vector(1, 0, 0)
    }
    static get west() {
        return new Vector(0, 0, -1)
    }
    static add(v1, v2) {
        const {x: x1, y: y1, z: z1} = v1
        const {x: x2, y: y2, z: z2} = v2
        return new Vector(x1 + x2, y1 + y2, z1 + z2)
    }
    static subtract(v1, v2) {
        const {x: x1, y: y1, z: z1} = v1
        const {x: x2, y: y2, z: z2} = v2
        return new Vector(x1 - x2, y1 - y2, z1 - z2)
    }
    static multiply(v1, v2) {
        const {x: x1, y: y1, z: z1} = v1
        const {x: x2, y: y2, z: z2} = v2
        return new Vector(x1 * x2, y1 * y2, z1 * z2)
    }
    static divide(v1, v2) {
        const {x: x1, y: y1, z: z1} = v1
        const {x: x2, y: y2, z: z2} = v2
        return new Vector(x1 / x2, y1 / y2, z1 / z2)
    }
}
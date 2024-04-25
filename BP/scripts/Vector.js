
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
    [Symbol.isPrimitive]() {
        const { x, y, z } = this
        return {
            x,
            y,
            z
        }
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
        return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
    }
    static subtract(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
    }
}
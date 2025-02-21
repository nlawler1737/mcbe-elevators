import { Block, Direction } from "@minecraft/server"
import { scoreboard } from "./scoreboard"
import { NON_COLLIDABLE_BLOCK_TYPE_STRINGS, NON_COLLIDABLE_BLOCK_TYPE_REGEXS, NON_COLLIDABLE_BLOCK_TYPE_FUNCTIONS } from "./constants";


export function isBlockTransparent(block: Block) {
    const typeId = block.typeId

    if (block.isAir) return true

    if (NON_COLLIDABLE_BLOCK_TYPE_STRINGS.includes(typeId)) return true

    if (NON_COLLIDABLE_BLOCK_TYPE_REGEXS.some((value) => value.test(typeId))) return true

    const func = NON_COLLIDABLE_BLOCK_TYPE_FUNCTIONS[typeId]
    if (func && func(block.permutation)) return true

    return false
}

export function getNearestElevatorType(block: Block, direction: Direction.Down | Direction.Up): { block: Block | null, error: string } {
    if (!(block instanceof Block) || !direction) return null
    const { min, max } = block.dimension.heightRange
    const blockType = block.typeId
    let b = null as Block

    let next;
    if (direction === Direction.Down) {
        b = block.below()
        next = () => b = b.below()
    } else if (direction === Direction.Up) {
        b = block.above()
        next = () => b = b.above()
    }

    while (b && b.location.y >= min && b.location.y < max) {
        if (b.typeId !== blockType) {
            try {
                next()
            } catch (e) {
                return { block: null, error: "" }
            }
            continue
        }

        if (scoreboard.ignoreObstructions) {
            return { block: b, error: "" }
        }

        if (!isElevatorObstructed(b)) {
            return { block: b, error: "" }
        }

        if (scoreboard.skipObstructed) {
            try {
                next()
            } catch (e) {
                return { block: null, error: "" }
            }
            continue
        }
        return { block: null, error: "§cElevator Obstructed" }
    }

    return { block: null, error: "" }
    // when dimension.getBlockBelow() is stable
    // if (direction === Direction.Down) {
    //     return block.dimension.getBlockBelow(block.below().location, { includeTypes: [block.typeId] }) || null
    // } else if (direction === Direction.Up) {
    //     return block.dimension.getBlockAbove(block.above().location, { includeTypes: [block.typeId] }) || null
    // }
    // return null
}

export function isElevatorObstructed(block: Block) {
    if (!scoreboard.ignoreObstructions) {
        try {
            const above1 = block.above()
            const above2 = above1.above()

            if (!isBlockTransparent(above1) || (scoreboard.maxTeleportDistance > 2 ? !isBlockTransparent(above2) : false)) {
                return true
            }
        } catch (e) {
            if (e.name === "LocationOutOfWorldBoundariesError") {
                return false
            }
            return true
        }
    }
    return false
}

/**
 * Rounds `num` if when rounded the difference is <= `tolerance`
 * 
 * ```js
 * round(1.1, 0.001) // 1.1
 * round(1.0000001, 0.001) // 1
 * ```
 */
export function round(num: number, tolerance: number) {
    const rounded = Math.round(num);
    const diff = Math.abs(rounded - num)
    if (diff > tolerance) return num
    return rounded
}

export function xor(a: boolean, b: boolean) {
    return a ? !b : b
}
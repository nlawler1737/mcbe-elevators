import { Block, Direction, type BlockPermutation } from "@minecraft/server"
import { scoreboard } from "./scoreboard"
import { NON_COLLIDABLE_BLOCK_TYPE_STRINGS, NON_COLLIDABLE_BLOCK_TYPE_REGEXS, NON_COLLIDABLE_BLOCK_TYPE_FUNCTIONS } from "./constants";
import { TransparentBlock } from "./types"

export function getTransparentBlock(block: Block): TransparentBlock | null {
    const typeId = block.typeId

    return NON_COLLIDABLE_BLOCK_TYPE_STRINGS.get(typeId) ?? getTransparentBlockFromRegex(typeId) ?? getTransparentBlockFromFunction(typeId, block.permutation) ?? null
}

function getTransparentBlockFromRegex(typeId: string): TransparentBlock | null {
    for (const [regex, transparentBlock] of NON_COLLIDABLE_BLOCK_TYPE_REGEXS) {
        if (regex.test(typeId)) return transparentBlock
    }

    return null
}

function getTransparentBlockFromFunction(typeId: string, block: BlockPermutation): TransparentBlock | null {
    const func = NON_COLLIDABLE_BLOCK_TYPE_FUNCTIONS.get(typeId)
    return (func && func(block)) ?? null
}

export function getNearestElevatorType(block: Block, direction: Direction.Down | Direction.Up): { block: Block | null, transparentBlocks: Array<TransparentBlock | null> | null, error: string } {
    if (!(block instanceof Block) || !direction) return { block: null, transparentBlocks: null, error: "" }
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
                return { block: null, transparentBlocks: null, error: "" }
            }
            continue
        }

        const transparentBlocks = getTransparentBlocksAboveElevator(b)

        if (scoreboard.ignoreObstructions) {
            return { block: b, transparentBlocks: transparentBlocks, error: "" }
        }


        if (transparentBlocks.every((block) => block !== null)) {
            return { block: b, transparentBlocks: transparentBlocks, error: "" }
        }

        if (scoreboard.skipObstructed) {
            try {
                next()
            } catch (e) {
                return { block: null, transparentBlocks: null, error: "" }
            }
            continue
        }
        return { block: null, transparentBlocks: null, error: "§cElevator Obstructed" }
    }

    return { block: null, transparentBlocks: null, error: "" }
    // when dimension.getBlockBelow() is stable
    // if (direction === Direction.Down) {
    //     return block.dimension.getBlockBelow(block.below().location, { includeTypes: [block.typeId] }) || null
    // } else if (direction === Direction.Up) {
    //     return block.dimension.getBlockAbove(block.above().location, { includeTypes: [block.typeId] }) || null
    // }
    // return null
}

export function getTransparentBlocksAboveElevator(block: Block): Array<TransparentBlock | null> {
    const res: Array<TransparentBlock | null> = [null, null]
    try {
        const above1 = block.above()
        res[0] = getTransparentBlock(above1)
        const above2 = above1.above()
        res[1] = getTransparentBlock(above2)
    } catch (e) {
        // handle when `above2` is above build limit
        // set as transparent
        if (e.name === "LocationOutOfWorldBoundariesError") {
            res[1] = {}
        }
    }

    return res
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
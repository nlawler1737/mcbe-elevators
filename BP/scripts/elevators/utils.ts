import { Block, BlockPermutation } from "@minecraft/server"
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
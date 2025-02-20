import type { Block, BlockPermutation } from "@minecraft/server"
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

function getTransparentBlockFromFunction(typeId: string, block: BlockPermutation): TransparentBlock | null{
    const func = NON_COLLIDABLE_BLOCK_TYPE_FUNCTIONS.get(typeId)
    return (func && func(block)) ?? null
}
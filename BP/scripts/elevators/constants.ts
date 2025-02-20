import type { BlockPermutation } from "@minecraft/server"
import type { TransparentBlock } from "./types"

export const NON_COLLIDABLE_BLOCK_TYPE_STRINGS = new Map<string, TransparentBlock>([
    ["minecraft:air", {}],
    ["minecraft:scaffolding", {}],
    ["minecraft:vine", {}],
    ["minecraft:twisting_vines", {}],
    ["minecraft:weeping_vines", {}],
    ["minecraft:web", {}],
    ["minecraft:torch", {}],
    ["minecraft:soul_torch", {}],
    ["minecraft:redstone_torch", {}],
    ["minecraft:frame", {}],
    ["minecraft:glow_frame", {}],
    ["minecraft:water", {}],
    ["minecraft:standing_banner", {}],
    ["minecraft:wall_banner", {}],
    ["minecraft:rail", {}],
    ["minecraft:golden_rail", {}],
    ["minecraft:detector_rail", {}],
    ["minecraft:activator_rail", {}],
    ["minecraft:tripwire_hook", {}],
    ["minecraft:trip_wire", {}],
    ["minecraft:redstone_wire", {}],
    ["minecraft:lever", {}],
    ["minecraft:fire", {}],
    ["minecraft:powder_snow", {}],
    ["minecraft:ladder", {}],
    ["minecraft:leaf_litter", {}],
    ["minecraft:cactus_flower", {}],

    ["minecraft:hanging_roots", {}],
    ["minecraft:pale_hanging_moss", {}],
    ["minecraft:spore_blossom", {}],

    ["minecraft:sculk_vein", {}],
    ["minecraft:glow_lichen", {}],
    ["minecraft:resin_clump", {}],
])

export const NON_COLLIDABLE_BLOCK_TYPE_REGEXS = new Map<RegExp, TransparentBlock>([
    [/^minecraft:.+_standing_sign$/, {}],
    [/^minecraft:.+_wall_sign$/, {}],
    [/^minecraft:.+_pressure_plate$/, {}],
    [/^minecraft:.+_button$/, {}],
    [/^minecraft:.+_carpet$/, { height: 1 / 16 }],
    [/^minecraft:.+_coral$/, {}],
    [/^minecraft:.+_coral_fan$/, {}],
])

export const NON_COLLIDABLE_BLOCK_TYPE_FUNCTIONS = new Map<string, (block: BlockPermutation) => TransparentBlock | null>([
    ["minecraft:snow_layer", (block: BlockPermutation) => {
        return block.getState("height") === 0 ? {} : null
    }]
])
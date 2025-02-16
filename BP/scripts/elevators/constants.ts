import { type BlockPermutation } from "@minecraft/server"

export const NON_COLLIDABLE_BLOCK_TYPE_STRINGS = [
    "minecraft:air",
    "minecraft:scaffolding",
    "minecraft:vine",
    "minecraft:twisting_vines",
    "minecraft:weeping_vines",
    "minecraft:web",
    "minecraft:torch",
    "minecraft:soul_torch",
    "minecraft:redstone_torch",
    "minecraft:frame",
    "minecraft:glow_frame",
    "minecraft:water",
    "minecraft:standing_banner",
    "minecraft:wall_banner",
    "minecraft:rail",
    "minecraft:golden_rail",
    "minecraft:detector_rail",
    "minecraft:activator_rail",
    "minecraft:tripwire_hook",
    "minecraft:trip_wire",
    "minecraft:redstone_wire",
    "minecraft:lever",
    "minecraft:fire",
    "minecraft:powder_snow",
    "minecraft:ladder",

    "minecraft:hanging_roots",
    "minecraft:pale_hanging_moss",
    "minecraft:spore_blossom",

    "minecraft:sculk_vein",
    "minecraft:glow_lichen",
    "minecraft:resin_clump",
]

export const NON_COLLIDABLE_BLOCK_TYPE_REGEXS = [
    /^minecraft:.+_standing_sign$/,
    /^minecraft:.+_wall_sign$/,
    /^minecraft:.+_pressure_plate$/,
    /^minecraft:.+_button$/,
    /^minecraft:.+_carpet$/,
    /^minecraft:.+_coral$/,
    /^minecraft:.+_coral_fan$/,
]

export const NON_COLLIDABLE_BLOCK_TYPE_FUNCTIONS: { [key: string]: (block: BlockPermutation) => boolean } = {
    "minecraft:snow_layer": (block: BlockPermutation) => {
        return block.getState("height") === 0
    }
}
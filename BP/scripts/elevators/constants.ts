import type { BlockPermutation } from "@minecraft/server"
import type { TransparentBlock } from "./types"
import { Vector } from "../Vector"

export const SCOREBOARD_NAME = "elevators:config"
export const PROPERTY_TELEPORT_READY = "elevators:elevator_teleport_ready"
export const PROPERTY_WORLD_OWNER = "elevators:world_owner"
export const OPERATOR_ID = "elevators:op"
export const BLOCK_STATE_TELEPORT_DIRECTION = "nullun_elevators:teleport_direction"
export const ROTATIONS: Readonly<{ [key: number]: Vector }> = {
    1: new Vector(0, 180, 0),
    2: new Vector(0, 270, 0),
    3: new Vector(0, 0, 0),
    4: new Vector(0, 90, 0)
}
export const ARROW_PATHS: ReadonlyArray<string> = [
    "chevron_white_up.png",
    "arrowRight.png",
    "chevron_white_down.png",
    "arrowLeft.png",
]
export const FACING_DIRECTIONS: ReadonlyArray<string> = [
    "None",
    "North",
    "East",
    "South",
    "West"
]

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

export const HELP_TEXT = "§l== Elevators Config ==§r\n" + [
    ["Disable Elevators", "Disables the use of elevators"],
    ["Teleport Entities", "Allows entities to teleport along with players. This does not include other players"],
    ["Teleport Players", "Allows players to teleport along with other players"],
    ["Skip Obstructed", "Obstructed elevators will be skipped. Acts as if the elevator is not there."],
    ["Ignore Obstructions", "Players will always be teleported, ignoring any obstructions above an elevator."],
    ["Max Teleport Distance", "Max distance a elevators are to be spaced apart. Distance is surface to surface of elevators.\n  Distance should be greater than 2\n  -1 = No Limit"]
].map((a) => `§b${a[0]}§r - ${a[1]}`).join("\n\n")

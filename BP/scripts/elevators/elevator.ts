import { system, world, Vector, Block, Player, PlayerInteractWithBlockBeforeEvent } from "@minecraft/server"
import { ActionFormData } from "@minecraft/server-ui"

interface ElevatorConfig {
    blocks?: string[]; // blocks that player can jump/sneak on to teleport
    teleportAllOnBlock?: boolean; // whether all entities on the block will be teleported with you
}


world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    elevatorOnInteract(event)
})

let CONFIG: ElevatorConfig = {}
const formsOpen = new Set()

export default function elevator(config: ElevatorConfig) {
    CONFIG = config
    return {
        onInterval: elevatorOnInterval,
        onInteract: elevatorOnInteract
    }
}


/**
 * ```js
 * // how to use
 * import elevator from "./elevators/elevator"
 * system.runInterval(() => {
 *   elevator({
 *     blocks: [
 *       "elevators:black_elevator",
 *       "elevators:blue_elevator",
 *       "elevators:brown_elevator",
 *       "elevators:cyan_elevator",
 *       "elevators:gray_elevator",
 *       "elevators:green_elevator",
 *       "elevators:light_blue_elevator",
 *       "elevators:lime_elevator",
 *       "elevators:magenta_elevator",
 *       "elevators:orange_elevator",
 *       "elevators:pink_elevator",
 *       "elevators:purple_elevator",
 *       "elevators:red_elevator",
 *       "elevators:light_gray_elevator",
 *       "elevators:white_elevator",
 *       "elevators:yellow_elevator",
 *        ...
 *     ],
 *     teleportAllOnBlock: false
 *   })
 * })
 * ```
 */

function elevatorOnInterval(): void {
    if (!CONFIG.blocks.length) return
    world.getAllPlayers().forEach(player => {
        const heightRange = player.dimension.heightRange
        const playerLocation = player.location
        playerLocation.y = Math.round(playerLocation.y)
        const playerY = playerLocation.y

        if (!player.isJumping && !player.isSneaking) {
            player.setDynamicProperty("elevators:elevator_teleport_ready", true)
        }
        else if (((player.isJumping && !player.isSneaking) || (player.isSneaking && !player.isJumping)) && player.getDynamicProperty("elevators:elevator_teleport_ready") && playerY <= heightRange.max && playerY > heightRange.min) {
            const blockBelow = player.dimension.getBlock(Vector.add(Vector.down, playerLocation))
            const blockBelowType = blockBelow.typeId

            if (player.isSneaking && blockBelow.location.y === -64) return

            if (!CONFIG.blocks.includes(blockBelowType)) {
                player.setDynamicProperty("elevators:elevator_teleport_ready", false)
                return
            }

            let block = null as Block
            if (player.isJumping) {
                block = blockBelow.above()
                while (block.typeId !== blockBelowType && block.location.y < player.dimension.heightRange.max) {
                    block = block.above()
                }
            } else if (player.isSneaking) {
                block = blockBelow.below()
                while (block.typeId !== blockBelowType && block.location.y > player.dimension.heightRange.min) {
                    block = block.below()
                }
            }

            player.setDynamicProperty("elevators:elevator_teleport_ready", false)

            if (block.typeId !== blockBelowType) return

            try {
                if (!block.above().isAir || !block.above().above().isAir) {
                    player.sendMessage("§cElevator Obstructed")
                    return
                }
            } catch (e) { }

            const tpLocation = Vector.add(playerLocation, Vector.subtract(block.location, blockBelow.location))
            const directions = {
                1: new Vector(0, 180, 0),
                2: new Vector(0, 270, 0),
                3: new Vector(0, 0, 0),
                4: new Vector(0, 90, 0)
            }
            const directionState = block.permutation.getState("nullun_elevators:teleport_direction") as number
            if (CONFIG.teleportAllOnBlock) {
                player.dimension.getEntitiesAtBlockLocation(playerLocation).forEach(entity => {
                    if (entity instanceof Player) {
                        if (directionState) {
                            entity.teleport(tpLocation, { rotation: directions[directionState] })
                        } else {
                            entity.teleport(tpLocation)
                        }
                    } else {
                        entity.teleport(Vector.add(block.bottomCenter(), Vector.up))
                    }
                })
            } else {
                if (directionState) {
                    player.teleport(tpLocation, { rotation: directions[directionState] })

                } else {
                    player.teleport(tpLocation)

                }
            }
            system.runTimeout(() => {
                world.playSound("mob.endermen.portal", block.location, { volume: 0.5, pitch: 2.5 })
                world.playSound("mob.endermen.portal", blockBelow.location, { volume: 0.5, pitch: 2.5 })
            }, 1)
        }
    })
}

function elevatorOnInteract(event: PlayerInteractWithBlockBeforeEvent) {
    const { block, player, itemStack } = event
    let facing = Math.round((((player.getRotation().y + 180) % 360) / 90)) + 1
    if (facing === 5) facing = 1


    if (!CONFIG.blocks.length) return
    if (itemStack !== undefined) return
    if (!CONFIG.blocks.includes(block.typeId)) return
    if (formsOpen.has(player.id)) {
        return
    } else {
        formsOpen.add(player.id)
    }

    const currentDirection = block.permutation.getState("nullun_elevators:teleport_direction") as number
    const arrows = [
        "chevron_white_up.png",
        "arrowRight.png",
        "chevron_white_down.png",
        "arrowLeft.png",
    ]
    const values = [
        "None",
        "North",
        "East",
        "South",
        "West"
    ].map((value, i) => {
        let prefix = ""
        if (i === currentDirection) prefix += "§2"
        if (i === 0) return [prefix + value]
        return [prefix + value, "textures/ui/" + arrows[(i + 4 - facing) % 4]]
    })

    const form = new ActionFormData()
        .title("Elevator Direction")

    values.forEach((value) => {
        form.button(...value as [string, string])
    })

    system.run(() => {
        form.show(player).then((event) => {
            formsOpen.delete(player.id)
            if (event.canceled) return
            block.setPermutation(block.permutation.withState("nullun_elevators:teleport_direction", event.selection))
        }).catch((error) => {
            player.sendMessage(error)
        })
    })
}
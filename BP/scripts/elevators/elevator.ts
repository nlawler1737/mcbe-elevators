import { system, world, Block, Player, BlockComponentPlayerInteractEvent, Direction, BlockCustomComponent } from "@minecraft/server"
import { ActionFormData } from "@minecraft/server-ui"
import { Vector } from "../Vector.js"
import { isBlockTransparent } from "./utils"
import { elevators as config } from "../config"

const PROPERTY_TELEPORT_READY = "elevators:elevator_teleport_ready"
const BLOCK_STATE_TELEPORT_DIRECTION = "nullun_elevators:teleport_direction"
const ROTATIONS: Readonly<{ [key: number]: Vector }> = {
    1: new Vector(0, 180, 0),
    2: new Vector(0, 270, 0),
    3: new Vector(0, 0, 0),
    4: new Vector(0, 90, 0)
}
const ARROW_PATHS: ReadonlyArray<string> = [
    "chevron_white_up.png",
    "arrowRight.png",
    "chevron_white_down.png",
    "arrowLeft.png",
]
const FACING_DIRECTIONS: ReadonlyArray<string> = [
    "None",
    "North",
    "East",
    "South",
    "West"
]

const ElevatorBlockComponent: BlockCustomComponent = {
    onPlayerInteract: detectPlayerInteract,
}

world.beforeEvents.worldInitialize.subscribe((event) => {
    event.blockComponentRegistry.registerCustomComponent(
        "elevators:elevator",
        ElevatorBlockComponent
    )
})

const formsOpen = new Set()

system.runInterval(() => {
    detectOnElevator()
})

/**
 * Detects every interval if a player is sneaking / jumping on an elevator
 */
function detectOnElevator(): void {
    if (!config.blocks.size) return
    world.getAllPlayers().forEach(player => {
        const heightRange = player.dimension.heightRange
        const isJumpingXorSneaking = xor(player.isJumping, player.isSneaking)

        // round y pos to prevent bugs on some y locations
        const playerLocation = player.location
        playerLocation.y = round(playerLocation.y, 0.00001)

        // set teleport ready to true if player is not sneaking or jumping
        if (!player.isJumping && !player.isSneaking) {
            player.setDynamicProperty(PROPERTY_TELEPORT_READY, true)
            return
        }

        const isPlayerBetweenMinAndMaxY = playerLocation.y <= heightRange.max && playerLocation.y > heightRange.min + 1
        const isTeleportReady = player.getDynamicProperty(PROPERTY_TELEPORT_READY)

        if (!isJumpingXorSneaking || !isTeleportReady || !isPlayerBetweenMinAndMaxY) {
            return
        }

        const blockBelow = player.dimension.getBlock(Vector.add(Vector.down, playerLocation))
        const blockBelowType = blockBelow.typeId

        if (player.isSneaking && blockBelow.location.y === -64) return

        if (!config.blocks.has(blockBelowType)) {
            player.setDynamicProperty(PROPERTY_TELEPORT_READY, false)
            return
        }

        let block = getNearestBlockType(blockBelow, player.isJumping ? Direction.Up : player.isSneaking ? Direction.Down : null)

        player.setDynamicProperty(PROPERTY_TELEPORT_READY, false)

        if (!block || block.typeId !== blockBelowType) return

        try {
            const above1 = block.above()
            const above2 = above1.above()

            if (!isBlockTransparent(above1) || !isBlockTransparent(above2)) {
                player.sendMessage("§cElevator Obstructed")
                return
            }
        } catch (e) { }

        const blockDifference = Vector.subtract(block.location, blockBelow.location)
        const yAbsDifference = Math.abs(blockDifference.y)
        if (yAbsDifference > config.maxTeleportDistance) {
            player.sendMessage(`§cElevator too far away\nMax distance: ${config.maxTeleportDistance}\nCurrent distance: ${yAbsDifference}`)
            return
        }

        const tpLocation = Vector.add(playerLocation, blockDifference)
        const directionState = block.permutation.getState(BLOCK_STATE_TELEPORT_DIRECTION) as number

        // teleport location cannot be too close to the edges of the block
        // this prevents colliding with surrounding block when teleporting
        tpLocation.x = Math.min(Math.max(tpLocation.x, Math.floor(tpLocation.x) + 0.3), Math.ceil(tpLocation.x) - 0.3)
        tpLocation.z = Math.min(Math.max(tpLocation.z, Math.floor(tpLocation.z) + 0.3), Math.ceil(tpLocation.z) - 0.3)

        // teleport to the surface of the elevator to prevent
        // colliding with block above
        tpLocation.y = Math.floor(tpLocation.y)

        if (config.teleportAllOnBlock) {
            player.dimension.getEntitiesAtBlockLocation(playerLocation).forEach(entity => {
                if (entity instanceof Player) {
                    if (!config.teleportPlayers && entity !== player) return
                    if (directionState) {
                        entity.teleport(tpLocation, { rotation: ROTATIONS[directionState] })
                    } else {
                        entity.teleport(tpLocation)
                    }
                } else {
                    entity.teleport(Vector.add(block.bottomCenter(), Vector.up))
                }
            })
        } else {
            if (directionState) {
                player.teleport(tpLocation, { rotation: ROTATIONS[directionState] })

            } else {
                player.teleport(tpLocation)

            }
        }

        system.runTimeout(() => {
            player.dimension.playSound("mob.endermen.portal", block.center(), { volume: 0.5, pitch: 2.5 })
            player.dimension.playSound("mob.endermen.portal", blockBelow.center(), { volume: 0.5, pitch: 2.5 })
        }, 1)
    })
}

/**
 * Shows player UI to set teleport facing direction on an elevator block
 */
function detectPlayerInteract(event: BlockComponentPlayerInteractEvent) {
    const { block, player } = event
    if (player.isSneaking) return
    let facing = Math.round((((player.getRotation().y + 180) % 360) / 90)) + 1
    if (facing === 5) facing = 1


    if (!config.blocks.size) return
    if (!config.blocks.has(block.typeId)) return
    if (formsOpen.has(player.id)) {
        return
    } else {
        formsOpen.add(player.id)
    }

    const currentDirection = block.permutation.getState(BLOCK_STATE_TELEPORT_DIRECTION) as number
    const values = FACING_DIRECTIONS.map((value, i) => {
        let prefix = ""
        if (i === currentDirection) prefix += "§2"
        if (i === 0) return [prefix + value]
        return [prefix + value, "textures/ui/" + ARROW_PATHS[(i + 4 - facing) % 4]]
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
            block.setPermutation(block.permutation.withState(BLOCK_STATE_TELEPORT_DIRECTION, event.selection))
        }).catch((error) => {
            player.sendMessage(error)
        })
    })
}

function getNearestBlockType(block: Block, direction: Direction.Down | Direction.Up): Block | null {
    if (!(block instanceof Block) || !direction) return null
    const { min, max } = block.dimension.heightRange
    const blockType = block.typeId
    let b = null as Block
    if (direction === Direction.Down) {
        b = block.below()
        while (b.typeId !== blockType && b.location.y > min) {
            b = b.below()
        }
    } else if (direction === Direction.Up) {
        b = block.above()
        while (b.typeId !== blockType && b.location.y < max) {
            b = b.above()
        }
    }
    return b
    // when dimension.getBlockBelow() is stable
    // if (direction === Direction.Down) {
    //     return block.dimension.getBlockBelow(block.below().location, { includeTypes: [block.typeId] }) || null
    // } else if (direction === Direction.Up) {
    //     return block.dimension.getBlockAbove(block.above().location, { includeTypes: [block.typeId] }) || null
    // }
    // return null
}

/**
 * Rounds `num` if when rounded the difference is <= `tolerance`
 * 
 * ```js
 * round(1.1, 0.001) // 1.1
 * round(1.0000001, 0.001) // 1
 * ```
 */
function round(num: number, tolerance: number) {
    const rounded = Math.round(num);
    const diff = Math.abs(rounded - num)
    if (diff > tolerance) return num
    return rounded
}

function xor(a: boolean, b: boolean) {
    return a ? !b : b
}
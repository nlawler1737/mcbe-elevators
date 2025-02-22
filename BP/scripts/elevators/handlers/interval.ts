import { system, world, Direction, Player } from "@minecraft/server"
import { xor, round, getNearestElevatorType } from "../utils"
import { PROPERTY_TELEPORT_READY, ROTATIONS, BLOCK_STATE_TELEPORT_DIRECTION } from "../constants"
import { scoreboard } from "../scoreboard"
import { Vector } from "../../Vector"
import config from "../config"

/**
 * Detects every interval if a player is sneaking / jumping on an elevator
 */
export default function detectOnElevator(): void {
    if (!config.blocks.size) return
    world.getAllPlayers().forEach(player => {
        if (scoreboard.disabled) return
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

        const nearestElevator = getNearestElevatorType(blockBelow, player.isJumping ? Direction.Up : player.isSneaking ? Direction.Down : null)

        player.setDynamicProperty(PROPERTY_TELEPORT_READY, false)

        if (!nearestElevator.block) {
            if (nearestElevator.error) player.sendMessage(nearestElevator.error)
            return
        }

        const blockDifference = Vector.subtract(nearestElevator.block.location, blockBelow.location)
        const yAbsDifference = Math.abs(blockDifference.y)
        if (scoreboard.maxTeleportDistance !== -1 && yAbsDifference > scoreboard.maxTeleportDistance) {
            player.sendMessage(`§cElevator too far away\nMax distance: ${scoreboard.maxTeleportDistance}\nCurrent distance: ${yAbsDifference}`)
            return
        }

        const tpLocation = Vector.add(playerLocation, blockDifference)
        const directionState = nearestElevator.block.permutation.getState(BLOCK_STATE_TELEPORT_DIRECTION) as number

        // teleport location cannot be too close to the edges of the block
        // this prevents colliding with surrounding block when teleporting
        tpLocation.x = Math.min(Math.max(tpLocation.x, Math.floor(tpLocation.x) + 0.3), Math.ceil(tpLocation.x) - 0.3)
        tpLocation.z = Math.min(Math.max(tpLocation.z, Math.floor(tpLocation.z) + 0.3), Math.ceil(tpLocation.z) - 0.3)

        // teleport to the surface of the elevator to prevent
        // colliding with block above
        tpLocation.y = Math.floor(tpLocation.y) + (nearestElevator.transparentBlocks?.[0]?.height ?? 0)

        if (scoreboard.teleportEntities || scoreboard.teleportPlayers) {
            player.dimension.getEntitiesAtBlockLocation(playerLocation).forEach(entity => {
                if (entity instanceof Player) {
                    if (!scoreboard.teleportPlayers && entity !== player) return
                    if (directionState) {
                        entity.teleport(tpLocation, { rotation: ROTATIONS[directionState] })
                    } else {
                        entity.teleport(tpLocation)
                    }
                } else if (scoreboard.teleportEntities) {
                    entity.teleport(Vector.add(nearestElevator.block.bottomCenter(), Vector.up))
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
            player.dimension.playSound("mob.endermen.portal", nearestElevator.block.center(), { volume: 0.5, pitch: 2.5 })
            player.dimension.playSound("mob.endermen.portal", blockBelow.center(), { volume: 0.5, pitch: 2.5 })
        }, 1)
    })
}
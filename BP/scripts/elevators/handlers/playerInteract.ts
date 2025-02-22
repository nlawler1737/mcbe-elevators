import { BlockComponentPlayerInteractEvent } from "@minecraft/server"
import elevatorUI from "../ui/elevator"
import config from "../config"
/**
 * Shows player UI to set teleport facing direction on an elevator block
 */
export default function detectPlayerInteract(event: BlockComponentPlayerInteractEvent) {
    const { block, player } = event
    if (player.isSneaking) return

    if (!config.blocks.size) return
    if (!config.blocks.has(block.typeId)) return

    elevatorUI(player, block)
}
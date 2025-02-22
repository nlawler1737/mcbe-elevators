import { system, Player, Block } from "@minecraft/server"
import { ActionFormData } from "@minecraft/server-ui"
import optionsUI from "./options"
import { BLOCK_STATE_TELEPORT_DIRECTION, FACING_DIRECTIONS, ARROW_PATHS, OPERATOR_ID } from "../constants"

export default function create(player: Player, block: Block) {

    let facing = Math.round((((player.getRotation().y + 180) % 360) / 90)) + 1
    if (facing === 5) facing = 1
    const currentDirection = block.permutation.getState(BLOCK_STATE_TELEPORT_DIRECTION) as number
    const values = FACING_DIRECTIONS.map((value, i) => {
        let prefix = ""
        if (i === currentDirection) prefix += "§2"
        if (i === 0) return [prefix + value, "textures/ui/refresh_hover.png"]
        return [prefix + value, "textures/ui/" + ARROW_PATHS[(i + 4 - facing) % 4]]
    })

    const form = new ActionFormData()
        .title("Elevator Direction")

    values.forEach((value) => {
        form.button(...value as [string, string])
    })

    if (player.hasTag(OPERATOR_ID)) {
        form.button("Config")
    }

    system.run(() => {
        form.show(player).then((event) => {
            if (event.canceled) return
            if (event.selection === 5) {
                optionsUI(player)
            }
            block.setPermutation(block.permutation.withState(BLOCK_STATE_TELEPORT_DIRECTION, event.selection))
        }).catch((error) => {
            player.sendMessage(error)
        })
    })
}
import { Player } from "@minecraft/server"
import { ModalFormData } from "@minecraft/server-ui"
import { HELP_TEXT } from "../constants"
import { scoreboard } from "../scoreboard"


function updateScoreboard(value: any, data: any) {
    scoreboard[data.id] = value
}

export default function create(player: Player) {
    const actions = [
        { type: "toggle", args: ["Teleport Mobs", !!scoreboard.teleportMobs], data: { id: "teleportMobs" }, handler: updateScoreboard },
        { type: "toggle", args: ["Teleport Players", !!scoreboard.teleportPlayers], data: { id: "teleportPlayers" }, handler: updateScoreboard },
        { type: "toggle", args: ["Skip Obstructed", !!scoreboard.skipObstructed], data: { id: "skipObstructed" }, handler: updateScoreboard },
        { type: "toggle", args: ["Ignore Obstructions", !!scoreboard.ignoreObstructions], data: { id: "ignoreObstructions" }, handler: updateScoreboard },
        { type: "textField", args: ["Max Teleport Distance §7(-1 = No Limit)", "", "" + scoreboard.maxTeleportDistance], data: { id: "maxTeleportDistance" }, handler: updateScoreboard },
    ]
    const form = new ModalFormData()
    for (const action of actions) {
        form[action.type](...action.args)
    }
    form.toggle("Help\n§7§oselect then press 'Save'; nothing gets updated", false)
    form.submitButton("Save")
    form.show(player).then((event) => {
        if (event.canceled) return
        if (event.formValues[actions.length] === true) {
            player.sendMessage(HELP_TEXT)
            return
        }
        event.formValues.forEach((value, i) => {
            if (i === actions.length) return
            const action = actions[i]
            action.handler(value, action.data)
        })
    })
}
import { world } from "@minecraft/server"
import { SCOREBOARD_NAME } from "./constants"
import type { ElevatorsConfigOptions } from "./types"
import config from "./config"

const scoreboard = world.scoreboard.getObjective(SCOREBOARD_NAME) || world.scoreboard.addObjective(SCOREBOARD_NAME, "Elevators Config")

const scoreboardConfig: Partial<ElevatorsConfigOptions> = {}

for (const key in config.options) {
    const currentValue = scoreboard.hasParticipant(key) && scoreboard.getScore(key)
    if (currentValue) {
        const newVal = resolveFormat(key, currentValue)
        scoreboardConfig[key] = newVal
        scoreboard.setScore(key, newVal)
    } else {
        const newVal = resolveFormat(key, config.options[key])
        scoreboard.setScore(key, newVal)
        scoreboardConfig[key] = newVal
    }
}

const scoreboardProxy = new Proxy(scoreboardConfig, {
    set(target, prop, value) {
        const newValue = resolveFormat(prop as string, value)
        scoreboard.setScore(prop as string, newValue);
        target[prop] = newValue;
        return true
    }
})

function resolveFormat(key: string, value: any) {
    switch (key) {
        case "ignoreObstructions":
        case "skipObstructed":
        case "teleportMobs":
        case "teleportPlayers":
            return scoreboardFormat("boolean", value);
        case "maxTeleportDistance":
            return scoreboardFormat("distance", value);
        default:
            throw new Error(`Key '${key}' was not able to be formatted`)
    }
}

function scoreboardFormat(type: "boolean", value: any): 0 | 1
function scoreboardFormat(type: "distance", value: any): number
function scoreboardFormat(type: "boolean" | "distance", value: any): number | 0 | 1 {
    switch (type) {
        case "boolean":
            return value ? 1 : 0
        case "distance":
            return +value > 2 ? +value : -1
    }
}

export { scoreboardProxy as scoreboard }
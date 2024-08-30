import { ElevatorsConfig } from "./elevators/types"

type Config = {
    elevators: ElevatorsConfig
}

const elevators: ElevatorsConfig = {
    blocks: new Set([
        "elevators:black_elevator",
        "elevators:blue_elevator",
        "elevators:brown_elevator",
        "elevators:cyan_elevator",
        "elevators:gray_elevator",
        "elevators:green_elevator",
        "elevators:light_blue_elevator",
        "elevators:lime_elevator",
        "elevators:magenta_elevator",
        "elevators:orange_elevator",
        "elevators:pink_elevator",
        "elevators:purple_elevator",
        "elevators:red_elevator",
        "elevators:light_gray_elevator",
        "elevators:white_elevator",
        "elevators:yellow_elevator",
    ]),
    teleportAllOnBlock: true,
    teleportPlayers: false,
}

export default {
    elevators,
    //...
} as Config

export {
    elevators,
    //...
};
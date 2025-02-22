export type ElevatorsConfigOptions = {
    /**
     * When a player users an elevator, should all mobs
     * on the elevator also be teleported with the player
     */
    teleportMobs: 0 | 1,
    /**
     * Should teleporting all mobs with a player include other players
     */
    teleportPlayers: 0 | 1,
    /**
     * Maximum distance you can teleport between elevators
     * 
     * Use `-1` for no limit
     * 
     * Range: `3` to `(2^32)-1` and `-1`
     */
    maxTeleportDistance: number,
    /**
     * Obstructed elevators will act as if they are not there (ie. they are skipped)
     * 
     * The messgae "Elevator Objstructed" is not sent
     */
    skipObstructed: 0 | 1,
    /**
     * Obstructions are not looked for. The player will be teleported no matter what.
     */
    ignoreObstructions: 0 | 1,
}

export type ElevatorsConfig = {
    /**
     * Blocks to allow teleporting between
     * 
     * Blocks listed only allow teleporting between the same block type
     */
    blocks: Set<string>,
    /**
     * These are able to be changed within the game
     */
    options: ElevatorsConfigOptions
}

export type TransparentBlock = {
    /**
     * If the transparent block has a height, like carpet
     * 
     * For example, carpet would be `0.0625` aka. `1/16` because it is one pixel tall
     */
    height?: number
}
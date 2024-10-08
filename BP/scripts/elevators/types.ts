export type ElevatorsConfig = {
    /**
     * Blocks to allow teleporting between
     * 
     * Blocks listed only allow teleporting between the same block type
     */
    blocks: Set<string>,
    /**
     * When a player users an elevator, should all mobs
     * on the elevator also be teleported with the player
     */
    teleportAllOnBlock: boolean,
    /**
     * Should teleporting all mobs with a player include other players
     */
    teleportPlayers: boolean,
    /**
     * Maximum distance you can teleport between elevators
     * 
     * Use `Infinity` for no limit
     * 
     * Range: 3 - Infinity
     */
    maxTeleportDistance: number,
}
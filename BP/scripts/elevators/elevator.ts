import { system, world, BlockCustomComponent, PlayerJoinAfterEvent } from "@minecraft/server"
import detectOnElevator from "./handlers/interval"
import detectPlayerInteract from "./handlers/playerInteract"
import { PROPERTY_WORLD_OWNER, OPERATOR_ID } from "./constants"


const ElevatorBlockComponent: BlockCustomComponent = {
    onPlayerInteract: detectPlayerInteract,
}

world.beforeEvents.worldInitialize.subscribe((event) => {
    event.blockComponentRegistry.registerCustomComponent(
        "elevators:elevator",
        ElevatorBlockComponent
    )

    if (!world.getDynamicProperty(PROPERTY_WORLD_OWNER)) {
        system.run(() => {
            world.afterEvents.playerJoin.subscribe(handleFirstPlayerJoin)
        })
    }

})

system.runInterval(() => {
    detectOnElevator()
})

function handleFirstPlayerJoin(event: PlayerJoinAfterEvent) {
    world.setDynamicProperty(PROPERTY_WORLD_OWNER, event.playerId)
    world.getEntity(event.playerId).addTag(OPERATOR_ID)

    world.afterEvents.playerJoin.unsubscribe(handleFirstPlayerJoin)
}
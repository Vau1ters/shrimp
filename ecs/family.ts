import { Entity } from './entity'
import { World } from './world'
import { EventNotifier } from '../utils/eventNotifier'

export class Family {
  private readonly entities: Set<Entity>
  public readonly entityAddedEvent: EventNotifier<Entity>
  public readonly entityRemovedEvent: EventNotifier<Entity>

  public constructor(
    private readonly world: World,
    private readonly includeComponents: Set<string>,
    private readonly excludeComponents: Set<string>
  ) {
    this.entities = new Set()

    this.entityAddedEvent = new EventNotifier()
    this.entityRemovedEvent = new EventNotifier()
    for (const entity of this.world.entityIterator)
    {
      this.onEntityChanged(entity)
    }

    this.world.entityAddedEvent.addObserver((entity: Entity): void => {
      this.onEntityAdded(entity)
    })
    this.world.entityRemovedEvent.addObserver((entity: Entity): void => {
      this.onEntityRemoved(entity)
    })
  }

  public get entityIterator(): IterableIterator<Entity> {
    return this.entities[Symbol.iterator]()
  }

  private onEntityAdded(entity: Entity): void {
    entity.componentChangedEvent.addObserver((entity): void => {
      this.onEntityChanged(entity)
    })
    if (this.includesEntity(entity)) {
      this.entities.add(entity)
      this.entityAddedEvent.notify(entity)
    }
  }


  private onEntityRemoved(entity: Entity): void {
    if (this.includesEntity(entity)) {
      this.entities.delete(entity)
      this.entityRemovedEvent.notify(entity)
    }
  }

  private onEntityChanged(entity: Entity): void {
    if (this.includesEntity(entity)) {
      this.entities.add(entity)
      this.entityAddedEvent.notify(entity)
    } else {
      this.entities.delete(entity)
      this.entityRemovedEvent.notify(entity)
    }
  }

  private includesEntity(entity: Entity): boolean {
    for (const component of this.includeComponents.values()) {
      if (!entity.hasComponent(component)) {
        return false
      }
    }
    for (const component of this.excludeComponents.values()) {
      if (entity.hasComponent(component)) {
        return false
      }
    }
    return true
  }

}

export class FamilyBuilder {
  private readonly world: World
  private readonly includeComponents: Set<string>
  private readonly excludeComponents: Set<string>

  public constructor(world: World) {
    this.world = world
    this.includeComponents = new Set()
    this.excludeComponents = new Set()
  }

  include(componentNames: string[]): this {
    for (const componentName of componentNames) {
      this.includeComponents.add(componentName)
    }
    return this
  }

  exclude(componentNames: string[]): this {
    for (const componentName of componentNames) {
      this.excludeComponents.add(componentName)
    }
    return this
  }

  build(): Family {
    return new Family(this.world, this.includeComponents, this.excludeComponents)
  }
}

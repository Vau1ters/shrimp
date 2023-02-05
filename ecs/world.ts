import { Entity } from './entity'
import { System } from './system'
import { EventNotifier } from '@shrimp/utils/eventNotifier'
import { assert } from '@shrimp/utils/assertion'

export class World {
  private readonly entities: Array<Entity>
  private readonly systems: Array<System>

  public readonly entityAddedEvent: EventNotifier<Entity>
  public readonly entityRemovedEvent: EventNotifier<Entity>


  public constructor() {
    this.entities = []
    this.systems = []
    this.entityAddedEvent = new EventNotifier()
    this.entityRemovedEvent = new EventNotifier()
  }

  public execute() {
    for(const system of this.systems)
    {
      system.execute()
    }
  }

  public get entityIterator(): IterableIterator<Entity> {
    return this.entities[Symbol.iterator]()
  }



  public addEntity(entity: Entity): void {
    this.entities[entity.id] = entity
    this.entityAddedEvent.notify(entity)
  }

  public addEntities(entities: Entity[]): void {
    for (const entity of entities) {
      this.addEntity(entity)
    }
  }

  public getEntityById(id: number): Entity {
    assert(id >= 0 && id < this.entities.length, 'index out of range')
    return this.entities[id]
  }

  public hasEntity(entity: Entity): boolean {
    return entity.id >= 0 && entity.id < this.entities.length
  }

  public addSystem(...systems: System[]): void {
    for (const system of systems) {
      system.init()
      this.systems.push(system)
    }
  }
}

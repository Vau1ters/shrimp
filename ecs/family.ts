import { Entity } from './entity'
import { World } from './world'
import { EventNotifier } from '../utils/eventNotifier'
import { assert } from '../utils/assertion'
import { Component, ConstructorTuple } from './component'

export class Family<I extends Component[], E extends Component[]> implements IterableIterator<I> {
  private readonly entities: Set<Entity>
  public readonly entityAddedEvent: EventNotifier<Entity>
  public readonly entityRemovedEvent: EventNotifier<Entity>
  private world?: World = undefined

  public constructor(
    private readonly includeComponents: ConstructorTuple<I>,
    private readonly excludeComponents?: ConstructorTuple<E>
  ) {
    this.entities = new Set()
    this.entityAddedEvent = new EventNotifier()
    this.entityRemovedEvent = new EventNotifier()
  }

  public init(world: World) {
    assert(this.world === undefined, 'init called twice')
    this.world = world

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

  private eIter?: IterableIterator<Entity>
  private iterRet?: IteratorResult<I>

  public [Symbol.iterator](): IterableIterator<I> {
    this.eIter = this.entityIterator
    return this
  }

  public next(): IteratorResult<I> {
    assert(this.eIter, 'iterator is not initialized')
    const next = this.eIter.next()
    if (this.iterRet === undefined) {
      return this.iterRet = {
        done: next.done,
        value: next.value?.getComponents(this.includeComponents)
      }
    } else {
      this.iterRet.done = next.done
      this.iterRet.value =  next.value?.getComponents(this.includeComponents)
      return this.iterRet
    }
  }

  // public eIterator(): Iterator<I> {
  //   const it = this.entities[Symbol.iterator]()

  //   const iterator = {
  //     next: () => {
  //       const next = it.next()
  //       const entity = next.value
  //       return {value: entity.getComponents(this.includeComponents), done: next.done}
  //     }
  //   }

  //   return {
  //     [Symbol.iterator]: () => iterator
  //   }
  // }

  public get entityIterator(): IterableIterator<Entity> {
    return this.entities[Symbol.iterator]()
  }

  public getSingleton(): Entity {
    assert(this.entities.size == 1, 'family not singleton')
    return this.entityIterator.next().value
  }

  public hasNoMember(): boolean {
    return this.entities.size == 0
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

    if (this.excludeComponents) {
      for (const component of this.excludeComponents.values()) {
        if (entity.hasComponent(component)) {
          return false
        }
      }
    }

    return true
  }

}

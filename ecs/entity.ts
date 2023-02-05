import { Component, Constructor, ConstructorTuple } from './component'
import { EventNotifier } from '../utils/eventNotifier'
import { assert } from '../utils/assertion'

export class Entity {
  private static id = 0

  private readonly _id: number
  private readonly componentMap: Map<string, Component>
  public readonly componentChangedEvent: EventNotifier<Entity>

  public constructor() {
    this._id = Entity.id++
    this.componentMap = new Map<string, Component>() 
    this.componentChangedEvent = new EventNotifier()
  }

  public get id(): number {
    return this._id
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public hasComponent<T extends Component>(component: Constructor<T>): boolean {
    return this.componentMap.has(component.name)
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public hasComponents<T extends Component[]>(components: ConstructorTuple<T>): boolean {
    for (const component of components) {
      if (!this.hasComponent(component)) {
        return false
      }
    }
    return true
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public getComponent<T extends Component>(component: Constructor<T>): T {
    const result = this.componentMap.get(component.name) as T
    assert(result, `Missing component '${component.name}'`)
    return result
  }

  public getComponents<T extends Component[]>(components: ConstructorTuple<T>): T {
    return components.map(<V extends Component>(component: Constructor<V>): V => this.getComponent(component)) as T
  }

  public addComponent<T extends Component>(component: T): void {
    assert(!(component.constructor.name in this.componentMap),
      `Component '${component.constructor.name}' is already added`)
    this.componentMap.set(component.constructor.name, component)
    this.componentChangedEvent.notify(this)
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public removeComponent<T extends Component>(component: Constructor<T>): void {
    this.componentMap.delete(component.name)
    this.componentChangedEvent.notify(this)
  }
}

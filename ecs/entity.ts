import { Component } from './component'
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

  public hasComponent(componentName: string): boolean {
    return this.componentMap.has(componentName)
  }

  public hasComponents(componentNames: string[]): boolean {
    for (const name of componentNames) {
      if (!this.componentMap.has(name)) {
        return false
      }
    }
    return true
  }

  public getComponent(componentName: string): Component {
    const result = this.componentMap.get(componentName)
    assert(result, `Missing component '${componentName}'`)
    return result
  }

  public addComponent<T extends Component>(component: T): void {
    assert(!(component.constructor.name in this.componentMap),
      `Component '${component.constructor.name}' is already added`)
    this.componentMap.set(component.constructor.name, component)
    this.componentChangedEvent.notify(this)
  }

  public removeComponent(componentName: string): void {
    this.componentMap.delete(componentName)
    this.componentChangedEvent.notify(this)
  }
}

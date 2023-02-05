export type Constructor<T> = new (...args: any) => T
export type ConstructorTuple<T extends Component[]> = [...{[K in keyof T]: Constructor<T[K]>}]
export interface Component {
}

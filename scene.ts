export interface Scene {
  exec(): void
  getNextScene(): Scene
}

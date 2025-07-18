export class ExpiringMap<K, V> {
  #map: Map<K, [V, number]>;
  #interval: NodeJS.Timeout;
  constructor(sweep_interval = 10000) {
    this.#map = new Map;
    this.#interval = setInterval(() => this.sweep(), sweep_interval);
  }
  set(key: K, value: V, expire: number) {
    this.#map.set(key, [value, Date.now() + expire]);
  }
  get(key: K): V | undefined {
    if(this.has(key)) return this.#map.get(key)![0];
  }
  has(key: K): boolean {
    const value = this.#map.get(key);
    if(!value) return false;
    if(value[1] < Date.now()) {
        this.#map.delete(key);
        return false;
    }
    return true;
  }
  delete(key: K): boolean {
    return this.#map.delete(key);
  }
  sweep() {
    this.#map.forEach(([, expire], key) =>
      expire < Date.now() ? this.#map.delete(key) : 0);
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    clearInterval(this.#interval);
  }
}

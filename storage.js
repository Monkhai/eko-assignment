export class Storage {
  /** @type {Storage} */
  static #instance

  /**
   @type {Map<string, string>}
   */
  #cache = new Map()

  constructor() {
    if (Storage.#instance) {
      throw new Error('Use Storage.getInstance() instead of new Storage()')
    }
  }

  /**
   * @returns {Storage}
   */
  static getInstance() {
    if (!Storage.#instance) {
      Storage.#instance = new Storage()
    }
    return Storage.#instance
  }
  /**
   * @param {string} key
   * @returns {string}
   */
  get(key) {
    if (this.#cache.has(key)) {
      return this.#cache.get(key)
    }
    const value = localStorage.getItem(key)
    this.#cache.set(key, value)
    return value
  }

  /**
   * @param {string} key
   * @param {boolean} value
   */
  set(key, value) {
    this.#cache.set(key, value)
    localStorage.setItem(key, value)
  }

  /**
   * @param {string} key
   */
  remove(key) {
    this.#cache.delete(key)
    localStorage.removeItem(key)
  }
}

export const storage = Storage.getInstance()

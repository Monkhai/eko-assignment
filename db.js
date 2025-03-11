import { Database, onValue, ref, runTransaction } from 'firebase/database'
import { Storage } from './storage.js'

export const initialStats = {
  likes: 0,
  dislikes: 0,
  views: 0,
}

export class DB {
  /** @type {AbortController} */
  #abortController
  /** @type {Database} */
  #db
  /** @type {Storage} */
  #storage
  /** @type {(name: string) => string} */
  #getStatsPath = name => `videos/${name}/stats`
  /** @type {(name: string) => string} */
  #getStorageKey = name => `video_${name}`

  /**
   * @param {AbortController} abortController
   * @param {Database} db
   * @param {Storage} storage
   */
  constructor(abortController, db, storage) {
    if (!db) {
      throw new Error('db is required')
    }
    if (!storage) {
      throw new Error('storage is required')
    }
    if (!abortController) {
      throw new Error('abortController is required')
    }
    this.#abortController = abortController
    this.#db = db
    this.#storage = storage
  }

  /**
   * @param {string} name
   */
  async handleLikeVideo(name) {
    const baseKey = this.#getStorageKey(name)
    const userLiked = this.#storage.get(`${baseKey}_likes`)
    const userDisliked = this.#storage.get(`${baseKey}_dislikes`)

    // If the user disliked the video, remove the dislike before adding a like
    if (userDisliked) {
      await this.#removeDislike(name)
    }

    // if the user already liked the video, remove the like
    if (userLiked) {
      await this.#removeLike(name)
    } else {
      await this.#addLike(name)
    }
  }

  /**
   * @param {string} name
   */
  async handleDislikeVideo(name) {
    const baseKey = this.#getStorageKey(name)
    const userLiked = this.#storage.get(`${baseKey}_likes`)
    const userDisliked = this.#storage.get(`${baseKey}_dislikes`)

    // if the user already liked the video, remove the like before adding a dislike
    if (userLiked) {
      await this.#removeLike(name)
    }

    // if the user already disliked the video, remove the dislike before adding a new one
    if (userDisliked) {
      await this.#removeDislike(name)
    } else {
      await this.#addDislike(name)
    }
  }

  /**
   * @private
   * @param {string} name
   */
  async #addLike(name) {
    const baseKey = this.#getStorageKey(name)
    this.#storage.set(`${baseKey}_likes`, true)
    await this.#updateStat(name, 'likes', 1)
  }

  /**
   * @private
   * @param {string} name
   */
  async #removeLike(name) {
    const baseKey = this.#getStorageKey(name)
    this.#storage.remove(`${baseKey}_likes`)
    await this.#updateStat(name, 'likes', -1)
  }

  /**
   * @private
   * @param {string} name
   */
  async #addDislike(name) {
    const baseKey = this.#getStorageKey(name)
    this.#storage.set(`${baseKey}_dislikes`, true)
    await this.#updateStat(name, 'dislikes', 1)
  }

  /**
   * @private
   * @param {string} name
   */
  async #removeDislike(name) {
    const baseKey = this.#getStorageKey(name)
    this.#storage.remove(`${baseKey}_dislikes`)
    await this.#updateStat(name, 'dislikes', -1)
  }

  /**
   * @private
   * @param {string} name
   * @param {string} statName
   * @param {number} delta
   */
  async #updateStat(name, statName, delta) {
    const statsPath = this.#getStatsPath(name)
    const videoRef = ref(this.#db, statsPath)
    return runTransaction(videoRef, currentStats => {
      if (!currentStats) {
        return { ...initialStats, [statName]: Math.max(0, delta) }
      }
      if (!Object.hasOwn(currentStats, statName)) {
        throw Error(`Missing stat: ${statName}`)
      }
      return {
        ...currentStats,
        [statName]: currentStats[statName] + delta,
      }
    })
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  isLiked(name) {
    return this.#storage.get(`${this.#getStorageKey(name)}_likes`)
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  isDisliked(name) {
    return this.#storage.get(`${this.#getStorageKey(name)}_dislikes`)
  }

  /**
   * @param {string} name
   */
  async updateViews(name) {
    const baseKey = this.#getStorageKey(name)
    this.#storage.set(`${baseKey}_views`, true)
    await this.#updateStat(name, 'views', 1)
  }

  /**
   * @param {string} name
   * @param {({views: number, likes: number, dislikes: number}) => void} callback
   */
  listenToStatUpdates(name, callback) {
    const statsPath = this.#getStatsPath(name)
    const videoRef = ref(this.#db, statsPath)
    const unsubscribe = onValue(videoRef, snapshot => {
      const values = snapshot.val()
      callback(values || initialStats)
    })

    this.#abortController.signal.addEventListener('abort', () => {
      unsubscribe()
    })
  }
}

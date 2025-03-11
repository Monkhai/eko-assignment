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
  /** @type {(name: string) => string} */
  #videoStatsPath = name => `videos/${name}/stats`
  /** @type {Storage} */
  #storage
  /**
   * @param {AbortController} abortController - Controller for aborting operations
   * @param {Database} db - Firebase Realtime Database instance
   * @param {Storage} storage - Storage instance
   */
  constructor(abortController, db, storage) {
    this.#abortController = abortController
    this.#db = db
    this.#storage = storage
  }

  /**
   *
   * @param {string} name - the name of the video to like
   */
  handleLikeVideo(name) {
    const userLikedVideo = this.#storage.get(`video_${name}_likes`)
    const userDislikedVideo = this.#storage.get(`video_${name}_dislikes`)

    if (userDislikedVideo) {
      this.#removeDislike(name)
    }

    if (userLikedVideo) {
      this.#removeLike(name)
    } else {
      this.#likeVideo(name)
    }
  }

  /**
   * @param {string} name - the name of the video to like
   */
  #likeVideo(name) {
    const statsPath = this.#videoStatsPath(name)
    const videoRef = ref(this.#db, statsPath)
    runTransaction(videoRef, currentStats => {
      if (!currentStats) {
        return { ...initialStats, likes: 1 }
      }
      if (!Object.hasOwn(currentStats, 'likes')) {
        throw Error('handle me')
      }
      return {
        ...currentStats,
        likes: currentStats.likes + 1,
      }
    })
    this.#storage.set(`video_${name}_likes`, true)
  }

  /**
   * @param {string} name - the name of the video to remove like
   */
  #removeLike(name) {
    const storageKey = `video_${name}_likes`
    this.#storage.remove(storageKey)
    const statsPath = this.#videoStatsPath(name)
    const videoRef = ref(this.#db, statsPath)
    runTransaction(videoRef, currentStats => {
      if (!currentStats) {
        return { ...initialStats, likes: 0 }
      }
      if (!Object.hasOwn(currentStats, 'likes')) {
        throw Error('handle me')
      }
      return {
        ...currentStats,
        likes: currentStats.likes - 1,
      }
    })
    this.#storage.remove(`video_${name}_likes`)
  }

  /**
   *
   * @param {string} name - the name of the video to dislike
   */
  handleDislikeVideo(name) {
    const userDislikedVideo = this.#storage.get(`video_${name}_dislikes`)
    const userLikedVideo = this.#storage.get(`video_${name}_likes`)

    if (userLikedVideo) {
      this.#removeLike(name)
    }

    if (userDislikedVideo) {
      this.#removeDislike(name)
    } else {
      this.#dislikeVideo(name)
    }
  }

  /**
   *
   * @param {string} name - the name of the video to dislike
   */
  #dislikeVideo(name) {
    const statsPath = this.#videoStatsPath(name)
    const videoRef = ref(this.#db, statsPath)
    runTransaction(videoRef, currentStats => {
      if (!currentStats) {
        return { ...initialStats, dislikes: 1 }
      }
      if (!Object.hasOwn(currentStats, 'dislikes')) {
        throw Error('handle me')
      }
      return {
        ...currentStats,
        dislikes: currentStats.dislikes + 1,
      }
    })
    this.#storage.set(`video_${name}_dislikes`, true)
  }

  /**
   * @param {string} name - the name of the video to remove dislike
   */
  #removeDislike(name) {
    const storageKey = `video_${name}_dislikes`
    this.#storage.remove(storageKey)
    const statsPath = this.#videoStatsPath(name)
    const videoRef = ref(this.#db, statsPath)
    runTransaction(videoRef, currentStats => {
      if (!currentStats) {
        return { ...initialStats, dislikes: 0 }
      }
      if (!Object.hasOwn(currentStats, 'dislikes')) {
        throw Error('handle me')
      }
      return {
        ...currentStats,
        dislikes: currentStats.dislikes - 1,
      }
    })
  }

  /**
   *
   * @param {string} name - the name of the video
   * @param {({views: number, likes: number, dislikes: number}) => void} callback - the name of the video
   */
  listenToStatUpdates(name, callback) {
    const statsPath = this.#videoStatsPath(name)
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

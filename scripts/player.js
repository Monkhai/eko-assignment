import { Controls } from './controls'
import { Stats } from './stats'

/**
 * A video player controller that manages playback and UI state.
 * Handles play/pause functionality and time display updates.
 */
export class Player {
  /** @type {string} */
  videoName

  /** @type {HTMLVideoElement} */
  playerRef

  /** @type {AbortController} */
  abortController

  /** @type {Controls} */
  controls

  /** @type {Stats} */
  stats

  /** @type {boolean} */
  dragging = false
  //------------------------------------------------------------
  /**
   * @param {string} videoName
   */
  constructor(videoName) {
    this.videoName = videoName
    this.playerRef = document.getElementById('player')
    this.abortController = new AbortController()
    this.controls = new Controls(this.playerRef, this.abortController.signal)
    this.stats = new Stats(this.playerRef, this.videoName, this.abortController.signal)
  }

  /*
    Removes all event listeners when the player is destroyed
   */
  cleanup() {
    this.abortController.abort()
  }
}

// Initialize player when DOM is ready and clean up before page unload
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  let player
  document.addEventListener('DOMContentLoaded', () => {
    player = new Player('video1')
  })

  window.addEventListener('beforeunload', () => {
    if (!player) return
    player.cleanup()
  })
}

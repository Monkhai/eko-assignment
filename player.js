/**
 * A video player controller that manages playback and UI state.
 * Handles play/pause functionality and time display updates.
 */
class Player {
  /** @type {HTMLVideoElement | null} */
  playerRef
  /** @type {HTMLButtonElement} */
  buttonRef
  /** @type {HTMLElement} */
  playSvgRef
  /** @type {HTMLElement} */
  pauseSvgRef
  /** @type {HTMLElement} */
  currentTimeRef
  /** @type {AbortController} */
  abortController

  /**
   * Initializes the player by setting up DOM references and event listeners
   */
  constructor() {
    this.playerRef = document.getElementById('player')
    this.buttonRef = document.getElementById('play_button')
    this.playSvgRef = document.getElementById('play_svg')
    this.pauseSvgRef = document.getElementById('pause_svg')
    this.currentTimeRef = document.getElementById('current_time')

    this.abortController = new AbortController()
    const signal = this.abortController.signal

    //add play/pause functionality to the button
    this.buttonRef.addEventListener('click', this.togglePlaying.bind(this), { signal })

    // Listen to video events to update UI accordingly
    this.playerRef.addEventListener('play', this.updateButton.bind(this), { signal })
    this.playerRef.addEventListener('pause', this.updateButton.bind(this), { signal })
    this.playerRef.addEventListener('ended', this.updateButton.bind(this), { signal })
    this.playerRef.addEventListener('timeupdate', this.updateCurrentTime.bind(this), { signal })
  }

  /*
    Toggles video playback state between playing and paused
   */
  togglePlaying() {
    if (!this.playerRef) return
    if (this.playerRef.paused) {
      this.playerRef.play()
    } else {
      this.playerRef.pause()
    }
  }

  /*
    Updates the play/pause button UI based on video playback state
   */
  updateButton() {
    if (!this.pauseSvgRef || !this.playSvgRef) return
    if (this.playerRef.paused) {
      this.playSvgRef.classList.remove('hidden')
      this.pauseSvgRef.classList.add('hidden')
    } else {
      this.pauseSvgRef.classList.remove('hidden')
      this.playSvgRef.classList.add('hidden')
    }
  }

  /*
    Updates the current time display with the video's progress
   */
  updateCurrentTime() {
    const time = this.playerRef.currentTime
    const timeInSeconds = formatSecondsToTimestamp(Math.floor(time))
    if (this.currentTimeRef.textContent !== timeInSeconds) {
      this.currentTimeRef.textContent = timeInSeconds
    }
  }

  /*
    Removes all event listeners when the player is destroyed
   */
  cleanup() {
    this.abortController.abort()
  }
}

/**
 * Converts seconds into a MM:SS formatted string
 * @param {number} seconds - The time in seconds to format
 * @returns {string} Time formatted as "MM:SS"
 */
function formatSecondsToTimestamp(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const paddedSeconds = remainingSeconds.toString().padStart(2, '0')
  const paddedMinutes = minutes.toString().padStart(2, '0')
  return `${paddedMinutes}:${paddedSeconds}`
}

// Initialize player when DOM is ready and clean up before page unload
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  let player
  document.addEventListener('DOMContentLoaded', () => {
    player = new Player()
  })

  // added to allow jest to find Player during testing
  window.Player = Player

  window.addEventListener('beforeunload', () => {
    if (!player) return
    player.cleanup()
  })
}

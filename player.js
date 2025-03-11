// Initialize Firebase.
// const app = firebase.initializeApp({
//   databaseURL: 'DATABASE_URL_PLACEHOLDER',
// })

// // Initialize Realtime Database and get a reference to the service.
// const database = firebase.database(app)

/* TODO:
    - use abort controller to remove all event listeners when unmounting
    - make resuable by allowing client to provide ids
 */
class Player {
  /** @type {HTMLVideoElement | null} */
  playerRef
  buttonRef
  playSvgRef
  pauseSvgRef
  currentTimeRef
  abortController

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

  togglePlaying() {
    if (!this.playerRef) return
    if (this.playerRef.paused) {
      this.playerRef.play()
    } else {
      this.playerRef.pause()
    }
  }

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

  updateCurrentTime() {
    const time = this.playerRef.currentTime
    const timeInSeconds = formatSecondsToTimestamp(Math.floor(time))
    if (this.currentTimeRef.textContent !== timeInSeconds) {
      this.currentTimeRef.textContent = timeInSeconds
    }
  }

  cleanup() {
    this.abortController.abort()
  }
}

function formatSecondsToTimestamp(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const paddedSeconds = remainingSeconds.toString().padStart(2, '0')
  const paddedMinutes = minutes.toString().padStart(2, '0')
  return `${paddedMinutes}:${paddedSeconds}`
}

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

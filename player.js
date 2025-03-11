// Initialize Firebase.
// const app = firebase.initializeApp({
//   databaseURL: 'DATABASE_URL_PLACEHOLDER',
// })

// // Initialize Realtime Database and get a reference to the service.
// const database = firebase.database(app)

class VideoController {
  playerRef
  buttonRef
  playing = true

  constructor(playerId, buttonRefId) {
    const playerRef = document.getElementById(playerId)
    this.playerRef = playerRef
    const buttonRef = document.getElementById(buttonRefId)
    this.buttonRef = buttonRef
    this.buttonRef.addEventListener('click', this.togglePlaying.bind(this))
  }

  togglePlayingState() {
    this.playing = !this.playing
  }

  togglePlaying() {
    if (!this.playerRef) return
    if (this.playing) {
      this.playerRef.pause()
    } else {
      this.playerRef.play()
    }
    this.togglePlayingState()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const videoController = new VideoController('player', 'playPause')
})

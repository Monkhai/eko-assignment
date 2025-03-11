// Initialize Firebase.
// const app = firebase.initializeApp({
//   databaseURL: 'DATABASE_URL_PLACEHOLDER',
// })

// // Initialize Realtime Database and get a reference to the service.
// const database = firebase.database(app)

class VideoController {
  playerRef
  buttonRef
  playSvgRef
  pauseSvgRef

  constructor() {
    this.playerRef = document.getElementById('player')
    this.buttonRef = document.getElementById('playPause')
    this.playSvgRef = document.getElementById('play_svg')
    this.pauseSvgRef = document.getElementById('pause_svg')

    //add play/pause functionality to the button
    this.buttonRef.addEventListener('click', this.togglePlaying.bind(this))

    // Listen to video events to update UI accordingly
    this.playerRef.addEventListener('play', this.updateButton.bind(this))
    this.playerRef.addEventListener('pause', this.updateButton.bind(this))
    this.playerRef.addEventListener('ended', this.updateButton.bind(this))
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
    if (this.playerRef.paused) {
      //   this.buttonRef.textContent = 'Play'
      this.playSvgRef.classList.remove('hidden')
      this.pauseSvgRef.classList.add('hidden')
    } else {
      // this.buttonRef.textContent = 'Pause'
      this.pauseSvgRef.classList.remove('hidden')
      this.playSvgRef.classList.add('hidden')
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const videoController = new VideoController('player', 'playPause')
})

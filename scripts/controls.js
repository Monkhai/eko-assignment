import { formatSecondsToTimestamp } from './helpers'

export class Controls {
  /** @type {HTMLVideoElement} */
  playerRef

  /** @type {HTMLDivElement} */
  progressBarRef

  /** @type {HTMLDivElement} */
  progressBarFillRef

  /** @type {HTMLSpanElement} */
  progressBarThumbRef

  /** @type {HTMLButtonElement} */
  playButtonRef

  /** @type {HTMLSpanElement} */
  playSvgRef

  /** @type {HTMLSpanElement} */
  pauseSvgRef

  /** @type {HTMLSpanElement} */
  currentTimeRef

  /**
   *
   * @param {HTMLVideoElement} playerRef
   * @param {AbortSignal} signal
   */
  constructor(playerRef, signal) {
    this.playerRef = playerRef
    this.progressBarRef = document.getElementById('progress_bar')
    this.progressBarFillRef = document.getElementById('progress_bar_fill')
    this.progressBarThumbRef = document.getElementById('progress_bar_thumb')
    this.playButtonRef = document.getElementById('play_button')
    this.playSvgRef = document.getElementById('play_svg')
    this.pauseSvgRef = document.getElementById('pause_svg')
    this.currentTimeRef = document.getElementById('current_time')

    // PLAY BUTTON EVENTS
    this.playButtonRef.addEventListener('click', this.togglePlaying.bind(this), { signal })

    // PLAYER EVENTS
    this.playerRef.addEventListener('play', this.updatePlayButton.bind(this), { signal })
    this.playerRef.addEventListener('pause', this.updatePlayButton.bind(this), { signal })
    this.playerRef.addEventListener('ended', this.updatePlayButton.bind(this), { signal })
    this.playerRef.addEventListener('timeupdate', this.handleTimeUpdate.bind(this), { signal })

    // PROGRESS BAR EVENTS
    this.progressBarThumbRef.addEventListener('mousedown', this.handleMouseDown.bind(this), { signal })
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), { signal })
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), { signal })

    // bind the updateProgressBar function to the player
    this.updateProgressBar = this.updateProgressBar.bind(this)

    // update the progress bar on page load (since video is auto play)
    requestAnimationFrame(this.updateProgressBar)
  }

  /*
    Toggles video playback state between playing and paused
   */
  togglePlaying() {
    if (!this.playerRef) return
    if (this.playerRef.paused) {
      this.playerRef.play()
      requestAnimationFrame(this.updateProgressBar)
    } else {
      this.playerRef.pause()
    }
  }

  /*
    Updates the play/pause button UI based on video playback state
   */
  updatePlayButton() {
    if (!this.playerRef.paused) {
      requestAnimationFrame(this.updateProgressBar)
    }
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
    Handles the mouse down event on the progress bar
   */
  handleMouseDown() {
    this.playerRef.pause()
    this.dragging = true
  }

  /**
   *
   * @param {MouseEvent} e
   */
  handleMouseMove(e) {
    if (!this.dragging) return
    const rect = this.progressBarRef.getBoundingClientRect()
    let position = (e.clientX - rect.left) / rect.width
    position = Math.max(0, Math.min(position, 1))

    const precent = Math.round(position * 100)
    this.progressBarFillRef.style.width = `${precent}%`

    const currentTime = this.playerRef.duration * position
    this.playerRef.currentTime = currentTime
  }

  /**
   * Handles the mouse up event on the progress bar
   */
  handleMouseUp() {
    if (this.dragging) this.dragging = false
  }

  /*
    Updates the progress bar using requestAnimationFrame for smooth animations
   */
  updateProgressBar() {
    if (this.playerRef.paused) return

    const currentTime = this.playerRef.currentTime
    const duration = this.playerRef.duration
    const progressPercentage = (currentTime / duration) * 100
    // Update the range input value
    this.progressBarFillRef.style.width = `${progressPercentage}%`
    // Continue updating the progress bar
    requestAnimationFrame(this.updateProgressBar)
  }

  /*
    Updates the current time display with the video's progress
   */
  handleTimeUpdate() {
    const currentTime = this.playerRef.currentTime
    const timeInSeconds = formatSecondsToTimestamp(Math.floor(currentTime))
    if (this.currentTimeRef.textContent !== timeInSeconds) {
      this.currentTimeRef.textContent = timeInSeconds
    }
  }
}

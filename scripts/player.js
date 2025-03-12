import { formatSecondsToTimestamp } from './helpers'
import { DB, initialStats } from './db'
import { db } from '../firebase'
import { storage } from './storage'

const THRESHOLD_CONSTANT = 0.25

/**
 * A video player controller that manages playback and UI state.
 * Handles play/pause functionality and time display updates.
 */
export class Player {
  /** @type {string} */
  videoName

  // threshold before counting as a view
  /** @type {number} */
  viewThreshold

  // TODO: explain that this is not safe in docs
  // flag to check if the view has been updated this session
  /** @type {boolean} */
  hasUpdatedView = false

  // accumulated watch time since the last update
  /** @type {number} */
  accumulatedWatchTime = 0

  // time of the last update
  /** @type {number} */
  lastUpdateTime = 0

  /** @type {HTMLVideoElement} */
  playerRef

  /** @type {HTMLButtonElement} */
  playButtonRef

  /** @type {SVGSVGElement} */
  playSvgRef

  /** @type {SVGSVGElement} */
  pauseSvgRef

  /** @type {HTMLSpanElement} */
  currentTimeRef

  /** @type {HTMLButtonElement} */
  likeButtonRef

  /** @type {HTMLButtonElement} */
  dislikeButtonRef

  /** @type {HTMLSpanElement} */
  likeCountRef

  /** @type {HTMLSpanElement} */
  dislikeCountRef

  /** @type {SVGSVGElement} */
  likeOutlineSvgRef

  /** @type {SVGSVGElement} */
  likeFillSvgRef

  /** @type {SVGSVGElement} */
  dislikeOutlineSvgRef

  /** @type {SVGSVGElement} */
  dislikeFillSvgRef

  /** @type {HTMLSpanElement} */
  viewsCountRef

  /** @type {HTMLDivElement} */
  progressBarRef

  /** @type {HTMLDivElement} */
  progressBarFillRef

  /** @type {HTMLSpanElement} */
  progressBarThumbRef

  /** @type {AbortController} */
  abortController

  /**  @type {DB} */
  db

  /** @type {{likes: number, dislikes: number, views: number}} */
  stats = initialStats

  /** @type {boolean} */
  dragging = false
  //------------------------------------------------------------
  /**
   * @param {string} videoName
   */
  constructor(videoName) {
    this.videoName = videoName
    this.playerRef = document.getElementById('player')
    this.playButtonRef = document.getElementById('play_button')
    this.playSvgRef = document.getElementById('play_svg')
    this.pauseSvgRef = document.getElementById('pause_svg')
    this.currentTimeRef = document.getElementById('current_time')
    this.likeButtonRef = document.getElementById('like_button')
    this.dislikeButtonRef = document.getElementById('dislike_button')
    this.likeCountRef = document.getElementById('like_count')
    this.dislikeCountRef = document.getElementById('dislike_count')
    this.likeOutlineSvgRef = document.getElementById('like_svg_outline')
    this.likeFillSvgRef = document.getElementById('like_svg_fill')
    this.dislikeOutlineSvgRef = document.getElementById('dislike_svg_outline')
    this.dislikeFillSvgRef = document.getElementById('dislike_svg_fill')
    this.viewsCountRef = document.getElementById('views_count')
    this.progressBarRef = document.getElementById('progress_bar')
    this.progressBarFillRef = document.getElementById('progress_bar_fill')
    this.progressBarThumbRef = document.getElementById('progress_bar_thumb')
    this.abortController = new AbortController()

    const signal = this.abortController.signal

    // play/pause functionality
    this.playButtonRef.addEventListener('click', this.togglePlaying.bind(this), { signal })

    // like/dislike functionality
    this.likeButtonRef.addEventListener('click', this.likeVideo.bind(this), { signal })
    this.dislikeButtonRef.addEventListener('click', this.dislikeVideo.bind(this), { signal })

    // video events
    this.playerRef.addEventListener('play', this.updateButton.bind(this), { signal })
    this.playerRef.addEventListener('pause', this.updateButton.bind(this), { signal })
    this.playerRef.addEventListener('ended', this.updateButton.bind(this), { signal })
    this.playerRef.addEventListener('ended', this.resetViewState.bind(this), { signal })
    this.playerRef.addEventListener('timeupdate', this.updateCurrentTime.bind(this), { signal })

    // progress bar events
    this.progressBarThumbRef.addEventListener(
      'mousedown',
      () => {
        this.playerRef.pause()
        this.dragging = true
      },
      { signal }
    )
    document.addEventListener(
      'mousemove',
      e => {
        if (!this.dragging) return
        const rect = this.progressBarRef.getBoundingClientRect()
        let position = (e.clientX - rect.left) / rect.width
        position = Math.max(0, Math.min(position, 1))

        const precent = Math.round(position * 100)
        this.progressBarFillRef.style.width = `${precent}%`
      },
      { signal }
    )
    document.addEventListener(
      'mouseup',
      () => {
        if (this.dragging) this.dragging = false
      },
      { signal }
    )

    // set the view threshold to half of the video duration
    this.viewThreshold = this.playerRef.duration * THRESHOLD_CONSTANT
    // setup db
    this.db = new DB(this.abortController, db, storage)
    // create a realtime connection to update UI when database changes
    this.db.listenToStatUpdates('video1', this.updateStats.bind(this))

    // initialize the vote button fill

    // bind the updateProgressBar function to the player
    this.updateProgressBar = this.updateProgressBar.bind(this)

    // update the progress bar on page load (since video is auto play)
    requestAnimationFrame(this.updateProgressBar)
    this.updateVoteButtonFill()
  }

  resetViewState() {
    this.hasUpdatedView = false
    this.accumulatedWatchTime = 0
    this.lastUpdateTime = 0
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
  updateButton() {
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
    Updates the current time display with the video's progress
   */
  updateCurrentTime() {
    const currentTime = this.playerRef.currentTime
    const timeInSeconds = formatSecondsToTimestamp(Math.floor(currentTime))
    if (this.currentTimeRef.textContent !== timeInSeconds) {
      this.currentTimeRef.textContent = timeInSeconds
    }

    // Calculate the time watched since the last update
    const timeWatched = currentTime - this.lastUpdateTime
    if (timeWatched > 0) {
      this.accumulatedWatchTime += timeWatched
      this.lastUpdateTime = currentTime
    }

    // Update the view only if the accumulated watch time exceeds the threshold
    if (this.accumulatedWatchTime >= this.viewThreshold && !this.hasUpdatedView) {
      this.db.handleUpdateViews(this.videoName)
      this.hasUpdatedView = true // Set the flag to true after updating
    }
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

  /**
   * @param {{views: number, likes: number, dislikes: number}} stats - the name of the video
   */
  updateStats(stats) {
    if (stats.likes !== this.stats.likes) {
      this.likeCountRef.textContent = stats.likes
      this.updateVoteButtonFill()
    }
    if (stats.dislikes !== this.stats.dislikes) {
      this.dislikeCountRef.textContent = stats.dislikes
      this.updateVoteButtonFill()
    }
    if (stats.views !== this.stats.views) {
      this.viewsCountRef.textContent = stats.views
    }

    this.stats = stats
  }

  async likeVideo() {
    await this.db.handleLikeVideo(this.videoName)
  }

  async dislikeVideo() {
    await this.db.handleDislikeVideo(this.videoName)
  }

  /**
   * Updates the fill state of the vote buttons based on the user's vote
   */
  updateVoteButtonFill() {
    // if the user has liked the video, show the fill svg
    if (this.db.isLiked(this.videoName)) {
      this.likeOutlineSvgRef.classList.add('hidden')
      this.likeFillSvgRef.classList.remove('hidden')
    } else {
      // if the user has not liked the video, show the outline svg
      this.likeOutlineSvgRef.classList.remove('hidden')
      this.likeFillSvgRef.classList.add('hidden')
    }

    // if the user has disliked the video, show the fill svg
    if (this.db.isDisliked(this.videoName)) {
      this.dislikeOutlineSvgRef.classList.add('hidden')
      this.dislikeFillSvgRef.classList.remove('hidden')
    } else {
      // if the user has not disliked the video, show the outline svg
      this.dislikeOutlineSvgRef.classList.remove('hidden')
      this.dislikeFillSvgRef.classList.add('hidden')
    }
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

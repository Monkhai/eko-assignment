import { DB, initialStats } from './db'
import { db } from './firebase'
import { storage } from './storage'

/**
 * A video player controller that manages playback and UI state.
 * Handles play/pause functionality and time display updates.
 */
export class Player {
  /** @type {string} */
  videoName

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

  /** @type {AbortController} */
  abortController

  /**  @type {DB} */
  db

  /** @type {{likes: number, dislikes: number, views: number}} */
  stats = initialStats

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
    // initialize the AbortController
    this.abortController = new AbortController()
    const signal = this.abortController.signal
    //add play/pause functionality to the button
    this.playButtonRef.addEventListener('click', this.togglePlaying.bind(this), { signal })

    // Listen to video events to update UI accordingly
    this.playerRef.addEventListener('play', this.updateButton.bind(this), { signal })
    this.playerRef.addEventListener('pause', this.updateButton.bind(this), { signal })
    this.playerRef.addEventListener('ended', this.updateButton.bind(this), { signal })
    this.playerRef.addEventListener('timeupdate', this.updateCurrentTime.bind(this), { signal })

    // setup db
    this.db = new DB(this.abortController, db, storage)
    // create a realtime connection to update UI when database changes
    this.db.listenToStatUpdates('video1', this.updateStats.bind(this))

    // setup db functionality
    this.likeButtonRef.addEventListener('click', this.likeVideo.bind(this), { signal })
    this.dislikeButtonRef.addEventListener('click', this.dislikeVideo.bind(this), { signal })

    // initialize the vote button fill
    this.updateVoteButtonFill()
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
    player = new Player('video1')
  })

  window.addEventListener('beforeunload', () => {
    if (!player) return
    player.cleanup()
  })
}

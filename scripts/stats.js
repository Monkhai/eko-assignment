import { DB, initialStats } from './db'
import { db } from '../firebase'
import { storage } from './storage'

const THRESHOLD_CONSTANT = 0.25

export class Stats {
  /** @type {HTMLVideoElement} */
  playerRef

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

  /** @type {{likes: number, dislikes: number, views: number}} */
  stats = initialStats

  /**  @type {DB} */
  db

  /**
   *
   * @param {HTMLVideoElement} playerRef
   * @param {string} videoName
   * @param {AbortSignal} signal
   */
  constructor(playerRef, videoName, signal) {
    this.playerRef = playerRef
    this.videoName = videoName
    this.likeButtonRef = document.getElementById('like_button')
    this.dislikeButtonRef = document.getElementById('dislike_button')
    this.likeCountRef = document.getElementById('like_count')
    this.dislikeCountRef = document.getElementById('dislike_count')
    this.likeOutlineSvgRef = document.getElementById('like_svg_outline')
    this.likeFillSvgRef = document.getElementById('like_svg_fill')
    this.dislikeOutlineSvgRef = document.getElementById('dislike_svg_outline')
    this.dislikeFillSvgRef = document.getElementById('dislike_svg_fill')
    this.viewsCountRef = document.getElementById('views_count')
    // set the view threshold to half of the video duration
    this.viewThreshold = this.playerRef.duration * THRESHOLD_CONSTANT

    // setup db
    this.db = new DB(db, storage, signal)

    this.likeButtonRef.addEventListener('click', this.likeVideo.bind(this), { signal })
    this.dislikeButtonRef.addEventListener('click', this.dislikeVideo.bind(this), { signal })
    this.playerRef.addEventListener('ended', this.resetViewState.bind(this), { signal })

    // create a realtime connection to update UI when database changes
    this.db.listenToStatUpdates('video1', this.updateStats.bind(this))

    this.updateVoteButtonFill()
  }

  resetViewState() {
    this.hasUpdatedView = false
    this.accumulatedWatchTime = 0
    this.lastUpdateTime = 0
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
}

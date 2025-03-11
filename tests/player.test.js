import { beforeEach, describe, expect, vi } from 'vitest'
import { initialStats } from '../scripts/db.js'
import { Player } from '../scripts/player.js'

// test initial stats
describe('Player', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = `
    <video id="player"></video>
    <button id="play_button"></button>
    <svg id="play_svg" class="hidden"></svg>
    <svg id="pause_svg"></svg>
    <span id="current_time"></span>
    <button id="like_button"></button>
    <span id="like_count"></span>
    <button id="dislike_button"></button>
    <span id="dislike_count"></span>
    <svg id="like_svg_outline" class="hidden"></svg>
    <svg id="like_svg_fill" class="hidden"></svg>
    <svg id="dislike_svg_outline" class="hidden"></svg>
    <svg id="dislike_svg_fill" class="hidden"></svg>
    <span id="views_count"></span>
    `
  })

  test('initialize', () => {
    const player = new Player('test-video')
    expect(player.stats).toEqual(initialStats)
    expect(player.playerRef).toBeDefined()
    expect(player.playButtonRef).toBeDefined()
    expect(player.playSvgRef).toBeDefined()
    expect(player.pauseSvgRef).toBeDefined()
    expect(player.currentTimeRef).toBeDefined()
    expect(player.likeButtonRef).toBeDefined()
    expect(player.likeCountRef).toBeDefined()
    expect(player.dislikeButtonRef).toBeDefined()
    expect(player.dislikeCountRef).toBeDefined()
    expect(player.likeOutlineSvgRef).toBeDefined()
    expect(player.likeFillSvgRef).toBeDefined()
    expect(player.dislikeOutlineSvgRef).toBeDefined()
    expect(player.dislikeFillSvgRef).toBeDefined()
    expect(player.viewsCountRef).toBeDefined()
    expect(player.abortController).toBeDefined()
    expect(player.db).toBeDefined()
    expect(player.videoName).toBeDefined()
    expect(player.viewThreshold).toBeDefined()
  })

  test('player.togglePlaying()', () => {
    const player = new Player('test-video')
    const videoElement = player.playerRef

    // Mock play and pause methods
    videoElement.play = vi.fn(() => {
      Object.defineProperty(videoElement, 'paused', { value: false, configurable: true })
    })
    videoElement.pause = vi.fn(() => {
      Object.defineProperty(videoElement, 'paused', { value: true, configurable: true })
    })

    // Initially, the video should be paused
    Object.defineProperty(videoElement, 'paused', { value: false, configurable: true })
    expect(videoElement.paused).toBe(false)

    // Simulate play
    player.togglePlaying()
    expect(videoElement.pause).toHaveBeenCalled()
    expect(videoElement.paused).toBe(true)

    // Simulate play
    player.togglePlaying()
    expect(videoElement.play).toHaveBeenCalled()
    expect(videoElement.paused).toBe(false)
  })

  test('player.updateButton()', () => {
    const player = new Player('test-video')
    const videoElement = player.playerRef
    // initially the video should be paused
    Object.defineProperty(videoElement, 'paused', { value: false, configurable: true })
    expect(videoElement.paused).toBe(false)

    expect(player.playSvgRef.classList.contains('hidden')).toBe(true)
    expect(player.pauseSvgRef.classList.contains('hidden')).toBe(false)

    // simulate pause
    Object.defineProperty(videoElement, 'paused', { value: true, configurable: true })
    expect(videoElement.paused).toBe(true)

    player.playerRef.dispatchEvent(new Event('pause'))
    expect(player.playSvgRef.classList.contains('hidden')).toBe(false)
    expect(player.pauseSvgRef.classList.contains('hidden')).toBe(true)

    // simulate play
    Object.defineProperty(videoElement, 'paused', { value: false, configurable: true })
    expect(videoElement.paused).toBe(false)

    player.playerRef.dispatchEvent(new Event('play'))
    expect(player.playSvgRef.classList.contains('hidden')).toBe(true)
    expect(player.pauseSvgRef.classList.contains('hidden')).toBe(false)
  })

  test('player.updateCurrentTime()', () => {
    const player = new Player('test-video')
    player.playerRef.currentTime = 4.37
    player.updateCurrentTime()
    expect(player.currentTimeRef.textContent).toBe('00:04')
  })

  test('player.updateStats()', () => {
    const player = new Player('test-video')
    player.updateStats({
      likes: 10,
      dislikes: 5,
      views: 100,
    })
    expect(player.stats.likes).toBe(10)
    expect(player.likeCountRef.textContent).toBe('10')
    expect(player.stats.dislikes).toBe(5)
    expect(player.dislikeCountRef.textContent).toBe('5')
    expect(player.stats.views).toBe(100)
    expect(player.viewsCountRef.textContent).toBe('100')
  })

  test('player.updateVoteButtonFill()', () => {
    const player = new Player('test-video')
    player.db.isLiked = vi.fn(() => true)
    player.updateVoteButtonFill()
    expect(player.likeFillSvgRef.classList.contains('hidden')).toBe(false)
    expect(player.dislikeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(player.likeOutlineSvgRef.classList.contains('hidden')).toBe(true)
    expect(player.dislikeFillSvgRef.classList.contains('hidden')).toBe(true)

    player.db.isLiked = vi.fn(() => false)
    player.updateVoteButtonFill()
    expect(player.likeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(player.dislikeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(player.likeFillSvgRef.classList.contains('hidden')).toBe(true)
    expect(player.dislikeFillSvgRef.classList.contains('hidden')).toBe(true)

    player.db.isDisliked = vi.fn(() => true)
    player.updateVoteButtonFill()
    expect(player.likeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(player.dislikeOutlineSvgRef.classList.contains('hidden')).toBe(true)
    expect(player.likeFillSvgRef.classList.contains('hidden')).toBe(true)
    expect(player.dislikeFillSvgRef.classList.contains('hidden')).toBe(false)

    player.db.isDisliked = vi.fn(() => false)
    player.updateVoteButtonFill()
    expect(player.likeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(player.dislikeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(player.likeFillSvgRef.classList.contains('hidden')).toBe(true)
    expect(player.dislikeFillSvgRef.classList.contains('hidden')).toBe(true)
  })
})

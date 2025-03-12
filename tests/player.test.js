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
    <div id="progress_bar"></div>
    <div id="progress_bar_fill"></div>
    <span id="progress_bar_thumb"></span>
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

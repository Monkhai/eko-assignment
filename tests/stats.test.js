import { beforeEach, describe, expect, vi } from 'vitest'
import { Stats } from '../scripts/stats'
import { initialStats } from '../scripts/db'

describe('Stats', () => {
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
    const stats = createStats()
    expect(stats).toBeDefined()
    expect(stats.playerRef).toBeDefined()
    expect(stats.videoName).toBeDefined()
    expect(stats.viewThreshold).toBeDefined()
    expect(stats.hasUpdatedView).toBeDefined()
    expect(stats.accumulatedWatchTime).toBeDefined()
    expect(stats.lastUpdateTime).toBeDefined()
    expect(stats.likeButtonRef).toBeDefined()
    expect(stats.dislikeButtonRef).toBeDefined()
    expect(stats.likeCountRef).toBeDefined()
    expect(stats.dislikeCountRef).toBeDefined()
    expect(stats.likeOutlineSvgRef).toBeDefined()
    expect(stats.likeFillSvgRef).toBeDefined()
    expect(stats.dislikeOutlineSvgRef).toBeDefined()
    expect(stats.dislikeFillSvgRef).toBeDefined()
    expect(stats.viewsCountRef).toBeDefined()
    expect(stats.stats).toBe(initialStats)
    expect(stats.db).toBeDefined()
  })

  test('stats.resetViewState()', () => {
    const stats = createStats()
    stats.resetViewState()
    expect(stats.hasUpdatedView).toBe(false)
    expect(stats.accumulatedWatchTime).toBe(0)
    expect(stats.lastUpdateTime).toBe(0)
  })

  test('stats.updateStats()', () => {
    const stats = createStats()
    stats.updateStats({
      likes: 10,
      dislikes: 5,
      views: 100,
    })
    expect(stats.stats.likes).toBe(10)
    expect(stats.likeCountRef.textContent).toBe('10')
    expect(stats.stats.dislikes).toBe(5)
    expect(stats.dislikeCountRef.textContent).toBe('5')
    expect(stats.stats.views).toBe(100)
    expect(stats.viewsCountRef.textContent).toBe('100')
  })

  test('stats.updateVoteButtonFill()', () => {
    const stats = createStats()
    stats.db.isLiked = vi.fn(() => true)
    stats.updateVoteButtonFill()
    expect(stats.likeFillSvgRef.classList.contains('hidden')).toBe(false)
    expect(stats.dislikeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(stats.likeOutlineSvgRef.classList.contains('hidden')).toBe(true)
    expect(stats.dislikeFillSvgRef.classList.contains('hidden')).toBe(true)

    stats.db.isLiked = vi.fn(() => false)
    stats.updateVoteButtonFill()
    expect(stats.likeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(stats.dislikeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(stats.likeFillSvgRef.classList.contains('hidden')).toBe(true)
    expect(stats.dislikeFillSvgRef.classList.contains('hidden')).toBe(true)

    stats.db.isDisliked = vi.fn(() => true)
    stats.updateVoteButtonFill()
    expect(stats.likeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(stats.dislikeOutlineSvgRef.classList.contains('hidden')).toBe(true)
    expect(stats.likeFillSvgRef.classList.contains('hidden')).toBe(true)
    expect(stats.dislikeFillSvgRef.classList.contains('hidden')).toBe(false)

    stats.db.isDisliked = vi.fn(() => false)
    stats.updateVoteButtonFill()
    expect(stats.likeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(stats.dislikeOutlineSvgRef.classList.contains('hidden')).toBe(false)
    expect(stats.likeFillSvgRef.classList.contains('hidden')).toBe(true)
    expect(stats.dislikeFillSvgRef.classList.contains('hidden')).toBe(true)
  })
})

function createStats() {
  const abortController = new AbortController()
  const playerRef = document.getElementById('player')
  return new Stats(playerRef, 'videoTest', abortController.signal)
}

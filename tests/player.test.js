import { beforeEach, describe, expect, vi } from 'vitest'
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
    expect(player.playerRef).toBeDefined()
    expect(player.abortController).toBeDefined()
    expect(player.videoName).toBeDefined()
  })
})

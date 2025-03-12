import { Controls } from '../scripts/controls'
import { vi, describe, beforeEach, test, expect } from 'vitest'

describe('Controls', () => {
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
    const controls = createControls()
    expect(controls).toBeDefined()
    expect(controls.playerRef).toBeDefined()
    expect(controls.progressBarRef).toBeDefined()
    expect(controls.progressBarFillRef).toBeDefined()
    expect(controls.progressBarThumbRef).toBeDefined()
    expect(controls.playButtonRef).toBeDefined()
    expect(controls.playSvgRef).toBeDefined()
    expect(controls.pauseSvgRef).toBeDefined()
    expect(controls.currentTimeRef).toBeDefined()
  })

  test('controls.togglePlaying()', () => {
    const controls = createControls()
    const videoElement = controls.playerRef

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
    controls.togglePlaying()
    expect(videoElement.pause).toHaveBeenCalled()
    expect(videoElement.paused).toBe(true)

    // Simulate play
    controls.togglePlaying()
    expect(videoElement.play).toHaveBeenCalled()
    expect(videoElement.paused).toBe(false)
  })

  test('controls.updateButton()', () => {
    const controls = createControls()
    const videoElement = controls.playerRef
    // initially the video should be paused
    Object.defineProperty(videoElement, 'paused', { value: false, configurable: true })
    expect(videoElement.paused).toBe(false)

    expect(controls.playSvgRef.classList.contains('hidden')).toBe(true)
    expect(controls.pauseSvgRef.classList.contains('hidden')).toBe(false)

    // simulate pause
    Object.defineProperty(videoElement, 'paused', { value: true, configurable: true })
    expect(videoElement.paused).toBe(true)

    controls.playerRef.dispatchEvent(new Event('pause'))
    expect(controls.playSvgRef.classList.contains('hidden')).toBe(false)
    expect(controls.pauseSvgRef.classList.contains('hidden')).toBe(true)

    // simulate play
    Object.defineProperty(videoElement, 'paused', { value: false, configurable: true })
    expect(videoElement.paused).toBe(false)

    controls.playerRef.dispatchEvent(new Event('play'))
    expect(controls.playSvgRef.classList.contains('hidden')).toBe(true)
    expect(controls.pauseSvgRef.classList.contains('hidden')).toBe(false)
  })

  test('player.handleMouseMove()', () => {
    const controls = createControls()
    const videoElement = controls.playerRef
    const progressBarRef = controls.progressBarRef
    const progressBarFillRef = controls.progressBarFillRef

    // mock the duration of the video
    Object.defineProperty(videoElement, 'duration', { value: 100, configurable: true })

    // mock the bounding client rect of the progress bar
    progressBarRef.getBoundingClientRect = () => ({
      left: 100,
      width: 200,
      right: 200,
      top: 0,
      bottom: 0,
    })

    /**
     * 200 is the center of the progress bar (the width is 200 and the left is 100)
     */
    const mockMouseEvent = {
      clientX: 200,
    }
    controls.dragging = true
    controls.handleMouseMove(mockMouseEvent)

    expect(progressBarFillRef.style.width).toBe('50%')
  })

  test('controls.updateProgressBar()', () => {
    const controls = createControls()
    const videoElement = controls.playerRef
    const progressBarFillRef = controls.progressBarFillRef

    Object.defineProperty(videoElement, 'paused', { value: false, configurable: true })
    Object.defineProperty(videoElement, 'currentTime', { value: 50, configurable: true })
    Object.defineProperty(videoElement, 'duration', { value: 100, configurable: true })

    controls.updateProgressBar()

    expect(progressBarFillRef.style.width).toBe(`${50}%`)
  })

  test('controls.updateCurrentTime()', () => {
    const controls = createControls()
    const videoElement = controls.playerRef
    const currentTimeRef = controls.currentTimeRef

    Object.defineProperty(videoElement, 'currentTime', { value: 5.192, configurable: true })

    // set the text content to be different than the current time
    currentTimeRef.textContent = '00:04'

    controls.handleTimeUpdate()

    expect(currentTimeRef.textContent).toBe('00:05')
  })
})

function createControls() {
  const playerRef = document.getElementById('player')
  const abortController = new AbortController()
  return new Controls(playerRef, abortController.signal)
}

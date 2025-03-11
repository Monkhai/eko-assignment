require('./player.js')

describe('Player', () => {
  let player
  let mockPaused = true

  beforeEach(() => {
    document.body.innerHTML = `
      <video id="player"></video>
      <button id="play_button"></button>
      <svg id="play_svg"></svg>
      <svg id="pause_svg" class="hidden"></svg>
      <div id="current_time">00:00</div>
    `

    player = new Player()

    // Replace functiosn and properties with mocks for testing
    player.playerRef.play = jest.fn().mockImplementation(() => {
      mockPaused = false
      player.playerRef.dispatchEvent(new Event('play'))
    })

    player.playerRef.pause = jest.fn().mockImplementation(() => {
      mockPaused = true
      player.playerRef.dispatchEvent(new Event('pause'))
    })

    Object.defineProperty(player.playerRef, 'paused', {
      get: () => mockPaused,
      configurable: true,
    })
  })

  test('should properly toggle play and pause', () => {
    // initial state testing
    expect(player.playerRef.paused).toBe(true)
    expect(player.playSvgRef.classList.contains('hidden')).toBe(false)
    expect(player.pauseSvgRef.classList.contains('hidden')).toBe(true)

    // play
    player.buttonRef.click()

    // should be playing
    expect(player.playerRef.play).toHaveBeenCalled()
    expect(player.playerRef.paused).toBe(false)
    expect(player.playSvgRef.classList.contains('hidden')).toBe(true)
    expect(player.pauseSvgRef.classList.contains('hidden')).toBe(false)

    // pause
    player.buttonRef.click()

    // Should now be paused
    expect(player.playerRef.pause).toHaveBeenCalled()
    expect(player.playerRef.paused).toBe(true)
    expect(player.playSvgRef.classList.contains('hidden')).toBe(false)
    expect(player.pauseSvgRef.classList.contains('hidden')).toBe(true)
  })

  describe('Progress Indication', () => {
    test('should update time label when video time updates', () => {
      // Mock current time
      Object.defineProperty(player.playerRef, 'currentTime', {
        get: jest.fn().mockReturnValue(4.35),
        configurable: true,
      })

      player.playerRef.dispatchEvent(new Event('timeupdate'))
      expect(player.currentTimeRef.textContent).toBe('00:04')
    })
  })

  describe('updateButton', () => {
    test('should show correct icons based on video state', () => {
      // Test paused state
      mockPaused = true
      player.updateButton()
      expect(player.playSvgRef.classList.contains('hidden')).toBe(false)
      expect(player.pauseSvgRef.classList.contains('hidden')).toBe(true)

      // Test playing state
      mockPaused = false
      player.updateButton()
      expect(player.playSvgRef.classList.contains('hidden')).toBe(true)
      expect(player.pauseSvgRef.classList.contains('hidden')).toBe(false)
    })
  })

  describe('cleanup', () => {
    test('should abort all event listeners when cleanup is called', () => {
      // Mock abort function
      player.abortController.abort = jest.fn()

      // Call cleanup
      player.cleanup()

      // Verify abort was called
      expect(player.abortController.abort).toHaveBeenCalled()

      // Try to trigger events after cleanup to verify they don't work
      player.buttonRef.click()
      player.playerRef.dispatchEvent(new Event('play'))
      player.playerRef.dispatchEvent(new Event('timeupdate'))

      // These should not have been called after cleanup
      expect(player.playerRef.play).not.toHaveBeenCalled()
      expect(player.currentTimeRef.textContent).toBe('00:00') // Time shouldn't update
    })
  })
})

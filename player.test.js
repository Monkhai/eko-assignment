require('./player.js')
/**
 * @jest-environment jsdom
 */

describe('Player', () => {
  // Setup a minimal test environment
  beforeEach(() => {
    // Create the minimal HTML structure needed
    document.body.innerHTML = `
      <video id="player"></video>
      <button id="play_button"></button>
      <svg id="play_svg" class="hidden"></svg>
      <svg id="pause_svg"></svg>
      <div id="current_time">00:00</div>
    `
  })

  test('Player should initialize without errors', () => {
    // Create a new Player instance
    const player = new Player()

    // Verify that the player instance exists
    expect(player).toBeDefined()

    // Verify that it found the elements
    expect(player.playerRef).not.toBeNull()
    expect(player.buttonRef).not.toBeNull()
  })
})

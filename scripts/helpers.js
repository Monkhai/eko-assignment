/**
 * Converts seconds into a MM:SS formatted string
 * @param {number} seconds - The time in seconds to format
 * @returns {string} Time formatted as "MM:SS"
 */
export function formatSecondsToTimestamp(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const paddedSeconds = remainingSeconds.toString().padStart(2, '0')
  const paddedMinutes = minutes.toString().padStart(2, '0')
  return `${paddedMinutes}:${paddedSeconds}`
}

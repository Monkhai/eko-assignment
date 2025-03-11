import { beforeEach, describe, test } from 'vitest'
import { storage } from '../scripts/storage.js'

describe('Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should initialize the storage properly', () => {
    expect(storage).toBeDefined()
  })

  test('storage.set and storage.get', () => {
    storage.set('test', 'test')
    expect(storage.get('test')).toBe('test')
  })

  test('storage.remove', () => {
    storage.set('test', 'test')
    storage.remove('test')
    expect(storage.get('test')).toBeNull()
  })
})

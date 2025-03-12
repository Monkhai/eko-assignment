import { get, ref, remove } from 'firebase/database'
import { beforeEach, describe, expect, vi } from 'vitest'
import { DB } from '../scripts/db.js'
import { storage } from '../scripts/storage.js'
import { db } from '../firebase.js'

describe('DB', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const r = ref(db, 'videos')
    await remove(r)
  })

  test('should initialize the db properly', () => {
    const d = createDB()
    expect(d).toBeDefined()
  })

  test('add like', async () => {
    const d = createDB()
    const dbName = 'video1'
    await d.handleLikeVideo(dbName)
    const r = ref(db, `videos/${dbName}/stats/likes`)
    const snapshot = await get(r)
    expect(snapshot.val()).toBe(1)
  })

  test('add dislike', async () => {
    const d = createDB()
    const dbName = 'video1'
    await d.handleDislikeVideo(dbName)
    const r = ref(db, `videos/${dbName}/stats/dislikes`)
    const snapshot = await get(r)
    expect(snapshot.val()).toBe(1)
  })

  test('update views', async () => {
    const d = createDB()
    const dbName = 'video1'
    await d.handleUpdateViews(dbName)
    const r = ref(db, `videos/${dbName}/stats/views`)
    const snapshot = await get(r)
    expect(snapshot.val()).toBe(1)
  })
})

function createDB() {
  const abortController = new AbortController()
  return new DB(db, storage, abortController.signal)
}

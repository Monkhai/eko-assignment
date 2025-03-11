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
    const abortController = new AbortController()
    const d = new DB(abortController, db, storage)
    expect(d).toBeDefined()
  })

  test('add like', async () => {
    const abortController = new AbortController()
    const d = new DB(abortController, db, storage)
    const dbName = 'video1'
    await d.handleLikeVideo(dbName)
    const r = ref(db, `videos/${dbName}/stats/likes`)
    const snapshot = await get(r)
    expect(snapshot.val()).toBe(1)
  })

  test('add dislike', async () => {
    const abortController = new AbortController()
    const d = new DB(abortController, db, storage)
    const dbName = 'video1'
    await d.handleDislikeVideo(dbName)
    const r = ref(db, `videos/${dbName}/stats/dislikes`)
    const snapshot = await get(r)
    expect(snapshot.val()).toBe(1)
  })

  test('update views', async () => {
    const abortController = new AbortController()
    const d = new DB(abortController, db, storage)
    const dbName = 'video1'
    await d.handleUpdateViews(dbName)
    const r = ref(db, `videos/${dbName}/stats/views`)
    const snapshot = await get(r)
    expect(snapshot.val()).toBe(1)
  })
})

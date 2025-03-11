import { beforeEach, describe, expect, vi } from 'vitest'
import { DB } from './db.js'
import { storage, Storage } from './storage.js'
import { db } from './firebase.js'
import { get, ref, remove } from 'firebase/database'

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
    await d.updateViews(dbName)
    const r = ref(db, `videos/${dbName}/stats/views`)
    const snapshot = await get(r)
    expect(snapshot.val()).toBe(1)
  })
})

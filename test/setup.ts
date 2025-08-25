import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { afterEach, beforeEach } from 'vitest'

// Helper to clean up databases before and after each test
beforeEach(async () => {
  // Create a fresh IndexedDB instance for each test
  globalThis.indexedDB = new IDBFactory()
})

afterEach(async () => {
  // Clean up all databases
  if (globalThis.indexedDB && typeof globalThis.indexedDB.databases === 'function') {
    const databases = await globalThis.indexedDB.databases()
    for (const db of databases) {
      if (db.name) {
        globalThis.indexedDB.deleteDatabase(db.name)
      }
    }
  }
})
import type { Schema, KeyPathConfig } from '../types'

export class ConnectionManager {
  private db: IDBDatabase | null = null
  private readonly dbName: string
  private readonly schema: Schema
  private upgradeCallback?: (db: IDBDatabase, oldVersion: number, newVersion: number) => void
  private blockedCallback?: () => void
  private versionChangeCallback?: () => void

  constructor(
    dbName: string,
    schema: Schema,
    callbacks?: {
      onUpgrade?: (db: IDBDatabase, oldVersion: number, newVersion: number) => void
      onBlocked?: () => void
      onVersionChange?: () => void
    }
  ) {
    this.dbName = dbName
    this.schema = schema
    this.upgradeCallback = callbacks?.onUpgrade
    this.blockedCallback = callbacks?.onBlocked
    this.versionChangeCallback = callbacks?.onVersionChange
  }

  async connect(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.schema.version)

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        
        this.db.onversionchange = () => {
          this.versionChangeCallback?.()
          this.db?.close()
          this.db = null
        }

        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = request.result
        const oldVersion = event.oldVersion
        const newVersion = event.newVersion || this.schema.version

        this.performMigration(db, oldVersion, newVersion)
        
        this.upgradeCallback?.(db, oldVersion, newVersion)
      }

      request.onblocked = () => {
        this.blockedCallback?.()
      }
    })
  }

  private performMigration(db: IDBDatabase, oldVersion: number, newVersion: number): void {
    const existingStores = Array.from(db.objectStoreNames)
    
    // Delete stores that no longer exist in schema
    for (const storeName of existingStores) {
      if (!this.schema.stores[storeName]) {
        db.deleteObjectStore(storeName)
      }
    }

    for (const [storeName, storeConfig] of Object.entries(this.schema.stores)) {
      let store: IDBObjectStore
      
      const keyPath = this.getKeyPath(storeConfig['@@id'])
      const autoIncrement = this.getAutoIncrement(storeConfig['@@id'])

      if (!db.objectStoreNames.contains(storeName)) {
        // Create new store
        store = db.createObjectStore(storeName, {
          keyPath,
          autoIncrement,
        })
      } else {
        // Get existing store from the upgrade transaction
        const transaction = (event.target as IDBOpenDBRequest).transaction
        if (!transaction) continue
        store = transaction.objectStore(storeName)
        
        // Clear existing indexes
        const existingIndexes = Array.from(store.indexNames)
        for (const indexName of existingIndexes) {
          store.deleteIndex(indexName)
        }
      }

      // Create regular indexes
      const indexes = storeConfig['@@indexes'] || []
      for (const indexName of indexes) {
        if (!store.indexNames.contains(indexName)) {
          store.createIndex(indexName, indexName, { unique: false })
        }
      }

      // Create unique indexes
      const uniqueIndexes = storeConfig['@@uniqueIndexes'] || []
      for (const indexName of uniqueIndexes) {
        if (!store.indexNames.contains(indexName)) {
          store.createIndex(indexName, indexName, { unique: true })
        }
      }
    }
  }

  private getKeyPath(idConfig: string | KeyPathConfig): string {
    return typeof idConfig === 'string' ? idConfig : idConfig.keyPath
  }

  private getAutoIncrement(idConfig: string | KeyPathConfig): boolean {
    return typeof idConfig === 'object' ? idConfig.autoIncrement ?? false : false
  }

  async getDatabase(): Promise<IDBDatabase> {
    if (!this.db) {
      return this.connect()
    }
    return this.db
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}
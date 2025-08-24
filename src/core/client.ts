import type { 
  KengoClient, 
  KengoConfig, 
  Schema, 
  TransactionOptions,
  InferSchemaStores 
} from '../types'
import { ConnectionManager } from './connection'
import { StoreOperationsImpl } from '../operations/store'

export class Kengo<T extends Schema> implements KengoClient<T> {
  private connectionManager: ConnectionManager
  private stores: Map<string, StoreOperationsImpl<any>> = new Map()
  [key: string]: any

  constructor(config: KengoConfig<T>) {
    this.connectionManager = new ConnectionManager(
      config.name,
      config.schema,
      {
        onUpgrade: config.onUpgrade,
        onBlocked: config.onBlocked,
        onVersionChange: config.onVersionChange,
      }
    )

    this.initializeStores(config.schema)
  }

  private initializeStores(schema: T): void {
    for (const storeName of Object.keys(schema.stores)) {
      const storeOps = new StoreOperationsImpl(
        storeName,
        () => this.connectionManager.getDatabase()
      )
      
      this.stores.set(storeName, storeOps)
      
      Object.defineProperty(this, storeName, {
        get: () => storeOps,
        enumerable: true,
        configurable: false,
      })
    }
  }

  async $transaction<R>(
    fn: (tx: KengoClient<T>) => Promise<R>,
    options?: TransactionOptions
  ): Promise<R> {
    const db = await this.connectionManager.getDatabase()
    const storeNames = Array.from(this.stores.keys())
    
    return new Promise(async (resolve, reject) => {
      const transaction = db.transaction(storeNames, 'readwrite')
      
      const transactionalClient = this.createTransactionalClient(transaction)
      
      const timeoutId = options?.timeout
        ? setTimeout(() => {
            transaction.abort()
            reject(new Error('Transaction timeout'))
          }, options.timeout)
        : null

      transaction.oncomplete = () => {
        if (timeoutId) clearTimeout(timeoutId)
      }

      transaction.onerror = () => {
        if (timeoutId) clearTimeout(timeoutId)
        reject(new Error(`Transaction failed: ${transaction.error?.message}`))
      }

      transaction.onabort = () => {
        if (timeoutId) clearTimeout(timeoutId)
        reject(new Error('Transaction aborted'))
      }

      try {
        const result = await fn(transactionalClient as KengoClient<T>)
        resolve(result)
      } catch (error) {
        transaction.abort()
        reject(error)
      }
    })
  }

  private createTransactionalClient(transaction: IDBTransaction): KengoClient<T> {
    const client = Object.create(this)
    
    for (const [storeName, storeOps] of this.stores) {
      const transactionalStore = new StoreOperationsImpl(
        storeName,
        async () => {
          return transaction.db
        }
      )
      
      Object.defineProperty(client, storeName, {
        get: () => transactionalStore,
        enumerable: true,
        configurable: false,
      })
    }

    client.$transaction = async () => {
      throw new Error('Nested transactions are not supported')
    }

    return client
  }

  async $getRawDB(): Promise<IDBDatabase> {
    return this.connectionManager.getDatabase()
  }

  async $disconnect(): Promise<void> {
    await this.connectionManager.disconnect()
  }
}
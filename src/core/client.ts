import type { 
  KengoClient, 
  KengoConfig, 
  Schema, 
  TransactionOptions
} from '../types'
import { ConnectionManager } from './connection'
import { StoreOperationsImpl } from '../operations/store'
import { TransactionalStoreOperations } from '../operations/transaction-store'

export class Kengo<T extends Schema> {
  private connectionManager: ConnectionManager
  private stores: Map<string, StoreOperationsImpl<any>> = new Map()

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
      
      ;(this as any)[storeName] = storeOps
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
    const client = {} as any
    
    for (const [storeName] of this.stores) {
      const transactionalStore = new TransactionalStoreOperations(
        storeName,
        transaction
      )
      
      client[storeName] = transactionalStore
    }

    client.$transaction = async () => {
      throw new Error('Nested transactions are not supported')
    }
    
    client.$getRawDB = async () => {
      return transaction.db
    }
    
    client.$disconnect = async () => {
      throw new Error('Cannot disconnect within a transaction')
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
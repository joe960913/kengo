import type {
  StoreOperations,
  CreateOptions,
  CreateManyOptions,
  FindUniqueOptions,
  FindFirstOptions,
  FindManyOptions,
  UpdateOptions,
  UpdateManyOptions,
  DeleteOptions,
  DeleteManyOptions,
  UpsertOptions,
  SelectInput,
  StoreDefinition,
} from '../types'
import { QueryBuilder } from '../core/query-builder'
import { BaseStoreOperations } from './base-store'

export class StoreOperationsImpl<T> extends BaseStoreOperations implements StoreOperations<T> {
  constructor(
    private readonly storeName: string,
    private readonly getDB: () => Promise<IDBDatabase>,
    private readonly storeDefinition?: StoreDefinition
  ) {
    super()
  }

  async create<S extends SelectInput<T> = never>(
    options: CreateOptions<T> & { select?: S }
  ): Promise<any> {
    const db = await this.getDB()
    const transaction = db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)

    return new Promise((resolve, reject) => {
      const request = store.add(options.data)

      request.onsuccess = async () => {
        const key = request.result
        const getRequest = store.get(key)
        
        getRequest.onsuccess = () => {
          const result = getRequest.result
          if (options.select) {
            resolve(QueryBuilder.applySelect(result, options.select))
          } else {
            resolve(result)
          }
        }
        
        getRequest.onerror = () => reject(getRequest.error)
      }

      request.onerror = () => reject(request.error)
    })
  }

  async createMany(options: CreateManyOptions<T>): Promise<{ count: number }> {
    const db = await this.getDB()
    const transaction = db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)

    let count = 0
    const promises: Promise<void>[] = []

    // Get unique indexes from store definition
    const uniqueIndexes = this.storeDefinition?.['@@uniqueIndexes'] || []

    for (const item of options.data) {
      promises.push(
        new Promise<void>(async (resolve, reject) => {
          // Check for duplicates on unique indexes if skipDuplicates is true
          if (options.skipDuplicates && uniqueIndexes.length > 0) {
            for (const indexName of uniqueIndexes) {
              const indexValue = (item as any)[indexName]
              if (indexValue !== undefined) {
                const index = store.index(indexName)
                const checkRequest = index.get(indexValue)
                
                await new Promise<void>((checkResolve) => {
                  checkRequest.onsuccess = () => {
                    if (checkRequest.result) {
                      // Duplicate found, skip this item
                      resolve()
                      return
                    }
                    checkResolve()
                  }
                  checkRequest.onerror = () => checkResolve()
                })
                
                // If we resolved early due to duplicate, exit
                if (checkRequest.result) return
              }
            }
          }

          const request = store.add(item)
          request.onsuccess = () => {
            count++
            resolve()
          }
          request.onerror = () => {
            if (options.skipDuplicates) {
              // Don't increment count for skipped duplicates
              resolve()
            } else {
              reject(request.error)
            }
          }
        })
      )
    }

    await Promise.all(promises)
    return { count }
  }

  async findUnique<S extends SelectInput<T> = never>(
    options: FindUniqueOptions<T> & { select?: S }
  ): Promise<any> {
    const db = await this.getDB()
    const transaction = db.transaction([this.storeName], 'readonly')
    const store = transaction.objectStore(this.storeName)

    const keys = Object.keys(options.where)
    if (keys.length !== 1) {
      throw new Error('findUnique requires exactly one key in where clause')
    }

    const [key] = keys
    const value = (options.where as any)[key]

    return new Promise((resolve, reject) => {
      let request: IDBRequest

      if (key === store.keyPath) {
        request = store.get(value)
      } else if (store.indexNames.contains(key)) {
        const index = store.index(key)
        request = index.get(value)
      } else {
        reject(new Error(`No index found for key: ${key}`))
        return
      }

      request.onsuccess = () => {
        const result = request.result || null
        if (result && options.select) {
          resolve(QueryBuilder.applySelect(result, options.select))
        } else {
          resolve(result)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  async findFirst<S extends SelectInput<T> = never>(
    options?: FindFirstOptions<T> & { select?: S }
  ): Promise<any> {
    const results = await this.findMany({
      ...options,
      take: 1,
    })
    return results[0] || null
  }

  async findMany<S extends SelectInput<T> = never>(
    options?: FindManyOptions<T> & { select?: S }
  ): Promise<any[]> {
    const db = await this.getDB()
    const transaction = db.transaction([this.storeName], 'readonly')
    const store = transaction.objectStore(this.storeName)

    return new Promise((resolve, reject) => {
      const request = store.getAll()

      request.onsuccess = () => {
        let results = request.result as T[]

        if (options?.where) {
          const filter = QueryBuilder.buildWhereFilter(options.where)
          results = results.filter(filter)
        }

        if (options?.orderBy) {
          const comparator = QueryBuilder.buildOrderComparator(options.orderBy)
          results.sort(comparator)
        }

        if (options?.skip) {
          results = results.slice(options.skip)
        }

        if (options?.take) {
          results = results.slice(0, options.take)
        }

        if (options?.select) {
          results = results.map(item => QueryBuilder.applySelect(item, options.select))
        }

        resolve(results)
      }

      request.onerror = () => reject(request.error)
    })
  }

  async update<S extends SelectInput<T> = never>(
    options: UpdateOptions<T> & { select?: S }
  ): Promise<any> {
    const existing = await this.findUnique({ where: options.where })
    if (!existing) {
      throw new Error('Record not found')
    }

    const updated = this.applyUpdate(existing, options.data)

    const db = await this.getDB()
    const transaction = db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)

    return new Promise((resolve, reject) => {
      const request = store.put(updated)

      request.onsuccess = () => {
        if (options.select) {
          resolve(QueryBuilder.applySelect(updated, options.select))
        } else {
          resolve(updated)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  async updateMany(options: UpdateManyOptions<T>): Promise<{ count: number }> {
    const records = await this.findMany({ where: options.where })
    
    const db = await this.getDB()
    const transaction = db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)

    let count = 0
    const promises: Promise<void>[] = []

    for (const record of records) {
      const updated = this.applyUpdate(record, options.data)
      
      promises.push(
        new Promise<void>((resolve, reject) => {
          const request = store.put(updated)
          request.onsuccess = () => {
            count++
            resolve()
          }
          request.onerror = () => reject(request.error)
        })
      )
    }

    await Promise.all(promises)
    return { count }
  }

  async delete<S extends SelectInput<T> = never>(
    options: DeleteOptions<T> & { select?: S }
  ): Promise<any> {
    const existing = await this.findUnique({ where: options.where })
    if (!existing) {
      throw new Error('Record not found')
    }

    const db = await this.getDB()
    const transaction = db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)

    const keys = Object.keys(options.where)
    const [key] = keys
    const value = (options.where as any)[key]

    return new Promise((resolve, reject) => {
      const request = store.delete(value)

      request.onsuccess = () => {
        if (options.select) {
          resolve(QueryBuilder.applySelect(existing, options.select))
        } else {
          resolve(existing)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  async deleteMany(options?: DeleteManyOptions<T>): Promise<{ count: number }> {
    const records = await this.findMany({ where: options?.where })
    
    const db = await this.getDB()
    const transaction = db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)

    let count = 0
    const promises: Promise<void>[] = []

    for (const record of records) {
      const keyPath = store.keyPath as keyof T
      const key = record[keyPath]
      
      promises.push(
        new Promise<void>((resolve, reject) => {
          const request = store.delete(key as any)
          request.onsuccess = () => {
            count++
            resolve()
          }
          request.onerror = () => reject(request.error)
        })
      )
    }

    await Promise.all(promises)
    return { count }
  }

  async upsert<S extends SelectInput<T> = never>(
    options: UpsertOptions<T> & { select?: S }
  ): Promise<any> {
    const existing = await this.findUnique({ where: options.where })

    if (existing) {
      return this.update({
        where: options.where,
        data: options.update,
        select: options.select,
      })
    } else {
      return this.create({
        data: options.create,
        select: options.select,
      })
    }
  }

  async count(options?: { where?: FindManyOptions<T>['where'] }): Promise<number> {
    const results = await this.findMany({ where: options?.where })
    return results.length
  }
}
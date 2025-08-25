import type { Schema, InferSchemaStores } from './schema'
import type {
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
  SelectedFields,
  SelectInput,
} from './operations'

export interface StoreOperations<T> {
  create<S extends SelectInput<T> = never>(
    options: CreateOptions<T> & { select?: S },
  ): Promise<S extends SelectInput<T> ? SelectedFields<T, S> : T>

  createMany(options: CreateManyOptions<T>): Promise<{ count: number }>

  findUnique<S extends SelectInput<T> = never>(
    options: FindUniqueOptions<T> & { select?: S },
  ): Promise<(S extends SelectInput<T> ? SelectedFields<T, S> : T) | null>

  findFirst<S extends SelectInput<T> = never>(
    options?: FindFirstOptions<T> & { select?: S },
  ): Promise<(S extends SelectInput<T> ? SelectedFields<T, S> : T) | null>

  findMany<S extends SelectInput<T> = never>(
    options?: FindManyOptions<T> & { select?: S },
  ): Promise<Array<S extends SelectInput<T> ? SelectedFields<T, S> : T>>

  update<S extends SelectInput<T> = never>(
    options: UpdateOptions<T> & { select?: S },
  ): Promise<S extends SelectInput<T> ? SelectedFields<T, S> : T>

  updateMany(options: UpdateManyOptions<T>): Promise<{ count: number }>

  delete<S extends SelectInput<T> = never>(
    options: DeleteOptions<T> & { select?: S },
  ): Promise<S extends SelectInput<T> ? SelectedFields<T, S> : T>

  deleteMany(options?: DeleteManyOptions<T>): Promise<{ count: number }>

  upsert<S extends SelectInput<T> = never>(
    options: UpsertOptions<T> & { select?: S },
  ): Promise<S extends SelectInput<T> ? SelectedFields<T, S> : T>

  count(options?: { where?: FindManyOptions<T>['where'] }): Promise<number>
}

export type KengoClient<T extends Schema> = {
  [K in keyof InferSchemaStores<T>]: StoreOperations<InferSchemaStores<T>[K]>
} & {
  $transaction: <R>(
    fn: (tx: KengoClient<T>) => Promise<R>,
    options?: TransactionOptions,
  ) => Promise<R>
  $getRawDB: () => Promise<IDBDatabase>
  $disconnect: () => Promise<void>
}

export interface TransactionOptions {
  maxWait?: number
  timeout?: number
  isolationLevel?: 'readcommitted' | 'repeatableread'
}

export interface KengoConfig<T extends Schema> {
  name: string
  schema: T
  onUpgrade?: (db: IDBDatabase, oldVersion: number, newVersion: number) => void
  onBlocked?: () => void
  onVersionChange?: () => void
}

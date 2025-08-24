export interface KeyPathConfig {
  keyPath: string
  autoIncrement?: boolean
}

export type KeyPath = string | KeyPathConfig

export interface StoreDefinition {
  '@@id': KeyPath
  '@@indexes'?: string[]
  '@@uniqueIndexes'?: string[]
  [key: string]: any
}

export interface SchemaDefinition {
  version: number
  stores: Record<string, StoreDefinition>
}

export interface Schema<T extends SchemaDefinition = SchemaDefinition> {
  version: T['version']
  stores: T['stores']
}

export type InferStoreType<T extends StoreDefinition> = Omit<
  T,
  '@@id' | '@@indexes' | '@@uniqueIndexes'
>

export type InferSchemaStores<T extends Schema> = {
  [K in keyof T['stores']]: InferStoreType<T['stores'][K]>
}
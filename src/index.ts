export { defineSchema } from './core/schema'
export { Kengo } from './core/client'

export type {
  Schema,
  SchemaDefinition,
  StoreDefinition,
  KeyPath,
  KeyPathConfig,
  InferStoreType,
  InferSchemaStores,
} from './types/schema'

export type {
  WhereInput,
  WhereCondition,
  OrderDirection,
  OrderByInput,
  SelectInput,
  SelectedFields,
  FindManyOptions,
  FindFirstOptions,
  FindUniqueOptions,
  CreateOptions,
  CreateManyOptions,
  UpdateOptions,
  UpdateManyOptions,
  DeleteOptions,
  DeleteManyOptions,
  UpsertOptions,
  AtomicOperations,
} from './types/operations'

export type { KengoClient, KengoConfig, StoreOperations, TransactionOptions } from './types/client'

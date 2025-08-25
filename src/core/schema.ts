import type { Schema, SchemaDefinition } from '../types'

export function defineSchema<T extends SchemaDefinition>(definition: T): Schema<T> {
  if (!definition.version || typeof definition.version !== 'number' || definition.version < 1) {
    throw new Error('Schema version must be a positive integer')
  }

  if (!definition.stores || typeof definition.stores !== 'object') {
    throw new Error('Schema must define stores')
  }

  for (const [storeName, storeDefinition] of Object.entries(definition.stores)) {
    if (!storeDefinition['@@id']) {
      throw new Error(`Store "${storeName}" must define @@id`)
    }

    const idConfig = storeDefinition['@@id']
    if (typeof idConfig !== 'string' && typeof idConfig !== 'object') {
      throw new Error(`Store "${storeName}" @@id must be a string or object`)
    }

    if (typeof idConfig === 'object' && !idConfig.keyPath) {
      throw new Error(`Store "${storeName}" @@id object must have keyPath`)
    }
  }

  return {
    version: definition.version,
    stores: definition.stores,
  }
}

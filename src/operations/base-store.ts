import type { AtomicOperations } from '../types'

export abstract class BaseStoreOperations {
  protected applyUpdate<T>(existing: T, updates: Partial<T> & AtomicOperations<T>): T {
    const result = { ...existing }

    for (const [key, value] of Object.entries(updates)) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !('getTime' in value)) {
        const currentValue = (result as any)[key]

        if ('increment' in value && typeof currentValue === 'number') {
          const atomicOp = value as { increment?: number }
          if (atomicOp.increment !== undefined) {
            ;(result as any)[key] = currentValue + atomicOp.increment
          }
        } else if ('decrement' in value && typeof currentValue === 'number') {
          const atomicOp = value as { decrement?: number }
          if (atomicOp.decrement !== undefined) {
            ;(result as any)[key] = currentValue - atomicOp.decrement
          }
        } else if ('multiply' in value && typeof currentValue === 'number') {
          const atomicOp = value as { multiply?: number }
          if (atomicOp.multiply !== undefined) {
            ;(result as any)[key] = currentValue * atomicOp.multiply
          }
        } else if ('divide' in value && typeof currentValue === 'number') {
          const atomicOp = value as { divide?: number }
          if (atomicOp.divide !== undefined && atomicOp.divide !== 0) {
            ;(result as any)[key] = currentValue / atomicOp.divide
          }
        }
      } else {
        ;(result as any)[key] = value
      }
    }

    return result
  }
}

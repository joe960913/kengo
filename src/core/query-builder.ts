import type { WhereInput, WhereCondition, OrderByInput } from '../types'

export class QueryBuilder {
  static buildWhereFilter<T>(where: WhereInput<T>): (item: T) => boolean {
    return (item: T) => {
      for (const [key, condition] of Object.entries(where)) {
        const value = item[key as keyof T]

        if (condition === undefined) continue

        if (typeof condition === 'object' && condition !== null && !Array.isArray(condition)) {
          const whereCondition = condition as WhereCondition<any>

          if (!this.evaluateCondition(value, whereCondition)) {
            return false
          }
        } else {
          if (value !== condition) {
            return false
          }
        }
      }
      return true
    }
  }

  private static evaluateCondition<V>(value: V, condition: WhereCondition<V>): boolean {
    if ('equals' in condition && condition.equals !== undefined) {
      return value === condition.equals
    }

    if ('not' in condition && condition.not !== undefined) {
      return value !== condition.not
    }

    if ('in' in condition && condition.in !== undefined) {
      return condition.in.includes(value)
    }

    if ('notIn' in condition && condition.notIn !== undefined) {
      return !condition.notIn.includes(value)
    }

    if (typeof value === 'number' && typeof condition === 'object') {
      if ('gt' in condition && condition.gt !== undefined && condition.gt !== null) {
        if (value <= (condition.gt as number)) return false
      }
      if ('gte' in condition && condition.gte !== undefined && condition.gte !== null) {
        if (value < (condition.gte as number)) return false
      }
      if ('lt' in condition && condition.lt !== undefined && condition.lt !== null) {
        if (value >= (condition.lt as number)) return false
      }
      if ('lte' in condition && condition.lte !== undefined && condition.lte !== null) {
        if (value > (condition.lte as number)) return false
      }
    }

    if (typeof value === 'string' && typeof condition === 'object') {
      if ('contains' in condition && condition.contains !== undefined) {
        if (!value.includes(condition.contains)) return false
      }
      if ('startsWith' in condition && condition.startsWith !== undefined) {
        if (!value.startsWith(condition.startsWith)) return false
      }
      if ('endsWith' in condition && condition.endsWith !== undefined) {
        if (!value.endsWith(condition.endsWith)) return false
      }
    }

    return true
  }

  static buildOrderComparator<T>(orderBy: OrderByInput<T>): (a: T, b: T) => number {
    const orderArray = Array.isArray(orderBy) ? orderBy : [orderBy]

    return (a: T, b: T) => {
      for (const orderItem of orderArray) {
        for (const [key, direction] of Object.entries(orderItem)) {
          const aVal = a[key as keyof T]
          const bVal = b[key as keyof T]

          if (aVal === bVal) continue

          const comparison = aVal < bVal ? -1 : 1
          return direction === 'asc' ? comparison : -comparison
        }
      }
      return 0
    }
  }

  static applySelect<T, S>(item: T, select: S): any {
    const result: any = {}
    for (const [key, include] of Object.entries(select as any)) {
      if (include === true && key in (item as any)) {
        result[key] = (item as any)[key]
      }
    }
    return result
  }
}

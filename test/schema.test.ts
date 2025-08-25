import { describe, it, expect } from 'vitest'
import { defineSchema } from '../src'

describe('defineSchema', () => {
  it('should create a valid schema', () => {
    const schema = defineSchema({
      version: 1,
      stores: {
        users: {
          '@@id': 'id',
          '@@indexes': ['email', 'age'],
          '@@uniqueIndexes': ['username'],
        },
      },
    })

    expect(schema.version).toBe(1)
    expect(schema.stores.users).toBeDefined()
    expect(schema.stores.users['@@id']).toBe('id')
  })

  it('should accept auto-increment configuration', () => {
    const schema = defineSchema({
      version: 1,
      stores: {
        posts: {
          '@@id': { keyPath: 'id', autoIncrement: true },
        },
      },
    })

    expect(schema.stores.posts['@@id']).toEqual({
      keyPath: 'id',
      autoIncrement: true,
    })
  })

  it('should throw error for invalid version', () => {
    expect(() => {
      defineSchema({
        version: 0,
        stores: {},
      })
    }).toThrowError('Schema version must be a positive integer')

    expect(() => {
      defineSchema({
        version: -1,
        stores: {},
      })
    }).toThrowError('Schema version must be a positive integer')
  })

  it('should throw error if stores is not defined', () => {
    expect(() => {
      defineSchema({
        version: 1,
        stores: null as any,
      })
    }).toThrowError('Schema must define stores')
  })

  it('should throw error if store does not define @@id', () => {
    expect(() => {
      defineSchema({
        version: 1,
        stores: {
          users: {} as any,
        },
      })
    }).toThrowError('Store "users" must define @@id')
  })

  it('should throw error for invalid @@id type', () => {
    expect(() => {
      defineSchema({
        version: 1,
        stores: {
          users: {
            '@@id': 123 as any,
          },
        },
      })
    }).toThrowError('Store "users" @@id must be a string or object')
  })

  it('should throw error if @@id object lacks keyPath', () => {
    expect(() => {
      defineSchema({
        version: 1,
        stores: {
          users: {
            '@@id': { autoIncrement: true } as any,
          },
        },
      })
    }).toThrowError('Store "users" @@id object must have keyPath')
  })
})

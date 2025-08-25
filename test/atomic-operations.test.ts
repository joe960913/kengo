import { describe, it, expect, beforeEach } from 'vitest'
import { defineSchema, Kengo } from '../src'

interface Counter {
  id?: number
  name: string
  value: number
  multiplier: number
}

describe('Atomic Operations', () => {
  let db: any

  beforeEach(async () => {
    const schema = defineSchema({
      version: 1,
      stores: {
        counters: {
          '@@id': { keyPath: 'id', autoIncrement: true },
        },
      },
    })

    db = new Kengo({
      name: 'test-atomic-db',
      schema,
    })

    await db.counters.create({
      data: { name: 'TestCounter', value: 100, multiplier: 2 },
    })
  })

  it('should increment value', async () => {
    const counter = await db.counters.findFirst({ where: { name: 'TestCounter' } })

    const updated = await db.counters.update({
      where: { id: counter.id },
      data: { value: { increment: 10 } },
    })

    expect(updated.value).toBe(110)
  })

  it('should decrement value', async () => {
    const counter = await db.counters.findFirst({ where: { name: 'TestCounter' } })

    const updated = await db.counters.update({
      where: { id: counter.id },
      data: { value: { decrement: 25 } },
    })

    expect(updated.value).toBe(75)
  })

  it('should multiply value', async () => {
    const counter = await db.counters.findFirst({ where: { name: 'TestCounter' } })

    const updated = await db.counters.update({
      where: { id: counter.id },
      data: { value: { multiply: 3 } },
    })

    expect(updated.value).toBe(300)
  })

  it('should divide value', async () => {
    const counter = await db.counters.findFirst({ where: { name: 'TestCounter' } })

    const updated = await db.counters.update({
      where: { id: counter.id },
      data: { value: { divide: 4 } },
    })

    expect(updated.value).toBe(25)
  })

  it('should not divide by zero', async () => {
    const counter = await db.counters.findFirst({ where: { name: 'TestCounter' } })

    const updated = await db.counters.update({
      where: { id: counter.id },
      data: { value: { divide: 0 } },
    })

    // Value should remain unchanged
    expect(updated.value).toBe(100)
  })

  it('should handle multiple atomic operations in updateMany', async () => {
    await db.counters.createMany({
      data: [
        { name: 'Counter1', value: 10, multiplier: 1 },
        { name: 'Counter2', value: 20, multiplier: 2 },
        { name: 'Counter3', value: 30, multiplier: 3 },
      ],
    })

    const result = await db.counters.updateMany({
      where: { value: { lt: 50 } },
      data: { value: { increment: 5 } },
    })

    expect(result.count).toBe(3) // Counter1, Counter2, Counter3

    const counters = await db.counters.findMany({
      where: { name: { in: ['Counter1', 'Counter2', 'Counter3'] } },
    })

    expect(counters[0].value).toBe(15) // 10 + 5
    expect(counters[1].value).toBe(25) // 20 + 5
    expect(counters[2].value).toBe(35) // 30 + 5
  })

  it('should combine atomic operations with regular updates', async () => {
    const counter = await db.counters.findFirst({ where: { name: 'TestCounter' } })

    const updated = await db.counters.update({
      where: { id: counter.id },
      data: {
        name: 'UpdatedCounter',
        value: { increment: 50 },
        multiplier: 5,
      },
    })

    expect(updated.name).toBe('UpdatedCounter')
    expect(updated.value).toBe(150) // 100 + 50
    expect(updated.multiplier).toBe(5)
  })

  it('should work in transactions', async () => {
    await db.$transaction(async (tx: any) => {
      const counter = await tx.counters.findFirst({ where: { name: 'TestCounter' } })

      await tx.counters.update({
        where: { id: counter.id },
        data: { value: { increment: 10 } },
      })

      await tx.counters.update({
        where: { id: counter.id },
        data: { value: { multiply: 2 } },
      })

      await tx.counters.update({
        where: { id: counter.id },
        data: { value: { decrement: 20 } },
      })
    })

    const counter = await db.counters.findFirst({ where: { name: 'TestCounter' } })
    expect(counter.value).toBe(200) // ((100 + 10) * 2) - 20
  })
})

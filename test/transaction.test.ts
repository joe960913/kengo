import { describe, it, expect, beforeEach } from 'vitest'
import { defineSchema, Kengo } from '../src'

interface Account {
  id?: number
  name: string
  balance: number
}

describe('Transactions', () => {
  let db: any

  beforeEach(async () => {
    const schema = defineSchema({
      version: 1,
      stores: {
        accounts: {
          '@@id': { keyPath: 'id', autoIncrement: true },
        },
        transactions: {
          '@@id': { keyPath: 'id', autoIncrement: true },
          '@@indexes': ['fromAccountId', 'toAccountId'],
        },
      },
    })

    db = new Kengo({
      name: 'test-transaction-db',
      schema,
    })

    // Create test accounts
    await db.accounts.createMany({
      data: [
        { name: 'Alice', balance: 1000 },
        { name: 'Bob', balance: 500 },
        { name: 'Charlie', balance: 200 },
      ],
    })
  })

  it('should execute transaction successfully', async () => {
    const result = await db.$transaction(async (tx: any) => {
      const alice = await tx.accounts.findFirst({ where: { name: 'Alice' } })
      const bob = await tx.accounts.findFirst({ where: { name: 'Bob' } })

      // Transfer 100 from Alice to Bob
      await tx.accounts.update({
        where: { id: alice.id },
        data: { balance: { decrement: 100 } },
      })

      await tx.accounts.update({
        where: { id: bob.id },
        data: { balance: { increment: 100 } },
      })

      await tx.transactions.create({
        data: {
          fromAccountId: alice.id,
          toAccountId: bob.id,
          amount: 100,
          timestamp: new Date(),
        },
      })

      return { success: true, amount: 100 }
    })

    expect(result).toEqual({ success: true, amount: 100 })

    // Verify the changes
    const alice = await db.accounts.findFirst({ where: { name: 'Alice' } })
    const bob = await db.accounts.findFirst({ where: { name: 'Bob' } })
    expect(alice.balance).toBe(900)
    expect(bob.balance).toBe(600)
  })

  it('should rollback transaction on error', async () => {
    const initialAlice = await db.accounts.findFirst({ where: { name: 'Alice' } })
    const initialBob = await db.accounts.findFirst({ where: { name: 'Bob' } })

    await expect(
      db.$transaction(async (tx: any) => {
        await tx.accounts.update({
          where: { id: initialAlice.id },
          data: { balance: { decrement: 100 } },
        })

        // This should cause an error
        throw new Error('Transaction failed!')
      }),
    ).rejects.toThrowError('Transaction failed!')

    // Verify no changes were made
    const alice = await db.accounts.findFirst({ where: { name: 'Alice' } })
    const bob = await db.accounts.findFirst({ where: { name: 'Bob' } })
    expect(alice.balance).toBe(1000)
    expect(bob.balance).toBe(500)
  })

  it('should handle complex transaction with multiple operations', async () => {
    await db.$transaction(async (tx: any) => {
      // Get all accounts
      const accounts = await tx.accounts.findMany()

      // Update all balances
      for (const account of accounts) {
        await tx.accounts.update({
          where: { id: account.id },
          data: { balance: { multiply: 1.1 } }, // 10% interest
        })
      }

      // Create a system transaction record
      await tx.transactions.create({
        data: {
          fromAccountId: 0, // System
          toAccountId: 0, // All accounts
          amount: 0, // Variable amount
          timestamp: new Date(),
        },
      })
    })

    // Verify all balances increased by 10%
    const accounts = await db.accounts.findMany()
    expect(accounts[0].balance).toBeCloseTo(1100, 2) // Alice: 1000 * 1.1
    expect(accounts[1].balance).toBeCloseTo(550, 2) // Bob: 500 * 1.1
    expect(accounts[2].balance).toBeCloseTo(220, 2) // Charlie: 200 * 1.1
  })

  it('should reject nested transactions', async () => {
    await expect(
      db.$transaction(async (tx: any) => {
        await tx.$transaction(async () => {
          // This should not be allowed
        })
      }),
    ).rejects.toThrowError('Nested transactions are not supported')
  })

  it('should provide access to raw database in transaction', async () => {
    await db.$transaction(async (tx: any) => {
      const rawDB = await tx.$getRawDB()
      expect(rawDB).toBeDefined()
      // FDBDatabase is the fake-indexeddb implementation of IDBDatabase
      expect(rawDB.constructor.name).toMatch(/IDBDatabase|FDBDatabase/)
    })
  })

  it('should prevent disconnect within transaction', async () => {
    await expect(
      db.$transaction(async (tx: any) => {
        await tx.$disconnect()
      }),
    ).rejects.toThrowError('Cannot disconnect within a transaction')
  })

  it.skip('should handle transaction timeout', async () => {
    // Skip this test as fake-indexeddb doesn't handle timeouts properly
    await expect(
      db.$transaction(
        async () => {
          // Simulate long-running operation
          await new Promise((resolve) => setTimeout(resolve, 200))
        },
        { timeout: 100 },
      ),
    ).rejects.toThrowError('Transaction timeout')
  })

  it('should ensure atomicity with concurrent operations', async () => {
    await db.$transaction(async (tx: any) => {
      const operations = []

      // Create multiple operations concurrently
      for (let i = 0; i < 10; i++) {
        operations.push(
          tx.transactions.create({
            data: {
              fromAccountId: 1,
              toAccountId: 2,
              amount: 10,
              timestamp: new Date(),
            },
          }),
        )
      }

      await Promise.all(operations)
    })

    // Verify all operations were committed
    const transactions = await db.transactions.findMany()
    expect(transactions).toHaveLength(10)
  })
})

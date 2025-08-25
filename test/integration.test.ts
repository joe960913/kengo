import { describe, it, expect } from 'vitest'
import { defineSchema, Kengo } from '../src'

describe('Kengo Integration Test', () => {
  it('should work end-to-end with all features', async () => {
    // 1. Define schema
    const schema = defineSchema({
      version: 1,
      stores: {
        users: {
          '@@id': { keyPath: 'id', autoIncrement: true },
          '@@indexes': ['email', 'age'],
          '@@uniqueIndexes': ['email'],
        },
        posts: {
          '@@id': { keyPath: 'id', autoIncrement: true },
          '@@indexes': ['userId', 'createdAt'],
        },
      },
    })

    // 2. Create client
    const db = new Kengo({
      name: 'integration-test-db',
      schema,
    })

    // 3. Test CRUD operations
    const user = await db.users.create({
      data: {
        name: 'Alice',
        email: 'alice@test.com',
        age: 25,
      },
    })
    expect(user.id).toBeDefined()
    expect(user.name).toBe('Alice')

    // 4. Test findUnique
    const found = await db.users.findUnique({
      where: { id: user.id },
    })
    expect(found).toMatchObject({
      name: 'Alice',
      email: 'alice@test.com',
    })

    // 5. Test update with atomic operations
    const updated = await db.users.update({
      where: { id: user.id },
      data: { age: { increment: 5 } },
    })
    expect(updated.age).toBe(30)

    // 6. Test createMany
    await db.users.createMany({
      data: [
        { name: 'Bob', email: 'bob@test.com', age: 35 },
        { name: 'Charlie', email: 'charlie@test.com', age: 40 },
      ],
    })

    // 7. Test findMany with where, orderBy, and pagination
    const users = await db.users.findMany({
      where: { age: { gte: 30 } },
      orderBy: { age: 'desc' },
      take: 2,
    })
    expect(users).toHaveLength(2)
    expect(users[0].name).toBe('Charlie')

    // 8. Test transaction
    const result = await db.$transaction(async (tx) => {
      const post = await tx.posts.create({
        data: {
          userId: user.id,
          title: 'Test Post',
          content: 'Content',
          createdAt: new Date(),
        },
      })

      await tx.users.update({
        where: { id: user.id },
        data: { postCount: 1 },
      })

      return post
    })
    expect(result.userId).toBe(user.id)

    // 9. Test select
    const partial = await db.users.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    })
    expect(partial).toHaveProperty('name')
    expect(partial).not.toHaveProperty('age')

    // 10. Test upsert
    const upserted = await db.users.upsert({
      where: { email: 'new@test.com' },
      create: { name: 'New User', email: 'new@test.com', age: 22 },
      update: { age: 23 },
    })
    expect(upserted.name).toBe('New User')
    expect(upserted.age).toBe(22)

    // 11. Test count
    const count = await db.users.count({
      where: { age: { gte: 20 } },
    })
    expect(count).toBeGreaterThan(0)

    // 12. Test deleteMany
    await db.users.deleteMany({
      where: { age: { lt: 25 } },
    })

    // 13. Test raw database access
    const rawDB = await db.$getRawDB()
    expect(rawDB).toBeDefined()

    // 14. Clean up
    await db.$disconnect()
  }, 10000) // Increase timeout for integration test
})
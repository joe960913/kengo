import { describe, it, expect, beforeEach } from 'vitest'
import { defineSchema, Kengo } from '../src'

interface User {
  id?: number
  name: string
  email: string
  age: number
  country?: string
  isActive?: boolean
}

describe('CRUD Operations', () => {
  let db: any

  beforeEach(async () => {
    const schema = defineSchema({
      version: 1,
      stores: {
        users: {
          '@@id': { keyPath: 'id', autoIncrement: true },
          '@@indexes': ['email', 'age', 'country'],
          '@@uniqueIndexes': ['email'],
        },
      },
    })

    db = new Kengo({
      name: 'test-db',
      schema,
    })
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const user = await db.users.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          age: 30,
        },
      })

      expect(user).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      })
      expect(user.id).toBeDefined()
    })

    it('should create with select fields', async () => {
      const user = await db.users.create({
        data: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          age: 25,
        },
        select: {
          id: true,
          name: true,
        },
      })

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('name')
      expect(user).not.toHaveProperty('email')
      expect(user).not.toHaveProperty('age')
    })
  })

  describe('createMany', () => {
    it('should create multiple records', async () => {
      const result = await db.users.createMany({
        data: [
          { name: 'User 1', email: 'user1@test.com', age: 20 },
          { name: 'User 2', email: 'user2@test.com', age: 25 },
          { name: 'User 3', email: 'user3@test.com', age: 30 },
        ],
      })

      expect(result.count).toBe(3)
    })

    it('should skip duplicates when flag is set', async () => {
      await db.users.create({
        data: { name: 'Existing', email: 'existing@test.com', age: 35 },
      })

      const result = await db.users.createMany({
        data: [
          { name: 'New User', email: 'new@test.com', age: 20 },
          { name: 'Duplicate', email: 'existing@test.com', age: 25 },
        ],
        skipDuplicates: true,
      })

      expect(result.count).toBe(1)
    })
  })

  describe('findUnique', () => {
    it('should find record by unique field', async () => {
      const created = await db.users.create({
        data: { name: 'Unique User', email: 'unique@test.com', age: 40 },
      })

      const found = await db.users.findUnique({
        where: { id: created.id },
      })

      expect(found).toMatchObject({
        name: 'Unique User',
        email: 'unique@test.com',
        age: 40,
      })
    })

    it('should return null if not found', async () => {
      const found = await db.users.findUnique({
        where: { id: 999 },
      })

      expect(found).toBeNull()
    })

    it('should find by unique index', async () => {
      await db.users.create({
        data: { name: 'Index User', email: 'indexed@test.com', age: 35 },
      })

      const found = await db.users.findUnique({
        where: { email: 'indexed@test.com' },
      })

      expect(found).toMatchObject({
        name: 'Index User',
        email: 'indexed@test.com',
      })
    })
  })

  describe('findFirst', () => {
    it('should find first matching record', async () => {
      await db.users.createMany({
        data: [
          { name: 'A', email: 'a@test.com', age: 30 },
          { name: 'B', email: 'b@test.com', age: 30 },
          { name: 'C', email: 'c@test.com', age: 30 },
        ],
      })

      const found = await db.users.findFirst({
        where: { age: 30 },
      })

      expect(found).toBeDefined()
      expect(found.age).toBe(30)
    })

    it('should return null if no match', async () => {
      const found = await db.users.findFirst({
        where: { age: 999 },
      })

      expect(found).toBeNull()
    })
  })

  describe('findMany', () => {
    beforeEach(async () => {
      await db.users.createMany({
        data: [
          { name: 'Alice', email: 'alice@test.com', age: 25, country: 'US' },
          { name: 'Bob', email: 'bob@test.com', age: 30, country: 'UK' },
          { name: 'Charlie', email: 'charlie@test.com', age: 35, country: 'US' },
          { name: 'David', email: 'david@test.com', age: 40, country: 'CA' },
          { name: 'Eve', email: 'eve@test.com', age: 45, country: 'US' },
        ],
      })
    })

    it('should find all records', async () => {
      const users = await db.users.findMany()
      expect(users).toHaveLength(5)
    })

    it('should filter with where clause', async () => {
      const users = await db.users.findMany({
        where: { country: 'US' },
      })
      expect(users).toHaveLength(3)
    })

    it('should support ordering', async () => {
      const users = await db.users.findMany({
        orderBy: { age: 'desc' },
      })
      expect(users[0].name).toBe('Eve')
      expect(users[4].name).toBe('Alice')
    })

    it('should support pagination with take and skip', async () => {
      const users = await db.users.findMany({
        orderBy: { age: 'asc' },
        take: 2,
        skip: 1,
      })
      expect(users).toHaveLength(2)
      expect(users[0].name).toBe('Bob')
      expect(users[1].name).toBe('Charlie')
    })

    it('should support select fields', async () => {
      const users = await db.users.findMany({
        select: { name: true, age: true },
      })
      expect(users[0]).toHaveProperty('name')
      expect(users[0]).toHaveProperty('age')
      expect(users[0]).not.toHaveProperty('email')
    })
  })

  describe('update', () => {
    it('should update a record', async () => {
      const created = await db.users.create({
        data: { name: 'Original', email: 'original@test.com', age: 20 },
      })

      const updated = await db.users.update({
        where: { id: created.id },
        data: { name: 'Updated', age: 21 },
      })

      expect(updated.name).toBe('Updated')
      expect(updated.age).toBe(21)
      expect(updated.email).toBe('original@test.com')
    })

    it('should support atomic operations', async () => {
      const created = await db.users.create({
        data: { name: 'Counter', email: 'counter@test.com', age: 10 },
      })

      const updated = await db.users.update({
        where: { id: created.id },
        data: { age: { increment: 5 } },
      })

      expect(updated.age).toBe(15)
    })

    it('should throw error if record not found', async () => {
      await expect(
        db.users.update({
          where: { id: 999 },
          data: { name: 'Not Found' },
        }),
      ).rejects.toThrowError('Record not found')
    })
  })

  describe('updateMany', () => {
    it('should update multiple records', async () => {
      await db.users.createMany({
        data: [
          { name: 'User 1', email: 'u1@test.com', age: 20, isActive: false },
          { name: 'User 2', email: 'u2@test.com', age: 25, isActive: false },
          { name: 'User 3', email: 'u3@test.com', age: 30, isActive: true },
        ],
      })

      const result = await db.users.updateMany({
        where: { isActive: false },
        data: { isActive: true },
      })

      expect(result.count).toBe(2)
    })
  })

  describe('delete', () => {
    it('should delete a record', async () => {
      const created = await db.users.create({
        data: { name: 'To Delete', email: 'delete@test.com', age: 30 },
      })

      const deleted = await db.users.delete({
        where: { id: created.id },
      })

      expect(deleted).toMatchObject({
        name: 'To Delete',
        email: 'delete@test.com',
      })

      const found = await db.users.findUnique({
        where: { id: created.id },
      })
      expect(found).toBeNull()
    })

    it('should throw error if record not found', async () => {
      await expect(
        db.users.delete({
          where: { id: 999 },
        }),
      ).rejects.toThrowError('Record not found')
    })
  })

  describe('deleteMany', () => {
    it('should delete multiple records', async () => {
      await db.users.createMany({
        data: [
          { name: 'D1', email: 'd1@test.com', age: 20, country: 'US' },
          { name: 'D2', email: 'd2@test.com', age: 25, country: 'US' },
          { name: 'D3', email: 'd3@test.com', age: 30, country: 'UK' },
        ],
      })

      const result = await db.users.deleteMany({
        where: { country: 'US' },
      })

      expect(result.count).toBe(2)

      const remaining = await db.users.findMany()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].name).toBe('D3')
    })
  })

  describe('upsert', () => {
    it('should create if not exists', async () => {
      const result = await db.users.upsert({
        where: { email: 'new@test.com' },
        create: { name: 'New User', email: 'new@test.com', age: 25 },
        update: { age: 30 },
      })

      expect(result.name).toBe('New User')
      expect(result.age).toBe(25)
    })

    it('should update if exists', async () => {
      await db.users.create({
        data: { name: 'Existing', email: 'existing@test.com', age: 25 },
      })

      const result = await db.users.upsert({
        where: { email: 'existing@test.com' },
        create: { name: 'Should Not Create', email: 'existing@test.com', age: 20 },
        update: { age: 30 },
      })

      expect(result.name).toBe('Existing')
      expect(result.age).toBe(30)
    })
  })

  describe('count', () => {
    it('should count all records', async () => {
      await db.users.createMany({
        data: [
          { name: 'C1', email: 'c1@test.com', age: 20 },
          { name: 'C2', email: 'c2@test.com', age: 25 },
          { name: 'C3', email: 'c3@test.com', age: 30 },
        ],
      })

      const count = await db.users.count()
      expect(count).toBe(3)
    })

    it('should count with where filter', async () => {
      await db.users.createMany({
        data: [
          { name: 'C1', email: 'c1@test.com', age: 20 },
          { name: 'C2', email: 'c2@test.com', age: 25 },
          { name: 'C3', email: 'c3@test.com', age: 30 },
        ],
      })

      const count = await db.users.count({
        where: { age: { gte: 25 } },
      })
      expect(count).toBe(2)
    })
  })
})

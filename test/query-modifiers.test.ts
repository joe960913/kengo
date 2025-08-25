import { describe, it, expect, beforeEach } from 'vitest'
import { defineSchema, Kengo } from '../src'

interface Product {
  id?: number
  name: string
  price: number
  category: string
  inStock: boolean
  tags?: string[]
}

describe('Query Modifiers', () => {
  let db: any

  beforeEach(async () => {
    const schema = defineSchema({
      version: 1,
      stores: {
        products: {
          '@@id': { keyPath: 'id', autoIncrement: true },
          '@@indexes': ['category', 'price', 'inStock'],
        },
      },
    })

    db = new Kengo({
      name: 'test-query-db',
      schema,
    })

    // Seed data
    await db.products.createMany({
      data: [
        { name: 'Laptop', price: 1200, category: 'Electronics', inStock: true },
        { name: 'Mouse', price: 25, category: 'Electronics', inStock: true },
        { name: 'Keyboard', price: 75, category: 'Electronics', inStock: false },
        { name: 'Desk', price: 300, category: 'Furniture', inStock: true },
        { name: 'Chair', price: 150, category: 'Furniture', inStock: true },
        { name: 'Lamp', price: 50, category: 'Furniture', inStock: false },
        { name: 'Monitor', price: 400, category: 'Electronics', inStock: true },
        { name: 'Headphones', price: 100, category: 'Electronics', inStock: true },
      ],
    })
  })

  describe('Where Conditions', () => {
    it('should filter with equals (implicit)', async () => {
      const products = await db.products.findMany({
        where: { category: 'Furniture' },
      })
      expect(products).toHaveLength(3)
      expect(products.every((p) => p.category === 'Furniture')).toBe(true)
    })

    it('should filter with equals (explicit)', async () => {
      const products = await db.products.findMany({
        where: { category: { equals: 'Electronics' } },
      })
      expect(products).toHaveLength(5)
    })

    it('should filter with not', async () => {
      const products = await db.products.findMany({
        where: { category: { not: 'Furniture' } },
      })
      expect(products).toHaveLength(5)
      expect(products.every((p) => p.category !== 'Furniture')).toBe(true)
    })

    it('should filter with in', async () => {
      const products = await db.products.findMany({
        where: { name: { in: ['Laptop', 'Mouse', 'Desk'] } },
      })
      expect(products).toHaveLength(3)
    })

    it('should filter with notIn', async () => {
      const products = await db.products.findMany({
        where: { name: { notIn: ['Laptop', 'Mouse', 'Desk'] } },
      })
      expect(products).toHaveLength(5)
    })

    it('should filter with gt (greater than)', async () => {
      const products = await db.products.findMany({
        where: { price: { gt: 100 } },
      })
      expect(products.every((p) => p.price > 100)).toBe(true)
    })

    it('should filter with gte (greater than or equal)', async () => {
      const products = await db.products.findMany({
        where: { price: { gte: 100 } },
      })
      expect(products.every((p) => p.price >= 100)).toBe(true)
    })

    it('should filter with lt (less than)', async () => {
      const products = await db.products.findMany({
        where: { price: { lt: 100 } },
      })
      expect(products.every((p) => p.price < 100)).toBe(true)
    })

    it('should filter with lte (less than or equal)', async () => {
      const products = await db.products.findMany({
        where: { price: { lte: 100 } },
      })
      expect(products.every((p) => p.price <= 100)).toBe(true)
    })

    it('should combine multiple where conditions', async () => {
      const products = await db.products.findMany({
        where: {
          category: 'Electronics',
          inStock: true,
          price: { gte: 100 },
        },
      })
      expect(products).toHaveLength(3) // Laptop, Monitor, Headphones
      expect(
        products.every((p) => p.category === 'Electronics' && p.inStock === true && p.price >= 100),
      ).toBe(true)
    })
  })

  describe('OrderBy', () => {
    it('should order by single field ascending', async () => {
      const products = await db.products.findMany({
        orderBy: { price: 'asc' },
      })

      for (let i = 1; i < products.length; i++) {
        expect(products[i].price).toBeGreaterThanOrEqual(products[i - 1].price)
      }
    })

    it('should order by single field descending', async () => {
      const products = await db.products.findMany({
        orderBy: { price: 'desc' },
      })

      for (let i = 1; i < products.length; i++) {
        expect(products[i].price).toBeLessThanOrEqual(products[i - 1].price)
      }
    })

    it('should order by multiple fields', async () => {
      const products = await db.products.findMany({
        orderBy: [{ category: 'asc' }, { price: 'desc' }],
      })

      // Check that Electronics come before Furniture
      const electronicsIndex = products.findIndex((p) => p.category === 'Electronics')
      const furnitureIndex = products.findIndex((p) => p.category === 'Furniture')
      expect(electronicsIndex).toBeLessThan(furnitureIndex)

      // Check that within each category, prices are descending
      const electronics = products.filter((p) => p.category === 'Electronics')
      for (let i = 1; i < electronics.length; i++) {
        expect(electronics[i].price).toBeLessThanOrEqual(electronics[i - 1].price)
      }
    })
  })

  describe('Pagination', () => {
    it('should limit results with take', async () => {
      const products = await db.products.findMany({
        take: 3,
      })
      expect(products).toHaveLength(3)
    })

    it('should skip results', async () => {
      const allProducts = await db.products.findMany({
        orderBy: { price: 'asc' },
      })

      const skippedProducts = await db.products.findMany({
        orderBy: { price: 'asc' },
        skip: 2,
      })

      expect(skippedProducts).toHaveLength(allProducts.length - 2)
      expect(skippedProducts[0]).toEqual(allProducts[2])
    })

    it('should combine take and skip for pagination', async () => {
      const page1 = await db.products.findMany({
        orderBy: { price: 'asc' },
        take: 3,
        skip: 0,
      })

      const page2 = await db.products.findMany({
        orderBy: { price: 'asc' },
        take: 3,
        skip: 3,
      })

      expect(page1).toHaveLength(3)
      expect(page2).toHaveLength(3)
      expect(page1[0].price).toBeLessThan(page2[0].price)
    })
  })

  describe('Field Selection', () => {
    it('should select specific fields', async () => {
      const products = await db.products.findMany({
        select: {
          name: true,
          price: true,
        },
      })

      products.forEach((product) => {
        expect(product).toHaveProperty('name')
        expect(product).toHaveProperty('price')
        expect(product).not.toHaveProperty('category')
        expect(product).not.toHaveProperty('inStock')
      })
    })

    it('should work with where and orderBy', async () => {
      const products = await db.products.findMany({
        where: { category: 'Electronics' },
        orderBy: { price: 'desc' },
        select: {
          name: true,
          price: true,
        },
      })

      expect(products[0].name).toBe('Laptop')
      expect(products[0].price).toBe(1200)
      expect(products[0]).not.toHaveProperty('category')
    })
  })
})

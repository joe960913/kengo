<div align="center">
  
  # ⚔︎
  
  # **K E N G O**
  
  ### 剣豪
  
  <br />
  
  **A modern, type-safe, and reactive ORM for IndexedDB**  
  *Wield the power of a server-side ORM, directly in the browser*
  
  <br />
  
  [![NPM Version](https://img.shields.io/npm/v/kengo?style=for-the-badge&labelColor=1a1b26&color=7aa2f7&logo=npm)](https://www.npmjs.com/package/kengo) [![Bundle Size](https://img.shields.io/bundlephobia/minzip/kengo?style=for-the-badge&labelColor=1a1b26&color=9ece6a&logo=javascript)](https://bundlephobia.com/result?p=kengo) [![Tests](https://img.shields.io/github/actions/workflow/status/joe960913/kengo/test.yml?branch=main&label=tests&style=for-the-badge&labelColor=1a1b26&color=bb9af7&logo=github)](https://github.com/joe960913/kengo/actions) [![License](https://img.shields.io/npm/l/kengo?style=for-the-badge&labelColor=1a1b26&color=e0af68&logo=opensourceinitiative)](https://opensource.org/licenses/MIT)  
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-7aa2f7?style=for-the-badge&labelColor=1a1b26&logo=typescript)](https://www.typescriptlang.org/) [![IndexedDB](https://img.shields.io/badge/IndexedDB-Powered-f7768e?style=for-the-badge&labelColor=1a1b26&logo=database)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) [![Zero Deps](https://img.shields.io/badge/Zero-Dependencies-9ece6a?style=for-the-badge&labelColor=1a1b26)](https://www.npmjs.com/package/kengo?activeTab=dependencies) [![Browser](https://img.shields.io/badge/Browser-Compatible-73daca?style=for-the-badge&labelColor=1a1b26&logo=googlechrome)](https://caniuse.com/indexeddb)
  
  <br />
  
  ---
  
</div>

Managing data in the browser shouldn't feel like a clumsy battle. IndexedDB is powerful, but its native API is a maze of callbacks and verbose boilerplate—like wielding a blunt, heavy sword in the fog.

**Kengo** brings the art of the swordsman—**mastery, precision, and elegance**—to this battlefield. Inspired by the masterful developer experience of Prisma, Kengo allows you to command your browser's database with the confidence and clarity of a _Kengo_ (a master swordsman).

---

## The Way of Kengo - 剣豪之道

- ⚔️ **Schema First (The Form - 型):** Define your data structure in a single, readable schema file. This is your _kata_—the source of truth from which all data interactions flow with discipline and purpose.
- ✨ **Fully Type-Safe (The Blade - 刃):** Wield an auto-generated, fully-typed client. Your editor becomes your whetstone, sharpening your code and eliminating errors at compile time for a flawless edge.
- 🌊 **Fluent & Familiar API (The Stance - 構え):** Enjoy a modern, chainable API that feels just like Prisma. Every query is an elegant, powerful stance, allowing you to strike with precision and grace.
- 🚀 **Reactive & Real-time (The Mind - 心):** Go beyond simple CRUD. With `liveQuery`, your UI can subscribe to data changes and update automatically. Your application becomes a living entity, aware and responsive, like a swordsman in a state of total concentration.
- 🛡️ **Zero-Config Migrations (The Scabbard - 鞘):** Evolve your schema without fear. Simply increment your version number, and Kengo handles the migration automatically. Your blade is always ready, seamlessly adapting to new challenges.

## Quick Start: The First Cut

Experience the power of Kengo in minutes.

```bash
# npm
npm install kengo

# yarn
yarn add kengo

# pnpm
pnpm add kengo

# bun
bun add kengo
```

Define your schema, forge your client, and wield the blade.

```typescript
import { defineSchema, Kengo } from 'kengo'

// 1. Define your schema (The Form)
const schema = defineSchema({
  version: 1,
  stores: {
    users: {
      '@@id': { keyPath: 'id', autoIncrement: true },
      '@@uniqueIndexes': ['email'],
      '@@indexes': ['age'],
    },
  },
})

// 2. Forge your client
const db = new Kengo({ name: 'my-app-db', schema })

// 3. Wield the blade with a familiar, type-safe API!
async function main() {
  const newUser = await db.users.create({
    data: { name: 'Musashi', email: 'musashi@kengo.io', age: 29 },
  })

  const skilledSwordsmen = await db.users.findMany({
    where: { age: { gte: 25 } },
    orderBy: { name: 'asc' },
    take: 10,
  })

  console.log('Found:', skilledSwordsmen)
}

main()
```

## Comparison: Kengo vs. The Alternatives

| Feature              | **Kengo (The Master's Blade)**         | Native IndexedDB (Raw Iron)         | localStorage (Swiss Army Knife) |
| -------------------- | -------------------------------------- | ----------------------------------- | ------------------------------- |
| **API**              | ✅ Async/Await, Fluent, Prisma-like    | ❌ Callback-based, verbose, complex | ❌ Synchronous, blocking, basic |
| **Type Safety**      | ✅ Fully Type-Safe, Auto-generated     | ❌ `any`, error-prone               | ❌ String-only, manual parsing  |
| **Querying**         | ✅ Powerful, indexed, multi-faceted    | ❌ Manual cursors & ranges          | ❌ Key-only, no indexing        |
| **Migrations**       | ✅ Automatic, safe, version-controlled | ❌ Manual, high-risk, boilerplate   | ❌ N/A                          |
| **Storage Capacity** | ✅ Very Large (GBs+)                   | ✅ Very Large (GBs+)                | ❌ Tiny (~5MB)                  |
| **Reactivity**       | ✅ **Built-in `liveQuery`**            | ❌ None, requires manual polling    | ❌ `storage` event (limited)    |

## The Roadmap: The Path to Mastery

Kengo is an actively developed project on a mission to deliver the ultimate browser database experience. Here's what the future holds:

- [x] **Core:** Rock-solid, type-safe CRUD & Query Engine.
- [x] **Migrations:** Automatic schema migrations.
- [ ] **Reactivity:** `liveQuery` API for real-time UI updates.
- [ ] **Relations:** Simple, Prisma-like relation queries (`include`, `select`).
- [ ] **Full-Text Search:** Integrated full-text search capabilities.
- [ ] **Data Seeding:** A dedicated API for seeding development data.
- [ ] **Kengo Studio:** A developer tool for visualizing and managing your local database.

## 📚 Complete API Reference

<details open>
<summary><strong>Click to expand the full API documentation</strong></summary>

### 🏗️ Schema Definition

Define your database structure with a type-safe schema.

```typescript
const schema = defineSchema({
  version: 1, // Increment to trigger migrations
  stores: {
    users: {
      '@@id': { keyPath: 'id', autoIncrement: true }, // Primary key
      '@@indexes': ['email', 'age', 'country'], // Queryable indexes
      '@@uniqueIndexes': ['email'], // Unique constraints
    },
  },
})
```

**Schema Options:**

- `version`: Database version (positive integer)
- `stores`: Object defining your tables/stores
- `@@id`: Primary key configuration
  - String: `'@@id': 'userId'` (simple key path)
  - Object: `{ keyPath: 'id', autoIncrement: true }` (auto-increment)
- `@@indexes`: Array of field names for non-unique indexes
- `@@uniqueIndexes`: Array of field names for unique indexes

---

### ✨ CRUD Operations

#### **Create Operations**

```typescript
// Create single record
const user = await db.users.create({
  data: { name: 'Alice', email: 'alice@example.com', age: 25 },
  select: { id: true, name: true }, // Optional: Return specific fields
})

// Create multiple records
const result = await db.users.createMany({
  data: [
    { name: 'Bob', email: 'bob@example.com', age: 30 },
    { name: 'Charlie', email: 'charlie@example.com', age: 35 },
  ],
  skipDuplicates: true, // Skip records that violate unique constraints
})
// Returns: { count: 2 }
```

#### **Read Operations**

```typescript
// Find by unique field (returns null if not found)
const user = await db.users.findUnique({
  where: { id: 1 }, // or { email: 'alice@example.com' }
  select: { name: true, email: true },
})

// Find first matching record (returns null if not found)
const firstUser = await db.users.findFirst({
  where: { age: { gte: 25 } },
  orderBy: { createdAt: 'desc' },
})

// Find multiple records
const users = await db.users.findMany({
  where: {
    age: { gte: 18, lte: 65 },
    country: 'US',
  },
  orderBy: [{ age: 'desc' }, { name: 'asc' }],
  skip: 10,
  take: 20,
  select: { id: true, name: true, email: true },
})

// Count records
const count = await db.users.count({
  where: { age: { gte: 18 } },
})
```

#### **Update Operations**

```typescript
// Update single record
const updated = await db.users.update({
  where: { id: 1 },
  data: {
    name: 'Alice Smith',
    age: { increment: 1 }, // Atomic operation
  },
  select: { id: true, name: true, age: true },
})

// Update multiple records
const result = await db.users.updateMany({
  where: { country: 'US' },
  data: {
    isActive: true,
    credits: { multiply: 1.1 }, // Give 10% bonus
  },
})
// Returns: { count: 42 }
```

#### **Delete Operations**

```typescript
// Delete single record (throws if not found)
const deleted = await db.users.delete({
  where: { id: 1 },
})

// Delete multiple records
const result = await db.users.deleteMany({
  where: { age: { lt: 18 } },
})
// Returns: { count: 5 }
```

#### **Upsert Operation**

```typescript
// Create if not exists, update if exists
const user = await db.users.upsert({
  where: { email: 'alice@example.com' },
  create: {
    name: 'Alice',
    email: 'alice@example.com',
    age: 25,
  },
  update: {
    age: { increment: 1 },
    lastSeen: new Date(),
  },
  select: { id: true, name: true, age: true },
})
```

---

### 🔍 Query Conditions

#### **Where Conditions**

```typescript
// Equality (implicit)
where: { name: 'Alice' }

// Equality (explicit)
where: { name: { equals: 'Alice' } }

// Not equal
where: { status: { not: 'deleted' } }

// In array
where: { role: { in: ['admin', 'moderator'] } }

// Not in array
where: { status: { notIn: ['deleted', 'suspended'] } }

// Greater than / Greater than or equal
where: { age: { gt: 18 } }
where: { age: { gte: 18 } }

// Less than / Less than or equal
where: { price: { lt: 100 } }
where: { price: { lte: 100 } }

// String operations
where: { email: { contains: '@gmail.com' } }
where: { name: { startsWith: 'John' } }
where: { url: { endsWith: '.com' } }

// Combine multiple conditions (AND)
where: {
  age: { gte: 18, lte: 65 },
  country: 'US',
  isActive: true
}
```

#### **Ordering**

```typescript
// Single field
orderBy: {
  createdAt: 'desc'
}

// Multiple fields
orderBy: [{ category: 'asc' }, { price: 'desc' }]
```

#### **Pagination**

```typescript
// Skip and take
{
  skip: 20,   // Skip first 20 records
  take: 10    // Take next 10 records
}
```

#### **Field Selection**

```typescript
// Select specific fields
select: {
  id: true,
  name: true,
  email: true
  // Other fields will not be returned
}
```

---

### ⚛️ Atomic Operations

Perform atomic numeric operations without race conditions.

```typescript
// Increment
await db.counters.update({
  where: { id: 1 },
  data: { value: { increment: 5 } },
})

// Decrement
await db.counters.update({
  where: { id: 1 },
  data: { value: { decrement: 3 } },
})

// Multiply
await db.counters.update({
  where: { id: 1 },
  data: { value: { multiply: 2 } },
})

// Divide (ignores division by zero)
await db.counters.update({
  where: { id: 1 },
  data: { value: { divide: 4 } },
})

// Combine with regular updates
await db.users.update({
  where: { id: 1 },
  data: {
    name: 'Updated Name',
    points: { increment: 100 },
    multiplier: { multiply: 1.5 },
  },
})
```

---

### 🔄 Transactions

Ensure data consistency with ACID transactions.

```typescript
// Basic transaction
const result = await db.$transaction(async (tx) => {
  // All operations use 'tx' instead of 'db'
  const user = await tx.users.create({
    data: { name: 'Alice', email: 'alice@example.com' },
  })

  const post = await tx.posts.create({
    data: {
      userId: user.id,
      title: 'First Post',
      content: 'Hello World!',
    },
  })

  await tx.users.update({
    where: { id: user.id },
    data: { postCount: { increment: 1 } },
  })

  return { user, post } // Return value from transaction
})

// Transaction with error handling
try {
  await db.$transaction(async (tx) => {
    await tx.accounts.update({
      where: { id: senderId },
      data: { balance: { decrement: amount } },
    })

    if (amount > 1000) {
      throw new Error('Amount too large!') // Rollback
    }

    await tx.accounts.update({
      where: { id: receiverId },
      data: { balance: { increment: amount } },
    })
  })
} catch (error) {
  // Transaction rolled back, no changes applied
  console.error('Transaction failed:', error)
}
```

**Transaction Rules:**

- All operations within a transaction are atomic
- If any operation fails, all changes are rolled back
- Nested transactions are not supported
- Cannot call `$disconnect()` within a transaction
- Can access raw database with `tx.$getRawDB()`

---

### 🔄 Automatic Migrations

Kengo handles schema migrations automatically when you increment the version number.

```typescript
// Version 1: Initial schema
const schemaV1 = defineSchema({
  version: 1,
  stores: {
    users: {
      '@@id': { keyPath: 'id', autoIncrement: true },
      '@@indexes': ['email'],
    },
  },
})

// Version 2: Add new store and indexes
const schemaV2 = defineSchema({
  version: 2, // Increment version to trigger migration
  stores: {
    users: {
      '@@id': { keyPath: 'id', autoIncrement: true },
      '@@indexes': ['email', 'createdAt'], // Added new index
      '@@uniqueIndexes': ['username'], // Added unique constraint
    },
    posts: {
      // New store added
      '@@id': { keyPath: 'id', autoIncrement: true },
      '@@indexes': ['userId', 'publishedAt'],
    },
  },
})

// Kengo automatically:
// 1. Detects version change (1 → 2)
// 2. Creates new stores (posts)
// 3. Adds new indexes (createdAt, username)
// 4. Preserves all existing data
// 5. Handles the migration safely
const db = new Kengo({
  name: 'my-app',
  schema: schemaV2, // Just use the new schema!
})
```

**Migration Features:**

- **Zero-config**: Just increment the version number
- **Non-destructive**: Existing data is always preserved
- **Additive changes**: Add new stores, indexes, and unique constraints
- **Automatic handling**: No migration files or scripts needed
- **Safe rollback**: Old app versions continue to work with their schema version

**Important Notes:**

- Always increment the version number when changing schema
- You cannot remove stores or indexes (IndexedDB limitation)
- Schema changes are applied when the database is first opened
- Each browser profile maintains its own schema version

---

### 🔧 Advanced Features

#### **Raw Database Access**

```typescript
// Get the underlying IDBDatabase instance
const rawDB = await db.$getRawDB()

// Use native IndexedDB API for advanced operations
const transaction = rawDB.transaction(['users'], 'readonly')
const objectStore = transaction.objectStore('users')
const index = objectStore.index('email')
// ... perform native IndexedDB operations
```

#### **Connection Management**

```typescript
// Initialize database (called automatically on first operation)
await db.$connect()

// Close database connection
await db.$disconnect()

// Check connection status
const isConnected = db.$isConnected()
```

---

### 📝 TypeScript Support

Kengo provides full TypeScript support with auto-generated types.

```typescript
import { defineSchema, Kengo } from 'kengo'

// Define your data types
interface User {
  id?: number
  name: string
  email: string
  age: number
  createdAt: Date
}

// Schema is fully typed
const schema = defineSchema({
  version: 1,
  stores: {
    users: {
      '@@id': { keyPath: 'id', autoIncrement: true },
      '@@uniqueIndexes': ['email'],
    },
  },
})

// Client is fully typed based on schema
const db = new Kengo({ name: 'my-app', schema })

// All operations are type-safe
const user = await db.users.create({
  data: {
    name: 'Alice', // ✅ Required
    email: 'alice@example.com', // ✅ Required
    age: 25, // ✅ Required
    // id is optional (auto-increment)
    // unknown: 'field'  // ❌ TypeScript error
  },
})
```

---

### 🚀 Performance Tips

1. **Use Indexes**: Define indexes for fields you query frequently
2. **Select Fields**: Use `select` to return only needed fields
3. **Batch Operations**: Use `createMany`, `updateMany`, `deleteMany` for bulk operations
4. **Transactions**: Group related operations in transactions
5. **Pagination**: Use `skip` and `take` for large datasets

</details>

## Contributing

Kengo's path to mastery is forged by its community. Contributions of all forms are welcome, from bug reports to new features. Please see our **[Contributing Guide](CONTRIBUTING.md)** to get started.

## License

Licensed under the **[MIT License](LICENSE)**.

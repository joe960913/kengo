# Kengo (剣豪) - A Comprehensive Guide to its Features

Every feature in Kengo is meticulously designed to offer a master-class development experience for browser databases. The following is a comprehensive guide to all of Kengo's features and capabilities.

### Table of Contents

1. [**Core Philosophy (The Creed)**](#1-core-philosophy-the-creed)
2. [**Schema Definition (`defineSchema`)**](#2-schema-definition-defineschema)
3. [**The Kengo Client (`new Kengo()`)**](#3-the-kengo-client-new-kengo)
4. [**Core API: CRUD Operations**](#4-core-api-crud-operations)
   * [`create`](#create)
   * [`createMany`](#createmany)
   * [`findUnique`](#findunique)
   * [`findFirst`](#findfirst)
   * [`findMany`](#findmany)
   * [`update`](#update)
   * [`updateMany`](#updatemany)
   * [`delete`](#delete)
   * [`deleteMany`](#deletemany)
   * [`upsert`](#upsert)
5. [**Query Modifiers**](#5-query-modifiers)
   * [Filtering (`where`)](#filtering-where)
   * [Ordering (`orderBy`)](#ordering-orderby)
   * [Pagination (`take` &amp; `skip`)](#pagination-take--skip)
   * [Field Selection (`select`)](#field-selection-select)
6. [**Advanced Features**](#6-advanced-features)
   * [Transactions (`$transaction`)](#transactions-transaction)
   * [Automatic Migrations](#automatic-migrations)
   * [Raw Database Access (`$getRawDB`)](#raw-database-access-getrawdb)

---

### 1. Core Philosophy (The Creed)

* **Schema First (The Form):** Your schema definition is the single, absolute source of truth for your data structure. Kengo relies on it to generate types, create object stores and indexes, and perform migrations.
* **Fully Type-Safe (The Blade):** From the `data` argument in `db.users.create` to the return value of `findMany`, every step is strictly enforced by TypeScript. Say goodbye to `any` and embrace compile-time confidence.
* **Zero-Config Migrations (The Scabbard):** Simply increment the `version` number in your schema and adjust its structure. Kengo automatically handles the IndexedDB version upgrade and structural changes upon the next initialization.

### 2. Schema Definition (`defineSchema`)

The core function used to define all database metadata.

* **`version`**: `number` (required)
  * The current version of the database. Must be a positive integer. You **must** increment this version number whenever you change the structure of your `stores` to trigger an automatic migration.
* **`stores`**: `Record<string, StoreDefinition>` (required)
  * An object where each `key` is the store name (e.g., `users`), and the `value` is the store's definition.
* **`StoreDefinition`**:
  * `'@@id'`: `string | { keyPath: string, autoIncrement: boolean }` (required)
    * Defines the primary key.
    * Simple syntax: `'@@id': 'id'` indicates that the `id` field is the primary key.
    * Expanded syntax: `'@@id': { keyPath: 'id', autoIncrement: true }` allows specifying if the primary key auto-increments.
  * `'@@indexes'`: `string[]` (optional)
    * An array of field names for which to create indexes, e.g., `['email', 'age']`.
  * `'@@uniqueIndexes'`: `string[]` (optional)
    * An array of field names for which to create **unique** indexes, e.g., `['email']`.

**Example:**

```typescript
const mySchema = defineSchema({
  version: 2,
  stores: {
    users: {
      '@@id': { keyPath: 'id', autoIncrement: true }, // Auto-incrementing primary key
      '@@indexes': ['age', 'country'],
      '@@uniqueIndexes': ['email'],
    },
    // ...
  },
});
```

### 3. The Kengo Client (`new Kengo()`)

The entry point for creating and managing the database connection.

* **`new Kengo(options)`**
  * `options.name`: `string` - The name of the database.
  * `options.schema`: `SchemaObject` - The schema object returned by `defineSchema`.

The client instance dynamically generates properties based on your schema, such as `db.users` and `db.posts`.

---

### 4. Core API: CRUD Operations

Kengo provides a complete, powerful, and Prisma-like CRUD API for each data store.

#### `create`

Creates a new record.

```typescript
const user = await db.users.create({ data: { email: '...' } });
```

* `data`: `T` - The data object to be created, type-checked against your `User` interface.

#### `createMany`

Creates multiple records in a batch.

```typescript
await db.users.createMany({ data: [{...}, {...}] });
```

* `data`: `T[]` - An array of data objects.
* **Note:** This is executed in a single transaction for better performance.

#### `findUnique`

Finds a single record by its primary key or a unique index.

```typescript
const user = await db.users.findUnique({ where: { email: 'a@b.c' } });
// returns User | null
```

* `where`: `UniqueWhereInput` - The query condition, which must include a primary key or a unique index field.

#### `findFirst`

Finds the first record that matches the given criteria.

```typescript
const user = await db.users.findFirst({ where: { age: { gt: 18 } } });
// returns User | null
```

* Accepts the same modifiers as `findMany`, such as `where` and `orderBy`.

#### `findMany`

Finds all records that match the given criteria. This is the most flexible query method.

```typescript
const users = await db.users.findMany({
  where: { age: { gte: 21 } },
  orderBy: { name: 'asc' },
  take: 50,
});
// returns User[]
```

* See [Query Modifiers](#5-query-modifiers) for detailed options.

#### `update`

Updates a single record based on a unique criterion.

```typescript
const updatedUser = await db.users.update({
  where: { id: 1 },
  data: { age: 30, name: 'Kenji' },
});
```

* `where`: `UniqueWhereInput` - Locates the record to update.
* `data`: `Partial<T>` & `AtomicOperations` - The fields to update. Supports **atomic operations**:
  * `age: { increment: 1 }`
  * `followers: { decrement: 5 }`

#### `updateMany`

Updates multiple records that match the criteria in a batch.

```typescript
await db.users.updateMany({
  where: { country: 'JP' },
  data: { hasVisited: true },
});
```

#### `delete`

Deletes a single record based on a unique criterion.

```typescript
const deletedUser = await db.users.delete({ where: { id: 1 } });
```

#### `deleteMany`

Deletes multiple records that match the criteria in a batch.

```typescript
await db.users.deleteMany({ where: { status: 'INACTIVE' } });
```

#### `upsert`

Updates a record if it exists, or creates it if it does not.

```typescript
await db.users.upsert({
  where: { email: 'a@b.c' },
  update: { lastLogin: new Date() },
  create: { email: 'a@b.c', name: 'New User' },
});
```

* `where`: `UniqueWhereInput` - The criteria used to find the record.
* `update`: `Partial<T>` - The update to apply if the record is found.
* `create`: `T` - The data to use to create the record if it is not found.

---

### 5. Query Modifiers

Used to refine results in queries like `findMany` and `findFirst`.

#### Filtering (`where`)

* **Direct Match**: `{ name: 'Kenji', age: 29 }`
* **Advanced Conditions**:
  * `equals`: `{ name: { equals: 'Kenji' } }` (default)
  * `not`: `{ name: { not: 'Kenji' } }`
  * `in`: `{ country: { in: ['JP', 'US'] } }`
  * `notIn`: `{ country: { notIn: ['CN', 'RU'] } }`
* **Numeric Comparisons**:
  * `gt`: `{ age: { gt: 18 } }` (greater than)
  * `gte`: `{ age: { gte: 18 } }` (greater than or equal to)
  * `lt`: `{ age: { lt: 65 } }` (less than)
  * `lte`: `{ age: { lte: 65 } }` (less than or equal to)
* **String Matching** (Planned for future):
  * `contains`, `startsWith`, `endsWith`

#### Ordering (`orderBy`)

* **Single-field sorting**: `{ age: 'desc' }`
* **Multi-field sorting**: `[{ age: 'desc' }, { name: 'asc' }]`

#### Pagination (`take` & `skip`)

* `take`: `number` - The number of records to retrieve (LIMIT).
* `skip`: `number` - The number of records to skip (OFFSET).

#### Field Selection (`select`)

Return only the fields you need to improve performance.

```typescript
const partialUser = await db.users.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    email: true,
  },
});
// partialUser's type: { id: number; email: string; }
```

---

### 6. Advanced Features

Powerful techniques that go beyond basic CRUD operations.

#### Transactions (`$transaction`)

Bundle multiple operations into a single atomic transaction. Either all operations succeed, or they all fail.

```typescript
await db.$transaction(async (tx) => {
  // `tx` is a transactional Kengo client
  const user = await tx.users.findUnique({ where: { id: 1 } });

  if (user.balance < 100) {
    throw new Error('Insufficient balance!'); // Throwing an error automatically rolls back the transaction
  }

  await tx.users.update({
    where: { id: 1 },
    data: { balance: { decrement: 100 } },
  });
  await tx.merchants.update({
    where: { id: 42 },
    data: { balance: { increment: 100 } },
  });
});
```

#### Automatic Migrations

Kengo automatically handles changes to the database structure during initialization.

* **Workflow**:
  1. Modify the `stores` definition in `schema.ts` (e.g., add a new index).
  2. **Increment the `version` number by one.**
  3. The next time your web application loads and initializes Kengo, it will detect the version difference and automatically execute operations like `createIndex` or `createObjectStore` within the `onupgradeneeded` event.
* **Note**: More granular control over complex data migrations (e.g., field renaming) will be provided in a future version.

#### Raw Database Access (`$getRawDB`)

When necessary, access the underlying `IDBDatabase` object for native operations. This serves as an "escape hatch."

```typescript
const rawDB = await db.$getRawDB();
// You can now use the standard IndexedDB API
const transaction = rawDB.transaction('users', 'readonly');
// ...
```

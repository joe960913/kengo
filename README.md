<div align="center">
  <img src="https://raw.githubusercontent.com/joe960913/kengo/main/assets/kengo-logo.png" alt="Kengo Logo" width="150">
  <h1>Kengo (剣豪)</h1>
  <p>
    <strong>A modern, type-safe, and reactive ORM for IndexedDB.<br />Wield the power of a server-side ORM, directly in the browser.</strong>
  </p>

[![NPM Version](https://img.shields.io/npm/v/kengo?color=c6362c&style=flat-rounded)](https://www.npmjs.com/package/kengo)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/kengo?style=flat-rounded&color=007ec6)](https://bundlephobia.com/result?p=kengo)
[![Tests](https://img.shields.io/github/actions/workflow/status/joe960913/kengo/test.yml?branch=main&label=tests&style=flat-square)](https://github.com/joe960913/kengo/actions)
[![License](https://img.shields.io/npm/l/kengo?style=flat-square&color=yellow)](https://opensource.org/licenses/MIT)

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
npm install kengo
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

## Core Features

<details>
<summary><strong>Click to expand the full API documentation</strong></summary>

### Schema Definition (`defineSchema`)

The source of truth for your database structure.

- **`version`**: `number` (required) - Increment to trigger migrations.
- **`stores`**: `Record<string, StoreDefinition>` (required) - Defines your tables.
  - `'@@id'`: `string | { keyPath: string, autoIncrement: boolean }` (required) - Defines the primary key.
  - `'@@indexes'`: `string[]` (optional) - Defines queryable indexes.
  - `'@@uniqueIndexes'`: `string[]` (optional) - Defines unique constraints.

### CRUD Operations

A complete, powerful, and familiar API for data manipulation.

- `create` / `createMany`
- `findUnique` / `findFirst` / `findMany`
- `update` / `updateMany`
- `delete` / `deleteMany`
- `upsert`

### Query Modifiers

Refine your queries with precision.

- **Filtering (`where`)**: `equals`, `not`, `in`, `gt`, `gte`, `lt`, `lte`, `contains`, `startsWith`, `endsWith`.
- **Ordering (`orderBy`)**: Sort by one or more fields, `asc` or `desc`.
- **Pagination (`take` & `skip`)**: Effortless pagination for large datasets.
- **Field Selection (`select`)**: Return only the data you need for maximum performance.

### Advanced Features

Techniques for the seasoned swordsman.

- **Transactions (`$transaction`)**: Ensure data integrity by bundling multiple operations into an atomic unit. If one fails, all are rolled back.
- **Raw Access (`$getRawDB`)**: An "escape hatch" to the underlying `IDBDatabase` object for when you need absolute control.

</details>

## Contributing

Kengo's path to mastery is forged by its community. Contributions of all forms are welcome, from bug reports to new features. Please see our **[Contributing Guide](CONTRIBUTING.md)** to get started.

## License

Licensed under the **[MIT License](LICENSE)**.

## Kengo (剣豪) - 功能特性全解

Kengo 的每一项功能都经过精心设计，旨在提供一个无与伦比的、大师级的浏览器数据库开发体验。以下是 Kengo 所持有的全部“招式”与“奥義”。

### 目录

1.  [**核心哲学 (The Creed)**](#1-核心哲学-the-creed)
2.  [**Schema 定义 (`defineSchema`)**](#2-schema-定义-defineschema)
3.  [**Kengo 客户端 (`new Kengo()`)**](#3-kengo-客户端-new-kengo)
4.  [**核心招式: CRUD 操作**](#4-核心招式-crud-操作)
    *   [`create`](#create)
    *   [`createMany`](#createmany)
    *   [`findUnique`](#findunique)
    *   [`findFirst`](#findfirst)
    *   [`findMany`](#findmany)
    *   [`update`](#update)
    *   [`updateMany`](#updatemany)
    *   [`delete`](#delete)
    *   [`deleteMany`](#deletemany)
    *   [`upsert`](#upsert)
5.  [**查询调节器 (Query Modifiers)**](#5-查询调节器-query-modifiers)
    *   [Filtering (`where`)](#filtering-where)
    *   [Ordering (`orderBy`)](#ordering-orderby)
    *   [Pagination (`take` & `skip`)](#pagination-take--skip)
    *   [Field Selection (`select`)](#field-selection-select)
6.  [**奥義: 高级功能**](#6-奥義-高级功能)
    *   [事务 (`$transaction`)](#事务-transaction)
    *   [自动迁移 (Automatic Migrations)](#自动迁移-automatic-migrations)
    *   [原生访问 (`$getRawDB`)](#原生访问-getrawdb)

---

### 1. 核心哲学 (The Creed)

*   **Schema First (型):** 你的 Schema 定义是数据结构的唯一、绝对的真实来源。Kengo 依赖它来生成类型、创建表和索引，并执行迁移。
*   **完全类型安全 (刃):** 从 `db.users.create` 的 `data` 参数，到 `findMany` 的返回结果，每一环都由 TypeScript 严格把关。告别 `any`，拥抱编译时自信。
*   **零配置迁移 (鞘):** 你只需提升 Schema 中的 `version` 号并调整结构，Kengo 会在下次初始化时自动处理 IndexedDB 的版本升级和结构变更。

### 2. Schema 定义 (`defineSchema`)

用于定义数据库所有元信息的核心函数。

*   **`version`**: `number` (必需)
    *   数据库的当前版本号。必须是正整数。每次你更改 `stores` 的结构时，都**必须**增加此版本号以触发自动迁移。
*   **`stores`**: `Record<string, StoreDefinition>` (必需)
    *   一个对象，其 `key` 为表名 (例如 `users`)，`value` 为该表的定义。
*   **`StoreDefinition`**:
    *   `'@@id'`: `string | { keyPath: string, autoIncrement: boolean }` (必需)
        *   定义主键。
        *   简单模式: `'@@id': 'id'`，表示 `id` 字段是主键。
        *   高级模式: `'@@id': { keyPath: 'id', autoIncrement: true }`，允许指定主键是否自增。
    *   `'@@indexes'`: `string[]` (可选)
        *   需要创建索引的字段名数组，例如 `['email', 'age']`。
    *   `'@@uniqueIndexes'`: `string[]` (可选)
        *   需要创建**唯一约束**索引的字段名数组，例如 `['email']`。

**示例:**
```typescript
const mySchema = defineSchema({
  version: 2,
  stores: {
    users: {
      '@@id': { keyPath: 'id', autoIncrement: true }, // 自增主键
      '@@indexes': ['age', 'country'],
      '@@uniqueIndexes': ['email'],
    },
    // ...
  },
});
```

### 3. Kengo 客户端 (`new Kengo()`)

创建和管理数据库连接的入口。

*   **`new Kengo(options)`**
    *   `options.name`: `string` - 数据库的名称。
    *   `options.schema`: `SchemaObject` - 由 `defineSchema` 返回的 Schema 对象。

客户端实例会根据你的 Schema 动态生成属性，例如 `db.users` 和 `db.posts`。

---

### 4. 核心招式: CRUD 操作

Kengo 为每个数据表提供了一套完整、强大且符合 Prisma 命名规范的 CRUD API。

#### `create`
创建一条新纪录。
```typescript
const user = await db.users.create({ data: { email: '...' } });
```
*   `data`: `T` - 需要创建的数据对象，其类型会根据你的 `User` 接口进行检查。

#### `createMany`
批量创建多条记录。
```typescript
await db.users.createMany({ data: [{...}, {...}] });
```
*   `data`: `T[]` - 数据对象数组。
*   **注意:** 这会在一个单独的事务中执行，以保证性能。

#### `findUnique`
根据主键或唯一索引查找单条记录。
```typescript
const user = await db.users.findUnique({ where: { email: 'a@b.c' } });
// returns User | null
```
*   `where`: `UniqueWhereInput` - 查询条件，必须包含一个主键或唯一索引字段。

#### `findFirst`
查找符合条件的第一条记录。```typescript
const user = await db.users.findFirst({ where: { age: { gt: 18 } } });
// returns User | null
```
*   接受 `where`, `orderBy` 等与 `findMany` 相同的调节器。

#### `findMany`
查找所有符合条件的记录。这是最灵活的查询方法。
```typescript
const users = await db.users.findMany({
  where: { age: { gte: 21 } },
  orderBy: { name: 'asc' },
  take: 50,
});
// returns User[]
```
*   详细选项见 [查询调节器](#5-查询调节器-query-modifiers)。

#### `update`
根据唯一条件更新单条记录。
```typescript
const updatedUser = await db.users.update({
  where: { id: 1 },
  data: { age: 30, name: 'Kenji' },
});
```
*   `where`: `UniqueWhereInput` - 定位要更新的记录。
*   `data`: `Partial<T>` & `AtomicOperations` - 包含要更新的字段。支持**原子操作**：
    *   `age: { increment: 1 }`
    *   `followers: { decrement: 5 }`

#### `updateMany`
批量更新所有符合条件的记录。
```typescript
await db.users.updateMany({
  where: { country: 'JP' },
  data: { hasVisited: true },
});
```

#### `delete`
根据唯一条件删除单条记录。
```typescript
const deletedUser = await db.users.delete({ where: { id: 1 } });
```

#### `deleteMany`
批量删除所有符合条件的记录。
```typescript
await db.users.deleteMany({ where: { status: 'INACTIVE' } });
```

#### `upsert`
若记录存在则更新，若不存在则创建。
```typescript
await db.users.upsert({
  where: { email: 'a@b.c' },
  update: { lastLogin: new Date() },
  create: { email: 'a@b.c', name: 'New User' },
});
```
*   `where`: `UniqueWhereInput` - 用于查找记录的条件。
*   `update`: `Partial<T>` - 如果找到记录，则应用此更新。
*   `create`: `T` - 如果未找到记录，则用此数据创建新记录。

---

### 5. 查询调节器 (Query Modifiers)

用于在 `findMany`, `findFirst` 等查询中精炼结果。

#### Filtering (`where`)
*   **直接匹配**: `{ name: 'Kenji', age: 29 }`
*   **高级条件**:
    *   `equals`: `{ name: { equals: 'Kenji' } }` (默认)
    *   `not`: `{ name: { not: 'Kenji' } }`
    *   `in`: `{ country: { in: ['JP', 'US'] } }`
    *   `notIn`: `{ country: { notIn: ['CN', 'RU'] } }`
*   **数值比较**:
    *   `gt`: `{ age: { gt: 18 } }` (大于)
    *   `gte`: `{ age: { gte: 18 } }` (大于等于)
    *   `lt`: `{ age: { lt: 65 } }` (小于)
    *   `lte`: `{ age: { lte: 65 } }` (小于等于)
*   **字符串匹配** (未来规划):
    *   `contains`, `startsWith`, `endsWith`

#### Ordering (`orderBy`)
*   **单字段排序**: `{ age: 'desc' }`
*   **多字段排序**: `[{ age: 'desc' }, { name: 'asc' }]`

#### Pagination (`take` & `skip`)
*   `take`: `number` - 获取记录的数量 (LIMIT)。
*   `skip`: `number` - 跳过记录的数量 (OFFSET)。

#### Field Selection (`select`)
只返回你需要的字段，以提升性能。
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

### 6. 奥義: 高级功能

超越基础 CRUD 的强大技巧。

#### 事务 (`$transaction`)
将多个操作捆绑在一个原子事务中。要么全部成功，要么全部失败。
```typescript
await db.$transaction(async (tx) => {
  // `tx` 是一个事务化的 Kengo 客户端
  const user = await tx.users.findUnique({ where: { id: 1 } });

  if (user.balance < 100) {
    throw new Error('Insufficient balance!'); // 抛出错误会自动回滚事务
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

#### 自动迁移 (Automatic Migrations)
Kengo 会在初始化时自动处理数据库结构的变更。
*   **工作流**:
    1.  在 `schema.ts` 中修改 `stores` 的定义 (例如，添加一个新索引)。
    2.  **将 `version` 号加一**。
    3.  下次你的 Web 应用加载并初始化 Kengo 时，它会检测到版本差异，并在 `onupgradeneeded` 事件中自动执行 `createIndex` 或 `createObjectStore` 等操作。
*   **注意**: 复杂的数据迁移（例如字段重命名）在未来版本中将提供更精细的控制。

#### 原生访问 (`$getRawDB`)
在需要时，获取底层的 `IDBDatabase` 对象以进行原生操作。这是一个“逃生舱口”。
```typescript
const rawDB = await db.$getRawDB();
// 你现在可以使用标准的 IndexedDB API
const transaction = rawDB.transaction('users', 'readonly');
// ...
```
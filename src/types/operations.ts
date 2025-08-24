export interface WhereCondition<T> {
  equals?: T
  not?: T
  in?: T[]
  notIn?: T[]
  lt?: T
  lte?: T
  gt?: T
  gte?: T
  contains?: string
  startsWith?: string
  endsWith?: string
}

export type WhereInput<T> = {
  [K in keyof T]?: T[K] | WhereCondition<T[K]>
}

export type OrderDirection = 'asc' | 'desc'

export type OrderByInput<T> = {
  [K in keyof T]?: OrderDirection
} | Array<{ [K in keyof T]?: OrderDirection }>

export type SelectInput<T> = {
  [K in keyof T]?: boolean
}

export type SelectedFields<T, S extends SelectInput<T>> = {
  [K in keyof S as S[K] extends true ? K : never]: K extends keyof T ? T[K] : never
}

export interface FindManyOptions<T> {
  where?: WhereInput<T>
  orderBy?: OrderByInput<T>
  take?: number
  skip?: number
  select?: SelectInput<T>
}

export interface FindFirstOptions<T> extends FindManyOptions<T> {}

export interface FindUniqueOptions<T> {
  where: Partial<T>
  select?: SelectInput<T>
}

export interface CreateOptions<T> {
  data: T
  select?: SelectInput<T>
}

export interface CreateManyOptions<T> {
  data: T[]
  skipDuplicates?: boolean
}

export interface UpdateOptions<T> {
  where: Partial<T>
  data: Partial<T> & AtomicOperations<T>
  select?: SelectInput<T>
}

export interface UpdateManyOptions<T> {
  where?: WhereInput<T>
  data: Partial<T> & AtomicOperations<T>
}

export interface DeleteOptions<T> {
  where: Partial<T>
  select?: SelectInput<T>
}

export interface DeleteManyOptions<T> {
  where?: WhereInput<T>
}

export interface UpsertOptions<T> {
  where: Partial<T>
  create: T
  update: Partial<T> & AtomicOperations<T>
  select?: SelectInput<T>
}

export type AtomicOperations<T> = {
  [K in keyof T as T[K] extends number ? K : never]?: {
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }
}
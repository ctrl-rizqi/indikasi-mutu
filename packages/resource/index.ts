export type Role = 'ADMIN' | 'USER'

export interface User {
  id: string
  password: string
  name: string
  role: Role
  createdAt: Date
  updatedAt: Date
  activities?: ActivityLog[]
}

export interface Category {
  id: string
  name: string
  items?: Item[]
}

export interface Item {
  id: string
  name: string
  code: string
  location: string
  spec?: string
  status: string
  categoryId: string
  category?: Category
  activities?: ActivityLog[]
  createdAt: Date
  updatedAt: Date
}

export type ActivityChecklist = Record<string, string | number | boolean | null>

export interface ActivityLog {
  id: string
  checklist: ActivityChecklist
  note?: string
  photo?: string
  userId: string
  user?: User
  itemId: string
  item?: Item
  createdAt: Date
}

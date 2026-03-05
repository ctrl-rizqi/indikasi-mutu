import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Category, Item } from '@repo/resource'
import { authenticatedFetch } from '../lib/api-client'

export type CategoryOption = Pick<Category, 'id' | 'name'>

export type ItemRow = Pick<Item, 'id' | 'name' | 'code' | 'location' | 'status'> & {
  category?: CategoryOption
  createdAt: string
  updatedAt: string
}

export type CreateItemPayload = Pick<
  Item,
  'name' | 'code' | 'location' | 'categoryId'
> & {
  spec?: string
}

export type CreateCategoryPayload = Pick<Category, 'name'>
export type UpdateCategoryPayload = Pick<Category, 'name'>

export const ITEMS_QUERY_KEY = ['master-items'] as const
export const CATEGORIES_QUERY_KEY = ['master-categories'] as const

const fetchItems = async (): Promise<ItemRow[]> => {
  const response = await authenticatedFetch('/items')

  if (!response.ok) {
    throw new Error('Gagal mengambil data item')
  }

  return (await response.json()) as ItemRow[]
}

const fetchCategories = async (): Promise<CategoryOption[]> => {
  const response = await authenticatedFetch('/categories')

  if (!response.ok) {
    throw new Error('Gagal mengambil data kategori')
  }

  return (await response.json()) as CategoryOption[]
}

const createItem = async (payload: CreateItemPayload): Promise<void> => {
  const response = await authenticatedFetch('/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Gagal menambah item')
  }
}

const createCategory = async (payload: CreateCategoryPayload): Promise<void> => {
  const response = await authenticatedFetch('/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await getCategoryErrorMessage(response, 'Gagal menambah kategori')
    throw new Error(message)
  }
}

const updateCategory = async ({
  id,
  payload,
}: {
  id: string
  payload: UpdateCategoryPayload
}): Promise<void> => {
  const response = await authenticatedFetch(`/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await getCategoryErrorMessage(response, 'Gagal mengubah kategori')
    throw new Error(message)
  }
}

const deleteCategory = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(`/categories/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const message = await getCategoryErrorMessage(response, 'Gagal menghapus kategori')
    throw new Error(message)
  }
}

const getCategoryErrorMessage = async (
  response: Response,
  fallbackMessage: string,
) => {
  try {
    const body = (await response.json()) as { message?: unknown }
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message
    }
  } catch {
    return fallbackMessage
  }

  return fallbackMessage
}
export const useMasterItemsQuery = () => {
  return useQuery({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: fetchItems,
  })
}

export const useMasterCategoriesQuery = () => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: fetchCategories,
  })
}

export const useCreateItemMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY })
    },
  })
}

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      await queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY })
    },
  })
}

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      await queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY })
    },
  })
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      await queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY })
    },
  })
}

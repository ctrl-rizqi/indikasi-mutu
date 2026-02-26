import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ActivityChecklist, ActivityLog, Item, User } from '@repo/resource'
import { authenticatedFetch } from '../lib/api-client'

export type ActivityLogWithRelations = ActivityLog & {
  user?: Pick<User, 'id' | 'name'>
  item?: Item
}

export type CreateActivityPayload = {
  itemId: string
  userId: string
  checklist: ActivityChecklist
  note?: string
  photo?: string
}

export const ACTIVITIES_QUERY_KEY = ['tugas-activities'] as const

const fetchActivities = async (): Promise<ActivityLogWithRelations[]> => {
  const response = await authenticatedFetch('/activities')

  if (!response.ok) {
    throw new Error('Gagal mengambil data aktivitas')
  }

  return (await response.json()) as ActivityLogWithRelations[]
}

const createActivity = async (
  payload: CreateActivityPayload,
): Promise<void> => {
  const response = await authenticatedFetch('/activities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Gagal menyimpan aktivitas')
  }
}

export const useTugasActivitiesQuery = () => {
  return useQuery({
    queryKey: ACTIVITIES_QUERY_KEY,
    queryFn: fetchActivities,
  })
}

export const useCreateActivityMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createActivity,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACTIVITIES_QUERY_KEY })
    },
  })
}

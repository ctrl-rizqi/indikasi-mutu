import { useQuery } from '@tanstack/react-query'
import type { Role } from '@repo/resource'
import { authenticatedFetch } from '../lib/api-client'

export type UserRow = {
    id: string
    username: string
    role: Role
}

export const USERS_QUERY_KEY = ['master-users'] as const

const fetchUsers = async (): Promise<UserRow[]> => {
    const response = await authenticatedFetch('/master/users')

    if (!response.ok) {
        throw new Error('Gagal mengambil data user')
    }

    return (await response.json()) as UserRow[]
}

export const useMasterUsersQuery = () => {
    return useQuery({
        queryKey: USERS_QUERY_KEY,
        queryFn: fetchUsers,
    })
}

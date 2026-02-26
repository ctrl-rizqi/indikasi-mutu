import { useQuery } from '@tanstack/react-query'
import type { Role } from '@repo/resource'

export type UserRow = {
    id: string
    username: string
    role: Role
}

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

export const USERS_QUERY_KEY = ['master-users'] as const

const fetchUsers = async (): Promise<UserRow[]> => {
    const response = await fetch(`${API_BASE_URL}/master/users`)

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

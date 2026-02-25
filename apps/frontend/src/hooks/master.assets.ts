import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ASSET_TYPE } from '@repo/resource'
import type { Asset, AssetType } from '@repo/resource'

export type AssetRow = Pick<Asset, 'id' | 'name' | 'type' | 'location'> & {
  createdAt: string
  updatedAt: string
}

export type CreateAssetPayload = {
  name: string
  type: AssetType
  location: string
}

export const ASSET_TYPES = Object.values(ASSET_TYPE) as AssetType[]

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

export const ASSETS_QUERY_KEY = ['master-assets'] as const

const fetchAssets = async (): Promise<AssetRow[]> => {
  const response = await fetch(`${API_BASE_URL}/master/assets`)

  if (!response.ok) {
    throw new Error('Gagal mengambil data aset')
  }

  return (await response.json()) as AssetRow[]
}

const createAsset = async (payload: CreateAssetPayload): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/master/assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Gagal menambah aset')
  }
}

export const useMasterAssetsQuery = () => {
  return useQuery({
    queryKey: ASSETS_QUERY_KEY,
    queryFn: fetchAssets,
  })
}

export const useCreateAssetMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAsset,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY })
    },
  })
}

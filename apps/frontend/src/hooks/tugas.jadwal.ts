import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Asset, Jadwal, Transaksi } from '@repo/resource'

export type JadwalWithRelations = Jadwal & {
  asset: Asset
  transaksi: Transaksi[]
}

export type CreateTransaksiPayload = {
  jadwalId: string
  actualDate: string
  hasilFisik: string
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

export const JADWALS_QUERY_KEY = ['tugas-jadwal'] as const

const fetchJadwals = async (): Promise<JadwalWithRelations[]> => {
  const response = await fetch(`${API_BASE_URL}/jadwal`)

  if (!response.ok) {
    throw new Error('Gagal mengambil data jadwal')
  }

  return (await response.json()) as JadwalWithRelations[]
}

const createTransaksi = async (
  payload: CreateTransaksiPayload,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/transaksi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Gagal menyimpan hasil transaksi')
  }
}

export const useTugasJadwalQuery = () => {
  return useQuery({
    queryKey: JADWALS_QUERY_KEY,
    queryFn: fetchJadwals,
  })
}

export const useCreateTransaksiMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTransaksi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: JADWALS_QUERY_KEY })
    },
  })
}

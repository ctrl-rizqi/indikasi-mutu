import { useQuery } from '@tanstack/react-query'
import { authenticatedFetch } from '../lib/api-client'

// Actual API response type from backend
export type LaporanApiResponse = {
  total: number
  byCategory: { label: string; value: number }[]
  trend: { date: string; count: number }[]
}

// Transformed response for UI
export type LaporanResponse = {
  numerator: number
  denominator: number
  percentage: string
  visualData: {
    label: string
    value: number
  }
}

export const LAPORAN_QUERY_KEY = ['laporan-indikator'] as const

const fetchLaporan = async (): Promise<LaporanResponse> => {
  const response = await authenticatedFetch('/laporan/indikator-mutu')

  if (!response.ok) {
    throw new Error('Gagal mengambil data laporan')
  }

  const data = (await response.json()) as LaporanApiResponse

  // Transform API response to UI format
  const denominator = data.total
  const numerator = data.byCategory.reduce((sum, cat) => sum + cat.value, 0)
  const percentage = denominator > 0
    ? `${Math.round((numerator / denominator) * 100)}%`
    : '0%'

  const maxCategory = data.byCategory.reduce(
    (max, cat) => (cat.value > max.value ? cat : max),
    { label: '-', value: 0 }
  )

  return {
    numerator,
    denominator,
    percentage,
    visualData: {
      label: maxCategory.label,
      value: parseFloat(percentage.replace('%', '')),
    },
  }
}

export const useLaporanIndikatorQuery = () => {
  return useQuery({
    queryKey: LAPORAN_QUERY_KEY,
    queryFn: fetchLaporan,
  })
}

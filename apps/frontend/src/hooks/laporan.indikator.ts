import { useQuery } from '@tanstack/react-query'

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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

export const LAPORAN_QUERY_KEY = ['laporan-indikator'] as const

const fetchLaporan = async (): Promise<LaporanResponse> => {
  const response = await fetch(`${API_BASE_URL}/laporan/indikator-mutu`)

  if (!response.ok) {
    throw new Error('Gagal mengambil data laporan')
  }

  const data = (await response.json()) as LaporanApiResponse

  // Transform API response to UI format
  const denominator = data.total // Total activities
  const numerator = data.byCategory.reduce((sum, cat) => sum + cat.value, 0) // Activities with category
  const percentage = denominator > 0
    ? `${Math.round((numerator / denominator) * 100)}%`
    : '0%'

  // Find category with highest value for label
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

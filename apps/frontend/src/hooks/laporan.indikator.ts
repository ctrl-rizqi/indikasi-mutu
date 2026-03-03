import { useQuery } from '@tanstack/react-query'
import { authenticatedFetch } from '../lib/api-client'

export type LaporanApiResponse = {
  meta: {
    contractVersion: number
    generatedAt: string
    filters: {
      itemId: string | null
    }
  }
  summary: {
    totalActivities: number
    uniqueItems: number
    uniqueCategories: number
    enumerator: number
    denumerator: number
    complianceRate: number
  }
  breakdowns: {
    byCategory: {
      categoryId: string
      categoryName: string
      count: number
      enumerator: number
      denumerator: number
      percentage: number
    }[]
    byCondition: {
      condition: string
      count: number
    }[]
  }
  trend: {
    daily: {
      date: string
      count: number
      enumerator: number
      denumerator: number
      percentage: number
    }[]
  }
  history: {
    id: string
    itemId: string
    itemName: string
    categoryName: string
    checkedAt: string
    condition: string
    isCompliant: boolean
    enumerator: number
    denumerator: number
    note: string | null
    photo: string | null
  }[]
}

export const LAPORAN_QUERY_KEY = ['laporan-indikator'] as const

const fetchLaporan = async (
  itemId?: string,
  startDate?: string,
  endDate?: string,
): Promise<LaporanApiResponse> => {
  const params = new URLSearchParams({ v: '3' })

  if (itemId) {
    params.set('itemId', itemId)
  }
  if (startDate) {
    params.set('startDate', startDate)
  }
  if (endDate) {
    params.set('endDate', endDate)
  }

  const url = `/laporan/indikator-mutu?${params.toString()}`

  const response = await authenticatedFetch(url)

  if (!response.ok) {
    throw new Error('Gagal mengambil data laporan')
  }

  const payload = (await response.json()) as any

  return {
    meta: {
      contractVersion: payload.meta?.contractVersion || 3,
      generatedAt: payload.meta?.generatedAt || new Date(0).toISOString(),
      filters: {
        itemId: payload.meta?.filters?.itemId || null,
      },
    },
    summary: {
      totalActivities: payload.summary?.totalActivities || 0,
      uniqueItems: payload.summary?.uniqueItems || 0,
      uniqueCategories: payload.summary?.uniqueCategories || 0,
      enumerator: payload.summary?.enumerator || 0,
      denumerator: payload.summary?.denumerator || 0,
      complianceRate: payload.summary?.complianceRate || 0,
    },
    breakdowns: {
      byCategory: Array.isArray(payload.breakdowns?.byCategory)
        ? payload.breakdowns.byCategory
        : [],
      byCondition: Array.isArray(payload.breakdowns?.byCondition)
        ? payload.breakdowns.byCondition
        : [],
    },
    trend: {
      daily: Array.isArray(payload.trend?.daily) ? payload.trend.daily : [],
    },
    history: Array.isArray(payload.history) ? payload.history : [],
  }
}

export const useLaporanIndikatorQuery = (
  itemId?: string,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: [...LAPORAN_QUERY_KEY, itemId, startDate, endDate] as const,
    queryFn: () => fetchLaporan(itemId, startDate, endDate),
    staleTime: 0,
  })
}

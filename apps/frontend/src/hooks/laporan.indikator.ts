import { useQuery } from '@tanstack/react-query'
import { authenticatedFetch } from '../lib/api-client'

export type LaporanApiResponse = {
  meta: {
    contractVersion: 2
    generatedAt: string
    filters: {
      itemId: string | null
    }
  }
  summary: {
    totalActivities: number
    uniqueItems: number
    uniqueCategories: number
  }
  breakdowns: {
    byCategory: {
      categoryId: string
      categoryName: string
      count: number
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
    }[]
  }
  history: {
    id: string
    itemId: string
    itemName: string
    categoryName: string
    checkedAt: string
    condition: string
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
  const params = new URLSearchParams({ v: '2' })

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

  const payload = (await response.json()) as Partial<LaporanApiResponse>

  const generatedAt =
    typeof payload.meta?.generatedAt === 'string'
      ? payload.meta.generatedAt
      : new Date(0).toISOString()

  const filterItemId =
    typeof payload.meta?.filters?.itemId === 'string'
      ? payload.meta.filters.itemId
      : null

  return {
    meta: {
      contractVersion: 2,
      generatedAt,
      filters: {
        itemId: filterItemId,
      },
    },
    summary: {
      totalActivities:
        typeof payload.summary?.totalActivities === 'number'
          ? payload.summary.totalActivities
          : 0,
      uniqueItems:
        typeof payload.summary?.uniqueItems === 'number'
          ? payload.summary.uniqueItems
          : 0,
      uniqueCategories:
        typeof payload.summary?.uniqueCategories === 'number'
          ? payload.summary.uniqueCategories
          : 0,
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
    staleTime: 0, // Always fetch fresh data when filters change
  })
}

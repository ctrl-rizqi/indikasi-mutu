import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { LaporanApiResponse } from '../hooks/laporan.indikator'
import { useLaporanIndikatorQuery } from '../hooks/laporan.indikator'
import { useTugasItemsQuery } from '../hooks/tugas.activities'
import ProtectedRoute from '../components/ProtectedRoute'

export const Route = createFileRoute('/laporan')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(
    undefined,
  )
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data: items = [] } = useTugasItemsQuery()
  const { data, isLoading, error, refetch, isFetching } =
    useLaporanIndikatorQuery(selectedItemId, startDate, endDate)

  const defaultLaporan: LaporanApiResponse = {
    meta: {
      contractVersion: 2,
      generatedAt: new Date(0).toISOString(),
      filters: {
        itemId: null,
      },
    },
    summary: {
      totalActivities: 0,
      uniqueItems: 0,
      uniqueCategories: 0,
    },
    breakdowns: {
      byCategory: [],
      byCondition: [],
    },
    trend: {
      daily: [],
    },
    history: [],
  }

  const laporan = data ?? defaultLaporan
  const byCategory = Array.isArray(laporan.breakdowns.byCategory)
    ? laporan.breakdowns.byCategory
    : []
  const byCondition = Array.isArray(laporan.breakdowns.byCondition)
    ? laporan.breakdowns.byCondition
    : []
  const trend = Array.isArray(laporan.trend.daily) ? laporan.trend.daily : []
  const history = Array.isArray(laporan.history) ? laporan.history : []
  const selectedItemName = items.find(
    (item) => item.id === selectedItemId,
  )?.name
  const dominantCategory = byCategory.reduce(
    (max, category) => (category.count > max.count ? category : max),
    { categoryId: '-', categoryName: '-', count: 0 },
  )
  const dominantCondition = byCondition.reduce(
    (max, condition) => (condition.count > max.count ? condition : max),
    { condition: '-', count: 0 },
  )
  const latestTrend = trend[trend.length - 1]
  const currentBreakdown = selectedItemId ? byCondition : byCategory
  const currentBreakdownTitle = selectedItemId
    ? 'Distribusi Kondisi'
    : 'Distribusi Kategori'
  const currentHighlightTitle = selectedItemId
    ? `Kondisi Terbanyak (${dominantCondition.condition})`
    : `Kategori Terbanyak (${dominantCategory.categoryName})`
  const currentHighlightValue = selectedItemId
    ? dominantCondition.count
    : dominantCategory.count
  const formatCheckedAt = (value: string) =>
    new Date(value).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  console.log(laporan)

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <section className="border shadow-md bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Laporan Indikator Mutu
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Ringkasan Kepatuhan Pemeliharaan Rutin Aset (Visualisasi Admin)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Date Filters */}
              <div className="flex items-center gap-1">
                <label className="text-xs font-semibold text-slate-500">
                  Dari:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border px-2 py-1 text-sm rounded"
                />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-xs font-semibold text-slate-500">
                  Hingga:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border px-2 py-1 text-sm rounded"
                />
              </div>
              {/* Item Dropdown */}
              <select
                value={selectedItemId || ''}
                onChange={(e) => setSelectedItemId(e.target.value || undefined)}
                className="border px-3 py-1.5 text-sm rounded"
              >
                <option value="">Semua Item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="bg-slate-100 border px-3 py-1.5 text-sm hover:bg-slate-200"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? 'Memuat...' : 'Refresh'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-500 font-mono animate-pulse">
              Mengambil data statistik terbaru...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-mono">
              Error: {error.message}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 mb-2">
                    Total Aktivitas
                  </h3>
                  <p className="text-5xl font-bold font-mono text-slate-800">
                    {laporan.summary.totalActivities}
                  </p>
                  <div className="mt-2 text-xs text-slate-400">
                    Seluruh log aktivitas sesuai filter yang dipilih
                  </div>
                </div>

                <div className="border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 mb-2">
                    Total Kategori
                  </h3>
                  <p className="text-5xl font-bold font-mono text-slate-800">
                    {laporan.summary.uniqueCategories}
                  </p>
                  <div className="mt-2 text-xs text-slate-400">
                    Jumlah kategori unik dari data aktivitas
                  </div>
                </div>

                <div className="border-2 border-blue-200 bg-blue-50 p-6 shadow-sm rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                  <h3 className="text-sm font-semibold text-blue-700 mb-2 relative z-10">
                    {currentHighlightTitle}
                  </h3>
                  <p className="text-5xl font-bold font-mono text-blue-800 relative z-10">
                    {currentHighlightValue}
                  </p>
                  <div className="mt-2 text-xs text-blue-500 font-semibold relative z-10">
                    Aktivitas terbanyak pada breakdown saat ini
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">
                    {currentBreakdownTitle}
                  </h3>
                  {currentBreakdown.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Belum ada data breakdown
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {currentBreakdown.map((entry) => {
                        const count =
                          'condition' in entry ? entry.count : entry.count
                        const label =
                          'condition' in entry
                            ? entry.condition
                            : entry.categoryName
                        const width = laporan.summary.totalActivities
                          ? Math.round(
                              (count / laporan.summary.totalActivities) * 100,
                            )
                          : 0

                        return (
                          <div key={label}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-semibold text-slate-700">
                                {label}
                              </span>
                              <span className="font-mono text-slate-500">
                                {count}
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-2 rounded-full bg-blue-500 transition-all"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">
                    Tren Harian
                  </h3>
                  {trend.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Belum ada data tren
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {trend.map((entry) => (
                        <div
                          key={entry.date}
                          className="flex items-center justify-between text-sm border-b border-slate-200 pb-2"
                        >
                          <span className="text-slate-600">{entry.date}</span>
                          <span className="font-mono font-semibold text-slate-800">
                            {entry.count}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 text-xs text-slate-500">
                        Terakhir diperbarui: {latestTrend?.date ?? '-'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedItemId ? (
                <div className="border border-slate-200 bg-white p-6 shadow-sm mt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">
                    Riwayat Pemeriksaan Item
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {selectedItemName ?? 'Item terpilih'} - {history.length}{' '}
                    riwayat
                  </p>
                  {history.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Belum ada riwayat pemeriksaan untuk item ini
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((entry) => (
                        <div
                          key={entry.id}
                          className="border border-slate-200 rounded p-3 bg-slate-50"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-slate-700">
                              {entry.itemName}
                            </div>
                            <div className="text-xs font-mono text-slate-500">
                              {formatCheckedAt(entry.checkedAt)}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-slate-600">
                            Kondisi:{' '}
                            <span className="font-semibold">
                              {entry.condition}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            Kategori: {entry.categoryName}
                          </div>
                          {entry.note ? (
                            <div className="mt-1 text-sm text-slate-500">
                              Catatan: {entry.note}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </ProtectedRoute>
  )
}

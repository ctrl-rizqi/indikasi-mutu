import { createFileRoute } from '@tanstack/react-router'
import { useLaporanIndikatorQuery } from '../hooks/laporan.indikator'
import ProtectedRoute from '../components/ProtectedRoute'

export const Route = createFileRoute('/laporan')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const { data, isLoading, error, refetch, isFetching } =
    useLaporanIndikatorQuery()

  // Fallback to default values when no data
  const defaultLaporan = {
    numerator: 0,
    denominator: 0,
    percentage: '0%',
    visualData: { label: '-', value: 0 },
  }

  const laporan = data ?? defaultLaporan

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
            <button
              type="button"
              className="bg-slate-100 border px-3 py-1.5 text-sm hover:bg-slate-200"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? 'Memuat...' : 'Refresh'}
            </button>
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
                    Numerator (Pemeliharaan Tepat Waktu)
                  </h3>
                  <p className="text-5xl font-bold font-mono text-slate-800">
                    {laporan.numerator}
                  </p>
                  <div className="mt-2 text-xs text-slate-400">
                    Total Alat sudah di inspeksi jadwal bulan ini
                  </div>
                </div>

                <div className="border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 mb-2">
                    Denominator (Total Seluruh Aset)
                  </h3>
                  <p className="text-5xl font-bold font-mono text-slate-800">
                    {laporan.denominator}
                  </p>
                  <div className="mt-2 text-xs text-slate-400">
                    Total Alat Master aktif di sistem
                  </div>
                </div>

                <div className="border-2 border-blue-200 bg-blue-50 p-6 shadow-sm rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                  <h3 className="text-sm font-semibold text-blue-700 mb-2 relative z-10">
                    Capaian Kepatuhan ({laporan.visualData.label})
                  </h3>
                  <p className="text-5xl font-bold font-mono text-blue-800 relative z-10">
                    {laporan.percentage}
                  </p>
                  <div className="mt-2 text-xs text-blue-500 font-semibold relative z-10">
                    Target: {'>'} 90%
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-8 min-h-75 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 rounded-full border-8 border-slate-200 border-r-blue-500 border-t-blue-500 border-l-blue-500 transform rotate-45 mx-auto mb-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                      <span className="text-2xl font-bold text-slate-700">
                        {laporan.visualData.value}%
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-500 font-mono text-sm max-w-sm mx-auto">
                    [ Placeholder Visualisasi Chart Kepatuhan dari Engine
                    Statistik ]
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </ProtectedRoute>
  )
}

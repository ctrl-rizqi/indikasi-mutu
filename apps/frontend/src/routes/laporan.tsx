import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'
const LAPORAN_QUERY_KEY = ['laporan-indikator'] as const

type LaporanResponse = {
  numerator: number
  denominator: number
  percentage: string
  visualData: {
    label: string
    value: number
  }
}

const fetchLaporan = async (): Promise<LaporanResponse> => {
  const response = await fetch(`${API_BASE_URL}/laporan/indikator-mutu`)
  if (!response.ok) {
    throw new Error('Gagal mengambil data laporan')
  }
  return (await response.json()) as LaporanResponse
}

export const Route = createFileRoute('/laporan')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    data: laporan,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: LAPORAN_QUERY_KEY,
    queryFn: fetchLaporan,
  })

  const errorMessage = error instanceof Error ? error.message : null

  return (
    <div className="p-6 space-y-6">
      <section className="border shadow-md bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold">Laporan Indikator Mutu</h1>
            <p className="text-sm text-slate-600 mt-1">
              Ringkasan Kepatuhan Pemeliharaan Rutin Aset.
            </p>
          </div>
          <button
            type="button"
            className="border px-3 py-1.5 text-sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? 'Memuat...' : 'Refresh'}
          </button>
        </div>

        {errorMessage ? (
          <p className="text-sm text-red-600 mb-3">{errorMessage}</p>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            Memuat data laporan...
          </p>
        ) : laporan ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border bg-slate-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-semibold text-slate-500 mb-1">
                  Numerator (Tepat Waktu)
                </h3>
                <p className="text-4xl font-bold font-mono text-slate-800">
                  {laporan.numerator}
                </p>
              </div>

              <div className="border bg-slate-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-semibold text-slate-500 mb-1">
                  Denominator (Total Rencana)
                </h3>
                <p className="text-4xl font-bold font-mono text-slate-800">
                  {laporan.denominator}
                </p>
              </div>

              <div className="border bg-blue-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-semibold text-blue-600 mb-1">
                  Capaian ({laporan.visualData.label})
                </h3>
                <p className="text-4xl font-bold font-mono text-blue-800">
                  {laporan.percentage}
                </p>
              </div>
            </div>

            <div className="border bg-slate-50 p-8 rounded-lg min-h-[300px] flex items-center justify-center">
              <p className="text-slate-400 font-mono text-center">
                [ Placeholder Visualisasi Chart ]
                <br />
                Value: {laporan.visualData.value}%
              </p>
            </div>
          </>
        ) : null}
      </section>
    </div>
  )
}

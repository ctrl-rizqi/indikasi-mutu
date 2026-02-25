import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  useCreateTransaksiMutation,
  useTugasJadwalQuery,
} from '@/hooks/tugas.jadwal'

export const Route = createFileRoute('/tugas')({
  component: RouteComponent,
})

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
  const [selectedJadwalId, setSelectedJadwalId] = useState<string | null>(null)

  // Transaction submission form state
  const [form, setForm] = useState({
    actualDate: new Date().toISOString().slice(0, 16),
    hasilFisik: '',
  })

  const {
    data: jadwals = [],
    isLoading,
    isFetching,
    error: jadwalsError,
    refetch,
  } = useTugasJadwalQuery()

  const {
    mutateAsync: submitTransaksi,
    isPending: isSubmitting,
    error: submitError,
  } = useCreateTransaksiMutation()

  const pendingTasks = useMemo(() => {
    return jadwals.filter((j) => !j.transaksi || j.transaksi.length === 0)
  }, [jadwals])

  const completedTasks = useMemo(() => {
    return jadwals.filter((j) => j.transaksi && j.transaksi.length > 0)
  }, [jadwals])

  const filteredJadwals =
    activeTab === 'pending' ? pendingTasks : completedTasks
  const currentJadwal = jadwals.find((j) => j.id === selectedJadwalId)

  const errorMessage =
    (jadwalsError instanceof Error ? jadwalsError.message : null) ??
    (submitError instanceof Error ? submitError.message : null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentJadwal) return

    try {
      await submitTransaksi({
        jadwalId: currentJadwal.id,
        actualDate: new Date(form.actualDate).toISOString(),
        hasilFisik: form.hasilFisik,
      })

      setSelectedJadwalId(null)
      setForm({
        actualDate: new Date().toISOString().slice(0, 16),
        hasilFisik: '',
      })
    } catch {
      return
    }
  }

  return (
    <div className="p-6 h-full flex flex-col lg:flex-row gap-6">
      {/* Left Column: Task List */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white border shadow-md p-4 min-h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold">Tugas Hari Ini</h1>
            <p className="text-sm text-slate-500 mt-1">
              Daftar pemeliharaan aset
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

        <div className="flex gap-2 mt-2 mb-4">
          <button
            onClick={() => {
              setActiveTab('pending')
              setSelectedJadwalId(null)
            }}
            className={`flex-1 py-2 text-sm font-medium border ${
              activeTab === 'pending'
                ? 'bg-slate-100 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Pending ({pendingTasks.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('completed')
              setSelectedJadwalId(null)
            }}
            className={`flex-1 py-2 text-sm font-medium border ${
              activeTab === 'completed'
                ? 'bg-slate-100 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Selesai ({completedTasks.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 border-t pt-2">
          {isLoading ? (
            <p className="text-sm text-slate-500 text-center mt-4">
              Memuat data...
            </p>
          ) : filteredJadwals.length === 0 ? (
            <p className="text-sm text-slate-500 text-center mt-4">
              Tidak ada tugas {activeTab === 'pending' ? 'pending' : 'selesai'}.
            </p>
          ) : (
            filteredJadwals.map((jadwal) => {
              const tr = jadwal.transaksi?.[0]
              return (
                <div
                  key={jadwal.id}
                  onClick={() => setSelectedJadwalId(jadwal.id)}
                  className={`p-3 border cursor-pointer hover:bg-slate-50 flex flex-col gap-1 ${
                    selectedJadwalId === jadwal.id
                      ? 'border-slate-800 bg-slate-50'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold px-2 border bg-white">
                      {jadwal.asset?.type}
                    </span>
                    {tr && (
                      <span
                        className={`text-xs ${tr.status === 'TEPAT_WAKTU' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {tr.status}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm">
                    {jadwal.asset?.name || 'Aset Tidak Ditemukan'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {jadwal.asset?.location}
                  </p>
                  <p className="text-xs text-slate-500">
                    Jadwal:{' '}
                    {new Date(jadwal.plannedDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Column: Task Detail / Form */}
      <div className="w-full lg:w-2/3 h-full flex flex-col bg-white border shadow-md">
        {errorMessage ? (
          <div className="p-4 border-b bg-red-50 text-red-600 text-sm">
            {errorMessage}
          </div>
        ) : null}

        {currentJadwal ? (
          <div className="flex flex-col h-full">
            {/* Header Detail */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{currentJadwal.asset?.name}</h2>
              <p className="text-sm text-slate-600 mt-2">
                Lokasi: {currentJadwal.asset?.location} <br />
                Jadwal:{' '}
                {new Date(currentJadwal.plannedDate).toLocaleString('id-ID')}
              </p>
            </div>

            {/* Form Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'pending' ? (
                <form className="max-w-2xl space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Waktu Pengerjaan
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border px-3 py-2"
                      value={form.actualDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, actualDate: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Catatan / Hasil Fisik
                    </label>
                    <textarea
                      rows={4}
                      className="w-full border px-3 py-2"
                      placeholder="Masukkan catatan kondisi fisik..."
                      value={form.hasilFisik}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, hasilFisik: e.target.value }))
                      }
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 border px-4 py-2 bg-slate-900 text-white font-medium disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                  </button>
                </form>
              ) : (
                <div className="max-w-2xl space-y-4 text-sm">
                  {currentJadwal.transaksi?.[0] &&
                    (() => {
                      const tr = currentJadwal.transaksi[0]
                      return (
                        <>
                          <div className="border p-4 mb-4">
                            <h3 className="font-semibold mb-2">
                              Status Pengerjaan
                            </h3>
                            <p>
                              Status:{' '}
                              <b
                                className={
                                  tr.status === 'TEPAT_WAKTU'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }
                              >
                                {tr.status}
                              </b>
                            </p>
                            <p>
                              Waktu Aktual:{' '}
                              {new Date(tr.actualDate).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Hasil Fisik:</h3>
                            <div className="border p-4 whitespace-pre-wrap bg-slate-50">
                              {tr.hasilFisik}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-slate-500 text-sm">
            Pilih tugas di panel kiri untuk melihat detail atau mengisi form
            transaksi
          </div>
        )}
      </div>
    </div>
  )
}

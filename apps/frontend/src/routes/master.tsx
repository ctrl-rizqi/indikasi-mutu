import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ASSET_TYPES,
  useCreateAssetMutation,
  useMasterAssetsQuery,
} from '@/hooks/master.assets'
import type { CreateAssetPayload } from '@/hooks/master.assets'

export const Route = createFileRoute('/master')({
  component: RouteComponent,
})

function RouteComponent() {
  const [form, setForm] = useState<CreateAssetPayload>({
    name: '',
    type: 'AC',
    location: '',
  })

  const {
    data: assets = [],
    isLoading,
    isFetching,
    error: assetsError,
    refetch,
  } = useMasterAssetsQuery()

  const {
    mutateAsync: submitAsset,
    isPending: isSubmitting,
    error: submitError,
  } = useCreateAssetMutation()

  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [assets])

  const errorMessage =
    (assetsError instanceof Error ? assetsError.message : null) ??
    (submitError instanceof Error ? submitError.message : null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await submitAsset(form)

      setForm({
        name: '',
        type: 'AC',
        location: '',
      })
    } catch {
      return
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div></div>
      <section className="border shadow-md bg-white p-4">
        <h1 className="text-lg font-semibold">Master Aset</h1>
        <p className="text-sm text-slate-600 mt-1">
          Tambah aset baru dan lihat daftar aset.
        </p>

        <form
          className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3"
          onSubmit={handleSubmit}
        >
          <input
            className="border px-3 py-2"
            placeholder="Nama aset"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            required
          />

          <select
            className="border px-3 py-2"
            value={form.type}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                type: event.target.value as CreateAssetPayload['type'],
              }))
            }
            required
          >
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            className="border px-3 py-2"
            placeholder="Lokasi"
            value={form.location}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, location: event.target.value }))
            }
            required
          />

          <button
            type="submit"
            className="border px-3 py-2 bg-slate-900 text-white disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Tambah'}
          </button>
        </form>
      </section>

      <section className="border bg-white shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Daftar Aset</h2>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Nama</th>
                <th className="text-left py-2 px-2">Tipe</th>
                <th className="text-left py-2 px-2">Lokasi</th>
                <th className="text-left py-2 px-2">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {sortedAssets.length === 0 ? (
                <tr>
                  <td className="py-3 px-2 text-slate-500" colSpan={4}>
                    {isLoading ? 'Memuat data...' : 'Belum ada data aset'}
                  </td>
                </tr>
              ) : (
                sortedAssets.map((asset) => (
                  <tr key={asset.id} className="border-b">
                    <td className="py-2 px-2">{asset.name}</td>
                    <td className="py-2 px-2">{asset.type}</td>
                    <td className="py-2 px-2">{asset.location}</td>
                    <td className="py-2 px-2">
                      {new Date(asset.createdAt).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

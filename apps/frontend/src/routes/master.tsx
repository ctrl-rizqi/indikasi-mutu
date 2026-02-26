import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  useMasterItemsQuery,
  useMasterCategoriesQuery,
  useCreateItemMutation,
} from '../hooks/master.items'
import ProtectedRoute from '../components/ProtectedRoute'

export const Route = createFileRoute('/master')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const [form, setForm] = useState({
    name: '',
    code: '',
    location: '',
    categoryId: '',
    spec: '',
  })

  const { data: items = [], isLoading: isLoadingItems } = useMasterItemsQuery()
  const { data: categories = [], isLoading: isLoadingCategories } = useMasterCategoriesQuery()
  const createItemMutation = useCreateItemMutation()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await createItemMutation.mutateAsync({
        name: form.name,
        code: form.code,
        location: form.location,
        categoryId: form.categoryId,
        spec: form.spec || undefined,
      })

      // Reset form
      setForm({
        name: '',
        code: '',
        location: '',
        categoryId: categories[0]?.id || '',
        spec: '',
      })
    } catch (error) {
      console.error('Failed to create item:', error)
    }
  }

  const isLoading = isLoadingItems || isLoadingCategories
  const isSubmitting = createItemMutation.isPending

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="p-6 space-y-6">
      <section className="border shadow-md bg-white p-4">
        <h1 className="text-lg font-semibold border-b pb-2 mb-4">
          Kelola Master Item
        </h1>
        <p className="text-sm text-slate-600 mb-4 font-mono">
          [Alur Admin] Tambah Alat: AC/APAR/Lainnya
        </p>

        <form
          className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 border border-slate-200"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-500">
              Nama Alat
            </label>
            <input
              className="border px-3 py-2 w-full text-sm"
              placeholder="e.g AC Daikin 1PK"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-500">
              Kode Alat / No Seri
            </label>
            <input
              className="border px-3 py-2 w-full text-sm"
              placeholder="e.g AC-LT2-01"
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, code: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-500">
              Kategori
            </label>
            <select
              className="border px-3 py-2 w-full text-sm bg-white"
              value={form.categoryId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, categoryId: e.target.value }))
              }
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-500">
              Lokasi / Ruangan
            </label>
            <input
              className="border px-3 py-2 w-full text-sm"
              placeholder="e.g Ruang Tunggu"
              value={form.location}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, location: e.target.value }))
              }
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1 text-slate-500">
              Spesifikasi Detail (Opsional)
            </label>
            <input
              className="border px-3 py-2 w-full text-sm"
              placeholder="e.g Watt, Kapasitas..."
              value={form.spec}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, spec: e.target.value }))
              }
            />
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              className="border px-6 py-2 bg-slate-900 text-white font-semibold disabled:opacity-50 text-sm hover:bg-slate-800 transition shadow-sm"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Menyimpan...' : '+ Tambah Alat Master'}
            </button>
          </div>
        </form>
      </section>

      <section className="border bg-white shadow-md p-4 mt-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h2 className="text-base font-semibold">
            Daftar Master Item Terdaftar
          </h2>
          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
            Total: {items.length} Item
          </span>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-500">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50">
                <tr className="border-b font-mono text-slate-600">
                  <th className="text-left py-3 px-3">Kode</th>
                  <th className="text-left py-3 px-3">Nama Alat</th>
                  <th className="text-left py-3 px-3">Kategori</th>
                  <th className="text-left py-3 px-3">Lokasi</th>
                  <th className="text-left py-3 px-3">Status</th>
                  <th className="text-right py-3 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-slate-500" colSpan={6}>
                      Belum ada data item
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-slate-50 transition"
                    >
                      <td className="py-3 px-3 font-mono font-medium">
                        {item.code}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {item.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.category?.name || 'Lainnya'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.location}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 p-1 mx-1 border border-blue-200 bg-blue-50">
                          Edit
                        </button>
                        <button className="text-xs font-semibold text-red-600 hover:text-red-800 p-1 mx-1 border border-red-200 bg-red-50">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
    </ProtectedRoute>
  )
}

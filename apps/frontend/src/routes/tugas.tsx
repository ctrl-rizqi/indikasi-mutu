import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTugasItemsQuery, useCreateActivityMutation } from '../hooks/tugas.activities'
import { useAuthStore } from '../store/authStore'
import ProtectedRoute from '../components/ProtectedRoute'
import { Search, Check, X } from 'lucide-react'

export const Route = createFileRoute('/tugas')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const user = useAuthStore((state) => state.user)
  const { data: items = [], isLoading } = useTugasItemsQuery()
  const createActivityMutation = useCreateActivityMutation()

  const [search, setSearch] = useState('')
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [form, setForm] = useState({
    kondisi: '',
    catatan: '',
  })
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase())
  )

  const handleExpand = (itemId: string) => {
    setExpandedItemId(itemId)
    setForm({ kondisi: '', catatan: '' })
    setSubmitSuccess(null)
  }

  const handleCollapse = () => {
    setExpandedItemId(null)
    setForm({ kondisi: '', catatan: '' })
    setSubmitSuccess(null)
  }

  const handleSubmit = async (itemId: string, event: React.FormEvent) => {
    event.preventDefault()
    if (!user?.id || !form.kondisi) return

    await createActivityMutation.mutateAsync({
      itemId,
      userId: user.id,
      checklist: { kondisi: form.kondisi },
      note: form.catatan || undefined,
    })

    setSubmitSuccess(itemId)
    setForm({ kondisi: '', catatan: '' })
    
    // Auto collapse after 2 seconds
    setTimeout(() => {
      handleCollapse()
    }, 2000)
  }

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Tugas / Aktivitas</h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        {/* Loading State */}
        {isLoading && <p className="text-gray-500">Memuat...</p>}

        {/* Item List */}
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow border">
              {/* Item Row - Clickable */}
              <div
                onClick={() => handleExpand(item.id)}
                className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.location}</p>
                </div>
                <div className="text-gray-400">
                  {expandedItemId === item.id ? <X size={20} /> : <Check size={20} />}
                </div>
              </div>

              {/* Expanded Form */}
              {expandedItemId === item.id && (
                <div className="px-4 pb-4 border-t">
                  <form
                    onSubmit={(e) => handleSubmit(item.id, e)}
                    className="pt-4 space-y-4"
                  >
                    {/* Kondisi */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Kondisi</label>
                      <select
                        value={form.kondisi}
                        onChange={(e) => setForm((prev) => ({ ...prev, kondisi: e.target.value }))}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">-- Pilih Kondisi --</option>
                        <option value="baik">Baik</option>
                        <option value="rusak">Rusak</option>
                        <option value="hilang">Hilang</option>
                      </select>
                    </div>

                    {/* Catatan */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Catatan</label>
                      <textarea
                        value={form.catatan}
                        onChange={(e) => setForm((prev) => ({ ...prev, catatan: e.target.value }))}
                        className="w-full p-2 border rounded"
                        rows={2}
                        placeholder="Tambahkan catatan..."
                      />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={createActivityMutation.isPending || !form.kondisi}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {createActivityMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCollapse}
                        className="px-4 py-2 border rounded hover:bg-gray-50"
                      >
                        Batal
                      </button>
                    </div>

                    {/* Success Message */}
                    {submitSuccess === item.id && (
                      <p className="text-green-600 text-sm">✓ Aktivitas berhasil disimpan</p>
                    )}
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <p className="text-gray-500 text-center py-8">Item tidak ditemukan</p>
        )}
      </div>
    </ProtectedRoute>
  )
}

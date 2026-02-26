import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Filter,
  BarChart3,
  Settings,
  ClipboardList,
} from 'lucide-react'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({ component: App })

// Dummy Data
const DUMMY_ASSETS = [
  {
    id: '1',
    name: 'AC Split 1/2 PK',
    code: 'AC-001',
    location: 'Ruang Rawat Inap 1',
    category: 'AC',
  },
  {
    id: '2',
    name: 'APAR 3Kg Serbuk',
    code: 'AP-001',
    location: 'Koridor Utama',
    category: 'APAR',
  },
  {
    id: '3',
    name: 'Genset 500kVA',
    code: 'GS-001',
    location: 'Gedung Mesin',
    category: 'Listrik',
  },
]

const DUMMY_LOGS = [
  {
    id: '1',
    asset: 'AC-001 - AC Split 1/2 PK',
    date: '2026-02-25 08:30',
    user: 'Petugas 1',
    status: 'Selesai',
    note: 'Freon normal, filter dibersihkan',
  },
  {
    id: '2',
    asset: 'AP-001 - APAR 3Kg Serbuk',
    date: '2026-02-24 14:00',
    user: 'Petugas 1',
    status: 'Selesai',
    note: 'Tekanan APAR baik',
  },
  {
    id: '3',
    asset: 'GS-001 - Genset 500kVA',
    date: '2026-02-23 09:15',
    user: 'Petugas 2',
    status: 'Perlu Perbaikan',
    note: 'Oli perlu diganti minggu depan',
  },
]

function App() {
  const navigate = useNavigate()
  const [role, setRole] = useState<string | null>(null)

  // User Form State
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [formInput, setFormInput] = useState({ condition: 'Baik', note: '' })
  const [submitted, setSubmitted] = useState(false)

  // Admin Filter State
  const [filterCat, setFilterCat] = useState('Semua')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const r = localStorage.getItem('dummy_role')
      if (!r) {
        navigate({ to: '/login' })
      } else {
        setRole(r)
      }
    }
  }, [navigate])

  if (!role)
    return <div className="p-8 text-center text-slate-500">Memuat...</div>

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setSelectedAsset('')
      setFormInput({ condition: 'Baik', note: '' })
      alert('Aktivitas berhasil disimpan (Dummy)')
    }, 1000)
  }

  // ==== ADMIN VIEW ====
  if (role === 'ADMIN') {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Dashboard Statistik
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Laporan aktivitas pemeliharaan alat/fasilitas
              </p>
            </div>
            <button
              onClick={() => navigate({ to: '/master' })}
              className="flex items-center gap-2 bg-slate-900 border text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition"
            >
              <Settings className="w-4 h-4" /> Kelola Master Item
            </button>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Inspeksi',
                value: '142',
                icon: <ClipboardList className="w-5 h-5 text-blue-500" />,
                color: 'bg-blue-50 border-blue-100',
              },
              {
                title: 'Kondisi Baik',
                value: '130',
                icon: <CheckCircle className="w-5 h-5 text-green-500" />,
                color: 'bg-green-50 border-green-100',
              },
              {
                title: 'Perlu Perbaikan',
                value: '12',
                icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
                color: 'bg-orange-50 border-orange-100',
              },
              {
                title: 'Kepatuhan',
                value: '92%',
                icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
                color: 'bg-purple-50 border-purple-100',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`p-5 ${stat.color} shadow-sm border border-slate-200`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600 font-mono">
                    {stat.title}
                  </h3>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-slate-800 font-mono">
                  {stat.value}
                </p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-white border border-slate-200 shadow-sm p-6 col-span-3 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Log Aktivitas Terbaru
                </h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    className="border px-2 py-1 text-sm bg-slate-50"
                    value={filterCat}
                    onChange={(e) => setFilterCat(e.target.value)}
                  >
                    <option>Semua</option>
                    <option>AC</option>
                    <option>APAR</option>
                    <option>Listrik</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200 font-mono">
                      <th className="pb-3 px-4 py-2 font-semibold text-slate-500 text-sm">
                        Waktu
                      </th>
                      <th className="pb-3 px-4 py-2 font-semibold text-slate-500 text-sm">
                        Alat/Lokasi
                      </th>
                      <th className="pb-3 px-4 py-2 font-semibold text-slate-500 text-sm">
                        Petugas
                      </th>
                      <th className="pb-3 px-4 py-2 font-semibold text-slate-500 text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-mono">
                    {DUMMY_LOGS.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-4 text-slate-500">{log.date}</td>
                        <td className="py-4 px-4 font-medium text-slate-700">
                          {log.asset}
                        </td>
                        <td className="py-4 px-4 text-slate-500">{log.user}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold border ${log.status === 'Selesai' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white border border-slate-200 shadow-sm p-6 col-span-3 lg:col-span-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Visualisasi Dummy
              </h2>
              <div className="h-48 border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                <p className="text-slate-400 font-mono text-sm">
                  [ Diagram Aktivitas ]
                </p>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Representasi visual data sesuai dengan flowchart Admin Dashboard
                (Charts).
              </p>
            </section>
          </div>
        </div>
      </div>
    )
  }

  // ==== USER (PETUGAS) VIEW ====
  return (
    <div className="min-h-full bg-slate-50 p-6 flex justify-center">
      <div className="max-w-xl w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Dashboard Petugas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pilih alat dari Master untuk melakukan input aktivitas pemeliharaan.
          </p>
        </div>

        {!selectedAsset ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-700 mb-2">
              Pilih Alat / Fasilitas
            </h2>
            {DUMMY_ASSETS.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset.id)}
                className="bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md cursor-pointer transition flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-slate-800">{asset.name}</h3>
                  <p className="text-sm text-slate-500">
                    {asset.code} - {asset.location}
                  </p>
                </div>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 text-xs font-semibold rounded-full border border-slate-200">
                  {asset.category}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
            <button
              onClick={() => setSelectedAsset('')}
              className="text-sm text-blue-600 hover:text-blue-800 mb-4 font-semibold"
            >
              &larr; Kembali ke daftar alat
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Input Aktivitas
            </h2>
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded text-sm">
              <span className="font-semibold text-slate-700">
                Dimensi Alat:
              </span>
              {DUMMY_ASSETS.find((a) => a.id === selectedAsset)?.name} (
              {DUMMY_ASSETS.find((a) => a.id === selectedAsset)?.location})
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Kondisi Alat / Checklist
                </label>
                <select
                  className="w-full border border-slate-300 px-3 py-2 text-sm bg-white"
                  value={formInput.condition}
                  onChange={(e) =>
                    setFormInput({ ...formInput, condition: e.target.value })
                  }
                  required
                >
                  <option>Baik</option>
                  <option>Perlu Perbaikan Ringan</option>
                  <option>Rusak / Ganti Sparepart</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  className="w-full border border-slate-300 px-3 py-2 text-sm bg-white min-h-[100px]"
                  placeholder="Deskripsi pekerjaan atau temuan..."
                  value={formInput.note}
                  onChange={(e) =>
                    setFormInput({ ...formInput, note: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitted}
                  className="w-full bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitted ? 'Menyimpan...' : 'Simpan Aktivitas'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

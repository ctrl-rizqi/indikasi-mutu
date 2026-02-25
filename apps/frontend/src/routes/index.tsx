import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const stats = [
    {
      title: 'Kepatuhan Hari Ini',
      value: '95%',
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      color: 'bg-green-50 border-green-100',
    },
    {
      title: 'Tugas Selesai',
      value: '24/28',
      icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
      color: 'bg-blue-50 border-blue-100',
    },
    {
      title: 'Terlambat',
      value: '2',
      icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
      color: 'bg-orange-50 border-orange-100',
    },
    {
      title: 'Belum Dikerjakan',
      value: '2',
      icon: <Clock className="w-6 h-6 text-gray-500" />,
      color: 'bg-white border-gray-100',
    },
  ]

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`p-6 ${stat.color} shadow-sm transition-all hover:shadow-md border border-slate-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600 font-mono">
                  {stat.title}
                </h3>
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-slate-800 font-mono">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="bg-white border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Jadwal Pemeliharaan Hari Ini
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 font-mono ">
                  <th className="pb-3 px-4 py-2 font-semibold text-slate-500 text-sm">
                    Aset
                  </th>
                  <th className="pb-3 px-4 py-2 font-semibold text-slate-500 text-sm">
                    Lokasi
                  </th>
                  <th className="pb-3 px-4 py-2 font-semibold text-slate-500 text-sm">
                    Petugas
                  </th>
                  <th className="pb-3 px-4 py-2 font-semibold text-slate-500 text-sm">
                    Status
                  </th>
                  <th className="pb-3 px-4 py-2 font-semibold text-slate-500 text-sm text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {[
                  {
                    id: 1,
                    aset: 'AC Daikin 2PK',
                    lokasi: 'Ruang UGD',
                    petugas: 'Budi Santoso',
                    status: 'Selesai',
                    color: 'bg-green-100 text-green-700',
                  },
                  {
                    id: 2,
                    aset: 'APAR 3Kg (ABC)',
                    lokasi: 'Lorong Farmasi',
                    petugas: 'Andi M',
                    status: 'Selesai',
                    color: 'bg-green-100 text-green-700',
                  },
                  {
                    id: 3,
                    aset: 'AC Panasonic 1PK',
                    lokasi: 'Kamar Rawat 102',
                    petugas: 'Budi Santoso',
                    status: 'Belum Dikerjakan',
                    color: 'bg-slate-100 text-slate-600',
                  },
                  {
                    id: 4,
                    aset: 'Hydrant Indoor',
                    lokasi: 'Lantai 2 Sayap Kiri',
                    petugas: 'Siti K',
                    status: 'Terlambat',
                    color: 'bg-red-100 text-red-700',
                  },
                ].map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors font-mono"
                  >
                    <td className="py-4 px-4 font-medium text-slate-700">
                      {row.aset}
                    </td>
                    <td className="py-4 px-4 text-slate-500">{row.lokasi}</td>
                    <td className="py-4 px-4 text-slate-500 font-mono">
                      {row.petugas}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold ${row.color} border`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        {row.status === 'Selesai' ? 'Lihat Detail' : 'Isi Form'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

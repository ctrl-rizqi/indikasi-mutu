import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDummyLogin = async (role: 'ADMIN' | 'USER') => {
    setLoading(role)
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    // Set dummy auth data
    localStorage.setItem('dummy_role', role)
    localStorage.setItem(
      'dummy_user',
      JSON.stringify({
        name: role === 'ADMIN' ? 'Administrator' : 'Petugas 1',
        role,
      }),
    )

    // Redirect based on role
    if (role === 'ADMIN') {
      navigate({ to: '/' })
    } else {
      navigate({ to: '/' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 font-mono">
            Simulasi Login
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Pilih role untuk melanjutkan dengan data dummy (Flowchart Change)
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleDummyLogin('ADMIN')}
            disabled={loading !== null}
            className="w-full bg-slate-900 border text-white px-4 py-3 font-semibold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading === 'ADMIN' ? 'Masuk...' : 'Login Sebagai Admin'}
          </button>

          <button
            onClick={() => handleDummyLogin('USER')}
            disabled={loading !== null}
            className="w-full bg-blue-600 border border-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading === 'USER' ? 'Masuk...' : 'Login Sebagai Petugas (User)'}
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 font-mono">
          <p>
            Sistem ini menggunakan dummy data untuk Development & Testing
            sementara.
          </p>
        </div>
      </div>
    </div>
  )
}

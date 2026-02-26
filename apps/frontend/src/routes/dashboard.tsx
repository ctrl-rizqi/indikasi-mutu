import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'
import LogoutButton from '../components/LogoutButton'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name} ({user?.role})
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Welcome to your dashboard
          </h2>
          <p className="text-gray-600">
            This is a protected page only accessible to authenticated users.
          </p>
        </div>
      </main>
    </div>
  )
}

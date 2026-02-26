import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'
import LogoutButton from '../components/LogoutButton'
import ProtectedRoute from '../components/ProtectedRoute'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <ProtectedRoute>
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
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
              <p className="text-gray-500 text-center text-lg">
                Welcome to the protected dashboard!
              </p>
              <p className="text-gray-600 text-center mt-2">
                This is a protected page only accessible to authenticated users.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

import { Link } from '@tanstack/react-router'
import { Box, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    ...(isAuthenticated ? [{ label: 'Home', to: '/' as const }] : []),
    ...(user?.role === 'USER' ? [{ label: 'Tugas / Aktivitas', to: '/tugas' as const }] : []),
    ...(user?.role === 'ADMIN' ? [
      { label: 'Master Item', to: '/master' as const },
      { label: 'Laporan', to: '/laporan' as const },
    ] : []),
  ]

  return (
    <header className="flex items-center justify-between p-4 bg-[#0E172A] text-white relative">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Box />
        <Link to="/" className="text-xl font-semibold">
          Indikator Mutu RS
        </Link>
      </div>

      {/* Desktop Menu */}
      <nav className="hidden md:block">
        <ul className="flex items-center gap-2">
          {navItems.map((item) => (
            <li key={item.to} className="hover:bg-gray-700 rounded-md p-2 cursor-pointer uppercase font-semibold">
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
          {!isAuthenticated && (
            <li className="hover:bg-blue-600 bg-blue-500 rounded-md p-2 cursor-pointer uppercase font-semibold ml-4">
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </nav>

      {/* User / Hamburger Menu Toggle */}
      <div className="flex items-center gap-4">
        {/* User Info */}
        {isAuthenticated && (
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                {user?.role === 'ADMIN' ? 'AD' : 'PT'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">
                  {user?.name || user?.role}
                </span>
                <span className="text-xs text-gray-400 capitalize leading-tight">
                  {user?.role?.toLowerCase()}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}

        {/* Hamburger Icon */}
        <button
          className="md:hidden p-2 text-gray-300 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0E172A] border-t border-gray-700 md:hidden z-50 shadow-xl">
          <nav className="flex flex-col p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:bg-gray-700 p-3 rounded-md uppercase font-semibold"
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:bg-blue-600 bg-blue-500 p-3 rounded-md uppercase font-semibold text-center mt-2"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={() => {
                  handleLogout()
                  setIsMobileMenuOpen(false)
                }}
                className="hover:bg-red-900 text-red-400 text-left p-3 rounded-md uppercase font-semibold mt-2 border-t border-gray-700"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

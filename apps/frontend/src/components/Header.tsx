import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { Box, Menu, X, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const [role, setRole] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Re-check auth on route change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const r = localStorage.getItem('dummy_role')
      const u = localStorage.getItem('dummy_user')
      setRole(r)
      if (u) {
        try {
          setUser(JSON.parse(u))
        } catch {
          // ignore
        }
      }
    }
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('dummy_role')
    localStorage.removeItem('dummy_user')
    setRole(null)
    setUser(null)
    navigate({ to: '/login' })
  }

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
          {role && (
            <li className="hover:bg-gray-700 rounded-md p-2 cursor-pointer uppercase font-semibold">
              <Link to="/">Home</Link>
            </li>
          )}

          {role === 'USER' && (
            <li className="hover:bg-gray-700 rounded-md p-2 cursor-pointer uppercase font-semibold">
              <Link to="/">Tugas / Aktivitas</Link>
            </li>
          )}

          {role === 'ADMIN' && (
            <>
              <li className="hover:bg-gray-700 rounded-md p-2 cursor-pointer uppercase font-semibold">
                <Link to="/master">Master Item</Link>
              </li>
              <li className="hover:bg-gray-700 rounded-md p-2 cursor-pointer uppercase font-semibold">
                <Link to="/laporan">Laporan</Link>
              </li>
            </>
          )}

          {!role && (
            <li className="hover:bg-blue-600 bg-blue-500 rounded-md p-2 cursor-pointer uppercase font-semibold ml-4">
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </nav>

      {/* User / Hamburger Menu Toggle */}
      <div className="flex items-center gap-4">
        {/* User Info */}
        {role && (
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                {role === 'ADMIN' ? 'AD' : 'PT'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">
                  {user?.name || role}
                </span>
                <span className="text-xs text-gray-400 capitalize leading-tight">
                  {role.toLowerCase()}
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
            {role && (
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:bg-gray-700 p-3 rounded-md uppercase font-semibold"
              >
                Home
              </Link>
            )}

            {role === 'USER' && (
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:bg-gray-700 p-3 rounded-md uppercase font-semibold"
              >
                Tugas / Aktivitas
              </Link>
            )}

            {role === 'ADMIN' && (
              <>
                <Link
                  to="/master"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:bg-gray-700 p-3 rounded-md uppercase font-semibold"
                >
                  Master Item
                </Link>
                <Link
                  to="/laporan"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:bg-gray-700 p-3 rounded-md uppercase font-semibold"
                >
                  Laporan
                </Link>
              </>
            )}

            {!role ? (
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

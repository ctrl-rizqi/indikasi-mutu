import { Link } from '@tanstack/react-router'
import { Box, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="flex items-center justify-between p-4 bg-[#0E172A] text-white relative">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Box />
        <h1 className="text-xl font-semibold">Indikator Mutu RS</h1>
      </div>

      {/* Desktop Menu */}
      <nav className="hidden md:block">
        <ul className="flex items-center gap-2">
          <li className="hover:bg-gray-500 p-2 cursor-pointer uppercase font-semibold">
            <Link to="/">Home</Link>
          </li>
          <li className="hover:bg-gray-500 p-2 cursor-pointer uppercase font-semibold">
            <Link to="/tugas">Tugas</Link>
          </li>
          <li className="hover:bg-gray-500 p-2 cursor-pointer uppercase font-semibold">
            <Link to="/master">Master</Link>
          </li>
          <li className="hover:bg-gray-500 p-2 cursor-pointer uppercase font-semibold">
            <Link to="/laporan">Laporan</Link>
          </li>
          <li className="hover:bg-gray-500 p-2 cursor-pointer uppercase font-semibold ml-4">
            <Link to="/login">Login</Link>
          </li>
        </ul>
      </nav>

      {/* User / Hamburger Menu Toggle */}
      <div className="flex items-center gap-4">
        {/* User Info (Hidden on very small screens, optional) */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
            AD
          </div>
          <span className="text-sm font-semibold">Admin</span>
        </div>

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
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:bg-gray-700 p-3 rounded-md uppercase font-semibold"
            >
              Home
            </Link>
            <Link
              to="/tugas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:bg-gray-700 p-3 rounded-md uppercase font-semibold"
            >
              Tugas
            </Link>
            <Link
              to="/master"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:bg-gray-700 p-3 rounded-md uppercase font-semibold"
            >
              Master
            </Link>
            <Link
              to="/laporan"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:bg-gray-700 p-3 rounded-md uppercase font-semibold"
            >
              Laporan
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:bg-gray-700 p-3 rounded-md uppercase font-semibold text-blue-400"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

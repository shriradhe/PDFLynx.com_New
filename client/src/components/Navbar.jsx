import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import useThemeStore from '../store/themeStore'
import useAuthStore from '../store/authStore'

let toolsMenuTimeout = null
let toolsMenuHover = false

const toolCategories = [
  {
    label: 'Convert',
    items: [
      { label: 'PDF to Word', to: '/convert', type: 'pdf-to-word' },
      { label: 'PDF to JPG', to: '/convert', type: 'pdf-to-jpg' },
      { label: 'PDF to PNG', to: '/pdf-to-png' },
      { label: 'PDF to Text', to: '/pdf-to-text' },
      { label: 'JPG to PDF', to: '/convert', type: 'jpg-to-pdf' },
      { label: 'Images to PDF', to: '/image-to-pdf' },
      { label: 'HTML to PDF', to: '/html-to-pdf' },
    ],
  },
  {
    label: 'Organize',
    items: [
      { label: 'Merge PDF', to: '/merge-pdf' },
      { label: 'Split PDF', to: '/split-pdf' },
      { label: 'Organize Pages', to: '/organize-pdf' },
      { label: 'Compress PDF', to: '/compress-pdf' },
    ],
  },
  {
    label: 'Edit & Secure',
    items: [
      { label: 'Edit PDF', to: '/edit-pdf' },
      { label: 'Sign PDF', to: '/sign-pdf' },
      { label: 'Watermark', to: '/watermark-pdf' },
      { label: 'Rotate PDF', to: '/rotate-pdf' },
      { label: 'Page Numbers', to: '/page-numbers' },
      { label: 'Redact PDF', to: '/redact-pdf' },
    ],
  },
  {
    label: 'Protect & Extract',
    items: [
      { label: 'Protect PDF', to: '/protect-pdf' },
      { label: 'Unlock PDF', to: '/unlock-pdf' },
      { label: 'OCR PDF', to: '/ocr-pdf' },
    ],
  },
  {
    label: 'AI Tools ✨',
    items: [
      { label: 'AI Summary', to: '/ai-summary' },
      { label: 'Chat with PDF', to: '/chat-with-pdf' },
      { label: 'Smart Search', to: '/smart-search' },
    ],
  },
]

const allTools = toolCategories.flatMap((cat) => cat.items)

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setToolsOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest('[data-user-menu]')) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [userMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isDashboard = location.pathname.startsWith('/dashboard')

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 dark:bg-surface-500/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-600/25 group-hover:shadow-brand-600/40 transition-shadow duration-300">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              PDF<span className="text-brand-600">Lynx</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Tools Mega Menu — CSS transitions instead of framer-motion */}
            <div className="relative"
              onMouseEnter={() => {
                clearTimeout(toolsMenuTimeout)
                setToolsOpen(true)
              }}
              onMouseLeave={() => {
                toolsMenuHover = true
                toolsMenuTimeout = setTimeout(() => {
                  setToolsOpen(false)
                  toolsMenuHover = false
                }, 150)
              }}>
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200">
                Tools
                <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] card-elevated p-6 z-[100]"
              >
                <div className="grid grid-cols-5 gap-6">
                  {toolCategories.map((cat) => (
                    <div key={cat.label}>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{cat.label}</h4>
                      <div className="space-y-1">
                        {cat.items.map((item) => (
                          <Link
                            key={item.to + item.label}
                            to={item.to}
                            className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>

            <NavLink to="/dashboard" className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`
            }>
              Dashboard
            </NavLink>

            <NavLink to="/pricing" className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`
            }>
              Pricing
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/settings" className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`
              }>
                Settings
              </NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <div
                  className={`absolute right-0 top-full mt-2 w-56 card-elevated p-2 transition-all duration-150 origin-top-right ${
                    userMenuOpen
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 mb-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <UserCircleIcon className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <Cog6ToothIcon className="w-4 h-4" />
                    Settings
                  </Link>
                  <div className="border-t border-slate-100 dark:border-white/5 my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — CSS transitions instead of framer-motion */}
      <div
        className={`lg:hidden bg-white/95 dark:bg-surface-400/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto no-scrollbar">
          {toolCategories.map((cat) => (
            <div key={cat.label} className="mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-3">{cat.label}</h4>
              {cat.items.map((item) => (
                <Link
                  key={item.to + item.label}
                  to={item.to}
                  className="flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {item.label}
                  <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>
          ))}

          <div className="border-t border-slate-100 dark:border-white/10 pt-3 mt-3 space-y-2">
            <Link to="/dashboard" className="block px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              Dashboard
            </Link>
            {isAuthenticated && (
              <Link to="/settings" className="block px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                Settings
              </Link>
            )}
            <div className="border-t border-slate-100 dark:border-white/10 pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn-secondary text-sm w-full">Sign Out</button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm text-center" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
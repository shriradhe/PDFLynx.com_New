import { useState, useEffect } from 'react'
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
import { useLanguage } from '../context/LanguageContext'
import { SUPPORTED_LANGUAGES } from '../i18n/languageConfig'

let toolsMenuTimeout = null

const convertMenuGroups = [
  {
    title: 'Convert to PDF',
    items: [
      { label: 'JPG to PDF', to: '/convert', type: 'jpg-to-pdf' },
      { label: 'Images to PDF', to: '/image-to-pdf' },
      { label: 'HTML to PDF', to: '/html-to-pdf' },
    ],
  },
  {
    title: 'Convert from PDF',
    items: [
      { label: 'PDF to Word', to: '/convert', type: 'pdf-to-word' },
      { label: 'PDF to JPG', to: '/convert', type: 'pdf-to-jpg' },
      { label: 'PDF to PNG', to: '/pdf-to-png' },
      { label: 'PDF to Text', to: '/pdf-to-text' },
    ],
  },
]

const toolCategories = [
  {
    labelKey: 'catConvert',
    items: [
      { labelKey: 'toolPdfToWord', to: '/convert', type: 'pdf-to-word' },
      { labelKey: 'toolPdfToJpg', to: '/convert', type: 'pdf-to-jpg' },
      { labelKey: 'toolPdfToPng', to: '/pdf-to-png' },
      { labelKey: 'toolPdfToText', to: '/pdf-to-text' },
      { labelKey: 'toolJpgToPdf', to: '/convert', type: 'jpg-to-pdf' },
      { labelKey: 'toolImagesToPdf', to: '/image-to-pdf' },
      { labelKey: 'toolHtmlToPdf', to: '/html-to-pdf' },
    ],
  },
  {
    labelKey: 'catOrganize',
    items: [
      { labelKey: 'toolMergePdf', to: '/merge-pdf' },
      { labelKey: 'toolSplitPdf', to: '/split-pdf' },
      { labelKey: 'toolOrganizePages', to: '/organize-pdf' },
      { labelKey: 'toolCompressPdf', to: '/compress-pdf' },
    ],
  },
  {
    labelKey: 'catEditSecure',
    items: [
      { labelKey: 'toolEditPdf', to: '/edit-pdf' },
      { labelKey: 'toolSignPdf', to: '/sign-pdf' },
      { labelKey: 'toolWatermark', to: '/watermark-pdf' },
      { labelKey: 'toolRotatePdf', to: '/rotate-pdf' },
      { labelKey: 'toolPageNumbers', to: '/page-numbers' },
      { labelKey: 'toolRedactPdf', to: '/redact-pdf' },
    ],
  },
  {
    labelKey: 'catProtectExtract',
    items: [
      { labelKey: 'toolProtectPdf', to: '/protect-pdf' },
      { labelKey: 'toolUnlockPdf', to: '/unlock-pdf' },
      { labelKey: 'toolOcrPdf', to: '/ocr-pdf' },
    ],
  },
  {
    labelKey: 'catAiTools',
    items: [
      { labelKey: 'toolAiSummary', to: '/ai-summary' },
      { labelKey: 'toolChatWithPdf', to: '/chat-with-pdf' },
      { labelKey: 'toolSmartSearch', to: '/smart-search' },
    ],
  },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { language, setLanguage, t } = useLanguage()
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 dark:bg-surface-500/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-sm'
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
                toolsMenuTimeout = setTimeout(() => {
                  setToolsOpen(false)
                }, 150)
              }}>
              <button
                type="button"
                aria-expanded={toolsOpen}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200"
              >
                {t('navTools', 'All PDF Tools')}
                <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[760px] card-elevated p-6 z-[100] shadow-xl"
              >
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {convertMenuGroups.map((group) => (
                    <div key={group.title} className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50/50 dark:bg-white/5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-3">{group.title}</h4>
                      <div className="space-y-1.5">
                        {group.items.map((item) => (
                          <Link
                            key={item.to + item.label}
                            to={item.to}
                            className="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {toolCategories.map((cat) => (
                    <div key={cat.labelKey}>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{t(cat.labelKey)}</h4>
                      <div className="space-y-1">
                        {cat.items.slice(0, 3).map((item) => (
                          <Link
                            key={item.to + item.labelKey}
                            to={item.to}
                            className="block px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-md transition-colors"
                          >
                            {t(item.labelKey)}
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
              {t('navDashboard', 'Dashboard')}
            </NavLink>

            <NavLink to="/pricing" className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`
            }>
              {t('navPricing', 'Pricing')}
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/settings" className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`
              }>
                {t('navSettings', 'Settings')}
              </NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2">
            <label className="sr-only" htmlFor="language-select-desktop">{t('navLanguage', 'Language')}</label>
            <select
              id="language-select-desktop"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-500 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              aria-label={t('navLanguage', 'Language')}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="relative" data-user-menu>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
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
                    {t('navDashboard', 'Dashboard')}
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <Cog6ToothIcon className="w-4 h-4" />
                    {t('navSettings', 'Settings')}
                  </Link>
                  <div className="border-t border-slate-100 dark:border-white/5 my-2" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    {t('navSignOut', 'Sign Out')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200">
                  {t('navSignIn', 'Sign In')}
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">
                  {t('navGetStarted', 'Get Started')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button type="button" onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" aria-label="Toggle Dark Mode">
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — CSS transitions instead of framer-motion */}
      <div
        id="mobile-navigation"
        className={`lg:hidden bg-white/95 dark:bg-surface-500/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto no-scrollbar">
          {toolCategories.map((cat) => (
            <div key={cat.labelKey} className="mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-3">{t(cat.labelKey)}</h4>
              {cat.items.map((item) => (
                <Link
                  key={item.to + item.labelKey}
                  to={item.to}
                  className="flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {t(item.labelKey)}
                  <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>
          ))}

          <div className="border-t border-slate-100 dark:border-white/10 pt-3 mt-3 space-y-2">
            <Link to="/dashboard" className="block px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              {t('navDashboard', 'Dashboard')}
            </Link>
            {isAuthenticated && (
              <Link to="/settings" className="block px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                {t('navSettings', 'Settings')}
              </Link>
            )}
            <div className="px-3">
              <label className="sr-only" htmlFor="language-select-mobile">{t('navLanguage', 'Language')}</label>
              <select
                id="language-select-mobile"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-500 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                aria-label={t('navLanguage', 'Language')}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div className="border-t border-slate-100 dark:border-white/10 pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <button type="button" onClick={handleLogout} className="btn-secondary text-sm w-full">{t('navSignOut', 'Sign Out')}</button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm text-center" onClick={() => setMobileOpen(false)}>{t('navSignIn', 'Sign In')}</Link>
                  <Link to="/register" className="btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>{t('navGetStarted', 'Get Started')}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
import { Link } from 'react-router-dom'
import { memo } from 'react'
import { useEffect, useRef, useState } from 'react'

function ToolCard({ icon: Icon, label, description, to, color = 'blue', delay = 0 }) {
  const colorMap = {
    red: 'border-rose-200/80 dark:border-rose-500/20 hover:border-rose-300 dark:hover:border-rose-400/40',
    blue: 'border-blue-200/80 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-400/40',
    green: 'border-emerald-200/80 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-400/40',
    orange: 'border-orange-200/80 dark:border-orange-500/20 hover:border-orange-300 dark:hover:border-orange-400/40',
    purple: 'border-purple-200/80 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/40',
    cyan: 'border-cyan-200/80 dark:border-cyan-500/20 hover:border-cyan-300 dark:hover:border-cyan-400/40',
    pink: 'border-pink-200/80 dark:border-pink-500/20 hover:border-pink-300 dark:hover:border-pink-400/40',
    yellow: 'border-yellow-200/80 dark:border-yellow-500/20 hover:border-yellow-300 dark:hover:border-yellow-400/40',
    indigo: 'border-indigo-200/80 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-400/40',
    teal: 'border-teal-200/80 dark:border-teal-500/20 hover:border-teal-300 dark:hover:border-teal-400/40',
    slate: 'border-slate-300 dark:border-slate-500/30 hover:border-slate-400 dark:hover:border-slate-400/50',
    amber: 'border-amber-200/80 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-400/40',
  }

  const iconBg = {
    red:    'text-rose-400 bg-rose-500/10',
    blue:   'text-blue-400 bg-blue-500/10',
    green:  'text-emerald-400 bg-emerald-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    cyan:   'text-cyan-400 bg-cyan-500/10',
    pink:   'text-pink-400 bg-pink-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    indigo: 'text-indigo-400 bg-indigo-500/10',
    teal:   'text-teal-400 bg-teal-500/10',
    slate:  'text-slate-400 bg-slate-500/10',
    amber:  'text-amber-400 bg-amber-500/10',
  }

  const accentBorderClasses = colorMap[color] || colorMap.blue
  const ref = useRef(null)
  const isFirstRow = delay < 0.2 // Make first few cards visible instantly to avoid LCP penalties
  const [visible, setVisible] = useState(isFirstRow)

  useEffect(() => {
    if (isFirstRow) return // skip observer entirely
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isFirstRow])

  return (
    <div
      ref={ref}
      className="transition-opacity duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay * 1000}ms`,
      }}
    >
      <Link
        to={to}
        className={`group relative flex flex-col gap-4 p-6 rounded-2xl border bg-white dark:bg-surface-200
          ${accentBorderClasses}
          transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-500`}
      >
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-300 ${iconBg[color] || iconBg.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1.5 transition-colors">{label}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 transition-colors mt-auto">
          Select files
          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  )
}

export default memo(ToolCard)

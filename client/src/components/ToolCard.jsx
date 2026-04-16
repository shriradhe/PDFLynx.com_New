import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

export default function ToolCard({ icon: Icon, label, description, to, color = 'blue', delay = 0 }) {
  const colorMap = {
    red:    'from-rose-500/20 to-rose-600/5 border-rose-500/20 hover:border-rose-500/40 group-hover:text-rose-400 group-hover:bg-rose-500/20',
    blue:   'from-blue-500/20 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 group-hover:text-blue-400 group-hover:bg-blue-500/20',
    green:  'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40 group-hover:text-emerald-400 group-hover:bg-emerald-500/20',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40 group-hover:text-orange-400 group-hover:bg-orange-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 group-hover:text-purple-400 group-hover:bg-purple-500/20',
    cyan:   'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/40 group-hover:text-cyan-400 group-hover:bg-cyan-500/20',
    pink:   'from-pink-500/20 to-pink-600/5 border-pink-500/20 hover:border-pink-500/40 group-hover:text-pink-400 group-hover:bg-pink-500/20',
    yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40 group-hover:text-yellow-400 group-hover:bg-yellow-500/20',
    indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20 hover:border-indigo-500/40 group-hover:text-indigo-400 group-hover:bg-indigo-500/20',
    teal:   'from-teal-500/20 to-teal-600/5 border-teal-500/20 hover:border-teal-500/40 group-hover:text-teal-400 group-hover:bg-teal-500/20',
    slate:  'from-slate-500/20 to-slate-600/5 border-slate-500/20 hover:border-slate-500/40 group-hover:text-slate-400 group-hover:bg-slate-500/20',
    amber:  'from-amber-500/20 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40 group-hover:text-amber-400 group-hover:bg-amber-500/20',
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

  const classes = colorMap[color] || colorMap.blue
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
        className={`group flex flex-col gap-4 p-5 rounded-2xl border bg-gradient-to-br
          ${classes.split(' hover:').join(' ')} 
          bg-white dark:bg-surface-300 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20
          transition-all duration-300 hover:shadow-sm dark:hover:shadow-card-hover hover:-translate-y-1`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${iconBg[color] || iconBg.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-brand-600 dark:group-hover:text-white transition-colors">{label}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-500 leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-brand-600 dark:group-hover:text-slate-300 transition-colors mt-auto">
          Select files
          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  )
}

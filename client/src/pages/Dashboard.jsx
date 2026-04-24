import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { analyticsAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import {
  DocumentIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  FolderOpenIcon,
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'

const toolLabels = {
  merge: 'Merge PDF', split: 'Split PDF', compress: 'Compress PDF',
  'pdf-to-jpg': 'PDF to JPG', 'jpg-to-pdf': 'JPG to PDF', 'pdf-to-word': 'PDF to Word',
  rotate: 'Rotate PDF', watermark: 'Watermark PDF', protect: 'Protect PDF',
  unlock: 'Unlock PDF', 'page-numbers': 'Page Numbers', ocr: 'OCR PDF',
  sign: 'Sign PDF', edit: 'Edit PDF', 'pdf-to-text': 'PDF to Text',
  'pdf-to-png': 'PDF to PNG', organize: 'Organize Pages', redact: 'Redact PDF',
  'html-to-pdf': 'HTML to PDF', 'image-to-pdf': 'Images to PDF',
}

const toolColors = {
  merge: 'text-rose-400', split: 'text-orange-400', compress: 'text-emerald-400',
  rotate: 'text-yellow-400', watermark: 'text-pink-400', protect: 'text-indigo-400',
  unlock: 'text-teal-400', 'page-numbers': 'text-orange-400', ocr: 'text-green-400',
  'pdf-to-jpg': 'text-cyan-400', 'jpg-to-pdf': 'text-purple-400', 'pdf-to-word': 'text-blue-400',
  sign: 'text-amber-400', edit: 'text-violet-400', 'pdf-to-text': 'text-slate-400',
  'pdf-to-png': 'text-cyan-400', organize: 'text-blue-400', redact: 'text-red-400',
  'html-to-pdf': 'text-emerald-400', 'image-to-pdf': 'text-purple-400',
}

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

const formatNumber = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n?.toString() || '0'
}

const SimpleBarChart = ({ data }) => {
  if (!data || data.length === 0) return null
  const maxVal = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t transition-all duration-500 hover:from-brand-500 hover:to-brand-300"
            style={{ height: `${Math.max(4, (d.count / maxVal) * 100)}%` }}
            title={`${d._id}: ${d.count}`}
          />
          <span className="text-[10px] text-slate-400 truncate w-full text-center">
            {d._id?.slice(5)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadData()
  }, [isAuthenticated, period])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data } = await analyticsAPI.getDashboard(period)
      const dashboardStats = data?.stats || {}
      setStats(dashboardStats)
      setHistory(dashboardStats.recentActivity || [])
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const quickTools = [
    { label: 'Merge PDF', to: '/merge-pdf', icon: DocumentIcon, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' },
    { label: 'Split PDF', to: '/split-pdf', icon: BoltIcon, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' },
    { label: 'Compress', to: '/compress-pdf', icon: ArrowTrendingDownIcon, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
    { label: 'Convert', to: '/convert', icon: ArrowRightIcon, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
    { label: 'Sign PDF', to: '/sign-pdf', icon: ShieldCheckIcon, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
    { label: 'Edit PDF', to: '/edit-pdf', icon: BoltIcon, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20' },
  ]
  const periodOptions = useMemo(() => ['7d', '30d', '90d', '1y'], [])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 h-28 skeleton" />
          ))}
        </div>
        <div className="card p-6 h-64 skeleton" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-500/25">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user?.email} · <span className="badge badge-neutral capitalize">{user?.plan || 'free'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {periodOptions.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPeriod(p)}
                aria-pressed={period === p}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  period === p
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-value">{formatNumber(stats?.totalFiles || 0)}</p>
                <p className="stat-label">Total Files</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <DocumentIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-value">{stats?.successRate || 0}%</p>
                <p className="stat-label">Success Rate</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-value">{stats?.avgProcessingTime ? `${stats.avgProcessingTime}ms` : '—'}</p>
                <p className="stat-label">Avg. Processing</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-value">{formatNumber(stats?.filesProcessed || 0)}</p>
                <p className="stat-label">Files Processed</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Usage Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2 card p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Usage Overview</h3>
            {stats?.dailyUsage && stats.dailyUsage.length > 0 ? (
              <SimpleBarChart data={stats.dailyUsage} />
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-400 text-sm">No usage data yet</div>
            )}
          </motion.div>

          {/* Top Tools */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Top Tools</h3>
            {stats?.toolBreakdown && stats.toolBreakdown.length > 0 ? (
              <div className="space-y-3">
                {stats.toolBreakdown.slice(0, 6).map((tool, i) => (
                  <div key={tool._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 w-5">{i + 1}</span>
                      <span className={`text-sm font-medium ${toolColors[tool._id] || 'text-slate-400'}`}>
                        {toolLabels[tool._id] || tool._id}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{tool.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-400 text-sm">No tool data yet</div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8">
          <h2 className="section-label mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {quickTools.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all hover:scale-[1.02] ${t.color}`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="section-label mb-3">Recent Activity</h2>

          {history.length === 0 ? (
            <div className="card p-16 text-center">
              <FolderOpenIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No files processed yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Start using our tools and your activity will appear here.</p>
              <Link to="/" className="btn-primary mt-6 inline-flex">Browse Tools</Link>
            </div>
          ) : (
            <div className="table-container overflow-x-auto">
              <table className="table">
                <caption className="sr-only">Recent file processing activity</caption>
                <thead>
                  <tr>
                    <th scope="col">Tool</th>
                    <th scope="col">File</th>
                    <th scope="col">Status</th>
                    <th scope="col">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record._id}>
                      <td>
                        <span className={`text-sm font-medium ${toolColors[record.tool] || 'text-slate-400'}`}>
                          {toolLabels[record.tool] || record.tool}
                        </span>
                      </td>
                      <td className="text-slate-500 text-sm truncate max-w-[200px]">
                        {record.inputFiles?.[0]?.originalName || '—'}
                      </td>
                      <td>
                        {record.status === 'completed' ? (
                          <span className="badge badge-success"><CheckCircleIcon className="w-3 h-3" /> Done</span>
                        ) : record.status === 'failed' ? (
                          <span className="badge badge-error"><XCircleIcon className="w-3 h-3" /> Failed</span>
                        ) : (
                          <span className="badge badge-warning">Processing</span>
                        )}
                      </td>
                      <td className="text-slate-400 text-xs">{formatDate(record.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

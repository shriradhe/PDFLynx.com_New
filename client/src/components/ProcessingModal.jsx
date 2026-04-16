import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, ArrowDownTrayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function ProcessingModal({ isOpen, status, state, progress = 0, message = '', result = null, downloadUrl, filename, onClose, onReset }) {
  const [downloading, setDownloading] = useState(false)
  const s = status || state || 'uploading'
  const r = result || (downloadUrl ? { downloadUrl, filename, size: '' } : null)
  const handleClose = () => { if (onReset) onReset(); else onClose?.() }

  const handleDownload = async () => {
    if (!r?.downloadUrl) return
    setDownloading(true)
    try {
      const response = await fetch(r.downloadUrl)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = r.filename || 'download'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      // Fallback: use anchor tag download without opening new tab
      const a = document.createElement('a')
      a.href = r.downloadUrl
      a.download = r.filename || 'download'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-card border border-slate-200 dark:border-white/15 p-8 max-w-sm w-full text-center shadow-sm dark:shadow-card-hover"
          >
            {/* Icon */}
            <div className="mb-6">
              {s === 'done' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-accent-green/15 border-2 border-accent-green/40 flex items-center justify-center mx-auto"
                >
                  <CheckCircleIcon className="w-9 h-9 text-accent-green" />
                </motion.div>
              ) : s === 'error' ? (
                <div className="w-16 h-16 rounded-full bg-accent-red/15 border-2 border-accent-red/40 flex items-center justify-center mx-auto">
                  <ExclamationTriangleIcon className="w-9 h-9 text-accent-red" />
                </div>
              ) : (
                <div className="relative w-16 h-16 mx-auto">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                    <motion.circle
                      cx="32" cy="32" r="26"
                      fill="none"
                      stroke="url(#grad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={163.36}
                      strokeDashoffset={163.36 * (1 - progress / 100)}
                      transition={{ duration: 0.4 }}
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-400">{progress}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Text */}
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              {s === 'uploading' && 'Uploading...'}
              {s === 'processing' && 'Processing...'}
              {s === 'done' && 'Done!'}
              {s === 'error' && 'Something went wrong'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message || 'Please wait a moment...'}</p>

            {/* Progress bar (uploading/processing) */}
            {(s === 'uploading' || s === 'processing') && (
              <div className="progress-bar mb-6">
                <motion.div
                  className="progress-fill"
                  style={{ width: `${s === 'processing' ? 100 : progress}%` }}
                  {...(s === 'processing' && {
                    animate: { width: ['30%', '90%', '30%'] },
                    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  })}
                />
              </div>
            )}

            {/* Result actions */}
            {s === 'done' && r && (
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  {downloading ? 'Downloading...' : `Download ${r.filename?.split('_')[0] || 'File'}`}
                </button>
                {r.size && (
                  <p className="text-xs text-slate-600 dark:text-slate-500">File size: {r.size}</p>
                )}
                <button onClick={handleClose} className="btn-secondary w-full text-sm">
                  Process Another File
                </button>
              </div>
            )}

            {s === 'error' && (
              <button onClick={handleClose} className="btn-secondary w-full">
                Try Again
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

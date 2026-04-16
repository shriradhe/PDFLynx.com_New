import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { previewAPI } from '../services/api'

export default function PDFPreview({ file, onClose }) {
  const [thumbnail, setThumbnail] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!file) return
    const loadPreview = async () => {
      try {
        const [thumbRes, countRes] = await Promise.all([
          previewAPI.getThumbnail(file, 1),
          previewAPI.getPageCount(file),
        ])
        setThumbnail(thumbRes)
        setPageCount(countRes.pageCount)
      } catch (err) {
        console.error('Preview load failed:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPreview()
  }, [file])

  const changePage = async (delta) => {
    const newPage = currentPage + delta
    if (newPage < 1 || newPage > pageCount) return
    setCurrentPage(newPage)
    setLoading(true)
    try {
      const thumbRes = await previewAPI.getThumbnail(file, newPage)
      setThumbnail(thumbRes)
    } catch (err) {
      console.error('Page change failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!file) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card border border-slate-200 dark:border-white/15 p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{file.name}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading preview...</p>
            </div>
          ) : thumbnail ? (
            <img src={thumbnail} alt={`Page ${currentPage}`} className="max-w-full max-h-[500px] object-contain" />
          ) : (
            <p className="text-sm text-slate-500">Preview not available</p>
          )}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => changePage(-1)}
              disabled={currentPage <= 1}
              className="btn-secondary btn-sm disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {pageCount}
            </p>
            <button
              onClick={() => changePage(1)}
              disabled={currentPage >= pageCount}
              className="btn-secondary btn-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

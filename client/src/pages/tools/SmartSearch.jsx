import { useState } from 'react'
import { motion } from 'framer-motion'
import { pdfAPI } from '../../services/api'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import toast from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

const searchModes = [
  { id: 'hybrid', label: 'Smart Search', desc: 'AI + keyword combined' },
  { id: 'keyword', label: 'Keyword Only', desc: 'Exact text matching' },
  { id: 'semantic', label: 'Semantic', desc: 'AI meaning-based search' },
]

export default function SmartSearch() {
  const [file, setFile] = useState(null)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('hybrid')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleSearch = async () => {
    if (!file) return toast.error('Please upload a PDF file.')
    if (!query.trim()) return toast.error('Please enter a search query.')
    setProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('query', query.trim())
      formData.append('mode', mode)
      formData.append('maxResults', '20')

      const { data } = await pdfAPI.aiSearch(formData, (p) => setProgress(p))
      setResult(data)
      if (data.totalMatches === 0) {
        toast('No matches found. Try different keywords.', { icon: '🔍' })
      } else {
        toast.success(`Found ${data.totalMatches} result(s)!`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-4">
            <SparklesIcon className="w-3.5 h-3.5" />
            AI Powered
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Smart PDF Search
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Search inside your PDF with AI-powered semantic understanding. Find content by meaning, not just keywords.
          </p>
        </motion.div>

        {/* Search Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 justify-center mb-6"
        >
          {searchModes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                mode === m.id
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium'
                  : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-emerald-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </motion.div>

        {/* Upload */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <FileUploader accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} onFilesChange={(files) => setFile(files[0] || null)} files={file ? [file] : []} />
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for anything inside the PDF…"
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!file || !query.trim() || processing}
              className="btn-primary px-6 disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {result.totalMatches} result(s) for "{result.query}"
              </h3>
              <span className="text-xs text-slate-500">{result.pageCount} pages • {result.mode} search</span>
            </div>

            {result.results.length === 0 ? (
              <div className="card p-12 text-center">
                <MagnifyingGlassIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">No matches found. Try different keywords or the semantic search mode.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.results.map((r, i) => (
                  <div key={i} className="card p-4 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          p.{r.page}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-500">Page {r.page}</span>
                          {r.type && (
                            <span className={`badge text-[10px] ${r.type === 'semantic' ? 'badge-info' : 'badge-neutral'}`}>
                              {r.type}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {Math.round((r.relevance || 0) * 100)}% match
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {r.context}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <ProcessingModal isOpen={processing} progress={progress} title="Searching PDF" />
      </div>
    </div>
  )
}

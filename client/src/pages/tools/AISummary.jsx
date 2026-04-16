import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pdfAPI } from '../../services/api'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import toast from 'react-hot-toast'
import {
  SparklesIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'

const summaryTypes = [
  { id: 'brief', label: 'Brief', desc: '2-3 paragraph overview' },
  { id: 'detailed', label: 'Detailed', desc: 'Full structured summary' },
  { id: 'executive', label: 'Executive', desc: 'Key findings & actions' },
  { id: 'key-points', label: 'Key Points', desc: 'Top 10 bullet points' },
]

export default function AISummary() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [summaryType, setSummaryType] = useState('detailed')

  const handleProcess = async () => {
    if (!file) return toast.error('Please upload a PDF file.')
    setProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', summaryType)

      const { data } = await pdfAPI.aiSummarize(formData, (p) => setProgress(p))
      setResult(data)
      toast.success('Summary generated!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to summarize PDF.'
      toast.error(msg)
    } finally {
      setProcessing(false)
    }
  }

  const copyToClipboard = () => {
    if (result?.summary) {
      navigator.clipboard.writeText(result.summary)
      toast.success('Copied to clipboard!')
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium mb-4">
            <SparklesIcon className="w-3.5 h-3.5" />
            AI Powered
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            AI PDF Summary
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Upload a PDF and get an intelligent summary powered by AI. Choose your summary style below.
          </p>
        </motion.div>

        {/* Summary Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          {summaryTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSummaryType(t.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                summaryType === t.id
                  ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/15'
                  : 'border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30'
              }`}
            >
              <p className={`text-sm font-semibold ${
                summaryType === t.id ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'
              }`}>{t.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </motion.div>

        {/* Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FileUploader
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={1}
            onFilesChange={(files) => setFile(files[0] || null)}
            files={file ? [file] : []}
          />
        </motion.div>

        {/* Process Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <button
            onClick={handleProcess}
            disabled={!file || processing}
            className="btn-primary px-8 py-3 text-base disabled:opacity-50"
          >
            <SparklesIcon className="w-5 h-5" />
            {processing ? 'Generating Summary…' : 'Generate AI Summary'}
          </button>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {summaryTypes.find(t => t.id === result.summaryType)?.label || 'Summary'}
                </h3>
                <span className="badge badge-neutral text-xs">{result.pageCount} pages</span>
                <span className="badge badge-neutral text-xs">{result.wordCount?.toLocaleString()} words</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={copyToClipboard} className="btn-secondary text-xs px-3 py-1.5">
                  <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                  Copy
                </button>
                {result.downloadUrl && (
                  <a href={result.downloadUrl} className="btn-primary text-xs px-3 py-1.5" download>
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                    Download
                  </a>
                )}
              </div>
            </div>

            {result.truncated && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                ⚠️ Document was truncated due to length. Summary covers the first portion.
              </div>
            )}

            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.summary}
            </div>

            {!result.aiConfigured && (
              <div className="mt-4 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs">
                💡 This is a demo summary. Set OPENAI_API_KEY in your server .env for real AI summaries.
              </div>
            )}
          </motion.div>
        )}

        <ProcessingModal isOpen={processing} progress={progress} title="Generating AI Summary" />
      </div>
    </div>
  )
}

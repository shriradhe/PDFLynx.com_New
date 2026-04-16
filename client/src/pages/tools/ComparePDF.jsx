import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function ComparePDF() {
  const [files, setFiles] = useState([])
  const [mode, setMode] = useState('text')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [modalState, setModalState] = useState({ open: false, status: '', message: '', progress: 0 })

  const handleProcess = async () => {
    if (files.length !== 2) { toast.error('Please upload exactly 2 PDF files.'); return }

    setProcessing(true)
    setModalState({ open: true, status: 'uploading', message: 'Uploading files...', progress: 0 })

    try {
      const formData = new FormData()
      formData.append('files', files[0])
      formData.append('files', files[1])
      formData.append('mode', mode)

      setModalState(prev => ({ ...prev, status: 'processing', message: 'Comparing PDFs...' }))

      const res = await api.post('/compare/compare', formData, {
        onUploadProgress: (e) => setModalState(prev => ({ ...prev, progress: e.total ? Math.round((e.loaded * 100) / e.total) : 0 })),
      })

      setResult(res.data)
      setModalState({
        open: true,
        status: 'done',
        message: res.data.identical ? 'PDFs are identical!' : `Found ${res.data.totalDifferences} difference(s).`,
        result: res.data,
      })
    } catch (err) {
      setModalState({ open: true, status: 'error', message: err.response?.data?.message || 'Failed to compare PDFs.' })
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFiles([])
    setResult(null)
    setModalState({ open: false, status: '', message: '', progress: 0 })
  }

  return (
    <ToolPage
      title="Compare PDF"
      subtitle="Find differences between two PDF documents"
      icon={ArrowsRightLeftIcon}
    >
      <FileUploader
        files={files}
        onFilesChange={setFiles}
        accept={{ 'application/pdf': ['.pdf'] }}
        multiple
        maxFiles={2}
        label="Drop 2 PDFs to compare"
        sublabel="Upload exactly 2 PDF files"
      />

      <div className="mt-6">
        <label className="input-label">Comparison Mode</label>
        <select value={mode} onChange={e => setMode(e.target.value)} className="select-field">
          <option value="text">Text Comparison</option>
          <option value="pages">Page Count Comparison</option>
        </select>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleProcess}
        disabled={processing || files.length !== 2}
        className="btn-primary w-full mt-6"
      >
        Compare PDFs
      </motion.button>

      {result && result.differences && result.differences.length > 0 && (
        <div className="mt-6 card p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Differences (first 100)</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {result.differences.map((diff, i) => (
              <div key={i} className="text-xs grid grid-cols-3 gap-2 p-2 rounded bg-slate-50 dark:bg-white/5">
                <span className="text-slate-500">Line {diff.line}</span>
                <span className="text-rose-600 font-mono truncate">{diff.file1}</span>
                <span className="text-emerald-600 font-mono truncate">{diff.file2}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProcessingModal
        isOpen={modalState.open}
        status={modalState.status}
        progress={modalState.progress}
        message={modalState.message}
        result={modalState.result}
        onReset={handleReset}
      />
    </ToolPage>
  )
}

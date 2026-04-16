import { useState } from 'react'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { pdfAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function PDFToText() {
  const [file, setFile] = useState(null)
  const [modal, setModal] = useState({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })

  const handleProcess = async () => {
    if (!file) return toast.error('Please upload a PDF file.')
    setModal({ open: true, state: 'uploading', progress: 0 })
    try {
      const { data } = await pdfAPI.pdfToText(file, (p) => setModal((prev) => ({ ...prev, progress: p })))
      setModal((prev) => ({ ...prev, state: 'done', downloadUrl: data.downloadUrl, filename: data.filename, message: data.message }))
    } catch (err) {
      setModal((prev) => ({ ...prev, state: 'error', message: err.response?.data?.message || 'Failed to extract text.' }))
    }
  }

  const reset = () => {
    setFile(null)
    setModal({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })
  }

  return (
    <ToolPage title="PDF to Text" subtitle="Extract all text content from PDF files" icon={DocumentTextIcon} iconColor="text-slate-500" iconBg="bg-slate-50 dark:bg-slate-500/10">
      <div className="space-y-6">
        <FileUploader files={file ? [file] : []} onFilesChange={(f) => setFile(f[0] || null)} accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} />
        <div className="card p-4 bg-blue-50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20">
          <p className="text-sm text-blue-700 dark:text-blue-300">Extracted text will be saved as a .txt file with page count header.</p>
        </div>
        <button onClick={handleProcess} disabled={!file} className="btn-primary w-full btn-lg">
          <DocumentTextIcon className="w-5 h-5" />
          Extract Text
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} state={modal.state} progress={modal.progress} downloadUrl={modal.downloadUrl} filename={modal.filename} message={modal.message} onClose={() => setModal((prev) => ({ ...prev, open: false }))} onReset={reset} />
    </ToolPage>
  )
}

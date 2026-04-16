import { useState } from 'react'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { pdfAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function PDFToPNG() {
  const [file, setFile] = useState(null)
  const [scale, setScale] = useState('2.0')
  const [modal, setModal] = useState({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })

  const handleProcess = async () => {
    if (!file) return toast.error('Please upload a PDF file.')
    setModal({ open: true, state: 'uploading', progress: 0 })
    try {
      const { data } = await pdfAPI.pdfToPng(file, { scale }, (p) => setModal((prev) => ({ ...prev, progress: p })))
      setModal((prev) => ({ ...prev, state: 'done', downloadUrl: data.downloadUrl, filename: data.filename, message: data.message }))
    } catch (err) {
      setModal((prev) => ({ ...prev, state: 'error', message: err.response?.data?.message || 'Failed to convert to PNG.' }))
    }
  }

  const reset = () => {
    setFile(null)
    setScale('2.0')
    setModal({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })
  }

  return (
    <ToolPage title="PDF to PNG" subtitle="Convert PDF pages to high-quality PNG images" icon={PhotoIcon} iconColor="text-cyan-500" iconBg="bg-cyan-50 dark:bg-cyan-500/10">
      <div className="space-y-6">
        <FileUploader files={file ? [file] : []} onFilesChange={(f) => setFile(f[0] || null)} accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} />
        <div className="card p-6">
          <div>
            <label className="input-label">Render Scale: {scale}x</label>
            <input type="range" min="1" max="4" step="0.5" value={scale} onChange={(e) => setScale(e.target.value)} className="w-full accent-brand-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1x (faster)</span>
              <span>4x (highest quality)</span>
            </div>
          </div>
        </div>
        <button onClick={handleProcess} disabled={!file} className="btn-primary w-full btn-lg">
          <PhotoIcon className="w-5 h-5" />
          Convert to PNG
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} state={modal.state} progress={modal.progress} downloadUrl={modal.downloadUrl} filename={modal.filename} message={modal.message} onClose={() => setModal((prev) => ({ ...prev, open: false }))} onReset={reset} />
    </ToolPage>
  )
}

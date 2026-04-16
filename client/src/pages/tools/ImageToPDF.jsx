import { useState } from 'react'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { pdfAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function ImageToPDF() {
  const [files, setFiles] = useState([])
  const [pageSize, setPageSize] = useState('a4')
  const [margin, setMargin] = useState('20')
  const [modal, setModal] = useState({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })

  const handleProcess = async () => {
    if (files.length === 0) return toast.error('Please upload image files.')
    setModal({ open: true, state: 'uploading', progress: 0 })
    try {
      const { data } = await pdfAPI.imageToPdf(files, { pageSize, margin }, (p) => setModal((prev) => ({ ...prev, progress: p })))
      setModal((prev) => ({ ...prev, state: 'done', downloadUrl: data.downloadUrl, filename: data.filename, message: data.message }))
    } catch (err) {
      setModal((prev) => ({ ...prev, state: 'error', message: err.response?.data?.message || 'Failed to convert images.' }))
    }
  }

  const reset = () => {
    setFiles([])
    setModal({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })
  }

  return (
    <ToolPage title="Images to PDF" subtitle="Merge multiple images into a single PDF file" icon={ArrowDownTrayIcon} iconColor="text-indigo-500" iconBg="bg-indigo-50 dark:bg-indigo-500/10">
      <div className="space-y-6">
        <FileUploader files={files} onFilesChange={setFiles} accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'] }} multiple maxFiles={30} label="Upload Images" sublabel="Drag & drop up to 30 images" />
        <div className="card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Page Size</label>
              <select value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="select-field">
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>
            <div>
              <label className="input-label">Margin (px)</label>
              <input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} min="0" max="50" className="input-field" />
            </div>
          </div>
        </div>
        <button onClick={handleProcess} disabled={files.length === 0} className="btn-primary w-full btn-lg">
          <ArrowDownTrayIcon className="w-5 h-5" />
          Convert {files.length} Image{files.length !== 1 ? 's' : ''} to PDF
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} state={modal.state} progress={modal.progress} downloadUrl={modal.downloadUrl} filename={modal.filename} message={modal.message} onClose={() => setModal((prev) => ({ ...prev, open: false }))} onReset={reset} />
    </ToolPage>
  )
}

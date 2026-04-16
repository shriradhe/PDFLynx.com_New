import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import { HashtagIcon } from '@heroicons/react/24/outline'

export default function PageNumbers() {
  const [files, setFiles] = useState([])
  const [opts, setOpts] = useState({ startNumber: 1, position: 'bottom-center', fontSize: 12, format: 'numeric', margin: 30 })
  const [modal, setModal] = useState({ open: false, status: 'uploading', progress: 0, message: '', result: null })

  const set = (k, v) => setOpts(p => ({ ...p, [k]: v }))

  const handleProcess = async () => {
    if (!files[0]) { toast.error('Please upload a PDF file.'); return }
    if (isNaN(opts.startNumber) || opts.startNumber < 1) {
      toast.error('Start number must be a valid number >= 1.')
      return
    }
    setModal({ open: true, status: 'uploading', progress: 0, message: 'Uploading...', result: null })
    try {
      const { data } = await pdfAPI.pageNumbers(files[0], opts, (p) =>
        setModal((m) => ({ ...m, progress: p, status: p < 100 ? 'uploading' : 'processing', message: p < 100 ? `Uploading... ${p}%` : 'Adding page numbers...' }))
      )
      setModal({ open: true, status: 'done', progress: 100, message: 'Page numbers added!', result: data })
      setFiles([])
    } catch (err) {
      setModal({ open: true, status: 'error', progress: 0, message: err.response?.data?.message || 'Failed.', result: null })
    }
  }

  const positions = ['bottom-center','bottom-left','bottom-right','top-center','top-left','top-right']

  return (
    <ToolPage title="Add Page Numbers" subtitle="Automatically number pages in your PDF document."
      icon={HashtagIcon} iconColor="text-orange-400" iconBg="bg-orange-500/10"      seoContent={
        <>
          <h2>Add Page Numbers to PDF Online Free</h2>
          <p>
            Add page numbers to PDF online free with PDFLynx allows you to insert page numbering into your documents quickly and accurately. This tool is ideal for organizing reports, presentations, books, and official documents that require clear pagination.
          </p>
          <h3>How to Number PDF Pages</h3>
          <p>
            To use the page numbers PDF online free tool, upload your document and choose the position, format, and style of the page numbers. You can place them at the top, bottom, or corners, and customize numbering formats as needed. Once applied, download your updated file instantly.
          </p>
          <h3>Perfect for Professionals</h3>
          <p>
            This tool is especially useful for professionals, students, and publishers who need structured and easy-to-navigate documents. Proper page numbering improves readability and ensures a professional presentation.
          </p>
          <h3>Secure & Effortless</h3>
          <p>
            PDFLynx processes your files securely and ensures that your data is not stored permanently. All files are automatically deleted after processing. With a simple interface and fast performance, adding page numbers becomes effortless and efficient.
          </p>
        </>
      }
    >
      <div className="glass-card border border-slate-200 dark:border-white/10 p-6 space-y-6">
        <FileUploader files={files} onFilesChange={setFiles} label="Drop your PDF here" sublabel="PDF files up to 50MB" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Start Number</label>
            <input type="number" className="input-field" min={1} value={opts.startNumber} onChange={e => set('startNumber', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="input-label">Font Size</label>
            <input type="number" className="input-field" min={8} max={24} value={opts.fontSize} onChange={e => set('fontSize', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="input-label">Position</label>
            <select className="input-field" value={opts.position} onChange={e => set('position', e.target.value)}>
              {positions.map(p => <option key={p} value={p}>{p.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Format</label>
            <select className="input-field" value={opts.format} onChange={e => set('format', e.target.value)}>
              <option value="numeric">1, 2, 3...</option>
              <option value="page-n-of-total">Page 1 of 10...</option>
            </select>
          </div>
          <div>
            <label className="input-label">Margin: {opts.margin}px</label>
            <input type="range" min={10} max={60} value={opts.margin} onChange={e => set('margin', parseInt(e.target.value))} className="w-full accent-orange-500" />
          </div>
        </div>

        <button onClick={handleProcess} disabled={!files[0]} className="btn-primary w-full" style={{ background: files[0] ? 'linear-gradient(135deg,#c2410c,#fb923c)' : undefined }}>
          <HashtagIcon className="w-5 h-5" />
          Add Page Numbers
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} status={modal.status} progress={modal.progress} message={modal.message} result={modal.result} onClose={() => setModal((m) => ({ ...m, open: false }))} />
    </ToolPage>
  )
}

import { useState } from 'react'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { Squares2X2Icon } from '@heroicons/react/24/outline'
import { pdfAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function OrganizePDF() {
  const [file, setFile] = useState(null)
  const [pageOrder, setPageOrder] = useState('')
  const [modal, setModal] = useState({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })

  const handleProcess = async () => {
    if (!file) return toast.error('Please upload a PDF file.')
    if (!pageOrder.trim()) return toast.error('Please enter page order.')
    const order = pageOrder.split(',').map((n) => parseInt(n.trim())).filter((n) => !isNaN(n))
    if (order.length === 0) return toast.error('Invalid page order. Use comma-separated numbers like: 1,3,2,4')

    setModal({ open: true, state: 'uploading', progress: 0 })
    try {
      const { data } = await pdfAPI.organize(file, { pageOrder: order }, (p) => setModal((prev) => ({ ...prev, progress: p })))
      setModal((prev) => ({ ...prev, state: 'done', downloadUrl: data.downloadUrl, filename: data.filename, message: data.message }))
    } catch (err) {
      setModal((prev) => ({ ...prev, state: 'error', message: err.response?.data?.message || 'Failed to organize PDF.' }))
    }
  }

  const reset = () => {
    setFile(null)
    setPageOrder('')
    setModal({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })
  }

  return (
    <ToolPage title="Organize Pages" subtitle="Reorder, delete, and duplicate PDF pages" icon={QueueListIcon} iconColor="text-rose-400" iconBg="bg-rose-500/10" seoContent={
        <>
          <h2>Organize PDF Online Free</h2>
          <p>
            Organize PDF online free with PDFLynx helps you rearrange, delete, and manage pages within your PDF files easily and efficiently. This tool is perfect for structuring documents exactly the way you need.
          </p>
          <h3>How to Organize PDF Pages</h3>
          <p>
            To use the organize PDF online free tool, upload your file and drag and drop pages to reorder them. You can remove unnecessary pages or combine sections as required. Once finalized, download the organized document instantly.
          </p>
          <h3>Full Control Over Structure</h3>
          <p>
            This tool is highly beneficial for managing large files such as reports, contracts, or study materials. It gives you full control over document structure without requiring advanced software.
          </p>
          <h3>Secure & User-Friendly</h3>
          <p>
            PDFLynx ensures secure and fast processing of your files. Your documents are handled in a protected environment and automatically deleted after use. With an intuitive interface, organizing PDFs becomes quick, flexible, and user-friendly.
          </p>
        </>
      }>
      <div className="space-y-6">
        <FileUploader files={file ? [file] : []} onFilesChange={(f) => setFile(f[0] || null)} accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} />
        <div className="card p-6 space-y-4">
          <div>
            <label className="input-label">Page Order *</label>
            <input type="text" value={pageOrder} onChange={(e) => setPageOrder(e.target.value)} placeholder="e.g. 1,3,2,4,4,5" className="input-field font-mono" />
            <p className="input-hint">Enter page numbers separated by commas. Repeat numbers to duplicate pages. Omit to delete.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPageOrder('1,2,3,4,5')} className="chip">1,2,3,4,5</button>
            <button onClick={() => setPageOrder('5,4,3,2,1')} className="chip">Reverse</button>
            <button onClick={() => setPageOrder('1,1,2,2,3,3')} className="chip">Duplicate each</button>
            <button onClick={() => setPageOrder('1,3,5')} className="chip">Odd only</button>
          </div>
        </div>
        <button onClick={handleProcess} disabled={!file || !pageOrder.trim()} className="btn-primary w-full btn-lg">
          <Squares2X2Icon className="w-5 h-5" />
          Organize Pages
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} state={modal.state} progress={modal.progress} downloadUrl={modal.downloadUrl} filename={modal.filename} message={modal.message} onClose={() => setModal((prev) => ({ ...prev, open: false }))} onReset={reset} />
    </ToolPage>
  )
}

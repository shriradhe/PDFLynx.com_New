import { useState } from 'react'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { EyeDropperIcon } from '@heroicons/react/24/outline'
import { pdfAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function RedactPDF() {
  const [file, setFile] = useState(null)
  const [regions, setRegions] = useState([{ page: 1, x: 100, y: 100, width: 200, height: 50 }])
  const [modal, setModal] = useState({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })

  const addRegion = () => {
    setRegions([...regions, { page: 1, x: 100, y: 100, width: 200, height: 50 }])
  }

  const updateRegion = (i, key, value) => {
    const updated = [...regions]
    updated[i] = { ...updated[i], [key]: parseInt(value) || 0 }
    setRegions(updated)
  }

  const removeRegion = (i) => {
    if (regions.length > 1) setRegions(regions.filter((_, idx) => idx !== i))
  }

  const handleProcess = async () => {
    if (!file) return toast.error('Please upload a PDF file.')
    for (const region of regions) {
      if (region.width <= 0 || region.height <= 0) {
        toast.error('Region dimensions must be positive.')
        return
      }
    }
    setModal({ open: true, state: 'uploading', progress: 0 })
    try {
      const { data } = await pdfAPI.redact(file, { regions }, (p) => setModal((prev) => ({ ...prev, progress: p })))
      setModal((prev) => ({ ...prev, state: 'done', downloadUrl: data.downloadUrl, filename: data.filename, message: data.message }))
    } catch (err) {
      setModal((prev) => ({ ...prev, state: 'error', message: err.response?.data?.message || 'Failed to redact PDF.' }))
    }
  }

  const reset = () => {
    setFile(null)
    setRegions([{ page: 1, x: 100, y: 100, width: 200, height: 50 }])
    setModal({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })
  }

  return (
    <ToolPage title="Redact PDF" subtitle="Permanently remove sensitive content from PDFs" icon={ShieldExclamationIcon} iconColor="text-slate-400" iconBg="bg-slate-500/10" seoContent={
        <>
          <h2>Redact PDF Online Free</h2>
          <p>
            Redact PDF online free with PDFLynx allows you to permanently remove sensitive information from your documents. This tool is essential for protecting confidential data such as personal details, financial information, or business secrets.
          </p>
          <h3>How to Redact Information</h3>
          <p>
            To use the redact PDF online free tool, upload your document and select the text or areas you want to remove. The tool permanently deletes the selected content, ensuring it cannot be recovered. Once completed, download the redacted file instantly.
          </p>
          <h3>Crucial for Privacy</h3>
          <p>
            This feature is especially important for legal, corporate, and personal use where privacy is critical. It helps you share documents safely without exposing sensitive information.
          </p>
          <h3>Reliable Security</h3>
          <p>
            PDFLynx uses secure processing methods to ensure your data remains protected. Files are automatically deleted after processing, giving you complete peace of mind. With a straightforward interface, redacting PDFs is both simple and reliable.
          </p>
        </>
      }>
      <div className="space-y-6">
        <FileUploader files={file ? [file] : []} onFilesChange={(f) => setFile(f[0] || null)} accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} />
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Redaction Regions</h3>
            <button onClick={addRegion} className="btn-ghost btn-sm text-brand-600">+ Add Region</button>
          </div>
          {regions.map((region, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Region #{i + 1}</span>
                {regions.length > 1 && <button onClick={() => removeRegion(i)} className="text-xs text-rose-500 hover:text-rose-600">Remove</button>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <input type="number" value={region.page} onChange={(e) => updateRegion(i, 'page', e.target.value)} min="1" placeholder="Page" className="input-field" />
                <input type="number" value={region.x} onChange={(e) => updateRegion(i, 'x', e.target.value)} placeholder="X" className="input-field" />
                <input type="number" value={region.y} onChange={(e) => updateRegion(i, 'y', e.target.value)} placeholder="Y" className="input-field" />
                <input type="number" value={region.width} onChange={(e) => updateRegion(i, 'width', e.target.value)} placeholder="Width" className="input-field" />
                <input type="number" value={region.height} onChange={(e) => updateRegion(i, 'height', e.target.value)} placeholder="Height" className="input-field" />
              </div>
            </div>
          ))}
        </div>
        <div className="card p-4 bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/20">
          <p className="text-sm text-amber-700 dark:text-amber-300">Warning: Redaction is permanent. Content under black boxes cannot be recovered.</p>
        </div>
        <button onClick={handleProcess} disabled={!file} className="btn-primary w-full btn-lg">
          <EyeDropperIcon className="w-5 h-5" />
          Redact Content
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} state={modal.state} progress={modal.progress} downloadUrl={modal.downloadUrl} filename={modal.filename} message={modal.message} onClose={() => setModal((prev) => ({ ...prev, open: false }))} onReset={reset} />
    </ToolPage>
  )
}

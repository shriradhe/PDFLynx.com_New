import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import { EyeIcon } from '@heroicons/react/24/outline'

export default function WatermarkPDF() {
  const [files, setFiles] = useState([])
  const [opts, setOpts] = useState({ text: 'CONFIDENTIAL', fontSize: 60, opacity: 0.25, colorHex: '#888888', rotation: -45, position: 'center' })
  const [modal, setModal] = useState({ open: false, status: 'uploading', progress: 0, message: '', result: null })

  const set = (k, v) => setOpts(p => ({ ...p, [k]: v }))

  const handleProcess = async () => {
    if (!files[0]) { toast.error('Please upload a PDF file.'); return }
    if (!opts.text.trim()) { toast.error('Watermark text cannot be empty.'); return }
    setModal({ open: true, status: 'uploading', progress: 0, message: 'Uploading...', result: null })
    try {
      const { data } = await pdfAPI.watermark(files[0], opts, (p) =>
        setModal((m) => ({ ...m, progress: p, status: p < 100 ? 'uploading' : 'processing', message: p < 100 ? `Uploading... ${p}%` : 'Adding watermark...' }))
      )
      setModal({ open: true, status: 'done', progress: 100, message: 'Watermark added!', result: data })
      setFiles([])
    } catch (err) {
      setModal({ open: true, status: 'error', progress: 0, message: err.response?.data?.message || 'Failed.', result: null })
    }
  }

  return (
    <ToolPage title="Add Watermark" subtitle="Add a custom text watermark to protect your PDF documents."
      icon={DocumentIcon} iconColor="text-fuchsia-400" iconBg="bg-fuchsia-500/10" seoContent={
        <>
          <h2>Watermark PDF Online Free</h2>
          <p>
            Watermark PDF online free with PDFLynx helps you add text or image watermarks to your documents for branding, protection, or identification purposes. This tool is ideal for marking ownership or preventing unauthorized use.
          </p>
          <h3>How to Add a Watermark</h3>
          <p>
            To use the watermark PDF online free tool, upload your file and choose the watermark type. You can customize text, adjust position, and control transparency. Once applied, download your updated document instantly.
          </p>
          <h3>Protect Your Work</h3>
          <p>
            This tool is especially useful for businesses, designers, and content creators who want to protect their work. Watermarks also help maintain brand identity across shared documents.
          </p>
          <h3>Fast, High-Quality Processing</h3>
          <p>
            PDFLynx ensures fast processing and high-quality output. Your files are handled securely and automatically deleted after use. With no installation required, you can watermark PDFs easily from any device.
          </p>
        </>
      }>
      <div className="glass-card border border-slate-200 dark:border-white/10 p-6 space-y-6">
        <FileUploader files={files} onFilesChange={setFiles} label="Drop your PDF here" sublabel="PDF files up to 50MB" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="input-label">Watermark Text</label>
            <input className="input-field" value={opts.text} onChange={e => set('text', e.target.value)} placeholder="CONFIDENTIAL" />
          </div>
          <div>
            <label className="input-label">Font Size: {opts.fontSize}px</label>
            <input type="range" min={20} max={120} value={opts.fontSize} onChange={e => set('fontSize', parseInt(e.target.value))} className="w-full accent-pink-500" />
          </div>
          <div>
            <label className="input-label">Opacity: {Math.round(opts.opacity * 100)}%</label>
            <input type="range" min={5} max={100} value={Math.round(opts.opacity * 100)} onChange={e => set('opacity', e.target.value / 100)} className="w-full accent-pink-500" />
          </div>
          <div>
            <label className="input-label">Color</label>
            <input type="color" value={opts.colorHex} onChange={e => set('colorHex', e.target.value)} className="h-10 w-full rounded-lg cursor-pointer bg-transparent border border-slate-200 dark:border-white/10" />
          </div>
          <div>
            <label className="input-label">Rotation: {opts.rotation}°</label>
            <input type="range" min={-90} max={90} value={opts.rotation} onChange={e => set('rotation', parseInt(e.target.value))} className="w-full accent-pink-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Position</label>
            <select className="input-field" value={opts.position} onChange={e => set('position', e.target.value)}>
              {['center','top-left','top-right','bottom-left','bottom-right'].map(p => <option key={p} value={p}>{p.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className="glass-card p-6 border-pink-200 dark:border-pink-500/20 bg-pink-50 dark:bg-pink-500/5 flex items-center justify-center h-28 overflow-hidden relative">
          <p className="absolute text-slate-600 dark:text-slate-500 text-xs top-2 left-3">Preview</p>
          <span style={{ fontSize: Math.min(opts.fontSize, 40), opacity: opts.opacity, color: opts.colorHex, transform: `rotate(${opts.rotation}deg)`, fontWeight: 'bold' }}>
            {opts.text || 'Watermark'}
          </span>
        </div>

        <button onClick={handleProcess} disabled={!files[0]} className="btn-primary w-full" style={{ background: files[0] ? 'linear-gradient(135deg,#be185d,#ec4899)' : undefined }}>
          <EyeIcon className="w-5 h-5" />
          Add Watermark
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} status={modal.status} progress={modal.progress} message={modal.message} result={modal.result} onClose={() => setModal((m) => ({ ...m, open: false }))} />
    </ToolPage>
  )
}

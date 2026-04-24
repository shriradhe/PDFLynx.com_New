import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import { ArrowsPointingInIcon } from '@heroicons/react/24/outline'

export default function CompressPDF() {
  const [files, setFiles] = useState([])
  const [compressionLevel, setCompressionLevel] = useState('strong')
  const [modal, setModal] = useState({ open: false, status: 'uploading', progress: 0, message: '', result: null })

  const handleProcess = async () => {
    if (!files[0]) { toast.error('Please upload a PDF file.'); return }
    setModal({ open: true, status: 'uploading', progress: 0, message: 'Uploading...', result: null })
    try {
      const { data } = await pdfAPI.compress(files[0], { level: compressionLevel }, (p) =>
        setModal((m) => ({ ...m, progress: p, status: p < 100 ? 'uploading' : 'processing', message: p < 100 ? `Uploading... ${p}%` : 'Compressing your PDF...' }))
      )
      setModal({
        open: true, status: 'done', progress: 100,
        message: `Compressed (${data.level || compressionLevel})! ${data.originalSize} → ${data.newSize} (${data.reduction} smaller)`,
        result: data,
      })
      setFiles([])
    } catch (err) {
      setModal({ open: true, status: 'error', progress: 0, message: err.response?.data?.message || 'Compression failed.', result: null })
    }
  }

  return (
    <ToolPage title="Compress PDF" subtitle="Reduce your PDF file size while maintaining quality. Great for email attachments."
      icon={ArrowsPointingInIcon} iconColor="text-emerald-400" iconBg="bg-emerald-500/10"      seoContent={
        <>
          <h2>Compress PDF Online Free</h2>
          <p>
            Compress PDF online free with PDFLynx helps you reduce PDF file size without significantly compromising quality. It is ideal for sharing documents via email, uploading files to websites, or saving storage space on your device.
          </p>
          <h3>How to Compress PDFs</h3>
          <p>
            Using the compress PDF online free tool is straightforward. Upload your file, choose the compression level, and let the system optimize your document. Within moments, you’ll receive a smaller file that maintains readability and clarity.
          </p>
          <h3>Great for Large Documents</h3>
          <p>
            This tool is particularly valuable for users dealing with large files such as reports, presentations, or scanned documents. By reducing file size, you can improve upload speeds and ensure compatibility with file size limits.
          </p>
          <h3>Fast, Secure and High Quality</h3>
          <p>
            PDFLynx uses advanced compression techniques to balance quality and size effectively. All processing is done securely, and files are automatically removed after use. With a fast and user-friendly interface, compressing PDFs has never been easier.
          </p>
        </>
      }
    >
      <div className="glass-card border border-slate-200 dark:border-white/10 p-6 space-y-6">
        <FileUploader files={files} onFilesChange={setFiles} label="Drop your PDF here" sublabel="PDF files up to 50MB" />
        <div className="space-y-2">
          <label htmlFor="compression-level" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Compression level
          </label>
          <select
            id="compression-level"
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-white/10 dark:bg-surface-500 dark:text-slate-100"
          >
            <option value="low">Low (best quality)</option>
            <option value="recommended">Recommended (balanced)</option>
            <option value="strong">Strong (smallest size)</option>
          </select>
        </div>
        <div className="glass-card p-4 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-sm text-slate-600 dark:text-slate-400">
          <p>Strong mode applies aggressive image downsampling for maximum size reduction. Results vary by PDF content.</p>
        </div>
        <button onClick={handleProcess} disabled={!files[0]} className="btn-primary w-full" style={{ background: files[0] ? 'linear-gradient(135deg,#059669,#10b981)' : undefined }}>
          <ArrowsPointingInIcon className="w-5 h-5" />
          Compress PDF
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} status={modal.status} progress={modal.progress} message={modal.message} result={modal.result} onClose={() => setModal((m) => ({ ...m, open: false }))} />
    </ToolPage>
  )
}

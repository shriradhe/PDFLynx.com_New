import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import { SparklesIcon } from '@heroicons/react/24/outline'

export default function OCRPDF() {
  const [files, setFiles] = useState([])
  const [modal, setModal] = useState({ open: false, status: 'uploading', progress: 0, message: '', result: null })
  const [extractedText, setExtractedText] = useState('')

  const handleProcess = async () => {
    if (!files[0]) { toast.error('Please upload a PDF or image file.'); return }
    setExtractedText('')
    setModal({ open: true, status: 'uploading', progress: 0, message: 'Uploading...', result: null })
    try {
      const { data } = await pdfAPI.ocr(files[0], (p) =>
        setModal((m) => ({ ...m, progress: p, status: p < 100 ? 'uploading' : 'processing', message: p < 100 ? `Uploading... ${p}%` : 'Running OCR analysis...' }))
      )
      setExtractedText(data.text || '')
      setModal({ open: true, status: 'done', progress: 100, message: `Extracted ${data.charCount?.toLocaleString() || '?'} characters.`, result: data })
      setFiles([])
    } catch (err) {
      setModal({ open: true, status: 'error', progress: 0, message: err.response?.data?.message || 'OCR failed.', result: null })
    }
  }

  return (
    <ToolPage title="OCR PDF" subtitle="Extract text from scanned PDFs and images using optical character recognition."
      icon={SparklesIcon} iconColor="text-green-400" iconBg="bg-green-500/10"      seoContent={
        <>
          <h2>OCR PDF Online Free</h2>
          <p>
            OCR PDF online free with PDFLynx allows you to convert scanned documents and image-based PDFs into editable and searchable text. This tool uses advanced Optical Character Recognition technology to extract text accurately from files that would otherwise be non-editable.
          </p>
          <h3>How to Use the OCR PDF Tool</h3>
          <p>
            To use the OCR PDF online free tool, upload your scanned PDF or image file and start the conversion process. Within seconds, the system analyzes the content and generates a fully searchable and editable document that you can download.
          </p>
          <h3>Digitize Your Documents</h3>
          <p>
            This tool is especially useful for digitizing printed documents, invoices, books, or handwritten notes. It saves time by eliminating manual typing and ensures better productivity for students, professionals, and businesses.
          </p>
          <h3>High Accuracy & Security</h3>
          <p>
            PDFLynx ensures high accuracy while maintaining the original formatting as much as possible. Your files are processed securely and automatically deleted after completion. With no software installation required, you can perform OCR tasks easily from any device.
          </p>
        </>
      }
    >
      <div className="space-y-6">
        <div className="glass-card border border-slate-200 dark:border-white/10 p-6 space-y-6">
          <FileUploader
            files={files} onFilesChange={setFiles}
            accept={{ 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
            label="Drop your PDF or image here"
            sublabel="PDF, JPG, PNG up to 50MB"
          />
          <div className="glass-card p-4 bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20 text-sm text-slate-600 dark:text-slate-400">
            <p>🔍 OCR uses Tesseract.js to recognize text. Best results with clear, high-resolution scans in English.</p>
          </div>
          <button onClick={handleProcess} disabled={!files[0]} className="btn-primary w-full" style={{ background: files[0] ? 'linear-gradient(135deg,#15803d,#22c55e)' : undefined }}>
            <SparklesIcon className="w-5 h-5" />
            Extract Text with OCR
          </button>
        </div>

        {/* Text output */}
        {extractedText && (
          <div className="glass-card border border-slate-200 dark:border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">Extracted Text</h3>
              <button
                onClick={() => { navigator.clipboard.writeText(extractedText); toast.success('Copied to clipboard!') }}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Copy All
              </button>
            </div>
            <textarea
              readOnly
              value={extractedText}
              className="input-field min-h-[300px] font-mono text-xs resize-y"
            />
          </div>
        )}
      </div>

      <ProcessingModal isOpen={modal.open} status={modal.status} progress={modal.progress} message={modal.message} result={modal.result} onClose={() => setModal((m) => ({ ...m, open: false }))} />
    </ToolPage>
  )
}

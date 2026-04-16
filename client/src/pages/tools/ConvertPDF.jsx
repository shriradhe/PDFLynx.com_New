import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import { ArrowsRightLeftIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const conversionTypes = [
  { value: 'pdf-to-word', label: 'PDF → Word', desc: 'Convert to editable .docx', icon: DocumentTextIcon, color: 'blue', accept: { 'application/pdf': ['.pdf'] } },
  { value: 'pdf-to-jpg', label: 'PDF → JPG', desc: 'Export pages as images', icon: PhotoIcon, color: 'cyan', accept: { 'application/pdf': ['.pdf'] } },
  {
    value: 'jpg-to-pdf', label: 'JPG → PDF', desc: 'Images to PDF document', icon: ArrowsRightLeftIcon, color: 'purple',
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }
  },
]

export default function ConvertPDF() {
  const [type, setType] = useState('pdf-to-word')
  const [files, setFiles] = useState([])
  const [modal, setModal] = useState({ open: false, status: 'uploading', progress: 0, message: '', result: null })

  const selected = conversionTypes.find(t => t.value === type)

  const handleProcess = async () => {
    if (files.length === 0) { toast.error('Please upload a file.'); return }
    setModal({ open: true, status: 'uploading', progress: 0, message: 'Uploading...', result: null })
    try {
      const filesToSend = type === 'jpg-to-pdf' ? files : files[0]
      const { data } = await pdfAPI.convert(filesToSend, type, (p) =>
        setModal((m) => ({ ...m, progress: p, status: p < 100 ? 'uploading' : 'processing', message: p < 100 ? `Uploading... ${p}%` : 'Converting...' }))
      )
      setModal({ open: true, status: 'done', progress: 100, message: 'Conversion completed!', result: data })
      setFiles([])
    } catch (err) {
      setModal({ open: true, status: 'error', progress: 0, message: err.response?.data?.message || 'Conversion failed.', result: null })
    }
  }

  const colorMap = { blue: 'border-blue-500/50 bg-blue-500/10 text-blue-400', cyan: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400', purple: 'border-purple-500/50 bg-purple-500/10 text-purple-400' }

  return (
    <ToolPage title="Convert PDF" subtitle="Transform PDFs to other formats or convert images to PDF."
      icon={ArrowsRightLeftIcon} iconColor="text-blue-400" iconBg="bg-blue-500/10"      seoContent={
        <>
          <h2>Convert PDF Online Free</h2>
          <p>
            Convert PDF online free with PDFLynx enables you to transform PDF files into various formats such as Word, PNG, or text with ease. This tool is designed for users who need flexible document formats for editing, sharing, or presentation purposes.
          </p>
          <h3>How to Use the PDF Converter</h3>
          <p>
            To use the convert PDF online free tool, upload your PDF and select the desired output format. The system processes your file quickly and provides a high-quality converted version ready for download.
          </p>
          <h3>Versatility Built-In</h3>
          <p>
            One of the key benefits is versatility. Whether you need to edit text in Word, extract images, or reuse content, this tool simplifies the workflow. It is especially useful for professionals, students, and content creators.
          </p>
          <h3>Accurate and Secure</h3>
          <p>
            PDFLynx ensures accurate conversions while maintaining the original layout and formatting. Files are handled securely and deleted automatically after processing. With no software installation required, you can convert PDFs anytime, anywhere.
          </p>
        </>
      }
    >
      <div className="glass-card border border-slate-200 dark:border-white/10 p-6 space-y-6">
        {/* Type selection */}
        <div>
          <label className="input-label">Conversion Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {conversionTypes.map((t) => {
              const Icon = t.icon
              return (
                <button key={t.value} onClick={() => { setType(t.value); setFiles([]) }}
                  className={`p-4 rounded-xl border text-left transition-all ${type === t.value ? colorMap[t.color] : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/3 hover:border-slate-300 dark:hover:border-white/20'}`}>
                  <Icon className="w-5 h-5 mb-2" />
                  <p className="font-medium text-sm">{t.label}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">{t.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        <FileUploader
          files={files} onFilesChange={setFiles}
          accept={selected.accept}
          multiple={type === 'jpg-to-pdf'}
          maxFiles={type === 'jpg-to-pdf' ? 20 : 1}
          label={type === 'jpg-to-pdf' ? 'Drop images here' : 'Drop your PDF here'}
          sublabel={type === 'jpg-to-pdf' ? 'JPG, PNG, WebP up to 50MB each' : 'PDF files up to 50MB'}
        />

        <button onClick={handleProcess} disabled={files.length === 0} className="btn-primary w-full">
          <ArrowsRightLeftIcon className="w-5 h-5" />
          Convert Now
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} status={modal.status} progress={modal.progress} message={modal.message} result={modal.result} onClose={() => setModal((m) => ({ ...m, open: false }))} />
    </ToolPage>
  )
}

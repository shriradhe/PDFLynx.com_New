import { useState } from 'react'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { PencilIcon } from '@heroicons/react/24/outline'
import { pdfAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function SignPDF() {
  const [file, setFile] = useState(null)
  const [signatureText, setSignatureText] = useState('')
  const [pageNumber, setPageNumber] = useState('1')
  const [x, setX] = useState('50')
  const [y, setY] = useState('50')
  const [fontSize, setFontSize] = useState('14')
  const [modal, setModal] = useState({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })

  const handleProcess = async () => {
    if (!file) return toast.error('Please upload a PDF file.')
    if (!signatureText.trim()) return toast.error('Please enter signature text.')

    const pageNum = parseInt(pageNumber) || 1
    const xPos = parseInt(x) || 0
    const yPos = parseInt(y) || 0
    const size = parseInt(fontSize) || 14

    if (pageNum < 1) return toast.error('Page number must be at least 1.')
    if (xPos < 0 || yPos < 0) return toast.error('Position values must be non-negative.')
    if (size < 8 || size > 72) return toast.error('Font size must be between 8 and 72.')

    setModal({ open: true, state: 'uploading', progress: 0 })
    try {
      const { data } = await pdfAPI.sign(file, { signatureText: signatureText.trim(), pageNumber: pageNum, x: xPos, y: yPos, fontSize: size }, (p) =>
        setModal((prev) => ({ ...prev, progress: p }))
      )
      setModal((prev) => ({
        ...prev,
        state: 'done',
        downloadUrl: data.downloadUrl,
        filename: data.filename,
        message: data.message,
      }))
    } catch (err) {
      setModal((prev) => ({ ...prev, state: 'error', message: err.response?.data?.message || 'Failed to sign PDF.' }))
    }
  }

  const reset = () => {
    setFile(null)
    setSignatureText('')
    setPageNumber('1')
    setX('50')
    setY('50')
    setFontSize('14')
    setModal({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })
  }

  return (
    <ToolPage 
      title="Sign PDF" 
      subtitle="Add your digital signature to any PDF document" 
      icon={PencilIcon} 
      iconColor="text-purple-400" 
      iconBg="bg-purple-500/10"
      seoContent={
        <>
          <h2>Sign PDF Online Free</h2>
          <p>
            Sign PDF online free with PDFLynx allows you to add digital signatures to your documents easily and securely. This tool is perfect for signing contracts, agreements, and official documents without printing or scanning.
          </p>
          <h3>How to Sign a PDF</h3>
          <p>
            To use the sign PDF online free tool, upload your file and create your signature by drawing, typing, or uploading an image. Place the signature in the desired location and download the signed document instantly.
          </p>
          <h3>Ultimate Convenience</h3>
          <p>
            The main advantage of this tool is convenience. It saves time and streamlines workflows, especially for remote work and online transactions. You can sign documents anytime, anywhere.
          </p>
          <h3>Safe and Secure</h3>
          <p>
            PDFLynx ensures your signatures and files are handled securely. All documents are processed safely and automatically deleted after completion. With a clean and user-friendly interface, signing PDFs becomes quick and effortless.
          </p>
        </>
      }
    >
      <div className="space-y-6">
        <FileUploader files={file ? [file] : []} onFilesChange={(f) => setFile(f[0] || null)} accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} />

        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Signature Details</h3>
          <div>
            <label className="input-label">Signature Text *</label>
            <input type="text" value={signatureText} onChange={(e) => setSignatureText(e.target.value)} placeholder="e.g. John Doe - Approved" className="input-field" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="input-label">Page</label>
              <input type="number" value={pageNumber} onChange={(e) => setPageNumber(e.target.value)} min="1" className="input-field" />
            </div>
            <div>
              <label className="input-label">X Position</label>
              <input type="number" value={x} onChange={(e) => setX(e.target.value)} min="0" className="input-field" />
            </div>
            <div>
              <label className="input-label">Y Position</label>
              <input type="number" value={y} onChange={(e) => setY(e.target.value)} min="0" className="input-field" />
            </div>
            <div>
              <label className="input-label">Font Size</label>
              <input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} min="8" max="72" className="input-field" />
            </div>
          </div>
        </div>

        <button onClick={handleProcess} disabled={!file || !signatureText.trim()} className="btn-primary w-full btn-lg">
          <PencilIcon className="w-5 h-5" />
          Sign PDF
        </button>
      </div>

      <ProcessingModal
        isOpen={modal.open}
        state={modal.state}
        progress={modal.progress}
        downloadUrl={modal.downloadUrl}
        filename={modal.filename}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
        onReset={reset}
      />
    </ToolPage>
  )
}

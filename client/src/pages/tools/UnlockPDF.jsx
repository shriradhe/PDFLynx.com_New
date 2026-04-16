import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import { LockOpenIcon } from '@heroicons/react/24/outline'

export default function UnlockPDF() {
  const [files, setFiles] = useState([])
  const [password, setPassword] = useState('')
  const [modal, setModal] = useState({ open: false, status: 'uploading', progress: 0, message: '', result: null })

  const handleProcess = async () => {
    if (!files[0]) { toast.error('Please upload a PDF file.'); return }
    setModal({ open: true, status: 'uploading', progress: 0, message: 'Uploading...', result: null })
    try {
      const { data } = await pdfAPI.unlock(files[0], { password }, (p) =>
        setModal((m) => ({ ...m, progress: p, status: p < 100 ? 'uploading' : 'processing', message: p < 100 ? `Uploading... ${p}%` : 'Removing protection...' }))
      )
      setModal({ open: true, status: 'done', progress: 100, message: 'PDF unlocked!', result: data })
      setFiles([])
    } catch (err) {
      setModal({ open: true, status: 'error', progress: 0, message: err.response?.data?.message || 'Failed. Wrong password?', result: null })
    }
  }

  return (
    <ToolPage title="Unlock PDF" subtitle="Remove password protection from your PDF files."
      icon={LockOpenIcon} iconColor="text-teal-400" iconBg="bg-teal-500/10"      seoContent={
        <>
          <h2>Unlock PDF Online Free</h2>
          <p>
            Unlock PDF online free with PDFLynx allows you to remove passwords and restrictions from protected PDF files quickly and securely. This tool is useful when you need access to edit, print, or copy content from locked documents.
          </p>
          <h3>How to Unlock a PDF</h3>
          <p>
            To use the unlock PDF online free tool, upload your protected file and enter the password if required. The system will remove restrictions and provide an unlocked version ready for download.
          </p>
          <h3>Save Time</h3>
          <p>
            This tool is highly beneficial for users who frequently deal with restricted files. It saves time and eliminates the need for complex software or manual workarounds.
          </p>
          <h3>Reliable & Secure</h3>
          <p>
            PDFLynx ensures secure handling of your files during the unlocking process. All data is processed safely and automatically deleted after completion. With a simple interface and fast performance, unlocking PDFs becomes quick and reliable.
          </p>
        </>
      }
    >
      <div className="glass-card border border-slate-200 dark:border-white/10 p-6 space-y-6">
        <FileUploader files={files} onFilesChange={setFiles} label="Drop your locked PDF here" sublabel="PDF files up to 50MB" />
        <div>
          <label className="input-label">PDF Password (if known)</label>
          <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank if no password" />
        </div>
        <button onClick={handleProcess} disabled={!files[0]} className="btn-primary w-full" style={{ background: files[0] ? 'linear-gradient(135deg,#0f766e,#14b8a6)' : undefined }}>
          <LockOpenIcon className="w-5 h-5" />
          Unlock PDF
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} status={modal.status} progress={modal.progress} message={modal.message} result={modal.result} onClose={() => setModal((m) => ({ ...m, open: false }))} />
    </ToolPage>
  )
}

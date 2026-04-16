import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import { LockClosedIcon } from '@heroicons/react/24/outline'

export default function ProtectPDF() {
  const [files, setFiles] = useState([])
  const [userPassword, setUserPassword] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [modal, setModal] = useState({ open: false, status: 'uploading', progress: 0, message: '', result: null })

  const handleProcess = async () => {
    if (!files[0]) { toast.error('Please upload a PDF file.'); return }
    if (!userPassword) { toast.error('Please enter a password.'); return }
    setModal({ open: true, status: 'uploading', progress: 0, message: 'Uploading...', result: null })
    try {
      const { data } = await pdfAPI.protect(files[0], { userPassword, ownerPassword: ownerPassword || userPassword }, (p) =>
        setModal((m) => ({ ...m, progress: p, status: p < 100 ? 'uploading' : 'processing', message: p < 100 ? `Uploading... ${p}%` : 'Protecting PDF...' }))
      )
      setModal({ open: true, status: 'done', progress: 100, message: 'PDF protected successfully!', result: data })
      setFiles([])
    } catch (err) {
      setModal({ open: true, status: 'error', progress: 0, message: err.response?.data?.message || 'Failed.', result: null })
    }
  }

  return (
    <ToolPage title="Protect PDF" subtitle="Add password protection to secure your PDF documents."
      icon={LockClosedIcon} iconColor="text-indigo-400" iconBg="bg-indigo-500/10"      seoContent={
        <>
          <h2>Protect PDF Online Free</h2>
          <p>
            Protect PDF online free with PDFLynx lets you secure your documents by adding passwords and restricting access. This tool is essential for protecting sensitive information such as contracts, reports, and personal files.
          </p>
          <h3>How to Add a Password</h3>
          <p>
            To use the protect PDF online free tool, upload your document and set a password. You can control who can open or modify the file. Once secured, download the protected PDF instantly.
          </p>
          <h3>Enhanced Security</h3>
          <p>
            The main benefit of this tool is enhanced security. It prevents unauthorized access and ensures your confidential data remains safe. This is particularly useful for businesses and individuals sharing important documents online.
          </p>
          <h3>Encrypted & Auto-Deleted</h3>
          <p>
            PDFLynx uses secure encryption methods to protect your files. All uploaded data is processed safely and automatically deleted after use. With a user-friendly interface, you can secure your PDFs in just a few clicks.
          </p>
        </>
      }
    >
      <div className="glass-card border border-slate-200 dark:border-white/10 p-6 space-y-6">
        <FileUploader files={files} onFilesChange={setFiles} label="Drop your PDF here" sublabel="PDF files up to 50MB" />
        <div>
          <label className="input-label">User Password (required to open)</label>
          <input type="password" className="input-field" value={userPassword} onChange={e => setUserPassword(e.target.value)} placeholder="Enter password" />
        </div>
        <div>
          <label className="input-label">Owner Password (optional — for editing/printing)</label>
          <input type="password" className="input-field" value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} placeholder="Same as user password if left blank" />
        </div>
        <div className="glass-card p-4 bg-indigo-50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/20 text-sm text-slate-600 dark:text-slate-400">
          <p>⚠️ Note: Basic protection is applied (RC4). For AES-256 encryption, install qpdf on the server.</p>
        </div>
        <button onClick={handleProcess} disabled={!files[0] || !userPassword} className="btn-primary w-full" style={{ background: (files[0] && userPassword) ? 'linear-gradient(135deg,#4338ca,#6366f1)' : undefined }}>
          <LockClosedIcon className="w-5 h-5" />
          Protect PDF
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} status={modal.status} progress={modal.progress} message={modal.message} result={modal.result} onClose={() => setModal((m) => ({ ...m, open: false }))} />
    </ToolPage>
  )
}

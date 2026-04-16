import { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function ESignature() {
  const [files, setFiles] = useState([])
  const [mode, setMode] = useState('sign')
  const [signers, setSigners] = useState([])
  const [signatureText, setSignatureText] = useState('')
  const [sigPosition, setSigPosition] = useState({ page: 1, x: 50, y: 50 })
  const [processing, setProcessing] = useState(false)
  const [modalState, setModalState] = useState({ open: false, status: '', message: '', progress: 0, result: null })

  const addSigner = () => {
    setSigners([...signers, { name: '', email: '', page: 1, x: 50, y: 50 }])
  }

  const updateSigner = (index, key, value) => {
    const updated = [...signers]
    updated[index] = { ...updated[index], [key]: value }
    setSigners(updated)
  }

  const removeSigner = (index) => {
    setSigners(signers.filter((_, i) => i !== index))
  }

  const handleProcess = async () => {
    if (files.length === 0) { toast.error('Please upload a PDF file.'); return }

    setProcessing(true)
    setModalState({ open: true, status: 'uploading', message: 'Uploading file...', progress: 0 })

    try {
      if (mode === 'request') {
        const formData = new FormData()
        formData.append('file', files[0])
        formData.append('signers', JSON.stringify(signers))

        const res = await pdfAPI.createSigningRequest(formData, (p) =>
          setModalState(prev => ({ ...prev, status: 'processing', message: 'Creating signing request...', progress: p }))
        )
        setModalState({ open: true, status: 'done', message: 'Signing request created!', result: res })
      } else {
        if (!signatureText) { toast.error('Please enter your signature text.'); return }

        const formData = new FormData()
        formData.append('file', files[0])
        formData.append('signatureText', signatureText)
        formData.append('page', sigPosition.page)
        formData.append('x', sigPosition.x)
        formData.append('y', sigPosition.y)

        const res = await pdfAPI.eSign(formData, (p) =>
          setModalState(prev => ({ ...prev, status: 'processing', message: 'Signing document...', progress: p }))
        )
        setModalState({ open: true, status: 'done', message: 'Document signed!', result: res })
      }
    } catch (err) {
      setModalState({ open: true, status: 'error', message: err.response?.data?.message || 'Failed.' })
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFiles([])
    setSigners([])
    setSignatureText('')
    setSigPosition({ page: 1, x: 50, y: 50 })
    setModalState({ open: false, status: '', message: '', progress: 0, result: null })
  }

  return (
    <ToolPage
      title="E-Signature"
      subtitle="Sign documents or request signatures from others"
      icon={PencilIcon}
    >
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode('sign')} className={`btn-sm ${mode === 'sign' ? 'btn-primary' : 'btn-secondary'}`}>Sign Document</button>
        <button onClick={() => setMode('request')} className={`btn-sm ${mode === 'request' ? 'btn-primary' : 'btn-secondary'}`}>Request Signatures</button>
      </div>

      <FileUploader
        files={files}
        onFilesChange={setFiles}
        accept={{ 'application/pdf': ['.pdf'] }}
        maxFiles={1}
        label="Drop your PDF here"
      />

      {mode === 'sign' ? (
        <div className="space-y-4 mt-6">
          <div>
            <label className="input-label">Your Signature (Text)</label>
            <input type="text" value={signatureText} onChange={e => setSignatureText(e.target.value)} className="input-field" placeholder="Type your full name" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="input-label">Page</label>
              <input type="number" value={sigPosition.page} onChange={e => setSigPosition(p => ({ ...p, page: parseInt(e.target.value) || 1 }))} className="input-field" min="1" />
            </div>
            <div>
              <label className="input-label">X Position</label>
              <input type="number" value={sigPosition.x} onChange={e => setSigPosition(p => ({ ...p, x: parseInt(e.target.value) || 0 }))} className="input-field" />
            </div>
            <div>
              <label className="input-label">Y Position</label>
              <input type="number" value={sigPosition.y} onChange={e => setSigPosition(p => ({ ...p, y: parseInt(e.target.value) || 0 }))} className="input-field" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          <button onClick={addSigner} className="btn-secondary btn-sm">+ Add Signer</button>
          {signers.map((signer, i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Signer {i + 1}</span>
                <button onClick={() => removeSigner(i)} className="text-rose-500"><TrashIcon className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={signer.name} onChange={e => updateSigner(i, 'name', e.target.value)} className="input-field" placeholder="Name" />
                <input type="email" value={signer.email} onChange={e => updateSigner(i, 'email', e.target.value)} className="input-field" placeholder="Email" />
              </div>
            </div>
          ))}
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleProcess}
        disabled={processing || files.length === 0}
        className="btn-primary w-full mt-6"
      >
        {mode === 'sign' ? 'Sign Document' : 'Request Signatures'}
      </motion.button>

      <ProcessingModal
        isOpen={modalState.open}
        status={modalState.status}
        progress={modalState.progress}
        message={modalState.message}
        result={modalState.result}
        onReset={handleReset}
      />
    </ToolPage>
  )
}

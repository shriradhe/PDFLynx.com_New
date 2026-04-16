import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import { DocumentDuplicateIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

export default function MergePDF() {
  const [files, setFiles] = useState([])
  const [dragIdx, setDragIdx] = useState(null)
  const dragOverIdx = useRef(null)
  const [modal, setModal] = useState({ open: false, status: 'uploading', progress: 0, message: '', result: null })

  const handleReorder = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return
    const updated = [...files]
    const [moved] = updated.splice(fromIdx, 1)
    updated.splice(toIdx, 0, moved)
    setFiles(updated)
  }

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleProcess = async () => {
    if (files.length < 2) { toast.error('Please add at least 2 PDF files to merge.'); return }
    setModal({ open: true, status: 'uploading', progress: 0, message: 'Uploading files...', result: null })
    try {
      const { data } = await pdfAPI.merge(files, (p) =>
        setModal((m) => ({ ...m, progress: p, status: p < 100 ? 'uploading' : 'processing', message: p < 100 ? `Uploading... ${p}%` : 'Merging your PDFs...' }))
      )
      setModal({ open: true, status: 'done', progress: 100, message: `${files.length} PDFs merged successfully.`, result: data })
      setFiles([])
    } catch (err) {
      setModal({ open: true, status: 'error', progress: 0, message: err.response?.data?.message || 'Merge failed. Please try again.', result: null })
    }
  }

  return (
    <ToolPage
      title="Merge PDF"
      subtitle="Combine multiple PDF files into one document. Drag to reorder before merging."
      icon={DocumentDuplicateIcon}
      iconColor="text-rose-400"
      iconBg="bg-rose-500/10"
      seoContent={
        <>
          <h2>How to Merge PDF Files Online for Free</h2>
          <p>
            Combining multiple PDF documents into a single file shouldn't be complicated or expensive. With PDFLynx, you can easily <strong>merge PDF files online for free</strong>, without installing any software or dealing with annoying watermarks. Whether you're combining invoices, reports, or scanned documents, our tool makes the process fast and intuitive.
          </p>

          <h3>Step-by-Step: Combining Your PDFs</h3>
          <ol>
            <li><strong>Upload your files:</strong> Drag and drop your PDF files into the upload area above, or click to select them from your device. You can upload up to 20 files at once.</li>
            <li><strong>Reorder pages:</strong> Once uploaded, you'll see a list of your files. Simply drag them up or down to arrange them in the exact order you want them to appear in the final document.</li>
            <li><strong>Merge and Download:</strong> Click the "Merge PDFs" button. Our servers will stitch your files together in seconds. Once complete, your new merged PDF will download automatically.</li>
          </ol>

          <h3>Why Use PDFLynx for PDF Merging?</h3>
          <p>
            While there are many PDF tools available, PDFLynx focuses on three core principles: <strong>Speed, Privacy, and Ease of Use.</strong>
          </p>
          <ul>
            <li><strong>100% Free, No Watermarks:</strong> We don't hide our best features behind a paywall, and we never ruin your professional documents with forced watermarks.</li>
            <li><strong>No Registration Required:</strong> You don't need to create an account or hand over your email address to use our core merging tools. Just upload and merge.</li>
            <li><strong>Cross-Platform Compatibility:</strong> Because PDFLynx works entirely in your web browser, you can merge PDFs on Windows, Mac, Linux, iOS, or Android devices seamlessly.</li>
          </ul>

          <h3>Bank-Grade Security & Auto-Deletion</h3>
          <p>
            We understand that your documents may contain sensitive, confidential information. Our entire platform is built with a <strong>Zero Trust</strong> architecture. When you upload files to merge, they are processed over secure, encrypted AES-256 connections. 
          </p>
          <p>
            More importantly, <strong>we never keep your files</strong>. Every single document you upload, and every merged file you generate, is automatically and permanently deleted from our servers within 30 minutes of processing. We do not read, analyze, or use your data to train AI models.
          </p>
        </>
      }
    >
      <div className="glass-card border border-slate-200 dark:border-white/10 p-6 space-y-6">
        <FileUploader
          files={files}
          onFilesChange={setFiles}
          multiple
          maxFiles={20}
          label="Drop PDFs here or click to browse"
          sublabel="Add up to 20 PDF files · 50MB each"
        />

        {files.length >= 2 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              File order ({files.length} files) — drag to reorder:
            </p>
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  layout
                  draggable
                  onDragStart={() => setDragIdx(index)}
                  onDragEnter={() => { dragOverIdx.current = index }}
                  onDragEnd={() => {
                    if (dragOverIdx.current !== null && dragIdx !== null) {
                      handleReorder(dragIdx, dragOverIdx.current)
                    }
                    setDragIdx(null)
                    dragOverIdx.current = null
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-grab active:cursor-grabbing"
                >
                  <Bars3Icon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate flex-1">
                    {index + 1}. {file.name}
                  </span>
                  <span className="text-xs text-slate-500 flex-shrink-0">{formatBytes(file.size)}</span>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-accent-red hover:bg-accent-red/10 transition-all flex-shrink-0"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <button
          onClick={handleProcess}
          disabled={files.length < 2}
          className="btn-primary w-full"
          style={{ background: files.length >= 2 ? 'linear-gradient(135deg,#e11d48,#f43f5e)' : undefined }}
        >
          <DocumentDuplicateIcon className="w-5 h-5" />
          Merge {files.length > 0 ? `${files.length} PDFs` : 'PDFs'}
        </button>
      </div>

      <ProcessingModal
        isOpen={modal.open}
        status={modal.status}
        progress={modal.progress}
        message={modal.message}
        result={modal.result}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />
    </ToolPage>
  )
}

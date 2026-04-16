import { useState } from 'react'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { pdfAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function EditPDF() {
  const [file, setFile] = useState(null)
  const [edits, setEdits] = useState([{ type: 'text', text: '', page: 1, x: 50, y: 50, fontSize: 12, color: '#000000', bold: false }])
  const [modal, setModal] = useState({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })

  const addEdit = () => {
    setEdits([...edits, { type: 'text', text: '', page: 1, x: 50, y: 50, fontSize: 12, color: '#000000', bold: false }])
  }

  const removeEdit = (i) => {
    if (edits.length > 1) setEdits(edits.filter((_, idx) => idx !== i))
  }

  const updateEdit = (i, key, value) => {
    const updated = [...edits]
    updated[i] = { ...updated[i], [key]: value }
    setEdits(updated)
  }

  const handleProcess = async () => {
    if (!file) return toast.error('Please upload a PDF file.')
    const validEdits = edits.filter((e) => e.text?.trim())
    if (validEdits.length === 0) return toast.error('Add at least one text edit.')

    setModal({ open: true, state: 'uploading', progress: 0 })
    try {
      const { data } = await pdfAPI.edit(file, { edits: validEdits }, (p) =>
        setModal((prev) => ({ ...prev, progress: p }))
      )
      setModal((prev) => ({ ...prev, state: 'done', downloadUrl: data.downloadUrl, filename: data.filename, message: data.message }))
    } catch (err) {
      setModal((prev) => ({ ...prev, state: 'error', message: err.response?.data?.message || 'Failed to edit PDF.' }))
    }
  }

  const reset = () => {
    setFile(null)
    setEdits([{ type: 'text', text: '', page: 1, x: 50, y: 50, fontSize: 12, color: '#000000', bold: false }])
    setModal({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })
  }

  return (
    <ToolPage title="Edit PDF" subtitle="Add text, images, and shapes to your PDF pages" icon={PencilSquareIcon} iconColor="text-cyan-400" iconBg="bg-cyan-500/10" seoContent={
        <>
          <h2>Edit PDF Online Free</h2>
          <p>
            Edit PDF online free with PDFLynx enables you to modify text, images, and elements within your PDF files quickly and efficiently. Whether you need to update content, correct errors, or add new information, this tool provides a simple and effective solution.
          </p>
          <h3>How to Edit a PDF</h3>
          <p>
            To use the edit PDF online free tool, upload your file and select the elements you want to modify. You can add text, adjust formatting, insert images, or highlight important sections. Once done, download the updated document instantly.
          </p>
          <h3>Perfect for Everyone</h3>
          <p>
            This tool is ideal for professionals, students, and anyone who frequently works with documents. It eliminates the need for expensive software and allows quick edits directly in your browser.
          </p>
          <h3>Smooth & Secure Experience</h3>
          <p>
            PDFLynx ensures a smooth editing experience while keeping your data secure. Files are processed in a protected environment and automatically removed after use. With an intuitive interface, editing PDFs becomes fast, accessible, and hassle-free.
          </p>
        </>
      }>
      <div className="space-y-6">
        <FileUploader files={file ? [file] : []} onFilesChange={(f) => setFile(f[0] || null)} accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} />

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Edits</h3>
            <button onClick={addEdit} className="btn-ghost btn-sm text-brand-600">+ Add Edit</button>
          </div>
          {edits.map((edit, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Edit #{i + 1}</span>
                {edits.length > 1 && (
                  <button onClick={() => removeEdit(i)} className="text-xs text-rose-500 hover:text-rose-600">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" value={edit.text} onChange={(e) => updateEdit(i, 'text', e.target.value)} placeholder="Text to add" className="input-field" />
                <input type="number" value={edit.page} onChange={(e) => updateEdit(i, 'page', parseInt(e.target.value))} min="1" placeholder="Page" className="input-field" />
                <input type="number" value={edit.x} onChange={(e) => updateEdit(i, 'x', parseInt(e.target.value))} placeholder="X" className="input-field" />
                <input type="number" value={edit.y} onChange={(e) => updateEdit(i, 'y', parseInt(e.target.value))} placeholder="Y" className="input-field" />
                <input type="number" value={edit.fontSize} onChange={(e) => updateEdit(i, 'fontSize', parseInt(e.target.value))} min="8" max="72" placeholder="Font Size" className="input-field" />
                <div className="flex items-center gap-2">
                  <input type="color" value={edit.color} onChange={(e) => updateEdit(i, 'color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input type="checkbox" checked={edit.bold} onChange={(e) => updateEdit(i, 'bold', e.target.checked)} /> Bold
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleProcess} disabled={!file} className="btn-primary w-full btn-lg">
          <PencilSquareIcon className="w-5 h-5" />
          Apply Edits
        </button>
      </div>

      <ProcessingModal
        isOpen={modal.open} state={modal.state} progress={modal.progress}
        downloadUrl={modal.downloadUrl} filename={modal.filename} message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))} onReset={reset}
      />
    </ToolPage>
  )
}

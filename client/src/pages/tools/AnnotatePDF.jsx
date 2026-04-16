import { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AnnotatePDF() {
  const [files, setFiles] = useState([])
  const [annotations, setAnnotations] = useState([])
  const [processing, setProcessing] = useState(false)
  const [modalState, setModalState] = useState({ open: false, status: '', message: '', progress: 0, result: null })

  const addAnnotation = (type) => {
    setAnnotations([...annotations, {
      type,
      page: 1,
      x: 50,
      y: 50,
      width: 100,
      height: 20,
      color: type === 'highlight' ? '#ffff00' : type === 'note' ? '#ff0000' : '#000000',
      opacity: type === 'highlight' ? 0.3 : 1,
      text: '',
      fontSize: 12,
    }])
  }

  const updateAnnotation = (index, key, value) => {
    const updated = [...annotations]
    updated[index] = { ...updated[index], [key]: value }
    setAnnotations(updated)
  }

  const removeAnnotation = (index) => {
    setAnnotations(annotations.filter((_, i) => i !== index))
  }

  const handleProcess = async () => {
    if (files.length === 0) { toast.error('Please upload a PDF file.'); return }
    if (annotations.length === 0) { toast.error('Please add at least one annotation.'); return }

    setProcessing(true)
    setModalState({ open: true, status: 'uploading', message: 'Uploading file...', progress: 0 })

    try {
      const formData = new FormData()
      formData.append('file', files[0])
      formData.append('annotations', JSON.stringify(annotations))

      const res = await pdfAPI.annotate(formData, (p) =>
        setModalState(prev => ({ ...prev, status: 'processing', message: 'Annotating PDF...', progress: p }))
      )

      setModalState({ open: true, status: 'done', message: 'PDF annotated successfully!', result: res })
    } catch (err) {
      setModalState({ open: true, status: 'error', message: err.response?.data?.message || 'Failed to annotate PDF.' })
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFiles([])
    setAnnotations([])
    setModalState({ open: false, status: '', message: '', progress: 0, result: null })
  }

  return (
    <ToolPage
      title="Annotate PDF"
      subtitle="Add highlights, underlines, strikethroughs, and notes"
      icon={PencilSquareIcon}
      iconColor="text-lime-400"
      iconBg="bg-lime-500/10"
      seoContent={
        <>
          <h2>Annotate PDF Online Free</h2>
          <p>
            Annotate PDF online free with PDFLynx enables you to add comments, highlights, drawings, and notes to your documents easily. This tool is perfect for reviewing, collaborating, or studying PDF files.
          </p>
          <h3>How to Annotate a PDF</h3>
          <p>
            To use the annotate PDF online free tool, upload your document and select the annotation options you need. You can highlight text, add comments, draw shapes, or underline important sections. After making changes, download the annotated file instantly.
          </p>
          <h3>Perfect for Collaboration</h3>
          <p>
            This tool is especially useful for students, teachers, and professionals who need to review or provide feedback on documents. It enhances collaboration and improves understanding of content.
          </p>
          <h3>Efficient & Secure</h3>
          <p>
            PDFLynx ensures secure handling of your files during the annotation process. All data is processed safely and automatically deleted after use. With an easy-to-use interface, annotating PDFs becomes efficient and accessible for everyone.
          </p>
        </>
      }
    >
      <FileUploader
        files={files}
        onFilesChange={setFiles}
        accept={{ 'application/pdf': ['.pdf'] }}
        maxFiles={1}
        label="Drop your PDF here"
      />

      <div className="space-y-4 mt-6">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => addAnnotation('highlight')} className="btn-secondary btn-sm">+ Highlight</button>
          <button onClick={() => addAnnotation('underline')} className="btn-secondary btn-sm">+ Underline</button>
          <button onClick={() => addAnnotation('strikethrough')} className="btn-secondary btn-sm">+ Strikethrough</button>
          <button onClick={() => addAnnotation('note')} className="btn-secondary btn-sm">+ Note</button>
        </div>

        {annotations.map((ann, i) => (
          <div key={i} className="card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">{ann.type}</span>
              <button onClick={() => removeAnnotation(i)} className="text-rose-500 hover:text-rose-600">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="input-label">Page</label>
                <input type="number" value={ann.page} onChange={e => updateAnnotation(i, 'page', parseInt(e.target.value) || 1)} className="input-field" min="1" />
              </div>
              <div>
                <label className="input-label">Color</label>
                <input type="color" value={ann.color} onChange={e => updateAnnotation(i, 'color', e.target.value)} className="w-full h-9 rounded-lg cursor-pointer" />
              </div>
              <div>
                <label className="input-label">X</label>
                <input type="number" value={ann.x} onChange={e => updateAnnotation(i, 'x', parseInt(e.target.value) || 0)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Y</label>
                <input type="number" value={ann.y} onChange={e => updateAnnotation(i, 'y', parseInt(e.target.value) || 0)} className="input-field" />
              </div>
              {ann.type === 'highlight' && (
                <>
                  <div>
                    <label className="input-label">Width</label>
                    <input type="number" value={ann.width} onChange={e => updateAnnotation(i, 'width', parseInt(e.target.value) || 0)} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Height</label>
                    <input type="number" value={ann.height} onChange={e => updateAnnotation(i, 'height', parseInt(e.target.value) || 0)} className="input-field" />
                  </div>
                </>
              )}
              {ann.type === 'note' && (
                <div className="col-span-2">
                  <label className="input-label">Note Text</label>
                  <input type="text" value={ann.text} onChange={e => updateAnnotation(i, 'text', e.target.value)} className="input-field" placeholder="Enter note..." />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleProcess}
        disabled={processing || files.length === 0}
        className="btn-primary w-full mt-6"
      >
        Annotate PDF
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

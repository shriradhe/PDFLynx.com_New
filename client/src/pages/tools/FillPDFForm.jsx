import { useState } from 'react'
import { motion } from 'framer-motion'
import { DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function FillPDFForm() {
  const [files, setFiles] = useState([])
  const [fields, setFields] = useState({})
  const [processing, setProcessing] = useState(false)
  const [modalState, setModalState] = useState({ open: false, status: '', message: '', progress: 0, result: null })

  const addField = () => {
    const key = `field_${Date.now()}`
    setFields({ ...fields, [key]: { name: '', value: '', type: 'text' } })
  }

  const updateField = (key, prop, value) => {
    setFields({ ...fields, [key]: { ...fields[key], [prop]: value } })
  }

  const removeField = (key) => {
    const updated = { ...fields }
    delete updated[key]
    setFields(updated)
  }

  const handleProcess = async () => {
    if (files.length === 0) { toast.error('Please upload a PDF file.'); return }

    const formData = {}
    for (const [, f] of Object.entries(fields)) {
      if (f.name) formData[f.name] = f.type === 'checkbox' ? f.value === 'true' : f.value
    }

    setProcessing(true)
    setModalState({ open: true, status: 'uploading', message: 'Uploading file...', progress: 0 })

    try {
      const form = new FormData()
      form.append('file', files[0])
      form.append('fields', JSON.stringify(formData))

      const res = await pdfAPI.fillForm(form, (p) =>
        setModalState(prev => ({ ...prev, status: 'processing', message: 'Filling form...', progress: p }))
      )

      setModalState({ open: true, status: 'done', message: 'Form filled successfully!', result: res })
    } catch (err) {
      setModalState({ open: true, status: 'error', message: err.response?.data?.message || 'Failed to fill form.' })
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFiles([])
    setFields({})
    setModalState({ open: false, status: '', message: '', progress: 0, result: null })
  }

  return (
    <ToolPage
      title="Fill PDF Form"
      subtitle="Fill out PDF form fields programmatically"
      icon={DocumentTextIcon} iconColor="text-sky-400" iconBg="bg-sky-500/10"      seoContent={
        <>
          <h2>Fill PDF Form Online Free</h2>
          <p>
            Fill PDF form online free with PDFLynx allows you to complete and edit PDF forms quickly without printing or scanning. This tool is ideal for filling applications, contracts, and official documents digitally.
          </p>
          <h3>How to Fill Out a Form</h3>
          <p>
            To use the fill PDF form online free tool, upload your form and click on the fields you want to fill. Enter text, select options, or add signatures as required. Once completed, download your filled document instantly.
          </p>
          <h3>Save Time and Paper</h3>
          <p>
            This tool saves time and eliminates the need for manual paperwork. It is especially useful for businesses, students, and individuals handling digital documentation regularly.
          </p>
          <h3>Convenient & Hassle-Free</h3>
          <p>
            PDFLynx ensures secure processing of your data and automatically deletes files after completion. With a clean and user-friendly interface, filling PDF forms becomes fast, convenient, and hassle-free.
          </p>
        </>
      }
    >
      <FileUploader
        files={files}
        onFilesChange={setFiles}
        accept={{ 'application/pdf': ['.pdf'] }}
        maxFiles={1}
        label="Drop your fillable PDF here"
      />

      <div className="space-y-4 mt-6">
        <button onClick={addField} className="btn-secondary btn-sm">+ Add Field</button>

        {Object.entries(fields).map(([key, field]) => (
          <div key={key} className="card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Form Field</span>
              <button onClick={() => removeField(key)} className="text-rose-500 hover:text-rose-600">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="input-label">Field Name</label>
                <input type="text" value={field.name} onChange={e => updateField(key, 'name', e.target.value)} className="input-field" placeholder="e.g. fullName" />
              </div>
              <div>
                <label className="input-label">Value</label>
                <input type="text" value={field.value} onChange={e => updateField(key, 'value', e.target.value)} className="input-field" placeholder="Value" />
              </div>
              <div>
                <label className="input-label">Type</label>
                <select value={field.type} onChange={e => updateField(key, 'type', e.target.value)} className="select-field">
                  <option value="text">Text</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
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
        Fill Form
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

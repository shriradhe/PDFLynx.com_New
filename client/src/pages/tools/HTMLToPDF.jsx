import { useState } from 'react'
import ToolPage from '../../components/ToolPage'
import ProcessingModal from '../../components/ProcessingModal'
import { CodeBracketIcon } from '@heroicons/react/24/outline'
import { pdfAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function HTMLToPDF() {
  const [html, setHtml] = useState('<h1>Hello World</h1>\n<p>This is a sample HTML document.</p>')
  const [pageSize, setPageSize] = useState('a4')
  const [margin, setMargin] = useState('50')
  const [fontSize, setFontSize] = useState('11')
  const [modal, setModal] = useState({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })

  const handleProcess = async () => {
    if (!html.trim()) return toast.error('Please enter HTML content.')
    setModal({ open: true, state: 'uploading', progress: 0 })
    try {
      const { data } = await pdfAPI.htmlToPdf({ html, pageSize, margin, fontSize })
      setModal((prev) => ({ ...prev, state: 'done', downloadUrl: data.downloadUrl, filename: data.filename, message: data.message }))
    } catch (err) {
      setModal((prev) => ({ ...prev, state: 'error', message: err.response?.data?.message || 'Failed to convert HTML.' }))
    }
  }

  const reset = () => {
    setHtml('')
    setModal({ open: false, state: 'uploading', progress: 0, downloadUrl: '', filename: '', message: '' })
  }

  return (
    <ToolPage title="HTML to PDF" subtitle="Convert HTML content to professional PDF documents" icon={CodeBracketIcon} iconColor="text-emerald-500" iconBg="bg-emerald-50 dark:bg-emerald-500/10">
      <div className="space-y-6">
        <div>
          <label className="input-label">HTML Content *</label>
          <textarea value={html} onChange={(e) => setHtml(e.target.value)} placeholder="<h1>Your HTML content here</h1>" className="textarea-field min-h-[200px]" rows={10} />
        </div>
        <div className="card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Page Size</label>
              <select value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="select-field">
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </select>
            </div>
            <div>
              <label className="input-label">Margin (px)</label>
              <input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} min="0" max="100" className="input-field" />
            </div>
            <div>
              <label className="input-label">Font Size</label>
              <input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} min="8" max="24" className="input-field" />
            </div>
          </div>
        </div>
        <button onClick={handleProcess} disabled={!html.trim()} className="btn-primary w-full btn-lg">
          <CodeBracketIcon className="w-5 h-5" />
          Convert to PDF
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} state={modal.state} progress={modal.progress} downloadUrl={modal.downloadUrl} filename={modal.filename} message={modal.message} onClose={() => setModal((prev) => ({ ...prev, open: false }))} onReset={reset} />
    </ToolPage>
  )
}

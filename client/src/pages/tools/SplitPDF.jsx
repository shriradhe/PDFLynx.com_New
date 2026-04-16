import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import { ScissorsIcon } from '@heroicons/react/24/outline'

export default function SplitPDF() {
  const [files, setFiles] = useState([])
  const [splitMode, setSplitMode] = useState('all')
  const [rangeInput, setRangeInput] = useState('1-3,5-7')
  const [everyN, setEveryN] = useState(1)
  const [modal, setModal] = useState({ open: false, status: 'uploading', progress: 0, message: '', result: null })

  const handleProcess = async () => {
    if (!files[0]) { toast.error('Please upload a PDF file.'); return }
    let options = { splitMode }
    if (splitMode === 'range') {
      try {
        const ranges = rangeInput.split(',').map(r => {
          const [s, e] = r.trim().split('-').map(Number)
          if (isNaN(s) || s < 1) throw new Error(`Invalid range start: ${r}`)
          return { start: s, end: isNaN(e) ? s : e }
        })
        options.ranges = JSON.stringify(ranges)
      } catch { toast.error('Invalid range format. Use: 1-3,5-7'); return }
    } else if (splitMode === 'every') {
      if (everyN < 1 || isNaN(everyN)) {
        toast.error('Split every N pages must be at least 1.')
        return
      }
      options.every = everyN
    }

    setModal({ open: true, status: 'uploading', progress: 0, message: 'Uploading...', result: null })
    try {
      const { data } = await pdfAPI.split(files[0], options, (p) =>
        setModal((m) => ({ ...m, progress: p, status: p < 100 ? 'uploading' : 'processing', message: p < 100 ? `Uploading... ${p}%` : 'Splitting your PDF...' }))
      )
      setModal({ open: true, status: 'done', progress: 100, message: `PDF split into ${data.pages} file(s).`, result: data })
      setFiles([])
    } catch (err) {
      setModal({ open: true, status: 'error', progress: 0, message: err.response?.data?.message || 'Split failed.', result: null })
    }
  }

  return (
    <ToolPage
      title="Split PDF"
      subtitle="Separate one PDF into multiple files. Choose to split all pages, by range, or every N pages."
      icon={ScissorsIcon}
      iconColor="text-orange-400"
      iconBg="bg-orange-500/10"
      seoContent={
        <>
          <h2>Split PDF Online Free</h2>
          <p>
            Split PDF online free with PDFLynx allows you to extract pages or divide a PDF into multiple smaller files quickly and securely. Whether you need to separate chapters, remove unwanted pages, or share specific sections, this tool makes the process simple and efficient.
          </p>
          <h3>How to Use the Split PDF Online Free Tool</h3>
          <p>
            To use the split PDF online free tool, upload your file and select how you want to split it—by page ranges or individual pages. Once selected, the tool processes your file instantly and provides downloadable outputs within seconds.
          </p>
          <h3>Complete Flexibility</h3>
          <p>
            One of the biggest advantages is flexibility. You can customize exactly which pages to extract without affecting the original document. This is especially useful for students, professionals, and businesses handling large PDF files regularly.
          </p>
          <h3>Secure & Private Processing</h3>
          <p>
            PDFLynx ensures your data remains private and secure. Files are processed in a protected environment and automatically deleted after completion. With no installation required, you can split PDFs directly from your browser on any device.
          </p>
        </>
      }
    >
      <div className="glass-card border border-slate-200 dark:border-white/10 p-6 space-y-6">
        <FileUploader files={files} onFilesChange={setFiles} label="Drop your PDF here" sublabel="PDF files up to 50MB" />

        {/* Split mode */}
        <div>
          <label className="input-label">Split Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'all', label: 'Extract All Pages' },
              { value: 'range', label: 'Custom Range' },
              { value: 'every', label: 'Every N Pages' },
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => setSplitMode(m.value)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  splitMode === m.value
                    ? 'border-orange-500/50 bg-orange-50 dark:bg-orange-500/10 text-brand-600 dark:text-orange-400'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/3 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {splitMode === 'range' && (
          <div>
            <label className="input-label">Page Ranges (e.g. 1-3,5-7)</label>
            <input className="input-field" value={rangeInput} onChange={(e) => setRangeInput(e.target.value)} placeholder="1-3,5-7,10-12" />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Separate multiple ranges with commas. Each range becomes a separate PDF.</p>
          </div>
        )}

        {splitMode === 'every' && (
          <div>
            <label className="input-label">Pages per Split</label>
            <input type="number" className="input-field" value={everyN} min={1} onChange={(e) => setEveryN(parseInt(e.target.value))} />
          </div>
        )}

        <button onClick={handleProcess} disabled={!files[0]} className="btn-primary w-full" style={{ background: files[0] ? 'linear-gradient(135deg,#ea580c,#fb923c)' : undefined }}>
          <ScissorsIcon className="w-5 h-5" />
          Split PDF
        </button>
      </div>

      <ProcessingModal isOpen={modal.open} status={modal.status} progress={modal.progress} message={modal.message} result={modal.result} onClose={() => setModal((m) => ({ ...m, open: false }))} />
    </ToolPage>
  )
}

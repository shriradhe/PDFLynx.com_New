import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolPage from '../../components/ToolPage'
import FileUploader from '../../components/FileUploader'
import ProcessingModal from '../../components/ProcessingModal'
import { pdfAPI } from '../../services/api'
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline'

export default function RotatePDF() {
  const [files, setFiles] = useState([])
  const [rotation, setRotation] = useState(90)
  const [modal, setModal] = useState({ open: false, status: 'uploading', progress: 0, message: '', result: null })

  const handleProcess = async () => {
    if (!files[0]) { toast.error('Please upload a PDF file.'); return }
    setModal({ open: true, status: 'uploading', progress: 0, message: 'Uploading...', result: null })
    try {
      const { data } = await pdfAPI.rotate(files[0], { rotation }, (p) =>
        setModal((m) => ({ ...m, progress: p, status: p < 100 ? 'uploading' : 'processing', message: p < 100 ? `Uploading... ${p}%` : 'Rotating pages...' }))
      )
      setModal({ open: true, status: 'done', progress: 100, message: `PDF rotated ${rotation}° successfully!`, result: data })
      setFiles([])
    } catch (err) {
      setModal({ open: true, status: 'error', progress: 0, message: err.response?.data?.message || 'Rotate failed.', result: null })
    }
  }

  return (
    <ToolPage title="Rotate PDF" subtitle="Rotate all pages in your PDF clockwise or counterclockwise."
      icon={ArrowPathRoundedSquareIcon} iconColor="text-yellow-400" iconBg="bg-yellow-500/10"      seoContent={
        <>
          <h2>Rotate PDF Online Free</h2>
          <p>
            Rotate PDF online free with PDFLynx allows you to adjust the orientation of your PDF pages quickly and effortlessly. Whether your document is upside down or incorrectly aligned, this tool helps you fix it in seconds.
          </p>
          <h3>How to Rotate Pages</h3>
          <p>
            To use the rotate PDF online free tool, upload your file and select the pages you want to rotate. You can rotate pages left or right based on your needs. Once done, download the corrected file instantly.
          </p>
          <h3>Perfect for Scans</h3>
          <p>
            This tool is especially helpful for scanned documents, presentations, or images saved in PDF format. Proper orientation improves readability and ensures a professional appearance.
          </p>
          <h3>Fast & Privacy Focused</h3>
          <p>
            PDFLynx provides a fast and secure environment for processing files. Your documents are not stored permanently and are automatically deleted after completion. With a simple interface and no installation required, rotating PDFs is quick and hassle-free.
          </p>
        </>
      }
    >
      <div className="glass-card border border-slate-200 dark:border-white/10 p-6 space-y-6">
        <FileUploader files={files} onFilesChange={setFiles} label="Drop your PDF here" sublabel="PDF files up to 50MB" />

        <div>
          <label className="input-label">Rotation Angle</label>
          <div className="grid grid-cols-4 gap-3">
            {[90, 180, 270, -90].map((r) => (
              <button key={r} onClick={() => setRotation(r)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${rotation === r ? 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/3 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}>
                {r > 0 ? `+${r}°` : `${r}°`}
                <div className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">{r === 90 ? 'Right' : r === -90 ? 'Left' : r === 180 ? '180°' : 'Counter'}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleProcess} disabled={!files[0]} className="btn-primary w-full" style={{ background: files[0] ? 'linear-gradient(135deg,#d97706,#f59e0b)' : undefined }}>
          <ArrowPathRoundedSquareIcon className="w-5 h-5" />
          Rotate PDF
        </button>
      </div>
      <ProcessingModal isOpen={modal.open} status={modal.status} progress={modal.progress} message={modal.message} result={modal.result} onClose={() => setModal((m) => ({ ...m, open: false }))} />
    </ToolPage>
  )
}

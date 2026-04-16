import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { formatBytes } from '../utils/helpers'

export default function FileUploader({
  files = [],
  onFilesChange,
  accept = { 'application/pdf': ['.pdf'] },
  multiple = false,
  maxFiles = 1,
  label = 'Drop your PDF here or click to browse',
  sublabel = 'PDF files up to 50MB',
  className = '',
}) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = multiple ? [...files, ...acceptedFiles].slice(0, maxFiles) : acceptedFiles.slice(0, 1)
      onFilesChange(newFiles)
    },
    [files, multiple, maxFiles, onFilesChange]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    maxSize: 50 * 1024 * 1024,
  })

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index)
    onFilesChange(updated)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-10 cursor-pointer text-center
          transition-all duration-300 group
          ${isDragReject
            ? 'border-accent-red/60 bg-accent-red/5'
            : isDragActive
            ? 'border-brand-500 bg-brand-500/10 dropzone-active'
            : 'border-slate-200 dark:border-white/15 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-white/3'
          }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragActive
              ? 'bg-brand-600 shadow-glow-brand'
              : 'bg-slate-100 dark:bg-white/5 group-hover:bg-brand-600/20 group-hover:shadow-glow-brand/40'
            }`}>
            <CloudArrowUpIcon className={`w-8 h-8 transition-colors duration-300 ${isDragActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'}`} />
          </div>

          <div>
            <p className="text-base font-medium text-slate-800 dark:text-slate-200">
              {isDragReject ? 'File type not supported' : isDragActive ? 'Drop files here...' : label}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">{sublabel}</p>
          </div>

          {!isDragActive && (
            <div className="px-5 py-2 rounded-lg bg-brand-600/15 border border-brand-500/30 text-brand-400 text-sm font-medium">
              Browse Files
            </div>
          )}
        </div>

        {isDragActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-brand-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card flex items-center gap-3 p-3"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                  <DocumentIcon className="w-5 h-5 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-500">{formatBytes(file.size)}</p>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-accent-green flex-shrink-0" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(index) }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-accent-red hover:bg-accent-red/10 transition-all duration-200 flex-shrink-0"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center" role="main" aria-label="Page Not Found">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-8xl font-black text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Page Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary" aria-label="Go back to PDFLynx homepage">
          Go Home
        </Link>
      </motion.div>
    </div>
  )
}

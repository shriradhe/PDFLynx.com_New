/**
 * Shared ToolPage layout used by every PDF tool page.
 * Props:
 *   title, subtitle, icon, children (options form), 
 *   files, onFilesChange, accept, multiple, maxFiles,
 *   onProcess, processing, canProcess
 */
import { motion } from 'framer-motion'

export default function ToolPage({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand-400',
  iconBg = 'bg-brand-500/15',
  children,
  seoContent,
}) {
  return (
    <article className="min-h-screen pt-24 pb-16 px-4" aria-label={title}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          {Icon && (
            <div className={`w-16 h-16 rounded-2xl ${iconBg} border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-5`}>
              <Icon className={`w-8 h-8 ${iconColor}`} aria-hidden="true" />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">{title}</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">{subtitle}</p>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {children}
        </motion.div>

        {/* SEO Content Section */}
        {seoContent && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="mt-20 pt-16 border-t border-slate-200 dark:border-white/10"
          >
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-brand-600 dark:prose-a:text-brand-400 hover:prose-a:text-brand-500">
              {seoContent}
            </div>
          </motion.div>
        )}
      </div>
    </article>
  )
}

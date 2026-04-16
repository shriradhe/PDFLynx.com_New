import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 mb-8 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 sm:p-12 border-brand-500/20"
        >
          <div className="mb-12 border-b border-slate-200 dark:border-white/10 pb-8">
            <span className="section-label mb-3 block">Data Protection</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Last updated: April 14, 2026
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-brand-600 dark:prose-a:text-brand-400 hover:prose-a:text-brand-500">
            <h2>1. Introduction</h2>
            <p>
              At PDFLynx, we take your privacy extremely seriously. We created this Privacy Policy to give you complete transparency on how we collect, use, and protect your personal information and documents. We believe your files are exactly that—yours.
            </p>

            <h2>2. Document Security & Deletion Policy</h2>
            <p>
              The core of our privacy commitment is our <strong>Zero Trust document policy</strong>:
            </p>
            <ul>
              <li><strong>Temporary Storage:</strong> When you upload a file to PDFLynx, it is stored in a secure, encrypted state only for the duration it takes to process your request.</li>
              <li><strong>Automatic Deletion:</strong> All source and output files are permanently deleted from our servers automatically after 30 minutes. No exceptions.</li>
              <li><strong>No Human Access:</strong> No human ever looks at the contents of your files. Our automated systems perform the requested alterations without inspecting the content.</li>
              <li><strong>No Training Data:</strong> We DO NOT use your documents or contents to train our AI models or third-party AI models.</li>
            </ul>

            <h2>3. Information We Collect</h2>
            <p>
              We collect information to provide better services to our users. This includes:
            </p>
            <ul>
              <li><strong>Information you give us:</strong> When you sign up for an account, we collect your email address and name.</li>
              <li><strong>Device Information:</strong> We may collect device-specific information (such as your hardware model, operating system version, and unique device identifiers).</li>
              <li><strong>Log Information:</strong> When you use our services, we automatically collect and store certain information in server logs, including your web request, IP address, and browser type.</li>
            </ul>

            <h2>4. Use of Cookies</h2>
            <p>
              We use cookies to enhance your experience. These include:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required to enable core site functionality like session management and authenticating users.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how our website is being used through aggregated analytics mapping (e.g., Google Analytics). You can opt out of these at any time via your browser settings.</li>
            </ul>

            <h2>5. Data Sharing & Third Parties</h2>
            <p>
              We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners. We may use third-party service providers (like payment processors) who process data on our behalf under strict confidentiality agreements.
            </p>

            <h2>6. Your Rights</h2>
            <p>
              Under the GDPR and CCPA, you have the right to access, rectify, port, and erase your personal data. You can manage most of this directly from your account settings or by contacting our data protection officer.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or how we handle your data, please contact our Data Protection Officer at <a href="mailto:privacy@pdflynx.com">privacy@pdflynx.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

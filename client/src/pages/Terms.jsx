import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function Terms() {
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
          className="card p-8 sm:p-12"
        >
          <div className="mb-12 border-b border-slate-200 dark:border-white/10 pb-8">
            <span className="section-label mb-3 block">Legal Information</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Terms & <span className="text-gradient">Conditions</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Last updated: April 14, 2026
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-brand-600 dark:prose-a:text-brand-400 hover:prose-a:text-brand-500">
            <h2>1. Introduction</h2>
            <p>
              Welcome to PDFLynx. These Terms and Conditions govern your use of our website (pdflynx.com) 
              and the services we provide. By accessing or using our platform, you agree to be bound by these 
              terms. If you disagree with any part of the terms, you may not access the service.
            </p>

            <h2>2. Use of Service</h2>
            <p>
              PDFLynx provides a suite of online tools for formatting, converting, modifying, and editing 
              PDF documents. We grant you a limited, non-exclusive, non-transferable, and revocable license 
              to use our services for personal or business purposes, subject to these Terms.
            </p>
            <ul>
              <li>You must not use the service for any illegal or unauthorized purpose.</li>
              <li>You must not abuse, harass, threaten, impersonate or intimidate other users.</li>
              <li>You must not transmit any worms, viruses, or any code of a destructive nature.</li>
            </ul>

            <h2>3. Account Registration & Subscriptions</h2>
            <p>
              While basic features are available for free, access to premium tools, AI capabilities, and higher 
              processing quotas may require you to register an account and purchase a subscription. You are 
              responsible for maintaining the security of your account and password. PDFLynx cannot and will 
              not be liable for any loss or damage from your failure to comply with this security obligation.
            </p>

            <h2>4. File Processing & Data Deletion</h2>
            <p>
              We prioritize your privacy. All files uploaded to PDFLynx are automatically and permanently deleted 
              from our servers within 30 minutes of processing. We do not inspect, copy, or distribute your files 
              under any circumstances. By uploading files, you represent that you have the right to process 
              these files and are not infringing on any third party copyright.
            </p>

            <h2>5. Service Availability & Modifications</h2>
            <p>
              We reserve the right at any time and from time to time to modify or discontinue, temporarily or 
              permanently, the Service (or any part thereof) with or without notice. PDFLynx shall not be liable 
              to you or to any third party for any modification, price change, suspension, or discontinuance of the Service.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              In no event shall PDFLynx, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access 
              to or use of or inability to access or use the Service.
            </p>

            <h2>7. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at <a href="mailto:legal@pdflynx.com">legal@pdflynx.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

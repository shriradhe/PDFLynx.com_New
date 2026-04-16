import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Your message has been sent successfully. We will get back to you shortly!')
      e.target.reset()
    }, 1500)
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="section-label mb-3 block">Get in Touch</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Contact <span className="text-gradient">Team PDFLynx</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Have a question about our enterprise plans, or experiencing technical issues? Drop us a line and we'll help you out.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 flex flex-col items-center sm:items-start text-center sm:text-left sm:flex-row gap-5 hover:border-brand-500/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 flex items-center justify-center shrink-0">
                <EnvelopeIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Email Support</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Our team typically responds within 2 hours.</p>
                <a href="mailto:support@pdflynx.com" className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700">support@pdflynx.com</a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 flex flex-col items-center sm:items-start text-center sm:text-left sm:flex-row gap-5 hover:border-purple-500/30 transition-colors"
            >
               <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 flex items-center justify-center shrink-0">
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Live Chat</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Available Mon-Fri from 9am to 6pm EST.</p>
                <button className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700">Start a conversation</button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 flex flex-col items-center sm:items-start text-center sm:text-left sm:flex-row gap-5 hover:border-amber-500/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center shrink-0">
                <MapPinIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Office Location</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">123 Document Drive<br />Suite 456<br />San Francisco, CA 94103</p>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 card p-8 sm:p-10"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-500/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-slate-900 dark:text-white"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-500/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-slate-900 dark:text-white"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-500/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-slate-900 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>

               <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-500/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-slate-900 dark:text-white"
                >
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing Question</option>
                  <option>Enterprise Sales</option>
                  <option>Feedback & Feature Request</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-500/30 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-slate-900 dark:text-white resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-4 text-base relative overflow-hidden"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  DocumentDuplicateIcon,
  ScissorsIcon,
  ArrowsPointingInIcon,
  ArrowPathRoundedSquareIcon,
  DocumentTextIcon,
  PhotoIcon,
  LockClosedIcon,
  LockOpenIcon,
  HashtagIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
  SparklesIcon,
  PencilSquareIcon,
  PencilIcon,
  EyeDropperIcon,
  CodeBracketIcon,
  Squares2X2Icon,
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'
import ToolCard from '../components/ToolCard'

const tools = [
  {
    icon: DocumentDuplicateIcon,
    label: 'Merge PDF',
    description: 'Combine multiple PDFs into one file in seconds.',
    to: '/merge-pdf',
    color: 'red',
  },
  {
    icon: ScissorsIcon,
    label: 'Split PDF',
    description: 'Extract pages or split PDF into multiple files.',
    to: '/split-pdf',
    color: 'orange',
  },
  {
    icon: ArrowsPointingInIcon,
    label: 'Compress PDF',
    description: 'Reduce PDF file size without losing quality.',
    to: '/compress-pdf',
    color: 'green',
  },
  {
    icon: ArrowsRightLeftIcon,
    label: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files.',
    to: '/convert',
    color: 'blue',
  },
  {
    icon: PhotoIcon,
    label: 'PDF to JPG',
    description: 'Export each PDF page as a high-quality image.',
    to: '/convert',
    color: 'cyan',
  },
  {
    icon: DocumentTextIcon,
    label: 'JPG to PDF',
    description: 'Convert images to PDF with a single click.',
    to: '/convert',
    color: 'purple',
  },
  {
    icon: ArrowPathRoundedSquareIcon,
    label: 'Rotate PDF',
    description: 'Rotate pages in your PDF any direction.',
    to: '/rotate-pdf',
    color: 'yellow',
  },
  {
    icon: EyeIcon,
    label: 'Watermark PDF',
    description: 'Add a custom text watermark to your PDF.',
    to: '/watermark-pdf',
    color: 'pink',
  },
  {
    icon: LockClosedIcon,
    label: 'Protect PDF',
    description: 'Secure your PDF with a strong password.',
    to: '/protect-pdf',
    color: 'indigo',
  },
  {
    icon: LockOpenIcon,
    label: 'Unlock PDF',
    description: 'Remove password protection from a PDF.',
    to: '/unlock-pdf',
    color: 'teal',
  },
  {
    icon: HashtagIcon,
    label: 'Page Numbers',
    description: 'Add page numbers to your PDF documents.',
    to: '/page-numbers',
    color: 'amber',
  },
  {
    icon: SparklesIcon,
    label: 'OCR PDF',
    description: 'Extract text from scanned PDFs and images.',
    to: '/ocr-pdf',
    color: 'green',
  },
  {
    icon: PencilIcon,
    label: 'Sign PDF',
    description: 'Add your digital signature to any PDF document.',
    to: '/sign-pdf',
    color: 'amber',
  },
  {
    icon: PencilSquareIcon,
    label: 'Edit PDF',
    description: 'Add text, images, and shapes to your PDF pages.',
    to: '/edit-pdf',
    color: 'purple',
  },
  {
    icon: DocumentTextIcon,
    label: 'PDF to Text',
    description: 'Extract all text content from PDF files.',
    to: '/pdf-to-text',
    color: 'slate',
  },
  {
    icon: PhotoIcon,
    label: 'PDF to PNG',
    description: 'Convert PDF pages to high-quality PNG images.',
    to: '/pdf-to-png',
    color: 'cyan',
  },
  {
    icon: Squares2X2Icon,
    label: 'Organize Pages',
    description: 'Reorder, delete, and duplicate PDF pages.',
    to: '/organize-pdf',
    color: 'blue',
  },
  {
    icon: EyeDropperIcon,
    label: 'Redact PDF',
    description: 'Permanently remove sensitive content from PDFs.',
    to: '/redact-pdf',
    color: 'red',
  },
  {
    icon: CodeBracketIcon,
    label: 'HTML to PDF',
    description: 'Convert HTML content to professional PDF documents.',
    to: '/html-to-pdf',
    color: 'emerald',
  },
  {
    icon: ArrowDownTrayIcon,
    label: 'Images to PDF',
    description: 'Merge multiple images into a single PDF file.',
    to: '/image-to-pdf',
    color: 'indigo',
  },
]

const stats = [
  { value: '20+', label: 'PDF Tools' },
  { value: '50MB', label: 'Max File Size' },
  { value: '30min', label: 'Auto-Delete' },
  { value: '100%', label: 'Free Always' },
]

const FloatingIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 64 80" fill="none">
    <rect width="64" height="80" rx="8" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
    <path d="M16 24h32M16 34h24M16 44h20M16 54h28" stroke="rgba(99,102,241,0.6)" strokeWidth="2" strokeLinecap="round" />
    <path d="M40 8l16 16H40V8z" fill="rgba(99,102,241,0.25)" stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
  </svg>
)

/* ── Lightweight IntersectionObserver hook ─────────────────────────────────── */
function useInView(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold: 0.1, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, inView]
}

/* ── Animated section wrapper ──────────────────────────────────────────────── */
/* Uses opacity-only transition to prevent CLS (translateY causes layout shift during hydration) */
function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`transition-opacity duration-500 ease-out ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function Home() {
  return (
    <div className="pt-16" role="main" aria-label="PDFLynx — Free Online PDF Tools">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[85vh] flex flex-col items-center justify-center text-center px-4">
        <div className="absolute top-24 left-[8%] opacity-40 hidden lg:block animate-float">
          <FloatingIcon className="w-16 h-20" />
        </div>
        <div className="absolute top-32 right-[10%] opacity-30 hidden lg:block animate-float-delay">
          <FloatingIcon className="w-12 h-16" />
        </div>

        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-600/10 dark:bg-brand-500/15 border border-brand-500/20 dark:border-brand-500/30 text-brand-700 dark:text-brand-300 text-sm font-semibold">
          <SparklesIcon className="w-4 h-4" />
          20+ Free PDF Tools — Enterprise-Grade
        </span>

        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight max-w-5xl text-slate-900 dark:text-white">
          The Complete
          <br />
          <span className="text-gradient">PDF Toolkit</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Merge, split, compress, convert, sign, edit, and secure your PDFs instantly.
          Professional tools, zero cost. Files auto-deleted after 30 minutes.
        </p>

        <FadeIn delay={400}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/merge-pdf" className="btn-primary text-base px-8 py-4 btn-lg">
              <DocumentDuplicateIcon className="w-5 h-5" />
              Start with Merge PDF
            </Link>
            <Link to="/register" className="btn-secondary text-base px-8 py-4 btn-lg">
              Create Free Account
            </Link>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            50MB free limit - no sign-up required
          </div>
        </FadeIn>

        <FadeIn delay={550}>
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Tool Grid ────────────────────────────────────────────────────────── */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <FadeIn className="text-center mb-12">
          <p className="section-label mb-3">Everything in one place</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">All PDF Tools</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Professional-grade tools that make working with PDFs effortless. No installation, no sign-up required.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tools.map((tool, i) => (
            <ToolCard key={tool.label} {...tool} delay={i * 0.04} />
          ))}
        </div>
      </section>

      {/* ── AI Tools Section ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
            <CpuChipIcon className="w-4 h-4" />
            NEW — AI-Powered
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">AI PDF Intelligence</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Go beyond basic editing. Let AI summarize, search, and answer questions about your PDFs.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: SparklesIcon,
              title: 'AI Summary',
              desc: 'Get instant executive summaries, key points, or detailed breakdowns of any PDF. Choose your summary style.',
              to: '/ai-summary',
              gradient: 'from-purple-600 to-pink-500',
              badge: 'Brief · Detailed · Executive',
            },
            {
              icon: ChatBubbleLeftRightIcon,
              title: 'Chat with PDF',
              desc: 'Upload a PDF and have a conversation about its contents. AI reads and understands your document.',
              to: '/chat-with-pdf',
              gradient: 'from-cyan-500 to-blue-500',
              badge: 'RAG-Powered',
            },
            {
              icon: MagnifyingGlassIcon,
              title: 'Smart Search',
              desc: 'Find information by meaning, not just keywords. Semantic search powered by AI embeddings.',
              to: '/smart-search',
              gradient: 'from-emerald-500 to-teal-500',
              badge: 'Keyword + Semantic',
            },
          ].map((tool, i) => (
            <FadeIn key={tool.title} delay={i * 100}>
              <Link
                to={tool.to}
                className="card p-6 h-full flex flex-col relative overflow-hidden group hover:border-purple-300 dark:hover:border-purple-400/40 transition-all duration-300 hover:shadow-md"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 flex-1">{tool.desc}</p>
                <span className="inline-flex self-start px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-xs font-medium text-slate-600 dark:text-slate-400">
                  {tool.badge}
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn className="text-center mb-14">
          <p className="section-label mb-3">Simple as 1-2-3</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">How It Works</h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Upload Your File', desc: 'Drag & drop or click to select your PDF or image. We support files up to 50MB.' },
            { step: '02', title: 'Configure Options', desc: 'Adjust settings like page range, rotation angle, watermark text, signature, and more.' },
            { step: '03', title: 'Download Result', desc: 'Your file is processed instantly. Click download — files auto-deleted in 30 min.' },
          ].map((item, i) => (
            <FadeIn key={item.step} delay={i * 150}>
              <div className="card p-8 text-center relative overflow-hidden">
                <div className="absolute top-4 right-6 text-6xl font-black text-slate-100 dark:text-white/3 select-none">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center mx-auto mb-5">
                  <span className="text-brand-600 dark:text-brand-400 font-bold text-lg">{item.step.replace('0', '')}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Privacy Banner ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn>
          <div className="card p-8 md:p-12 text-center bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-500/5 dark:to-purple-500/5 border-brand-200 dark:border-brand-500/20">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
              <LockClosedIcon className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">Your Privacy Matters</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Core PDF tools are designed for privacy-first processing and temporary handling.
              AI-powered features may use secure servers, and files are deleted automatically after 30 minutes.
            </p>
            <Link to="/register" className="btn-primary">
              Get Started Free — No Credit Card
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}

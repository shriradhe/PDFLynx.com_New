import { Link } from 'react-router-dom'

const toolCategories = [
  {
    label: 'Convert',
    items: [
      { to: '/convert', label: 'PDF to Word' },
      { to: '/convert', label: 'PDF to JPG' },
      { to: '/pdf-to-png', label: 'PDF to PNG' },
      { to: '/pdf-to-text', label: 'PDF to Text' },
      { to: '/convert', label: 'JPG to PDF' },
      { to: '/image-to-pdf', label: 'Images to PDF' },
      { to: '/html-to-pdf', label: 'HTML to PDF' },
    ],
  },
  {
    label: 'Organize',
    items: [
      { to: '/merge-pdf', label: 'Merge PDF' },
      { to: '/split-pdf', label: 'Split PDF' },
      { to: '/organize-pdf', label: 'Organize Pages' },
      { to: '/compress-pdf', label: 'Compress PDF' },
    ],
  },
  {
    label: 'Edit & Secure',
    items: [
      { to: '/edit-pdf', label: 'Edit PDF' },
      { to: '/sign-pdf', label: 'Sign PDF' },
      { to: '/watermark-pdf', label: 'Watermark' },
      { to: '/rotate-pdf', label: 'Rotate PDF' },
      { to: '/page-numbers', label: 'Page Numbers' },
      { to: '/redact-pdf', label: 'Redact PDF' },
    ],
  },
  {
    label: 'Protect & Extract',
    items: [
      { to: '/protect-pdf', label: 'Protect PDF' },
      { to: '/unlock-pdf', label: 'Unlock PDF' },
      { to: '/ocr-pdf', label: 'OCR PDF' },
    ],
  },
  {
    label: 'Company',
    items: [
      { to: '/blog', label: 'Blog' },
      { to: '/contact-us', label: 'Contact Us' },
      { to: '/privacy-policy', label: 'Privacy Policy' },
      { to: '/terms-and-conditions', label: 'Terms & Conditions' },
      { to: '/dmca-policy', label: 'DMCA Policy' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-surface-500">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">PDF<span className="text-brand-600 dark:text-brand-400">Lynx</span></span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
              The complete online PDF toolkit. Free, fast, and privacy-first.
            </p>
          </div>

          {/* Tool Categories */}
          {toolCategories.map((cat) => (
            <div key={cat.label}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-4">{cat.label}</h3>
              <div className="flex flex-col gap-2">
                {cat.items.map((t) => (
                  <Link key={t.to + t.label} to={t.to} className="text-sm text-slate-600 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-center gap-6">
          <a
            href="https://www.producthunt.com/products/pdflynx?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-pdflynx"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-90 hover:opacity-100 transition-opacity"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1124466&theme=light&t=1776277200819"
              alt="PDFLynx on Product Hunt"
              width="250"
              height="54"
              loading="lazy"
            />
          </a>
          <a
            href="//www.dmca.com/Protection/Status.aspx?ID=8de9fbf6-6a5b-47d1-a5b4-94b70d25f55c"
            title="DMCA.com Protection Status"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-90 hover:opacity-100 transition-opacity"
          >
            <img
              src="https://images.dmca.com/Badges/dmca_protected_sml_120m.png?ID=8de9fbf6-6a5b-47d1-a5b4-94b70d25f55c"
              alt="DMCA.com Protection Status"
              loading="lazy"
            />
          </a>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-300">
            © {new Date().getFullYear()} PDFLynx. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/settings" className="text-xs text-slate-600 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">API Keys</Link>
            <Link to="/settings" className="text-xs text-slate-600 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Webhooks</Link>
            <span className="text-xs text-slate-500 dark:text-slate-300">Files auto-deleted after 30 minutes</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SEO from './components/SEO'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import useThemeStore from './store/themeStore'
import { getPageSeo, getStructuredData } from './utils/seo'

// Statically load the Home page instantly to prevent LCP and CLS delays
import Home from './pages/Home'

// Lazy-loaded pages
const Login         = lazy(() => import('./pages/Login'))
const Register      = lazy(() => import('./pages/Register'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Settings      = lazy(() => import('./pages/Settings'))
const MergePDF      = lazy(() => import('./pages/tools/MergePDF'))
const SplitPDF      = lazy(() => import('./pages/tools/SplitPDF'))
const CompressPDF   = lazy(() => import('./pages/tools/CompressPDF'))
const ConvertPDF    = lazy(() => import('./pages/tools/ConvertPDF'))
const RotatePDF     = lazy(() => import('./pages/tools/RotatePDF'))
const WatermarkPDF  = lazy(() => import('./pages/tools/WatermarkPDF'))
const ProtectPDF    = lazy(() => import('./pages/tools/ProtectPDF'))
const UnlockPDF     = lazy(() => import('./pages/tools/UnlockPDF'))
const PageNumbers   = lazy(() => import('./pages/tools/PageNumbers'))
const OCRPDF        = lazy(() => import('./pages/tools/OCRPDF'))
const SignPDF       = lazy(() => import('./pages/tools/SignPDF'))
const EditPDF       = lazy(() => import('./pages/tools/EditPDF'))
const PDFToText     = lazy(() => import('./pages/tools/PDFToText'))
const PDFToPNG      = lazy(() => import('./pages/tools/PDFToPNG'))
const OrganizePDF   = lazy(() => import('./pages/tools/OrganizePDF'))
const RedactPDF     = lazy(() => import('./pages/tools/RedactPDF'))
const HTMLToPDF     = lazy(() => import('./pages/tools/HTMLToPDF'))
const ImageToPDF    = lazy(() => import('./pages/tools/ImageToPDF'))
const AnnotatePDF   = lazy(() => import('./pages/tools/AnnotatePDF'))
const FillPDFForm   = lazy(() => import('./pages/tools/FillPDFForm'))
const ComparePDF    = lazy(() => import('./pages/tools/ComparePDF'))
const ESignature    = lazy(() => import('./pages/tools/ESignature'))
const AISummary     = lazy(() => import('./pages/tools/AISummary'))
const ChatWithPDF   = lazy(() => import('./pages/tools/ChatWithPDF'))
const SmartSearch   = lazy(() => import('./pages/tools/SmartSearch'))
const Pricing       = lazy(() => import('./pages/Pricing'))
const Blog          = lazy(() => import('./pages/Blog'))
const BlogPost      = lazy(() => import('./pages/BlogPost'))
const Terms         = lazy(() => import('./pages/Terms'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const DMCAPolicy    = lazy(() => import('./pages/DMCAPolicy'))
const Contact       = lazy(() => import('./pages/Contact'))
const NotFound      = lazy(() => import('./pages/NotFound'))

// ─── Scroll to top on route change ───────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// ─── Dynamic SEO wrapper — injects meta tags based on current path ───────────
function RouteSEO() {
  const { pathname } = useLocation()
  const seo = getPageSeo(pathname)
  const schemas = getStructuredData(pathname)

  return (
    <SEO
      title={seo.title}
      description={seo.description}
      keywords={seo.keywords || ''}
      path={pathname}
      noindex={seo.noindex || false}
      structuredData={schemas}
    />
  )
}

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-brand-600/30" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
    </div>
  </div>
)

function App() {
  const { initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouteSEO />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1" role="main">
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/"                  element={<Home />} />
              <Route path="/login"             element={<Login />} />
              <Route path="/register"          element={<Register />} />
              <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/settings"          element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/merge-pdf"         element={<MergePDF />} />
              <Route path="/split-pdf"         element={<SplitPDF />} />
              <Route path="/compress-pdf"      element={<CompressPDF />} />
              <Route path="/convert"           element={<ConvertPDF />} />
              <Route path="/rotate-pdf"        element={<RotatePDF />} />
              <Route path="/watermark-pdf"     element={<WatermarkPDF />} />
              <Route path="/protect-pdf"       element={<ProtectPDF />} />
              <Route path="/unlock-pdf"        element={<UnlockPDF />} />
              <Route path="/page-numbers"      element={<PageNumbers />} />
              <Route path="/ocr-pdf"           element={<OCRPDF />} />
              <Route path="/sign-pdf"          element={<SignPDF />} />
              <Route path="/edit-pdf"          element={<EditPDF />} />
              <Route path="/pdf-to-text"       element={<PDFToText />} />
              <Route path="/pdf-to-png"        element={<PDFToPNG />} />
              <Route path="/organize-pdf"      element={<OrganizePDF />} />
              <Route path="/redact-pdf"        element={<RedactPDF />} />
              <Route path="/html-to-pdf"       element={<HTMLToPDF />} />
              <Route path="/image-to-pdf"      element={<ImageToPDF />} />
              <Route path="/annotate-pdf"       element={<AnnotatePDF />} />
              <Route path="/fill-pdf-form"      element={<FillPDFForm />} />
              <Route path="/compare-pdf"        element={<ComparePDF />} />
              <Route path="/e-signature"        element={<ESignature />} />
              <Route path="/ai-summary"         element={<AISummary />} />
              <Route path="/chat-with-pdf"      element={<ChatWithPDF />} />
              <Route path="/smart-search"       element={<SmartSearch />} />
              <Route path="/pricing"            element={<Pricing />} />
              <Route path="/blog"               element={<Blog />} />
              <Route path="/blog/:slug"         element={<BlogPost />} />
              <Route path="/terms-and-conditions" element={<Terms />} />
              <Route path="/privacy-policy"     element={<PrivacyPolicy />} />
              <Route path="/dmca-policy"        element={<DMCAPolicy />} />
              <Route path="/contact-us"         element={<Contact />} />
              <Route path="*"                   element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e1e2e',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#0a0a0f' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#0a0a0f' } },
        }}
      />
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

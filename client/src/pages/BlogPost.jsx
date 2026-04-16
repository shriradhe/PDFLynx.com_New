import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClockIcon, TagIcon, ArrowLongLeftIcon, UserCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { blogPosts } from '../data/blogData'

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)

  useEffect(() => {
    const foundPost = blogPosts.find((p) => p.slug === slug)
    if (foundPost) {
      setPost(foundPost)
    } else {
      navigate('/404', { replace: true })
    }
  }, [slug, navigate])

  if (!post) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-600/30 border-t-brand-600 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-slate-50 dark:bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors mb-8"
        >
          <ArrowLongLeftIcon className="w-5 h-5" />
          Back to all articles
        </Link>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <TagIcon className="w-3.5 h-3.5" />
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ClockIcon className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 pt-6 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <UserCircleIcon className="w-5 h-5 text-slate-400" />
              {post.author}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
              {post.date}
            </div>
          </div>
        </motion.div>

        {/* Hero Image / Graphic */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`w-full h-64 sm:h-96 rounded-3xl mb-16 overflow-hidden bg-gradient-to-br ${post.imageGradient} relative flex items-center justify-center`}
        >
          <div className="absolute w-64 h-64 bg-white/20 rounded-full blur-3xl -top-10 -right-10"></div>
          <div className="absolute w-40 h-40 bg-black/10 rounded-full blur-2xl bottom-10 left-10"></div>
          <span className="font-bold text-white/90 text-3xl sm:text-5xl tracking-widest uppercase rotate-[-5deg] drop-shadow-lg opacity-50">
            {post.category}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article Content */}
          <motion.article 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="lg:col-span-8 prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-brand-600 dark:prose-a:text-brand-400 hover:prose-a:text-brand-700"
             dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Sidebar CTA */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 card p-6 bg-white dark:bg-surface-400/20 border border-brand-100 dark:border-brand-500/20">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Try It Yourself</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Put this guide into practice immediately. PDFLynx is 100% free to use.
              </p>
              <Link to={post.toolPath} className="btn-primary w-full justify-center flex items-center shadow-brand-500/25">
                Open Tool Now
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

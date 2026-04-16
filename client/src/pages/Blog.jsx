import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ClockIcon, TagIcon, ArrowLongRightIcon } from '@heroicons/react/24/outline'
import { blogPosts } from '../data/blogData'

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')

  // Extract unique categories from actual posts
  const categories = ['All', ...new Set(blogPosts.map(post => post.category))]

  // Filter posts based on category
  const filteredPosts = blogPosts.filter(post => 
    activeCategory === 'All' ? true : post.category === activeCategory
  )

  const featuredPost = filteredPosts[0] || null
  const regularPosts = filteredPosts.slice(1) // rest of the posts

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-16"
        >
          <span className="section-label mb-3 block">PDFLynx Updates</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            The PDFLynx <span className="text-gradient">Blog</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Tips, news, and tutorials to help you work smarter with digital documents.
          </p>
        </motion.div>

        {/* Categories Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
             <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                   activeCategory === cat
                      ? 'bg-slate-900 text-white dark:bg-brand-500 dark:text-white shadow-lg'
                      : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                } border border-slate-200 dark:border-white/10`}
             >
                {cat}
             </button>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center text-slate-500 py-12">No posts found in this category.</div>
        )}

        <AnimatePresence mode="wait">
        <motion.div 
           key={activeCategory}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           transition={{ duration: 0.3 }}
        >
           {/* Featured Post */}
           {featuredPost && (
           <div className="mb-16 card overflow-hidden group cursor-pointer relative">
              <Link to={`/blog/${featuredPost.slug}`} className="absolute inset-0 z-10"></Link>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                 <div className={`h-64 lg:h-full bg-gradient-to-br ${featuredPost.imageGradient} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center relative overflow-hidden`}>
                    {/* Abstract geometric decor */}
                    <div className="absolute w-64 h-64 bg-white/20 rounded-full blur-3xl -top-10 -right-10"></div>
                    <div className="absolute w-40 h-40 bg-black/10 rounded-full blur-2xl bottom-10 left-10"></div>
                    <span className="font-bold text-white/90 text-2xl tracking-widest uppercase rotate-[-10deg] drop-shadow-md">{featuredPost.category}</span>
                 </div>
                 <div className="p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-surface-400/30">
                    <div className="flex items-center gap-4 mb-4">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                          <TagIcon className="w-3.5 h-3.5" />
                          {featuredPost.category}
                       </span>
                       <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {featuredPost.readTime}
                       </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                       {featuredPost.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                       {featuredPost.excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                       <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{featuredPost.date}</span>
                       <span className="flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                          Read Article <ArrowLongRightIcon className="w-5 h-5" />
                       </span>
                    </div>
                 </div>
              </div>
           </div>
           )}

           {/* Posts Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, i) => (
              <motion.div
                 key={post.id}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: '-100px' }}
                 transition={{ delay: i * 0.1 }}
                 className="card group cursor-pointer flex flex-col overflow-hidden h-full relative"
              >
                 <Link to={`/blog/${post.slug}`} className="absolute inset-0 z-10"></Link>
                 <div className={`h-48 bg-gradient-to-br ${post.imageGradient} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute w-32 h-32 bg-white/20 rounded-full blur-2xl top-4 right-4"></div>
                    <span className="font-bold text-white/50 text-xl tracking-widest uppercase rotate-[-5deg] drop-shadow-sm">{post.category}</span>
                 </div>
                 <div className="p-6 flex flex-col flex-1 bg-white dark:bg-surface-400/10">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                          {post.category}
                       </span>
                       <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                       <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {post.readTime}
                       </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                       {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
                       {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                       <span className="text-xs font-medium text-slate-500 dark:text-slate-500">{post.date}</span>
                       <span className="flex items-center text-xs font-bold text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                          Read More <ArrowLongRightIcon className="w-4 h-4 ml-1" />
                       </span>
                    </div>
                 </div>
              </motion.div>
              ))}
           </div>
        </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}

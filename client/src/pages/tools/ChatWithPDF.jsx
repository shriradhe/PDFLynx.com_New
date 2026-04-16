import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { pdfAPI } from '../../services/api'
import FileUploader from '../../components/FileUploader'
import toast from 'react-hot-toast'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const QUICK_PROMPTS = [
  'What is the main topic of this document?',
  'Summarize the key findings.',
  'What conclusions are drawn?',
  'List the main sections.',
  'What recommendations are made?',
]

export default function ChatWithPDF() {
  const [file, setFile] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [indexing, setIndexing] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a PDF file.')
    setIndexing(true)
    setMessages([])
    setSessionId(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await pdfAPI.aiChatUpload(formData)
      
      setSessionId(data.sessionId)
      setSessionInfo(data)
      setMessages([{
        role: 'assistant',
        content: `📄 **PDF indexed successfully!**\n\n• ${data.pageCount} pages\n• ${data.chunkCount} text segments\n• ${data.wordCount?.toLocaleString()} words\n\nAsk me anything about this document.${!data.aiConfigured ? '\n\n💡 *Demo mode — set OPENAI_API_KEY for real AI.*' : ''}`,
      }])
      toast.success('PDF ready for chat!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to index PDF.')
    } finally {
      setIndexing(false)
    }
  }

  const sendMessage = async (text) => {
    const question = (text || input).trim()
    if (!question || !sessionId) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const { data } = await pdfAPI.aiChatAsk({ sessionId, question })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        chunks: data.relevantChunks,
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ ' + (err.response?.data?.message || 'Failed to process question.'),
        error: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-medium mb-4">
            <SparklesIcon className="w-3.5 h-3.5" />
            AI Powered (RAG)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Chat with PDF
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Upload a PDF and have a conversation about its contents. AI reads and understands your document.
          </p>
        </motion.div>

        {!sessionId ? (
          /* Upload Phase */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <FileUploader
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={1}
              onFilesChange={(files) => setFile(files[0] || null)}
              files={file ? [file] : []}
            />
            <div className="mt-6 text-center">
              <button
                onClick={handleUpload}
                disabled={!file || indexing}
                className="btn-primary px-8 py-3 text-base disabled:opacity-50"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                {indexing ? 'Indexing PDF…' : 'Start Chatting'}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Chat Phase */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="card p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <DocumentTextIcon className="w-4 h-4 text-cyan-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Document</h3>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <p>{sessionInfo?.pageCount} pages</p>
                  <p>{sessionInfo?.chunkCount} segments</p>
                  <p>{sessionInfo?.wordCount?.toLocaleString()} words</p>
                </div>
                <button
                  onClick={() => { setSessionId(null); setMessages([]); setFile(null); }}
                  className="mt-3 w-full btn-secondary text-xs py-1.5"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  New Document
                </button>
              </div>

              <div className="card p-4">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Quick Prompts</h3>
                <div className="space-y-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      disabled={loading}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 card flex flex-col"
              style={{ height: '600px' }}
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-br-md'
                        : msg.error
                          ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-bl-md'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-bl-md'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-white/5 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-slate-200 dark:border-white/10 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about the document…"
                    disabled={loading}
                    className="flex-1 input-field"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="btn-primary px-4 disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

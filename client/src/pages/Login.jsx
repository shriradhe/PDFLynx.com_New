import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import { EnvelopeIcon, LockClosedIcon, KeyIcon } from '@heroicons/react/24/outline'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form }
      if (requires2FA) {
        payload.twoFactorCode = twoFactorCode
        payload.userId = userId
      }
      const { data } = await authAPI.login(payload)
      if (data.requiresTwoFactor) {
        setRequires2FA(true)
        setUserId(data.userId)
        setLoading(false)
        return
      }
      login(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
      if (requires2FA) {
        setRequires2FA(false)
        setUserId(null)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Sign in to your PDFLynx account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {requires2FA ? (
              <div>
                <label className="input-label">Two-Factor Code</label>
                <div className="relative">
                  <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="Enter 6-digit code" required maxLength={6} className="input-field pl-10 text-center text-lg tracking-widest font-mono" />
                </div>
              </div>
            ) : (
              <>
                {[
                  { name: 'email', placeholder: 'Email address', icon: EnvelopeIcon, type: 'email' },
                  { name: 'password', placeholder: 'Password', icon: LockClosedIcon, type: 'password' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="input-label">{field.placeholder}</label>
                    <div className="relative">
                      <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type={field.type} name={field.name} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder} required className="input-field pl-10" />
                    </div>
                  </div>
                ))}
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : requires2FA ? 'Verify Code' : 'Sign In'}
            </button>
          </form>

          {!requires2FA && (
            <div className="mt-4 text-center">
              <Link to="/forgot-password" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          <p className="text-center text-sm text-slate-600 dark:text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 hover:text-brand-500 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

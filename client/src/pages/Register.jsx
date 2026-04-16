import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.register({ name: form.name, email: form.email, password: form.password })
      login(data.user, data.token)
      toast.success('Welcome to PDFLynx!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Create Account</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Join PDFLynx — it's free forever</p>
        </div>

        <div className="glass-card border border-slate-200 dark:border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: 'name', placeholder: 'Full name', icon: UserIcon, type: 'text' },
              { name: 'email', placeholder: 'Email address', icon: EnvelopeIcon, type: 'email' },
              { name: 'password', placeholder: 'Password (min 6 chars)', icon: LockClosedIcon, type: 'password' },
              { name: 'confirm', placeholder: 'Confirm password', icon: LockClosedIcon, type: 'password' },
            ].map((field) => (
              <div key={field.name}>
                <label className="input-label">{field.placeholder}</label>
                <div className="relative">
                  <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

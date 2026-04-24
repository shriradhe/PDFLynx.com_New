import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI, apiKeyAPI, webhookAPI, analyticsAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import {
  UserCircleIcon,
  KeyIcon,
  ShieldCheckIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
      active
        ? 'bg-brand-600 text-white shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
    }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
)

export default function Settings() {
  const { isAuthenticated, user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  // Profile
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // API Keys
  const [apiKeys, setApiKeys] = useState([])
  const [newKeyName, setNewKeyName] = useState('')
  const [showNewKey, setShowNewKey] = useState(null)

  // Webhooks
  const [webhooks, setWebhooks] = useState([])
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookEvents, setNewWebhookEvents] = useState(['pdf.completed'])

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([])
  const [logPage, setLogPage] = useState(1)
  const [logPagination, setLogPagination] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setName(user?.name || '')
    setEmail(user?.email || '')
    loadApiKeys()
    loadWebhooks()
    loadAuditLogs()
  }, [isAuthenticated, logPage])

  const loadApiKeys = async () => {
    try {
      const { data } = await apiKeyAPI.getAll()
      setApiKeys(data.apiKeys || [])
    } catch (err) {
      // API keys endpoint may not exist yet
    }
  }

  const loadWebhooks = async () => {
    try {
      const { data } = await webhookAPI.getAll()
      setWebhooks(data.webhooks || [])
    } catch (err) {
      // Webhooks endpoint may not exist yet
    }
  }

  const loadAuditLogs = async () => {
    try {
      const { data } = await analyticsAPI.getLogs({ page: logPage, limit: 15 })
      setAuditLogs(data.logs || [])
      setLogPagination(data.pagination)
    } catch (err) {
      // Audit logs endpoint may not exist yet
    }
  }

  const handleUpdateProfile = async () => {
    if (!name.trim()) return toast.error('Name is required.')
    setLoading(true)
    try {
      const { data } = await authAPI.updateProfile({ name: name.trim() })
      updateUser(data.user)
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return toast.error('All fields are required.')
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match.')
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters.')
    setLoading(true)
    try {
      await authAPI.changePassword({ currentPassword, newPassword })
      toast.success('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return toast.error('API key name is required.')
    try {
      const { data } = await apiKeyAPI.create({ name: newKeyName.trim() })
      setShowNewKey(data.apiKey?.key)
      setNewKeyName('')
      loadApiKeys()
      toast.success('API key created. Save it now — it won\'t be shown again.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create API key.')
    }
  }

  const handleRevokeApiKey = async (id) => {
    try {
      await apiKeyAPI.revoke(id)
      loadApiKeys()
      toast.success('API key revoked.')
    } catch (err) {
      toast.error('Failed to revoke API key.')
    }
  }

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl.trim()) return toast.error('Webhook URL is required.')
    try {
      await webhookAPI.create({ url: newWebhookUrl.trim(), events: newWebhookEvents })
      setNewWebhookUrl('')
      loadWebhooks()
      toast.success('Webhook created.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create webhook.')
    }
  }

  const handleDeleteWebhook = async (id) => {
    try {
      await webhookAPI.delete(id)
      loadWebhooks()
      toast.success('Webhook deleted.')
    } catch (err) {
      toast.error('Failed to delete webhook.')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard.')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'api-keys', label: 'API Keys', icon: KeyIcon },
    { id: 'webhooks', label: 'Webhooks', icon: LinkIcon },
    { id: 'audit', label: 'Audit Log', icon: ClockIcon },
  ]

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your account, API keys, and integrations.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} icon={tab.icon}>
              {tab.label}
            </TabButton>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Information</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your personal information.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <span className="badge badge-neutral capitalize mt-1">{user?.plan || 'free'} plan</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" value={email} disabled className="input-field bg-slate-50 dark:bg-white/3 opacity-60" />
                <p className="input-hint">Email cannot be changed.</p>
              </div>
            </div>
            <button onClick={handleUpdateProfile} disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ensure your account is using a strong password.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Current Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="input-label">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" />
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={loading} className="btn-primary">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>

            <div className="card p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add an extra layer of security to your account.</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">2FA Status</p>
                    <p className="text-xs text-slate-500">{user?.twoFactorEnabled ? 'Enabled' : 'Not enabled'}</p>
                  </div>
                </div>
                <span className={`badge ${user?.twoFactorEnabled ? 'badge-success' : 'badge-neutral'}`}>
                  {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Contact support to enable or disable 2FA on your account.</p>
            </div>
          </motion.div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {showNewKey && (
              <div className="card p-6 border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5">
                <div className="flex items-start gap-3">
                  <KeyIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Save Your API Key</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">This key will not be shown again. Copy it now.</p>
                    <div className="flex items-center gap-2 mt-3">
                      <code className="flex-1 px-3 py-2 bg-white dark:bg-surface-500 rounded-lg text-sm font-mono text-slate-900 dark:text-white break-all">{showNewKey}</code>
                      <button type="button" onClick={() => copyToClipboard(showNewKey)} aria-label="Copy new API key" className="p-2 rounded-lg bg-white dark:bg-surface-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowNewKey(null)} aria-label="Dismiss API key alert" className="text-amber-400 hover:text-amber-600">
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create API Key</h2>
              <div className="flex gap-3">
                <input type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g. Production Key" className="input-field flex-1" />
                <button onClick={handleCreateApiKey} className="btn-primary">
                  <PlusIcon className="w-4 h-4" />
                  Create
                </button>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your API Keys</h2>
              </div>
              {apiKeys.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">No API keys created yet.</div>
              ) : (
                <div className="overflow-x-auto">
                <table className="table">
                  <caption className="sr-only">API keys list with status and usage</caption>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Prefix</th>
                      <th scope="col">Usage</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr key={key._id}>
                        <td className="font-medium text-slate-900 dark:text-white">{key.name}</td>
                        <td className="font-mono text-xs text-slate-500">{key.keyPrefix}</td>
                        <td className="text-sm text-slate-500">{key.usageCount || 0} requests</td>
                        <td>
                          <span className={`badge ${key.isActive ? 'badge-success' : 'badge-error'}`}>
                            {key.isActive ? 'Active' : 'Revoked'}
                          </span>
                        </td>
                        <td>
                          {key.isActive && (
                            <button type="button" onClick={() => handleRevokeApiKey(key._id)} className="text-xs text-rose-500 hover:text-rose-600 font-medium">
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create Webhook</h2>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Endpoint URL</label>
                  <input type="url" value={newWebhookUrl} onChange={(e) => setNewWebhookUrl(e.target.value)} placeholder="https://your-server.com/webhook" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Events</label>
                  <div className="flex flex-wrap gap-2">
                    {['pdf.completed', 'pdf.failed', 'file.expired'].map((event) => (
                      <button
                        key={event}
                        onClick={() => {
                          if (newWebhookEvents.includes(event)) {
                            setNewWebhookEvents(newWebhookEvents.filter((e) => e !== event))
                          } else {
                            setNewWebhookEvents([...newWebhookEvents, event])
                          }
                        }}
                        className={`chip ${newWebhookEvents.includes(event) ? 'chip-active' : ''}`}
                      >
                        {newWebhookEvents.includes(event) && <CheckCircleIcon className="w-3 h-3" />}
                        {event}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleCreateWebhook} className="btn-primary">
                  <PlusIcon className="w-4 h-4" />
                  Create Webhook
                </button>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Webhooks</h2>
              </div>
              {webhooks.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">No webhooks configured.</div>
              ) : (
                <div className="overflow-x-auto">
                <table className="table">
                  <caption className="sr-only">Webhook endpoints and delivery status</caption>
                  <thead>
                    <tr>
                      <th scope="col">URL</th>
                      <th scope="col">Events</th>
                      <th scope="col">Deliveries</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhooks.map((wh) => (
                      <tr key={wh._id}>
                        <td className="font-mono text-xs text-slate-500 truncate max-w-[200px]">{wh.url}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {wh.events.map((e) => (
                              <span key={e} className="chip text-[10px]">{e}</span>
                            ))}
                          </div>
                        </td>
                        <td className="text-sm text-slate-500">{wh.deliveryCount || 0}</td>
                        <td>
                          <span className={`badge ${wh.isActive ? 'badge-success' : 'badge-error'}`}>
                            {wh.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button type="button" onClick={() => handleDeleteWebhook(wh._id)} className="text-xs text-rose-500 hover:text-rose-600 font-medium">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Audit Log</h2>
                <p className="text-sm text-slate-500 mt-1">Track all actions performed on your account.</p>
              </div>
              {auditLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">No audit logs available.</div>
              ) : (
                <div className="overflow-x-auto">
                <table className="table">
                  <caption className="sr-only">Account audit log entries</caption>
                  <thead>
                    <tr>
                      <th scope="col">Action</th>
                      <th scope="col">Status</th>
                      <th scope="col">IP Address</th>
                      <th scope="col">Duration</th>
                      <th scope="col">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <CodeBracketIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{log.action}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-error'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="text-xs font-mono text-slate-500">{log.ipAddress || '—'}</td>
                        <td className="text-xs text-slate-500">{log.duration ? `${log.duration}ms` : '—'}</td>
                        <td className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
              {logPagination && logPagination.pages > 1 && (
                <div className="flex justify-center gap-2 p-4 border-t border-slate-100 dark:border-white/5">
                  {Array.from({ length: Math.min(logPagination.pages, 5) }, (_, i) => i + 1).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setLogPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        p === logPage ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

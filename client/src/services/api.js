import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pdflynx_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pdflynx_token')
      window.dispatchEvent(new CustomEvent('auth:expired'))
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
  enable2FA: () => api.post('/auth/2fa/enable'),
  disable2FA: (code) => api.post('/auth/2fa/disable', { code }),
  getAnalytics: (period) => api.get(`/auth/analytics?period=${period || '30d'}`),
}

const createFormData = (files, fields = {}) => {
  const formData = new FormData()
  if (Array.isArray(files)) {
    files.forEach((f) => formData.append('files', f))
  } else if (files) {
    formData.append('file', files)
  }
  Object.entries(fields).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      formData.append(key, typeof val === 'object' ? JSON.stringify(val) : val)
    }
  })
  return formData
}

export const pdfAPI = {
  merge: (files, onProgress) =>
    api.post('/pdf/merge', createFormData(files), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  split: (file, options = {}, onProgress) =>
    api.post('/pdf/split', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  compress: (file, options = {}, onProgress) =>
    api.post('/pdf/compress', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  rotate: (file, options = {}, onProgress) =>
    api.post('/pdf/rotate', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  watermark: (file, options = {}, onProgress) =>
    api.post('/pdf/watermark', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  protect: (file, options = {}, onProgress) =>
    api.post('/pdf/protect', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  unlock: (file, options = {}, onProgress) =>
    api.post('/pdf/unlock', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  pageNumbers: (file, options = {}, onProgress) =>
    api.post('/pdf/page-numbers', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  convert: (files, type, onProgress) => {
    const fileArray = Array.isArray(files) ? files : [files]
    return api.post('/pdf/convert', createFormData(fileArray, { type }), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    })
  },
  ocr: (file, onProgress) =>
    api.post('/pdf/ocr', createFormData(file), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  sign: (file, options = {}, onProgress) =>
    api.post('/pdf/sign', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  edit: (file, options = {}, onProgress) =>
    api.post('/pdf/edit', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  pdfToText: (file, onProgress) =>
    api.post('/pdf/pdf-to-text', createFormData(file), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  pdfToPng: (file, options = {}, onProgress) =>
    api.post('/pdf/pdf-to-png', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  organize: (file, options = {}, onProgress) =>
    api.post('/pdf/organize', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  redact: (file, options = {}, onProgress) =>
    api.post('/pdf/redact', createFormData(file, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  htmlToPdf: (options = {}) =>
    api.post('/pdf/html-to-pdf', options),
  imageToPdf: (files, options = {}, onProgress) =>
    api.post('/pdf/image-to-pdf', createFormData(files, options), {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  annotate: (formData, onProgress) =>
    api.post('/pdf/annotate', formData, {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  fillForm: (formData, onProgress) =>
    api.post('/pdf/fill-form', formData, {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  createSigningRequest: (formData, onProgress) =>
    api.post('/signature/create', formData, {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  eSign: (formData, onProgress) =>
    api.post('/signature/sign', formData, {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  getHistory: (page = 1, limit = 10) =>
    api.get(`/pdf/history?page=${page}&limit=${limit}`),

  // AI Tools (convenience wrappers)
  aiSummarize: (formData, onProgress) =>
    api.post('/ai/summarize', formData, {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
  aiChatUpload: (formData) =>
    api.post('/ai/chat/upload', formData),
  aiChatAsk: (data) =>
    api.post('/ai/chat/ask', data),
  aiSearch: (formData, onProgress) =>
    api.post('/ai/search', formData, {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    }),
}

export const apiKeyAPI = {
  create: (data) => api.post('/api-keys', data),
  getAll: () => api.get('/api-keys'),
  update: (id, data) => api.put(`/api-keys/${id}`, data),
  revoke: (id) => api.delete(`/api-keys/${id}`),
}

export const webhookAPI = {
  create: (data) => api.post('/webhooks', data),
  getAll: () => api.get('/webhooks'),
  update: (id, data) => api.put(`/webhooks/${id}`, data),
  delete: (id) => api.delete(`/webhooks/${id}`),
}

export const analyticsAPI = {
  getDashboard: (period) => api.get(`/analytics/dashboard?period=${period || '30d'}`),
  getLogs: (params) => {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/analytics/logs?${qs}`)
  },
}

export default api

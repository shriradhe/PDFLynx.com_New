import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  isAuthenticated: !!localStorage.getItem('pdflynx_token'),

  login: (user, token) => {
    localStorage.setItem('pdflynx_token', token)
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('pdflynx_token')
    set({ user: null, isAuthenticated: false })
  },

  updateUser: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }))
  },

  getToken: () => {
    return localStorage.getItem('pdflynx_token')
  },

  setLoading: (loading) => set({ loading }),
}))

export default useAuthStore

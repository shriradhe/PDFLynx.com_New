import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  getLanguageFromCountry,
  normalizeLanguageCode,
} from '../i18n/languageConfig'
import { translations } from '../i18n/translations'
import useAuthStore from '../store/authStore'

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
})

async function detectLanguageFromIP() {
  try {
    const response = await fetch('https://ipapi.co/json/', { cache: 'no-store' })
    if (!response.ok) return null
    const data = await response.json()
    return getLanguageFromCountry(data?.country_code)
  } catch {
    return null
  }
}

function getBrowserLanguage() {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE
  return normalizeLanguageCode(navigator.language || DEFAULT_LANGUAGE)
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    let mounted = true

    const applyAutoLanguage = async () => {
      const detected = await detectLanguageFromIP()
      if (!mounted) return
      const nextLanguage = normalizeLanguageCode(detected || getBrowserLanguage())
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
      setLanguageState(nextLanguage)
    }

    if (!isAuthenticated) {
      applyAutoLanguage()
    } else {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (saved) {
        setLanguageState(normalizeLanguageCode(saved))
      } else {
        applyAutoLanguage()
      }
    }

    return () => {
      mounted = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (nextLanguage) => {
    const normalized = normalizeLanguageCode(nextLanguage)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized)
    setLanguageState(normalized)
  }

  const value = useMemo(() => {
    const dict = translations[language] || translations[DEFAULT_LANGUAGE]
    return {
      language,
      setLanguage,
      t: (key, fallback) => dict[key] || translations.en[key] || fallback || key,
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}

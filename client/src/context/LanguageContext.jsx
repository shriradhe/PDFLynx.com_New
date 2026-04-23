import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  getLanguageFromCountry,
  normalizeLanguageCode,
} from '../i18n/languageConfig'
import { translations } from '../i18n/translations'

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

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (saved) {
      setLanguageState(normalizeLanguageCode(saved))
      return
    }

    let mounted = true
    detectLanguageFromIP().then((detected) => {
      if (!mounted) return
      setLanguageState(normalizeLanguageCode(detected || getBrowserLanguage()))
    })

    return () => {
      mounted = false
    }
  }, [])

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

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' },
  { code: 'fr', label: 'Francais' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Portugues' },
  { code: 'hi', label: 'Hindi' },
]

const COUNTRY_TO_LANGUAGE = {
  US: 'en',
  GB: 'en',
  CA: 'en',
  AU: 'en',
  IN: 'hi',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  FR: 'fr',
  BE: 'fr',
  DE: 'de',
  AT: 'de',
  CH: 'de',
  BR: 'pt',
  PT: 'pt',
}

export const DEFAULT_LANGUAGE = 'en'
export const LANGUAGE_STORAGE_KEY = 'pdflynx_language'

export function normalizeLanguageCode(code = '') {
  const normalized = String(code).toLowerCase().split('-')[0]
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === normalized)
    ? normalized
    : DEFAULT_LANGUAGE
}

export function getLanguageFromCountry(countryCode = '') {
  return COUNTRY_TO_LANGUAGE[String(countryCode || '').toUpperCase()] || DEFAULT_LANGUAGE
}

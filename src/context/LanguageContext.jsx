import { createContext, useContext, useState, useEffect } from 'react'
import t, { LANGUAGES } from '../i18n/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  const language = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.dir = language.rtl ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang, language.rtl])

  return (
    <LanguageContext.Provider value={{ lang, setLang, T: t[lang], language, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

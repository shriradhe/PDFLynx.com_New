import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'

const rootElement = document.getElementById('root')

if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
    <React.StrictMode>
      <HelmetProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </HelmetProvider>
    </React.StrictMode>
  )
} else {
  createRoot(rootElement).render(
    <React.StrictMode>
      <HelmetProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </HelmetProvider>
    </React.StrictMode>
  )
}

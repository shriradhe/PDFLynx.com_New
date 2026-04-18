import React from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById('root')

// We exclusively use createRoot because standard React.lazy() routing 
// conflicts with hydrateRoot on prerendered static pages. 
// createRoot gracefully replaces the prerender HTML without console errors.
createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.jsx'

const auth0Domain = (import.meta.env.VITE_AUTH0_DOMAIN ?? '')
  .trim()
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '')
const auth0ClientId = (import.meta.env.VITE_AUTH0_CLIENT_ID ?? '').trim()
const brandText = (import.meta.env.VITE_BRAND_TEXT ?? '').trim()
const brandFavicon = (import.meta.env.VITE_BRAND_FAVICON ?? '').trim()

if (!auth0Domain || !auth0ClientId || !brandText || !brandFavicon) {
  throw new Error(
    'Missing config: set VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_BRAND_TEXT, and VITE_BRAND_FAVICON for this environment.'
  )
}

document.title = brandText
let favicon = document.querySelector("link[rel='icon']")
if (!favicon) {
  favicon = document.createElement('link')
  favicon.setAttribute('rel', 'icon')
  document.head.appendChild(favicon)
}
favicon.setAttribute('href', brandFavicon)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        connection: 'google-oauth2',
      }}
    >
      <HashRouter>
        <App />
      </HashRouter>
    </Auth0Provider>
  </StrictMode>
)

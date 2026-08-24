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

if (!auth0Domain || !auth0ClientId) {
  throw new Error(
    'Missing Auth0 config: set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID for this environment.'
  )
}

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

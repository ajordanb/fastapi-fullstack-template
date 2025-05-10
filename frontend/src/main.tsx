import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { AuthProvider } from '@/contexts/auth/AuthContext'

import * as TanstackQuery from './integrations/tanstack-query/root-provider'

import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals'

const router = createRouter({
  routeTree,
  context: {
    ...TanstackQuery.getContext(),
    auth: undefined!,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useAuth()
  
  return (
    <RouterProvider 
      router={router} 
      context={{
        ...TanstackQuery.getContext(),
        auth
      }} 
    />
  )
}

// Main App component with all providers
function App() {
  return (
    <StrictMode>
      <TanstackQuery.Provider>
        <AuthProvider>
          <InnerApp />
        </AuthProvider>
      </TanstackQuery.Provider>
    </StrictMode>
  )
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
}


reportWebVitals()
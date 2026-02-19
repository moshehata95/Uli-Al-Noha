import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './stores/authStore'
import NavBar from './components/NavBar'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import GroupsPage from './pages/GroupsPage'
import GroupDetailPage from './pages/GroupDetailPage'
import JoinGroupPage from './pages/JoinGroupPage'
import SurahViewerPage from './pages/SurahViewerPage'
import PageViewerPage from './pages/PageViewerPage'
import { Loader2 } from 'lucide-react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,               // 1 retry (was 2) — much faster failure recovery
      refetchOnWindowFocus: false,
      staleTime: 60_000,     // 1 min default stale time — reduces redundant fetches
      gcTime: 10 * 60_000,  // 10 min cache time
    },
  },
})

function AppContent() {
  // useAuth runs the subscription/session check in the background
  useAuth()
  // Read state directly from store — avoids double render from hook internals
  const session = useAuthStore((s) => s.session)
  const isLoading = useAuthStore((s) => s.isLoading)

  // Only show full-screen spinner on first visit (no persisted session).
  // Return visitors: session is already in localStorage so we skip the wait.
  if (isLoading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: 'var(--color-gold)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>أولى النهى</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/join/:inviteCode" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<AuthPage />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <NavBar />
      <main className="pt-[72px] pb-12 px-4 max-w-4xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          <Route path="/join/:inviteCode" element={<JoinGroupPage />} />
          <Route path="/surah/:surahNumber" element={<SurahViewerPage />} />
          <Route path="/page/:pageNumber" element={<PageViewerPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

import { Routes, Route, Navigate } from 'react-router-dom'
import { authService } from '@/services'

import LoginPage from '@/pages/login'
import DashboardPage from '@/pages/dashboard'
import TransactionsPage from '@/pages/transactions'
import AnalyticsPage from '@/pages/analytics'
import ImportPage from '@/pages/import'
import SettingsPage from '@/pages/settings'

// ── Protected Route ───────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />
    }
    return <>{children}</>
}

// ── App ───────────────────────────────────────────────────────
function App() {
    return (
        <Routes>
            {/* public */}
            <Route path="/login" element={<LoginPage />} />

            {/* protected */}
            <Route path="/" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/transactions" element={
                <ProtectedRoute><TransactionsPage /></ProtectedRoute>
            } />
            <Route path="/analytics" element={
                <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
            } />
            <Route path="/import" element={
                <ProtectedRoute><ImportPage /></ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute><SettingsPage /></ProtectedRoute>
            } />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
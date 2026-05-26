import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './services/supabase'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Certificados from './pages/Certificados'
import EnsinoMedio from './pages/EnsinoMedio'
import Itinerario1 from './pages/Itinerario1'

// Componente que protege rotas privadas
function ProtectedRoute({ children, session, loading }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-surface-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-surface-400 text-sm">Carregando...</p>
                </div>
            </div>
        )
    }
    return session ? children : <Navigate to="/" replace />
}

export default function App() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Carrega sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        // Escuta mudanças de auth (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <Routes>
            {/* Rota pública – Login */}
            <Route
                path="/"
                element={
                    loading ? null : session ? <Navigate to="/dashboard" replace /> : <Login />
                }
            />

            {/* Rotas protegidas */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute session={session} loading={loading}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/certificados"
                element={
                    <ProtectedRoute session={session} loading={loading}>
                        <Certificados />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/certificados/ensino-medio"
                element={
                    <ProtectedRoute session={session} loading={loading}>
                        <EnsinoMedio />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/certificados/ensino-medio/itinerario-1"
                element={
                    <ProtectedRoute session={session} loading={loading}>
                        <Itinerario1 />
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import api from '../services/api'

export default function Dashboard() {
    const [userEmail, setUserEmail] = useState('')
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Pega dados do usuário
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserEmail(user.email)
        })

        // Busca histórico
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/certificados/historico')
            setHistory(data || [])
        } catch (err) {
            console.error('Erro ao buscar histórico:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async (cert) => {
        try {
            // Pega uma URL assinada (válida por 60 segundos)
            const { data, error } = await supabase.storage
                .from('certificados')
                .createSignedUrl(cert.storage_key, 60)

            if (error) throw error

            // Abre em nova aba ou força download
            window.open(data.signedUrl, '_blank')
        } catch (err) {
            alert('Erro ao obter link de download: ' + err.message)
        }
    }

    // Cálculos de stats
    const totalGerados = history.length
    const esteMes = history.filter(h => {
        const data = new Date(h.criado_em)
        const agora = new Date()
        return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear()
    }).length

    const stats = [
        { label: 'Certificados Gerados', value: totalGerados, icon: '🎓', color: 'text-primary-400', bg: 'bg-primary-600/10 border-primary-500/20' },
        { label: 'Este Mês', value: esteMes, icon: '📅', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Sistema Online', value: '100%', icon: '⚡', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    ]

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-surface-950 min-h-screen">
                <Header title="Dashboard" subtitle="Visão geral do sistema" />

                <main className="flex-1 p-8 space-y-8 overflow-y-auto">
                    {/* Saudação */}
                    <div className="card p-6">
                        <h3 className="text-surface-100 font-semibold text-lg">
                            Bem-vindo de volta 👋
                        </h3>
                        <p className="text-surface-500 text-sm mt-1">{userEmail}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.map((s) => (
                            <div key={s.label} className={`card p-6 border ${s.bg}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-surface-400 text-sm font-medium">{s.label}</p>
                                    <span className="text-xl">{s.icon}</span>
                                </div>
                                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Histórico Recente */}
                    <div className="card overflow-hidden">
                        <div className="p-6 border-b border-surface-700 flex items-center justify-between">
                            <h4 className="text-surface-200 font-semibold text-base">Certificados Recentes</h4>
                            <a href="/certificados" className="btn-primary text-xs py-1.5 px-3">Gerar Novo</a>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-12 text-center text-surface-500 italic">Carregando histórico...</div>
                            ) : history.length === 0 ? (
                                <div className="p-12 text-center text-surface-500 italic">Nenhum certificado gerado ainda.</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-surface-800/50 text-surface-400 text-xs uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Aluno</th>
                                            <th className="px-6 py-4">Tipo</th>
                                            <th className="px-6 py-4">Data</th>
                                            <th className="px-6 py-4 text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-800">
                                        {history.map((h) => (
                                            <tr key={h.id} className="hover:bg-surface-800/20 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-surface-200">{h.aluno_nome}</td>
                                                <td className="px-6 py-4 text-xs text-surface-400 uppercase tracking-wide">
                                                    {h.tipo === 'ensino_medio' ? `Ensino Médio (Itin. ${h.itinerario})` : h.tipo}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-surface-400">
                                                    {new Date(h.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDownload(h)}
                                                        className="text-primary-400 hover:text-primary-300 transition-colors inline-flex items-center gap-1 text-sm"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                        </svg>
                                                        PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

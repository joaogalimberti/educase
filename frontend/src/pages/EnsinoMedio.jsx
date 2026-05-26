import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const itinerarios = [
    {
        id: 1,
        title: 'Itinerário 1',
        desc: 'Linguagens e suas Tecnologias + Itinerário Formativo.',
        icon: '📝',
        active: true,
        path: '/certificados/ensino-medio/itinerario-1',
    },
    {
        id: 2,
        title: 'Itinerário 2',
        desc: 'Matemática e suas Tecnologias.',
        icon: '📐',
        active: false,
        path: null,
    },
    {
        id: 3,
        title: 'Itinerário 3',
        desc: 'Ciências da Natureza e suas Tecnologias.',
        icon: '🔬',
        active: false,
        path: null,
    },
    {
        id: 4,
        title: 'Itinerário 4',
        desc: 'Ciências Humanas e Sociais Aplicadas.',
        icon: '🌐',
        active: false,
        path: null,
    },
]

export default function EnsinoMedio() {
    const navigate = useNavigate()

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-surface-950">
                <Header title="Ensino Médio" subtitle="Selecione o itinerário formativo" />

                <main className="flex-1 p-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-surface-500 mb-8">
                        <a href="/certificados" className="hover:text-surface-300 transition-colors">Certificados</a>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                        <span className="text-surface-300">Ensino Médio</span>
                    </nav>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                        {itinerarios.map((it) => (
                            <div
                                key={it.id}
                                onClick={() => it.active && it.path && navigate(it.path)}
                                className={`card p-6 flex flex-col gap-5 transition-all duration-200 ${it.active
                                        ? 'hover:border-primary-500/40 hover:bg-surface-700/50 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'
                                        : 'opacity-60 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-700 text-2xl">
                                        {it.icon}
                                    </div>
                                    {it.active ? (
                                        <span className="badge-active">Ativo</span>
                                    ) : (
                                        <span className="badge-soon">Em breve</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-surface-100 font-semibold">{it.title}</h3>
                                    <p className="text-surface-500 text-sm mt-1 leading-relaxed">{it.desc}</p>
                                </div>
                                {it.active && (
                                    <div className="flex items-center gap-1.5 text-primary-400 text-sm font-medium mt-auto">
                                        Abrir formulário
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}

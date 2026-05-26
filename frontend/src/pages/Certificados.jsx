import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const certificados = [
    {
        id: 'fundamental',
        title: 'Ensino Fundamental',
        desc: 'Certificados de conclusão do ensino fundamental.',
        icon: '📚',
        active: false,
        path: null,
    },
    {
        id: 'medio',
        title: 'Ensino Médio',
        desc: 'Certificados de conclusão do ensino médio com itinerários formativos.',
        icon: '🎓',
        active: true,
        path: '/certificados/ensino-medio',
    },
    {
        id: 'eja',
        title: 'EJA',
        desc: 'Educação de Jovens e Adultos – em desenvolvimento.',
        icon: '📖',
        active: false,
        path: null,
    },
]

export default function Certificados() {
    const navigate = useNavigate()

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-surface-950">
                <Header title="Certificados" subtitle="Selecione a modalidade de ensino" />

                <main className="flex-1 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                        {certificados.map((cert) => (
                            <div
                                key={cert.id}
                                onClick={() => cert.active && cert.path && navigate(cert.path)}
                                className={`card p-6 flex flex-col gap-5 transition-all duration-200 ${cert.active
                                        ? 'hover:border-primary-500/40 hover:bg-surface-700/50 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'
                                        : 'opacity-60 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-700 text-2xl">
                                        {cert.icon}
                                    </div>
                                    {cert.active ? (
                                        <span className="badge-active">Ativo</span>
                                    ) : (
                                        <span className="badge-soon">Em breve</span>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-surface-100 font-semibold text-base">{cert.title}</h3>
                                    <p className="text-surface-500 text-sm mt-1 leading-relaxed">{cert.desc}</p>
                                </div>

                                {cert.active && (
                                    <div className="flex items-center gap-1.5 text-primary-400 text-sm font-medium mt-auto">
                                        Acessar
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

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import FormAluno from '../components/FormAluno'
import FormNotas from '../components/FormNotas'
import api from '../services/api'

const INICIAL_ALUNO = {
    nome: '',
    dataNascimento: '',
    cpf: '',
    nomeMae: '',
    nomePai: '',
    naturalCidade: '',
    naturalUF: '',
    nacionalidade: 'Brasileira',
    concluiuEm: '',
}

export default function Itinerario1() {
    const [aluno, setAluno] = useState(INICIAL_ALUNO)
    const [notas, setNotas] = useState({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleGerar = async () => {
        setError('')
        setSuccess(false)

        // Validação básica
        if (!aluno.nome.trim()) {
            setError('O nome do aluno é obrigatório.')
            return
        }
        if (!aluno.dataNascimento || aluno.dataNascimento.replace(/\D/g, '').length !== 8) {
            setError('Informe uma data de nascimento válida (DD/MM/AAAA).')
            return
        }

        setLoading(true)

        try {
            const response = await api.post(
                '/certificados/gerar',
                { aluno, notas, tipo: 'ensino_medio', itinerario: 1 },
                { responseType: 'blob' }
            )

            // Faz download automático do PDF
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
            const link = document.createElement('a')
            link.href = url
            link.download = `certificado_${aluno.nome.replace(/\s+/g, '_').toLowerCase()}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            setSuccess(true)
        } catch (err) {
            console.error('[Frontend Error]', err)

            // Se o backend retornou um erro (mesmo com responseType: 'blob')
            if (err.response?.data instanceof Blob) {
                const reader = new FileReader()
                reader.onload = () => {
                    const text = reader.result
                    try {
                        const errorData = JSON.parse(text)
                        setError(errorData.detail || errorData.error || 'Erro ao gerar o certificado.')
                    } catch (e) {
                        console.error('[JSON Parse Error] Raw response:', text)
                        setError('Erro ao processar resposta do servidor (Resposta inválida).')
                    }
                }
                reader.readAsText(err.response.data)
            } else {
                setError(err.response?.data?.error || 'Erro de conexão com o servidor. Verifique sua internet.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-surface-950">
                <Header
                    title="Itinerário 1 – Ensino Médio"
                    subtitle="Preencha os dados do aluno para gerar o certificado"
                />

                <main className="flex-1 p-8 space-y-8 max-w-5xl">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-surface-500">
                        <a href="/certificados" className="hover:text-surface-300 transition-colors">Certificados</a>
                        <span>›</span>
                        <a href="/certificados/ensino-medio" className="hover:text-surface-300 transition-colors">Ensino Médio</a>
                        <span>›</span>
                        <span className="text-surface-300">Itinerário 1</span>
                    </nav>

                    {/* Seção: Dados do Aluno */}
                    <section className="card p-6">
                        <h3 className="text-surface-100 font-semibold text-base mb-6 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold">1</span>
                            Dados do Aluno
                        </h3>
                        <FormAluno data={aluno} onChange={setAluno} />
                    </section>

                    {/* Seção: Notas */}
                    <section className="card p-6">
                        <h3 className="text-surface-100 font-semibold text-base mb-6 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold">2</span>
                            Notas por Componente Curricular
                        </h3>
                        <FormNotas notas={notas} onChange={setNotas} />
                    </section>

                    {/* Feedback */}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-400 flex-shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-400 flex-shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <p className="text-emerald-400 text-sm">
                                Certificado gerado com sucesso! O download foi iniciado automaticamente e uma cópia foi salva no seu <a href="/" className="underline font-bold">Dashboard</a>.
                            </p>
                        </div>
                    )}

                    {/* Ação */}
                    <div className="flex items-center justify-end gap-4 pt-2 pb-8">
                        <button
                            type="button"
                            onClick={() => { setAluno(INICIAL_ALUNO); setNotas({}); setError(''); setSuccess(false) }}
                            className="px-6 py-3 rounded-xl border border-surface-600 text-surface-400 hover:text-surface-200 hover:border-surface-500 transition-all duration-150 text-sm font-medium"
                        >
                            Limpar
                        </button>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleGerar}
                            className="btn-primary flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Gerando PDF...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                    Gerar Certificado PDF
                                </>
                            )}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    )
}

/**
 * FormNotas – Estrutura base modular para lançamento de notas
 * Arquitetura pronta para expansão futura.
 * Nesta versão: campos base de notas por componente curricular.
 */

// Componentes curriculares do Itinerário 1 – Ensino Médio (Set 2024 requested)
const COMPONENTES = [
    { id: 'lingua_portuguesa', label: 'Língua Portuguesa' },
    { id: 'lingua_inglesa', label: 'Língua Inglesa' },
    { id: 'arte', label: 'Arte' },
    { id: 'educacao_fisica', label: 'Educação Física' },
    { id: 'matematica', label: 'Matemática' },
    { id: 'fisica', label: 'Física' },
    { id: 'quimica', label: 'Química' },
    { id: 'biologia', label: 'Biologia' },
    { id: 'historia', label: 'História' },
    { id: 'geografia', label: 'Geografia' },
    { id: 'filosofia', label: 'Filosofia' },
    { id: 'sociologia', label: 'Sociologia' },
    { id: 'eletiva', label: 'Eletiva' },
    { id: 'projeto_vida', label: 'Projeto de Vida' },
    { id: 'estudo_orientado', label: 'Estudo Orientado' },
    { id: 'ciencia_tecnologia_saude', label: 'Ciência, Tecnologia & Saúde' },
    { id: 'do_micro_ao_macro', label: 'Do Micro Ao Macro: A Química Está Em Tudo?' },
    { id: 'que_haja_luz', label: 'Que Haja Luz!' },
]

const ANOS = ['1º Ano', '2º Ano', '3º Ano']

function MiniInput({ value, onChange, label, placeholder, tabIndex }) {
    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value || ''}
            tabIndex={tabIndex}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-surface-900 border border-surface-700 rounded-lg px-2 py-1.5 text-center
                 text-surface-100 text-xs placeholder-surface-600
                 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent
                 transition-all duration-150"
        />
    )
}

export default function FormNotas({ notas = {}, onChange }) {
    const handleField = (componenteId, ano, field, value) => {
        onChange({
            ...notas,
            [componenteId]: {
                ...(notas[componenteId] || {}),
                [ano]: {
                    ...(notas[componenteId]?.[ano] || { nota: '', faltas: '' }),
                    [field]: value,
                },
            },
        })
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-surface-700">
                        <th className="text-left py-3 pr-4 text-surface-400 font-medium w-48">
                            Componente Curricular
                        </th>
                        {ANOS.map((ano) => (
                            <th key={ano} className="py-3 px-3 text-center text-surface-400 font-medium min-w-[140px]">
                                {ano}
                                <div className="flex justify-around mt-1 text-[10px] uppercase tracking-wider opacity-60">
                                    <span>Nota</span>
                                    <span>Faltas</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {COMPONENTES.map((comp, compIdx) => (
                        <tr
                            key={comp.id}
                            className={`border-b border-surface-800 ${compIdx % 2 === 0 ? '' : 'bg-surface-900/30'}`}
                        >
                            <td className="py-3 pr-4 text-surface-300 font-medium">{comp.label}</td>
                            {ANOS.map((ano, anoIdx) => {
                                // Cálculo do tabIndex para ordem VERTICAL:
                                // Multiplicamos o índice do ano pelo total de matérias * 2 (nota + falta)
                                // Somamos o índice da matéria * 2
                                // E o offset do campo (0 para nota, 1 para faltas)
                                const baseIndex = (anoIdx * COMPONENTES.length * 2) + (compIdx * 2) + 1;

                                return (
                                    <td key={ano} className="py-3 px-3">
                                        <div className="flex gap-2">
                                            <MiniInput
                                                value={notas[comp.id]?.[ano]?.nota}
                                                placeholder="N"
                                                tabIndex={baseIndex}
                                                onChange={(v) => handleField(comp.id, ano, 'nota', v)}
                                            />
                                            <MiniInput
                                                value={notas[comp.id]?.[ano]?.faltas}
                                                placeholder="F"
                                                tabIndex={baseIndex + 1}
                                                onChange={(v) => handleField(comp.id, ano, 'faltas', v)}
                                            />
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

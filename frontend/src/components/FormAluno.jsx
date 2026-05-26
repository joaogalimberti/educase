import { useRef } from 'react'

/**
 * FormAluno – Formulário de dados do aluno
 * - TAB avança para próximo campo
 * - Data formata automaticamente (DD/MM/AAAA)
 * - CPF formata automaticamente (000.000.000-00)
 */
export default function FormAluno({ data, onChange }) {
    const refs = {
        nome: useRef(null),
        dataNascimento: useRef(null),
        cpf: useRef(null),
        nomeMae: useRef(null),
        nomePai: useRef(null),
        naturalCidade: useRef(null),
        naturalUF: useRef(null),
        nacionalidade: useRef(null),
        concluiuEm: useRef(null),
    }

    const order = [
        'nome', 'dataNascimento', 'cpf', 'nomeMae', 'nomePai',
        'naturalCidade', 'naturalUF', 'nacionalidade', 'concluiuEm',
    ]

    const focusNext = (currentKey) => {
        const idx = order.indexOf(currentKey)
        if (idx < order.length - 1) {
            refs[order[idx + 1]].current?.focus()
        }
    }

    const handleChange = (key, value) => {
        onChange({ ...data, [key]: value })
    }

    // Formata data DD/MM/AAAA em tempo real
    const formatDate = (raw) => {
        const digits = raw.replace(/\D/g, '').slice(0, 8)
        if (digits.length <= 2) return digits
        if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    }

    // Formata CPF 000.000.000-00
    const formatCPF = (raw) => {
        const digits = raw.replace(/\D/g, '').slice(0, 11)
        if (digits.length <= 3) return digits
        if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
        if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
    }

    const fields = [
        {
            key: 'nome',
            label: 'Nome do Aluno',
            placeholder: 'Nome completo',
            type: 'text',
            colSpan: 'col-span-2',
        },
        {
            key: 'dataNascimento',
            label: 'Data de Nascimento',
            placeholder: 'DD/MM/AAAA',
            type: 'text',
            inputMode: 'numeric',
            format: formatDate,
            onComplete: (v) => v.replace(/\D/g, '').length === 8,
        },
        {
            key: 'cpf',
            label: 'CPF',
            placeholder: '000.000.000-00',
            type: 'text',
            inputMode: 'numeric',
            format: formatCPF,
            onComplete: (v) => v.replace(/\D/g, '').length === 11,
        },
        {
            key: 'nomeMae',
            label: 'Nome da Mãe',
            placeholder: 'Nome completo da mãe',
            type: 'text',
            colSpan: 'col-span-2',
        },
        {
            key: 'nomePai',
            label: 'Nome do Pai',
            placeholder: 'Nome completo do pai',
            type: 'text',
            colSpan: 'col-span-2',
        },
        {
            key: 'naturalCidade',
            label: 'Natural de (Cidade)',
            placeholder: 'Cidade de nascimento',
            type: 'text',
        },
        {
            key: 'naturalUF',
            label: 'UF',
            placeholder: 'Ex: SP',
            type: 'text',
            maxLength: 2,
            style: { textTransform: 'uppercase' },
        },
        {
            key: 'nacionalidade',
            label: 'Nacionalidade',
            placeholder: 'Brasileira',
            type: 'text',
        },
        {
            key: 'concluiuEm',
            label: 'Concluiu em (Ano)',
            placeholder: 'Ex: 2024',
            type: 'text',
            inputMode: 'numeric',
            maxLength: 4,
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {fields.map((field) => (
                <div key={field.key} className={field.colSpan || ''}>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                        {field.label}
                    </label>
                    <input
                        ref={refs[field.key]}
                        id={`field-${field.key}`}
                        type={field.type}
                        inputMode={field.inputMode}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        value={data[field.key] || (field.key === 'nacionalidade' ? 'Brasileira' : '')}
                        style={field.style}
                        className="input-base"
                        onChange={(e) => {
                            const raw = e.target.value
                            const formatted = field.format ? field.format(raw) : raw
                            handleChange(field.key, formatted)
                            // Auto-avança quando campo completa
                            if (field.onComplete && field.onComplete(formatted)) {
                                focusNext(field.key)
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                focusNext(field.key)
                            }
                        }}
                    />
                </div>
            ))}
        </div>
    )
}

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = path.resolve(__dirname, '../templates')

/**
 * Formata uma data DD/MM/AAAA para "D de mês de YYYY" (mês em minúsculo)
 */
function formatarDataLongo(dataStr) {
    if (!dataStr || !dataStr.includes('/')) return dataStr
    const [dia, mes, ano] = dataStr.split('/')
    const meses = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ]
    const mesNome = meses[parseInt(mes, 10) - 1]
    if (!mesNome) return dataStr
    return `${parseInt(dia, 10)} de ${mesNome} de ${ano}`
}

/**
 * Converte valor para maiúsculo se for string
 */
function toUpper(val) {
    if (typeof val === 'string') return val.toUpperCase().trim()
    return val
}

/**
 * Gera um arquivo .docx a partir de um template e dados fornecidos.
 */
export async function gerarDoc(templateName, dados, outputPath) {
    const templatePath = path.join(TEMPLATES_DIR, templateName)
    console.log(`[DEBUG] Lendo template: ${templatePath}`)
    const content = fs.readFileSync(templatePath, 'binary')
    console.log(`[DEBUG] Template lido (${content.length} bytes). Criando zip...`)
    const zip = new PizZip(content)

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        errorLogging: false,
    })

    const shorthandMap = {
        lingua_portuguesa: 'LP',
        lingua_inglesa: 'LI',
        arte: 'AR',
        educacao_fisica: 'EF',
        matematica: 'MA',
        fisica: 'FI',
        quimica: 'QU',
        biologia: 'BI',
        historia: 'HI',
        geografia: 'GE',
        filosofia: 'FL',
        sociologia: 'SO',
        eletiva: 'EL',
        projeto_vida: 'PV',
        estudo_orientado: 'EO',
        ciencia_tecnologia_saude: 'CS',
        do_micro_ao_macro: 'MM',
        que_haja_luz: 'HL'
    }

    const anoSuffixMap = {
        '1º Ano': '1',
        '2º Ano': '2',
        '3º Ano': '3'
    }

    const flatNotas = {}

    // Lista exaustiva de componentes para inicializar com "*"
    const allComponents = [
        ...Object.keys(shorthandMap),
        'lingua_portuguesa', 'lingua_inglesa', 'arte', 'educacao_fisica', 'matematica',
        'fisica', 'quimica', 'biologia', 'historia', 'geografia', 'filosofia', 'sociologia',
        'eletiva', 'projeto_vida', 'estudo_orientado', 'ciencia_tecnologia_saude',
        'do_micro_ao_macro', 'que_haja_luz'
    ]

    // Inicializa todos os campos possíveis com "*" para evitar "undefined" no template
    allComponents.forEach(compId => {
        const sh = shorthandMap[compId] || compId.substring(0, 2).toUpperCase()
            ;['1', '2', '3'].forEach(suffix => {
                flatNotas[`N${sh}${suffix}`] = '*'
                flatNotas[`F${sh}${suffix}`] = '*'
            })
    })

    if (dados.notas) {
        Object.entries(dados.notas).forEach(([compId, anos]) => {
            const sh = shorthandMap[compId] || compId.substring(0, 2).toUpperCase()
            Object.entries(anos).forEach(([anoNome, valores]) => {
                const suffix = anoSuffixMap[anoNome]
                if (suffix) {
                    const notaRaw = valores.nota?.toString().trim()
                    const faltasRaw = valores.faltas?.toString().trim()

                    // Se for vazio, nulo ou a string 'undefined', coloca '*'
                    flatNotas[`N${sh}${suffix}`] = (notaRaw && notaRaw !== 'undefined' && notaRaw !== '') ? notaRaw : '*'
                    flatNotas[`F${sh}${suffix}`] = (faltasRaw && faltasRaw !== 'undefined' && faltasRaw !== '') ? faltasRaw : '*'
                }
            })
        })
    }

    const templateData = {
        nome: toUpper(dados.aluno?.nome || ''),
        data_nascimento: formatarDataLongo(dados.aluno?.dataNascimento || ''),
        cpf: dados.aluno?.cpf || '',
        nome_mae: toUpper(dados.aluno?.nomeMae || ''),
        nome_pai: toUpper(dados.aluno?.nomePai || ''),
        natural_cidade: toUpper(dados.aluno?.naturalCidade || ''),
        natural_uf: toUpper(dados.aluno?.naturalUF || ''),
        nacionalidade: toUpper(dados.aluno?.nacionalidade || 'BRASILEIRA'),
        concluiu_em: toUpper(dados.aluno?.concluiuEm || ''),
        tipo: toUpper(dados.tipo || ''),
        itinerario: toUpper(dados.itinerario || ''),
        data_emissao: formatarDataLongo(new Date().toLocaleDateString('pt-BR')),
        ...flatNotas,
    }

    console.log('[DEBUG] Renderizando documento docxtemplater...')
    try {
        doc.render(templateData)
    } catch (renderError) {
        console.error('[DEBUG] ERRO NO RENDER:', JSON.stringify(renderError))
        throw renderError
    }
    console.log('[DEBUG] Mocking doc render finalizado.')

    const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' })
    fs.writeFileSync(outputPath, buf)

    return outputPath
}

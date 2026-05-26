import path from 'path'
import { fileURLToPath } from 'url'
import { converterPdf } from '../services/converterPdf.js'
import { gerarDoc } from '../services/gerarDoc.js'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function test() {
    const docxPath = path.resolve(__dirname, '../tmp_test.docx')
    const pdfPath = path.resolve(__dirname, '../tmp_test.pdf')

    try {
        console.log('--- Iniciando Teste de Geração de Documento ---')
        await gerarDoc('certificado_modelo.docx', {
            aluno: { nome: 'Aluno de Teste' },
            notas: {},
            tipo: 'Teste',
            itinerario: '1'
        }, docxPath)
        console.log('DOCX gerado:', docxPath)

        console.log('--- Iniciando Teste de Conversão para PDF ---')
        await converterPdf(docxPath)

        if (fs.existsSync(pdfPath)) {
            console.log('SUCESSO: PDF gerado em', pdfPath)
        } else {
            console.error('ERRO: PDF não foi encontrado após conversão.')
        }

    } catch (err) {
        console.error('ERRO NO TESTE:', err)
    } finally {
        // Cleanup opcional para visualização manual se necessário
        // if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath)
        // if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath)
    }
}

test()

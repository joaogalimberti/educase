import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import fs from 'fs'
import os from 'os'

const execPromise = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Converte um arquivo .docx em .pdf usando Microsoft Word (no Windows) ou LibreOffice (no Linux/Render).
 *
 * @param {string} docxPath   - Caminho absoluto do arquivo .docx
 * @returns {Promise<string>} - Caminho absoluto do .pdf gerado
 */
export async function converterPdf(docxPath) {
    const pdfPath = docxPath.replace(/\.docx$/i, '.pdf')
    
    // Se estiver no Windows, tenta usar o Microsoft Word COM via PowerShell primeiro
    if (os.platform() === 'win32') {
        const scriptPath = path.join(__dirname, 'converter.ps1')
        try {
            console.log(`[Conversão - Windows] Tentando conversão via Microsoft Word COM...`)
            const command = `powershell -ExecutionPolicy Bypass -NoProfile -File "${scriptPath}" -docxPath "${docxPath}" -pdfPath "${pdfPath}"`
            console.log(`[DEBUG] Executando: ${command}`)
            
            const { stdout, stderr } = await execPromise(command, { timeout: 50000 })
            if (stdout) console.log(`[Word STDOUT]:\n${stdout}`)
            if (stderr) console.warn(`[Word STDERR]:\n${stderr}`)
            
            await new Promise(resolve => setTimeout(resolve, 2000))
            if (fs.existsSync(pdfPath)) {
                console.log(`[Conversão - Windows] PDF gerado com sucesso via Word: ${path.basename(pdfPath)}`)
                return pdfPath
            }
        } catch (wordErr) {
            console.warn(`[Conversão - Windows] Falha com Word COM: ${wordErr.message}. Tentando fallback para LibreOffice...`)
        }
    }

    // Se estiver no Linux (Render) ou se o Word COM falhar no Windows, usamos LibreOffice Headless
    try {
        console.log(`[Conversão - LibreOffice] Iniciando conversão headless...`)
        const libreOfficeCmd = process.env.LIBREOFFICE_PATH || 'soffice'
        const outputDir = path.dirname(docxPath)
        
        // Comando: soffice --headless --convert-to pdf --outdir <outdir> <docxPath>
        const command = `"${libreOfficeCmd}" --headless --convert-to pdf --outdir "${outputDir}" "${docxPath}"`
        console.log(`[DEBUG] Executando: ${command}`)
        
        const { stdout, stderr } = await execPromise(command, { timeout: 30000 })
        if (stdout) console.log(`[LibreOffice STDOUT]:\n${stdout}`)
        if (stderr) console.warn(`[LibreOffice STDERR]:\n${stderr}`)
        
        // Pequena pausa para garantir a liberação do arquivo pelo sistema
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        if (fs.existsSync(pdfPath)) {
            console.log(`[Conversão - LibreOffice] PDF gerado com sucesso: ${path.basename(pdfPath)}`)
            return pdfPath
        } else {
            throw new Error('O arquivo PDF final não foi encontrado no diretório de saída.')
        }
    } catch (err) {
        console.error('[Erro na Conversão PDF via LibreOffice]', err)
        const msg = err.killed ? 'Timeout na conversão (LibreOffice demorou demais)' : err.message
        throw new Error(`Falha ao converter DOCX para PDF (LibreOffice): ${msg}`)
    }
}

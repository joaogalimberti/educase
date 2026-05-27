import fs from 'fs'
import path from 'path'
import os from 'os'
import https from 'https'
import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import { gerarDoc } from '../services/gerarDoc.js'
import { converterPdf } from '../services/converterPdf.js'

// Força IPv4 nas requisições ao Supabase (evita erros de IPv6 no Render)
const ipv4Agent = new https.Agent({ family: 4 })
const fetchIPv4 = (url, options = {}) => fetch(url, { ...options, agent: ipv4Agent })

const router = Router()

// Validação preventiva das credenciais do Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERRO CRÍTICO: As variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não estão definidas!')
    console.error('Por favor, configure-as na aba "Environment" do seu painel do Render.')
    process.exit(1)
}

// Supabase Admin (service role) para bypass de RLS no storage e banco
// global: { fetch: fetchIPv4 } força IPv4 para evitar erros de conexão no Render
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { global: { fetch: fetchIPv4 } }
)

// ─── Middleware: valida JWT do usuário via Supabase Auth ──────────────────────
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação ausente.' })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' })
    }

    req.user = user
    next()
}

// ─── POST /api/certificados/gerar ────────────────────────────────────────────
router.post('/gerar', requireAuth, async (req, res) => {
    const { aluno, notas, tipo, itinerario } = req.body

    if (!aluno?.nome) {
        return res.status(400).json({ error: 'Dados do aluno incompletos.' })
    }

    const tmpDir = os.tmpdir()
    const timestamp = Date.now()
    const docxPath = path.join(tmpDir, `cert_${timestamp}.docx`)
    let pdfPath = null

    try {
        // 1. Gera o Word a partir do template
        await gerarDoc('certificado_modelo.docx', { aluno, notas, tipo, itinerario }, docxPath)

        // 2. Converte Word → PDF via Puppeteer
        pdfPath = await converterPdf(docxPath)

        // 3. RETORNA O PDF IMEDIATAMENTE PARA O CLIENTE
        if (pdfPath && fs.existsSync(pdfPath)) {
            let pdfBuffer;
            let retries = 5;
            while (retries > 0) {
                try {
                    pdfBuffer = fs.readFileSync(pdfPath)
                    break;
                } catch (readErr) {
                    console.warn(`[Read PDF] Tentativa falhou (${6 - retries}/5): ${readErr.message}`)
                    retries--;
                    if (retries === 0) throw readErr;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            console.log(`[HTTP] Enviando PDF: ${pdfBuffer.length} bytes`)
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `attachment; filename="certificado_${aluno.nome.replace(/\s+/g, '_')}.pdf"`)
            res.send(pdfBuffer)

            // 4. Tenta Firebase/Supabase Storage em BACKGROUND
            try {
                // Validação preventiva da key (se for a publishable correta, ela tem um formato específico, mas a service role é um JWT)
                if (process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('sb_publishable')) {
                    console.warn('⚠️ AVISO: A SUPABASE_SERVICE_ROLE_KEY parece ser uma chave pública (publishable). O upload pode falhar.')
                }

                const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'certificados'
                const storageKey = `${req.user.id}/${timestamp}_${aluno.nome.replace(/\s+/g, '_')}.pdf`

                console.log(`[Storage] Iniciando upload para o bucket "${bucket}"...`)
                const { error: uploadError } = await supabase.storage
                    .from(bucket)
                    .upload(storageKey, pdfBuffer, { contentType: 'application/pdf', upsert: false })

                if (uploadError) {
                    console.error('[Upload Storage Falhou - Silencioso]', uploadError.message)
                } else {
                    console.log('[Storage] Upload concluído. Salvando no histórico...')
                    const { error: dbError } = await supabase.from('historico').insert({
                        user_id: req.user.id,
                        aluno_nome: aluno.nome,
                        tipo,
                        itinerario,
                        storage_key: storageKey,
                        criado_em: new Date().toISOString(),
                    })
                    if (dbError) console.error('[DB Histórico Falhou]', dbError.message)
                    else console.log('[DB Histórico] Registro salvo com sucesso.')
                }
            } catch (bgError) {
                console.error('[Background Task Error]', bgError.message)
            }
        } else {
            throw new Error('O arquivo PDF não foi encontrado após a conversão.')
        }

    } catch (err) {
        console.error('[gerarCertificado Error]', err)
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Erro ao gerar certificado.',
                detail: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            })
        }
    } finally {
        // Limpa arquivos temporários de forma segura
        try {
            if (docxPath && fs.existsSync(docxPath)) fs.unlinkSync(docxPath)
            if (pdfPath && fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath)
        } catch (cleanupError) {
            console.warn('[Cleanup Error]', cleanupError.message)
        }
    }
})

// ─── GET /api/certificados/historico ─────────────────────────────────────────
router.get('/historico', requireAuth, async (req, res) => {
    const { data, error } = await supabase
        .from('historico')
        .select('*')
        .eq('user_id', req.user.id)
        .order('criado_em', { ascending: false })
        .limit(50)

    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
})

export default router

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import certificadoRouter from './controllers/certificadoController.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Captura erros fatais para evitar queda silenciosa do processo
process.on('uncaughtException', (err) => {
    console.error('❌ FATAL: Uncaught Exception:', err.message)
    console.error(err.stack)
    // Em produção, talvez queira avisar um serviço de monitoramento aqui
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ FATAL: Unhandled Rejection at:', promise, 'reason:', reason)
})

const app = express()
const PORT = process.env.PORT || 3001

// ─── Middlewares ────────────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    // URL do Render em produção (definida via variável de ambiente)
    process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        // Permite requisições sem origin (curl, Postman, same-origin no Docker)
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error(`CORS bloqueado para: ${origin}`))
    },
    credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Rotas ───────────────────────────────────────────────────────────────────
app.use('/api/certificados', certificadoRouter)

// ─── Frontend estático em Produção ───────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../frontend/dist')
    app.use(express.static(distPath))
    
    // Roteamento SPA: Qualquer rota não-API deve servir o index.html do React
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next()
        }
        res.sendFile(path.join(distPath, 'index.html'))
    })
}

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Rota não encontrada.' })
})

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[EducASE Error]', err)
    res.status(500).json({ error: 'Erro interno no servidor.', detail: err.message })
})

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ EducASE Backend rodando na porta ${PORT}`)
})

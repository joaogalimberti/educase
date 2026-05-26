import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
    baseURL: '/api',
    timeout: 60000, // 60s – LibreOffice conversion pode demorar
})

// Injeta o JWT do usuário logado em toda requisição
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
})

// Trata erros globais (ex: token expirado)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await supabase.auth.signOut()
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

export default api

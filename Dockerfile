# Use a imagem slim do Node.js como base
FROM node:20-slim

# Instala o LibreOffice, fontes básicas para acentuação e layout, e curl para healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    fonts-dejavu \
    fonts-liberation \
    fonts-freefont-ttf \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Cria o diretório de trabalho na imagem
WORKDIR /app

# Copia arquivos de dependência do root
COPY package*.json ./

# Instala as dependências do root
RUN npm install

# Copia arquivos de dependência do backend e instala
COPY backend/package*.json ./backend/
RUN npm install --prefix backend

# Copia arquivos de dependência do frontend e instala
COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend

# Copia o restante do código-fonte para a imagem
COPY . .

# ─── Build args para o Vite (variáveis VITE_* devem ser passadas em build time) ───
# O Vite embute essas variáveis no bundle estático — elas não existem em runtime.
# No Render, defina-as como "Environment Variables" com a opção "Available at build time".
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Compila o frontend React/Vite para gerar a pasta 'dist'
RUN npm run build --prefix frontend

# Expõe a porta que a aplicação Express rodará
EXPOSE 3001

# Variáveis de ambiente padrão em produção
ENV NODE_ENV=production
ENV PORT=3001
ENV LIBREOFFICE_PATH=soffice

# Comando de inicialização rodando o backend
CMD ["npm", "start", "--prefix", "backend"]

@echo off
echo ==========================================
echo [EducASE] Iniciando integracao com GitHub...
echo ==========================================

:: Inicializa o Git se não estiver inicializado
if not exist .git (
    echo [Git] Inicializando novo repositorio local...
    git init
)

:: Configura o remote origin
echo [Git] Configurando remote origin para https://github.com/joaogalimberti/educase.git ...
git remote remove origin 2>nul
git remote add origin https://github.com/joaogalimberti/educase.git

:: Garante a branch principal como main
git branch -M main

:: Adiciona arquivos ao Git
echo [Git] Adicionando arquivos...
git add .

:: Realiza o commit
echo [Git] Realizando commit...
git commit -m "feat: setup de deploy seguro no Render com Docker e LibreOffice"

:: Envia para o GitHub
echo [Git] Enviando alteracoes para a branch main do GitHub...
git push -u origin main

echo ==========================================
echo [EducASE] Processo de push finalizado!
echo ==========================================

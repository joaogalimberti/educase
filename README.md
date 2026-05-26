# EducASE – Sistema de Gestão de Documentos Acadêmicos

Sistema web privado para geração automática de certificados escolares com alta fidelidade.

## Stack Tecnológica

| Camada            | Tecnologia                                     |
|-------------------|------------------------------------------------|
| **Frontend**      | React + Vite + Tailwind CSS + Lucide React     |
| **Backend**       | Node.js + Express                              |
| **Auth + DB**     | Supabase (Auth + PostgreSQL + Storage)         |
| **Doc Gen**       | docxtemplater + pizzip                         |
| **Conversão PDF** | **Microsoft Word (COM Interop) + PowerShell**  |

---

## Timeline de Melhorias Recentes

### 🏆 Geração de Alta Fidelidade (Março 2026)
- **Fidelidade Total**: Migração da conversão de PDF (que antes usava LibreOffice/Puppeteer) para **Microsoft Word nativo via PowerShell**. Isso garante que o layout, as imagens e as tabelas do PDF sejam cópias exatas do modelo `.docx`.
- **Tratamento de Dados**: Implementação de lógica robusta para substituir notas ou faltas não preenchidas pelo símbolo `*`, eliminando o erro de campos exibindo `undefined`.
- **Layout Inteligente**: Otimização do fluxo para garantir que o certificado mantenha o padrão de 2 páginas do modelo original.

---

## Setup e Instalação

### Pré-requisitos
- **Node.js 20+**
- **Microsoft Word instalado** (Necessário para a conversão de alta fidelidade no Windows)
- **PowerShell** com permissão para execução de scripts (`Set-ExecutionPolicy Bypass`)
- Conta no [Supabase](https://supabase.com)

### 1. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Preencher VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Preencher SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.
npm run dev
```

---

## Estrutura do Projeto

```
educase/
├── frontend/
│   └── src/
│       ├── pages/         # Login, Dashboard, Certificados, EnsinoMedio
│       ├── components/    # Sidebar, Header, FormAluno, FormNotas
│       ├── services/      # supabase.js, api.js
└── backend/
    ├── controllers/       # certificadoController.js
    ├── services/          # gerarDoc.js, converterPdf.js, converter.ps1
    ├── templates/         # certificado_modelo.docx
    └── index.js
```

## Fluxo de Geração de Documentos

1. **Entrada**: O usuário preenche os dados do aluno e as notas no frontend.
2. **Processamento (gerarDoc)**:
   - Os dados são validados.
   - Campos vazios são preenchidos com `*`.
   - O `docxtemplater` injeta os dados no template `.docx`.
3. **Conversão (converterPdf)**:
   - O backend chama um script **PowerShell (`converter.ps1`)**.
   - O script utiliza a interface **COM do Microsoft Word** para abrir o documento e salvá-lo como PDF.
   - Isso garante que cores, escalas e fontes sejam preservadas 100%.
4. **Armazenamento**: O PDF é enviado para o **Supabase Storage**.
5. **Histórico**: Um registro é salvo na tabela `historico` do PostgreSQL.
6. **Entrega**: O link do PDF é retornado ao usuário para download imediato.

---

## Banco de Dados (Supabase)

Execute o SQL abaixo no SQL Editor:

```sql
-- Tabela de histórico de certificados
create table historico (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  aluno_nome text not null,
  tipo text,
  itinerario text,
  storage_key text,
  criado_em timestamptz default now()
);

-- RLS: somente o dono vê seus registros
alter table historico enable row level security;
create policy "historico_owner_only" on historico for all using (auth.uid() = user_id);
```

Crie um bucket chamado **`certificados`** no Storage.

---
© 2026 EducASE - Gestão Acadêmica Inteligente.

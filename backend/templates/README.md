# EducASE – Guia de Variáveis do Template (VERSÃO SIMPLIFICADA)

Use este guia para configurar seu arquivo `certificado_modelo.docx`. Como o espaço é reduzido, as variáveis agora têm no **máximo 4 caracteres**.

## 1. Dados Pessoais do Aluno
- `{nome}`: Nome completo
- `{data_nascimento}`: Data de nascimento
- `{cpf}`: CPF
- `{nome_mae}`: Nome da mãe
- `{nome_pai}`: Nome do pai
- `{natural_cidade}`: Cidade
- `{natural_uf}`: UF
- `{nacionalidade}`: Nacionalidade
- `{concluiu_em}`: Mês/Ano

## 2. Notas e Faltas (Padrão 4 Caracteres)
As variáveis seguem o padrão: `[Tipo][Sigla][Ano]`
- **Tipo**: `N` (Nota) ou `F` (Faltas)
- **Sigla**: 2 letras que identificam a matéria (veja tabela abaixo)
- **Ano**: `1`, `2` ou `3`

### Tabela de Siglas das Matérias:
| Matéria | Sigla | Nota (1º Ano) | Falta (1º Ano) |
| :--- | :---: | :---: | :---: |
| Língua Portuguesa | `LP` | `{NLP1}` | `{FLP1}` |
| Língua Inglesa | `LI` | `{NLI1}` | `{FLI1}` |
| Arte | `AR` | `{NAR1}` | `{FAR1}` |
| Educação Física | `EF` | `{NEF1}` | `{FEF1}` |
| Matemática | `MA` | `{NMA1}` | `{FMA1}` |
| Física | `FI` | `{NFI1}` | `{FFI1}` |
| Química | `QU` | `{NQU1}` | `{FQU1}` |
| Biologia | `BI` | `{NBI1}` | `{FBI1}` |
| História | `HI` | `{NHI1}` | `{FHI1}` |
| Geografia | `GE` | `{NGE1}` | `{FGE1}` |
| Filosofia | `FL` | `{NFL1}` | `{FFL1}` |
| Sociologia | `SO` | `{NSO1}` | `{FSO1}` |
| Eletiva | `EL` | `{NEL1}` | `{FEL1}` |
| Projeto de Vida | `PV` | `{NPV1}` | `{FPV1}` |
| Estudo Orientado | `EO` | `{NEO1}` | `{FEO1}` |
| Ciência, Tecnologia & Saúde | `CS` | `{NCS1}` | `{FCS1}` |
| Do Micro Ao Macro | `MM` | `{NMM1}` | `{FMM1}` |
| Que Haja Luz! | `HL` | `{NHL1}` | `{FHL1}` |

---
**Exemplo de uso no Word**:
Se você quer a nota de História do 2º ano, coloque: `{NHI2}`.
Se quer as faltas de Educação Física do 3º ano, coloque: `{FEF3}`.

## 3. Metadados
- `{tipo}`: Tipo (ex: ensino_medio)
- `{itinerario}`: Itinerário (ex: 1)
- `{data_emissao}`: Data atual (DD/MM/AAAA)

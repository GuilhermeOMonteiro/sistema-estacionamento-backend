# Sistema de Estacionamento - Backend (API)

Backend completo para um sistema de gestão de estacionamento, desenvolvido com Node.js, Express e PostgreSQL.

## Funcionalidades Core
- Controle de acesso com JWT (Admin/Operador)
- CRUD completo para gestão de Mensalistas
- Lógica de negócio para clientes avulsos, incluindo cálculo de preço e tolerâncias
- Logs de auditoria para ações críticas
- Endpoints de BI para relatórios financeiros e operacionais

## Tecnologias Utilizadas
- **Node.js**
- **Express.js**
- **PostgreSQL**
- **JSON Web Tokens (JWT)** para autenticação
- **Bcrypt** para hashing de senhas

## Pré-requisitos
- Node.js (v18+)
- PostgreSQL

## Como Rodar o Projeto
1. Clone o repositório: `git clone https://github.com/seu-usuario/sistema-estacionamento-backend.git`
2. Instale as dependências: `npm install`
3. Configure o banco de dados no PostgreSQL (crie o banco `estacionamento_db`).
4. Crie um arquivo `.env` na raiz, baseado no arquivo `.env.example` (que vamos criar).
5. Rode o servidor: `npm start` (ou `node src/app.js`)

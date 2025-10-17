# Atividade Aula 05

API RESTful para sistema de geração de provas automáticas desenvolvida durante a disciplina de Desenvolvimento Back-End (WEB II).

## 📚 Sobre o Projeto



Sistema acadêmico que permite:

- Gerenciamento de usuários (professores/administradores)
- Cadastro de disciplinas
- Banco de questões para geração de provas

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados (via Neon.com)
- **Vitest** - Framework de testes
- **ESLint + Prettier** - Padronização de código

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js 18+ instalado
- Conta no [Neon.com](https://neon.com) (banco PostgreSQL gratuito)
- Git instalado

### Passo a Passo

1. **Clone o repositório**

```bash
git clone https://github.com/arthurfporto/25-webii.git
cd 25-webii
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env e adicione sua DATABASE_URL do Neon.com
# DATABASE_URL="postgresql://usuario:senha@host/database"
```

4. **Acesse a branch atividade-aula-05**

```bash
git checkout -b atividade-aula-05
```

5. **Execute as migrations do banco de dados**

```bash
npx prisma migrate dev
```

6 . **Implemente o CRUD para Subject e Questions**

## 🧪 Executar Testes

```bash
# Todos os testes
npm test
```

## 📁 Estrutura do Projeto

```text
25-webii/
├── prisma/
│ ├── migrations/ # Migrations do banco de dados
│ └── schema.prisma # Schema do Prisma
├── src/
│ ├── config/
│ │ └── database.js # Configuração do Prisma Client
│ ├── controllers/ # Controllers (lógica de requisição/resposta)
│ ├── services/ # Services (regras de negócio)
│ ├── routes/ # Definição de rotas
│ └── server.js # Arquivo principal do servidor
├── tests/ # Testes automatizados
│ ├── setup.js
│ ├── users.test.js
│ ├── subjects.test.js
│ └── questions.test.js
├── .env.example # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

## 📊 Modelos de Dados

### User (Usuário)

- id, nome, email, senha, foto, papel, createdAt, updatedAt

### Subject (Disciplina)

- id, nome, ativa, professorId, createdAt, updatedAt

### Question (Questão)

- id, enunciado, dificuldade, respostaCorreta, disciplinaId, autorId, ativa, createdAt, updatedAt

## 🎯 Endpoints da API

### Usuários

- `GET /users` - Lista todos os usuários
- `GET /users/:id` - Busca usuário por ID
- `POST /users` - Cria novo usuário
- `PUT /users/:id` - Atualiza usuário
- `DELETE /users/:id` - Remove usuário

### Disciplinas

- `GET /subjects` - Lista todas as disciplinas
- `GET /subjects/:id` - Busca disciplina por ID
- `POST /subjects` - Cria nova disciplina
- `PUT /subjects/:id` - Atualiza disciplina
- `DELETE /subjects/:id` - Remove disciplina

### Questões

- `GET /questions` - Lista todas as questões
- `GET /questions/:id` - Busca questão por ID
- `POST /questions` - Cria nova questão
- `PUT /questions/:id` - Atualiza questão
- `DELETE /questions/:id` - Remove questão

## 🔧 Comandos Úteis

```bash
# Gerar Prisma Client
npx prisma generate

# Abrir Prisma Studio (interface visual do banco)
npx prisma studio

# Verificar formatação de código
npm run format:check

# Corrigir formatação automaticamente
npm run format

# Verificar problemas de lint
npm run lint

# Corrigir problemas de lint automaticamente
npm run lint:fix
```

## 👨‍🏫 Autor

**Arthur Porto**

- GitHub: [@arthurfporto](https://github.com/arthurfporto)

## 📄 Licença

Este projeto está sob a licença MIT.

---

Desenvolvido durante a disciplina de Desenvolvimento Back-End (WEB II) 🚀

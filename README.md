# NeedUK Next.js

Uma plataforma de conexão entre estudantes e empresas para oportunidades de estágio e emprego.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Better Auth** - Autenticação
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados (Supabase)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Git

## 🛠️ Configuração do Projeto

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd needuk-next
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp exampleENV.txt .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
# SUPABASE DB
DATABASE_URL="postgresql://usuario:senha@host:porta/database"
DIRECT_URL="postgresql://usuario:senha@host:porta/database"

# BETTER AUTH
BETTER_AUTH_SECRET="sua-chave-secreta-super-segura-aqui"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_URL="http://localhost:3000"
```

### 4. Configure o banco de dados

Execute as migrações do Prisma:

```bash
npx prisma generate
npx prisma db push
```

### 5. Execute o projeto

```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 👥 Tipos de Usuário

### 🎓 Aluno
- Cadastro com CPF obrigatório
- Informações acadêmicas (curso, universidade, período)
- Acesso a planos pagos

### 🏢 Recrutador
- Cadastro com CPF ou CNPJ
- Informações da empresa
- Busca por talentos

### 🎓 Gestor Universitário
- Cadastro com CPF ou CNPJ
- Informações da universidade
- Gestão de parcerias

## 🔐 Autenticação

O projeto usa **Better Auth** para autenticação:

- **Login/Logout** automático
- **Proteção de rotas** baseada em sessão
- **Redirecionamentos** inteligentes:
  - Usuário logado → Dashboard
  - Usuário não logado → Login/Home

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── dashboard/          # Dashboard do usuário
│   ├── login/              # Página de login
│   ├── signup/             # Página de cadastro
│   ├── api/auth/           # Rotas de autenticação
│   └── page.tsx            # Página inicial
├── lib/
│   ├── auth.ts             # Configuração do Better Auth
│   ├── auth-client.ts      # Cliente de autenticação
│   └── prisma.ts           # Cliente do Prisma
└── generated/prisma/       # Cliente Prisma gerado
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm run start

# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações
npx prisma db push

# Abrir Prisma Studio
npx prisma studio
```

## 🔧 Comandos Úteis

### Prisma
```bash
# Ver status das migrações
npx prisma migrate status

# Reset do banco (CUIDADO!)
npx prisma migrate reset

# Visualizar dados
npx prisma studio
```

### Desenvolvimento
```bash
# Limpar cache do Next.js
rm -rf .next

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licença

---

**Desenvolvido com ❤️ para conectar talentos e oportunidades**
# NeedUK - Plataforma de Conexão Profissional

Uma plataforma completa para conectar estudantes, empresas e universidades, facilitando oportunidades de estágio, emprego e parcerias educacionais.

## ✨ Funcionalidades

- 🔐 **Sistema de Autenticação Seguro** - Login/Registro com múltiplos tipos de usuário
- 👤 **Perfis Completos** - Gestão de perfil com foto, dados pessoais e informações específicas
- 📊 **Dashboard Personalizado** - Interface adaptada por tipo de usuário
- 📱 **Design Responsivo** - Experiência otimizada para desktop e mobile
- 🖼️ **Upload de Imagens** - Sistema de upload de fotos de perfil
- 🎯 **Sistema de Planos** - Estrutura preparada para planos premium

## 🚀 Tecnologias Utilizadas

- **Next.js 15.5.3** - Framework React com App Router
- **React 19.1.0** - Biblioteca para interfaces de usuário
- **TypeScript 5.9.2** - Superset JavaScript com tipagem estática
- **Tailwind CSS 4.0** - Framework CSS utilitário
- **Better Auth 1.3.13** - Sistema de autenticação completo
- **Prisma 6.16.2** - ORM moderno para banco de dados
- **PostgreSQL** - Banco de dados relacional (via Supabase)
- **Zod 4.1.11** - Validação de dados TypeScript-first
- **Lucide React** - Biblioteca de ícones

## 📋 Pré-requisitos

- **Node.js 18+**
- **npm** ou **yarn**
- **Conta no Supabase** (para banco de dados)
- **Git**

## 🛠️ Instalação e Configuração

### 1. Clone o Repositório
```bash
git clone <url-do-repositorio>
cd needuk-next
```

### 2. Instale as Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp exampleENV.txt .env.local
```

Edite o arquivo `.env.local` com suas configurações do Supabase:

```env
# SUPABASE DATABASE
DATABASE_URL="postgresql://usuario:senha@host:porta/database"
DIRECT_URL="postgresql://usuario:senha@host:porta/database"

# BETTER AUTH
BETTER_AUTH_SECRET="sua-chave-secreta-super-segura-aqui"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_URL="http://localhost:3000"
```

### 4. Configure o Banco de Dados

Gere o cliente Prisma e aplique as migrações:

```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações no banco
npx prisma db push
```

### 5. Execute o Projeto

```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 👥 Tipos de Usuário

### 🎓 **Aluno**
- **Cadastro:** CPF obrigatório
- **Informações Específicas:**
  - Dados acadêmicos (curso, universidade, período)
  - Competências e habilidades
- **Acesso:** Planos premium para visibilidade aumentada
- **Objetivo:** Encontrar oportunidades de estágio e emprego

### 🏢 **Recrutador**
- **Cadastro:** CPF ou CNPJ
- **Informações Específicas:**
  - Dados da empresa (nome, cargo, setor)
  - Informações de contato profissional
- **Acesso:** Ferramentas de busca e recrutamento
- **Objetivo:** Encontrar talentos qualificados

### 🎓 **Gestor Universitário**
- **Cadastro:** CPF ou CNPJ
- **Informações Específicas:**
  - Dados da instituição (universidade, departamento, cargo)
  - Informações acadêmicas e administrativas
- **Acesso:** Gestão de parcerias e convênios
- **Objetivo:** Facilitar conexões entre academia e empresas

## 🔐 Sistema de Autenticação

O projeto utiliza **Better Auth** para um sistema de autenticação robusto e seguro:

### Funcionalidades de Autenticação:
- ✅ **Registro e Login** com validação de dados
- ✅ **Sessões Seguras** com tokens JWT
- ✅ **Proteção de Rotas** baseada em estado de autenticação
- ✅ **Redirecionamentos Inteligentes:**
  - Usuário autenticado → `/dashboard`
  - Usuário não autenticado → `/` (home)
- ✅ **Logout Seguro** com limpeza de sessão

### Segurança:
- Criptografia de senhas
- Tokens de acesso temporários
- Validação de sessão em tempo real
- Proteção contra ataques CSRF

## 📁 Estrutura do Projeto

```
needuk-next/
├── src/
│   ├── app/
│   │   ├── _components/           # Componentes globais reutilizáveis
│   │   │   ├── AuthLoadingScreen.tsx
│   │   │   ├── footer.tsx
│   │   │   └── logo.tsx
│   │   ├── activities/            # Página de atividades (em desenvolvimento)
│   │   │   └── page.tsx
│   │   ├── api/                   # Rotas da API
│   │   │   ├── auth/[...all]/     # Rotas de autenticação Better Auth
│   │   │   └── profile/           # API de gerenciamento de perfil
│   │   │       ├── route.ts
│   │   │       └── upload-image/
│   │   ├── dashboard/             # Dashboard do usuário
│   │   │   ├── _components/       # Componentes específicos do dashboard
│   │   │   └── page.tsx
│   │   ├── login/                 # Página de login
│   │   │   ├── _components/
│   │   │   └── page.tsx
│   │   ├── profile/               # Página de perfil
│   │   │   ├── _components/       # Componentes do formulário de perfil
│   │   │   └── page.tsx
│   │   ├── signup/                # Página de cadastro
│   │   │   ├── _components/
│   │   │   └── page.tsx
│   │   ├── globals.css            # Estilos globais Tailwind
│   │   ├── layout.tsx             # Layout raiz da aplicação
│   │   └── page.tsx               # Página inicial (landing page)
│   ├── generated/prisma/          # Cliente Prisma gerado automaticamente
│   ├── hooks/                     # Hooks customizados React
│   │   └── useAuth.ts             # Hook para redirecionamento baseado em auth
│   └── lib/                       # Utilitários e configurações
│       ├── auth.ts                # Configuração Better Auth
│       ├── auth-client.ts         # Cliente de autenticação
│       └── prisma.ts              # Cliente Prisma
├── prisma/
│   ├── migrations/                # Migrações do banco de dados
│   └── schema.prisma              # Schema do banco de dados
├── public/                        # Arquivos estáticos
│   ├── home/                      # Imagens da landing page
│   └── *.png/svg                  # Logo e ícones
├── exampleENV.txt                 # Exemplo de variáveis de ambiente
├── next.config.ts                 # Configuração Next.js
├── package.json                   # Dependências e scripts
├── tailwind.config.*              # Configuração Tailwind CSS
├── tsconfig.json                  # Configuração TypeScript
└── README.md                      # Este arquivo
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Executa aplicação em produção

# Banco de Dados (Prisma)
npx prisma generate  # Gera cliente Prisma
npx prisma db push   # Aplica migrações no banco
npx prisma studio    # Abre interface gráfica do banco

# Desenvolvimento Avançado
npx prisma migrate status    # Status das migrações
npx prisma migrate reset     # Reset do banco (CUIDADO!)
npx prisma db seed          # Popular banco com dados de teste
```

## 🔧 Comandos Úteis para Desenvolvimento

### 🗄️ **Banco de Dados**
```bash
# Verificar status das migrações
npx prisma migrate status

# Resetar banco de dados (ATENÇÃO: perde todos os dados)
npx prisma migrate reset

# Visualizar e editar dados graficamente
npx prisma studio

# Gerar novas migrações após alterar schema.prisma
npx prisma migrate dev --name nome-da-migracao
```

### 🧹 **Limpeza e Manutenção**
```bash
# Limpar cache do Next.js
rm -rf .next
# ou (Windows)
rd /s /q .next

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Limpar cache npm
npm cache clean --force
```

### 🔍 **Debugging**
```bash
# Ver logs detalhados do Next.js
DEBUG=* npm run dev

# Build com análise de bundle
ANALYZE=true npm run build
```

## 📊 Modelo de Dados

O banco de dados utiliza PostgreSQL com as seguintes entidades principais:

### **User** (Usuário)
- Dados pessoais (nome, email, telefone, endereço)
- Tipo de usuário (aluno/recrutador/gestor)
- Campos específicos por tipo
- Sistema de planos (free/plus/premium/pro)

### **Session** (Sessão)
- Controle de sessões ativas
- Segurança com tokens
- Rastreamento de IP e user agent

### **Account** (Conta)
- Integração com provedores OAuth
- Tokens de acesso e refresh

### **Verification** (Verificação)
- Sistema de verificação de email
- Tokens temporários

## 🔄 Próximas Funcionalidades

- [ ] Sistema de atividades e tarefas
- [ ] Matching entre alunos e empresas
- [ ] Sistema de notificações
- [ ] Integração com LinkedIn
- [ ] Dashboard com estatísticas avançadas
- [ ] Sistema de mensagens
- [ ] Avaliações e reviews

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ para conectar talentos e oportunidades educacionais**
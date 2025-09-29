# NeedUK - Plataforma de Conexão Profissional

Micro-SaaS para conectar estudantes, empresas e universidades, facilitando oportunidades de estágio, emprego e parcerias educacionais através de um sistema avançado de atividades colaborativas.

## ✨ Funcionalidades Principais

### 🔐 **Sistema de Autenticação Seguro**
- Login/Registro com múltiplos tipos de usuário
- Sessões seguras com JWT
- Proteção de rotas baseada em autenticação
- Redirecionamentos inteligentes

### 👤 **Gestão de Perfis Completa**
- Perfis personalizados por tipo de usuário (Aluno/Recrutador/Gestor)
- Upload de fotos de perfil (MANUTENÇÃO)
- Dados pessoais e profissionais completos
- Sistema de medalhas e conquistas

### 📊 **Dashboard Personalizado**
- Interface adaptada por tipo de usuário
- Navegação responsiva com sidebar
- Sistema de notificações em tempo real
- Estatísticas e métricas (em desenvolvimento)

### 🏆 **Sistema de Medalhas**
- Medalhas de Ouro, Prata e Bronze
- Concessão automática e manual
- Contadores permanentes no perfil
- Notificações de conquistas

### 📋 **Sistema de Atividades Colaborativas**
- **Criação de Atividades**: Projetos, tarefas e iniciativas
- **Gestão de Participantes**: Convites por email, aceitação/rejeição
- **Sistema de Liderança**: Transferência de liderança entre participantes
- **Observações**: Comentários e progresso das atividades
- **Links Úteis**: Compartilhamento de recursos relacionados
- **Permissões Hierárquicas**: Líder vs Participantes

### 🔔 **Sistema de Notificações**
- Notificações em tempo real
- Tipos: convites, medalhas, atualizações de atividades
- Marcação de lidas/não lidas
- Limpeza automática (1h após leitura)

### 📱 **Design Totalmente Responsivo**
- Experiência otimizada para desktop, tablet e mobile
- Menus adaptativos e dropdowns inteligentes
- Layouts flexíveis e breakpoints adequados

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

## 📄 **Páginas e Funcionalidades Detalhadas**

### 🏠 **Página Inicial** (`/`)
- Landing page institucional
- Apresentação da plataforma
- Call-to-actions para cadastro/login

### 🔐 **Autenticação**
#### **Login** (`/login`)
- Formulário de acesso com email/senha
- Validação em tempo real
- Links para recuperação de senha
- Redirecionamento automático após login

#### **Cadastro** (`/signup`)
- Formulário multi-etapa (3 passos)
- Validação de CPF/CNPJ
- Campos específicos por tipo de usuário
- Confirmação de email

### 📊 **Dashboard** (`/dashboard`)
- **Visão Geral**: Cards com estatísticas (em desenvolvimento)
- **Navegação**: Menu lateral responsivo com itens filtrados por tipo de usuário
- **Notificações**: Dropdown com notificações em tempo real, contadores de não lidas
- **Menu do Usuário**: Perfil, configurações e logout

### 👤 **Perfil** (`/profile`)
- **Visualização**: Dados pessoais e específicos do tipo de usuário
- **Edição**: Formulário completo para atualização de dados
- **Upload de Foto**: Sistema de upload de imagem de perfil(MANUTENÇÃO)
- **Medalhas**: Exibição de conquistas (Ouro/Prata/Bronze)

### 📋 **Sistema de Atividades**

#### **Lista de Atividades** (`/activities`)
- **Visualização**: Grid responsivo de atividades
- **Filtros**: Por tipo (criadas/participando), status (pendente/concluída)
- **Busca**: Busca por título/descrição
- **Ações**: Ver, editar (líder), abandonar (participante)
- **Criação**: Botão para nova atividade

#### **Criar Atividade** (`/activities/create`)
- **Informações Básicas**: Título obrigatório, descrição opcional
- **Datas**: Início obrigatório, fim opcional
- **Participantes**: Adição/removação de emails para convite
- **Links**: Adição de recursos relacionados
- **Validação**: Campos obrigatórios e formatos

#### **Visualizar Atividade** (`/activities/[id]`)
- **Informações**: Título, descrição, datas, status
- **Participantes**: Lista com papéis (Criador/Líder/Membro)
- **Observações**:
  - Lista de comentários cronológicos
  - Adição de novas observações (todos os participantes)
  - **Exclusão**: Autor pode deletar própria observação, líder pode deletar todas
- **Links**: Recursos compartilhados, exclusão individual
- **Ações do Líder**: Editar, transferir liderança, excluir atividade
- **Ações do Participante**: Abandonar atividade
- **Ações do Gestor**: Conceder medalhas aos alunos

#### **Editar Atividade** (`/activities/[id]/edit`)
- **Modificação**: Título, descrição, datas
- **Convites**: Adicionar novos participantes por email
- **Links**: Gerenciar recursos da atividade
- **Permissões**: Apenas o líder pode editar

### 🔔 **Sistema de Notificações**
- **Tipos de Notificação**:
  - `invitation`: Convites para atividades
  - `medal`: Conquistas de medalhas
  - `activity_update`: Atualizações em atividades
- **Gestão**: Marcar como lida, contadores automáticos
- **Limpeza**: Script automático remove notificações lidas há 1h

## 👥 **Tipos de Usuário e Permissões**

### 🎓 **Aluno**
- **Cadastro**: CPF obrigatório, dados acadêmicos
- **Atividades**: Participar, criar observações, receber medalhas
- **Medalhas**: Receber conquistas por participação
- **Notificações**: Convites, medalhas, atualizações

### 🏢 **Recrutador**
- **Cadastro**: CPF/CNPJ, dados empresariais
- **Atividades**: Criar, liderar, gerenciar participantes
- **Permissões**: Controle total sobre atividades próprias
- **Convites**: Enviar convites para potenciais membros

### 🎓 **Gestor Universitário**
- **Cadastro**: CPF/CNPJ, dados institucionais
- **Atividades**: Criar, liderar, gerenciar participantes
- **Medalhas**: Conceder medalhas aos alunos participantes
- **Moderação**: Controle sobre conteúdo das atividades

### 🔑 **Sistema de Permissões por Atividade**
```
👑 LÍDER (Criador ou Transferido):
├── ✅ Criar/editar atividade
├── ✅ Convidar participantes
├── ✅ Transferir liderança
├── ✅ Excluir atividade
├── ✅ Deletar QUALQUER observação
├── ✅ Gerenciar links
└── ✅ Conceder medalhas (Gestor)

👤 PARTICIPANTE:
├── ✅ Adicionar observações
├── ✅ Deletar PRÓPRIA observação
├── ✅ Visualizar conteúdo
└── ✅ Abandonar atividade
```

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

## 📁 **Estrutura do Projeto**

```
needuk-next/
├── src/
│   ├── app/
│   │   ├── _components/           # Componentes globais reutilizáveis
│   │   │   ├── AuthLoadingScreen.tsx
│   │   │   ├── footer.tsx
│   │   │   └── logo.tsx
│   │   ├── activities/            # Sistema completo de atividades
│   │   │   ├── [id]/
│   │   │   │   ├── edit/          # Edição de atividades
│   │   │   │   └── page.tsx       # Visualização detalhada
│   │   │   ├── create/            # Criação de atividades
│   │   │   └── page.tsx           # Lista de atividades
│   │   ├── api/                   # Rotas da API
│   │   │   ├── activities/        # APIs de atividades
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── invite/    # Convites
│   │   │   │   │   ├── leave/     # Abandonar atividade
│   │   │   │   │   ├── links/     # Gerenciamento de links
│   │   │   │   │   ├── observations/ # Observações
│   │   │   │   │   │   └── [observationId]/ # Deletar observação
│   │   │   │   │   ├── participants/ # Participantes
│   │   │   │   │   ├── transfer-leadership/ # Transferir liderança
│   │   │   │   │   └── route.ts    # CRUD atividade
│   │   │   │   └── route.ts        # Listar atividades
│   │   │   ├── auth/[...all]/     # Better Auth (autenticação)
│   │   │   ├── invitations/[id]/  # Responder convites
│   │   │   │   └── respond/
│   │   │   ├── medals/            # Sistema de medalhas
│   │   │   │   ├── award/         # Conceder medalhas
│   │   │   │   └── route.ts       # Listar medalhas
│   │   │   ├── notifications/     # Sistema de notificações
│   │   │   │   ├── cleanup/       # Limpeza automática
│   │   │   │   └── route.ts       # CRUD notificações
│   │   │   ├── profile/           # Perfil do usuário
│   │   │   │   ├── route.ts
│   │   │   │   └── upload-image/
│   │   │   └── users/[id]/        # Medalhas do usuário
│   │   │       └── medals/
│   │   ├── dashboard/             # Dashboard do usuário
│   │   │   ├── _components/       # Componentes do dashboard
│   │   │   │   ├── dashboard-layout.tsx
│   │   │   │   ├── button-signout.tsx
│   │   │   │   └── index.ts
│   │   │   └── page.tsx
│   │   ├── login/                 # Página de login
│   │   ├── profile/               # Página de perfil
│   │   ├── signup/                # Página de cadastro
│   │   ├── globals.css            # Estilos globais Tailwind
│   │   ├── layout.tsx             # Layout raiz da aplicação
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   └── ui/                    # Componentes reutilizáveis
│   │       ├── Input.tsx          # Input customizado
│   │       ├── Button.tsx         # Botão customizado
│   │       ├── FormError.tsx      # Exibição de erros
│   │       ├── Modal.tsx          # Modal base
│   │       └── index.ts           # Exportações
│   ├── constants/                 # Constantes da aplicação
│   │   ├── styles.ts              # Classes CSS reutilizáveis
│   │   ├── messages.ts            # Mensagens padronizadas
│   │   ├── validation.ts          # Regras de validação
│   │   └── index.ts               # Exportações
│   ├── generated/prisma/          # Cliente Prisma gerado
│   ├── hooks/                     # Hooks customizados React
│   │   ├── custom/                # Hooks específicos
│   │   │   ├── useAuth.ts         # Autenticação
│   │   │   ├── useFormValidation.ts # Validação de formulários
│   │   │   ├── useApi.ts          # Chamadas API
│   │   │   └── index.ts
│   │   └── useAuth.ts             # Hook principal de auth
│   └── lib/                       # Utilitários e configurações
│       ├── auth.ts                # Configuração Better Auth
│       ├── auth-client.ts         # Cliente de autenticação
│       ├── prisma.ts              # Cliente Prisma
│       └── utils/                 # Utilitários organizados
│           ├── auth-middleware.ts # Middleware de autenticação
│           ├── validation-helpers.ts # Helpers de validação
│           ├── response-helpers.ts # Helpers de resposta API
│           ├── prisma-selects.ts  # Selects comuns do Prisma
│           ├── notification-cleanup.ts # Limpeza de notificações
│           └── index.ts           # Exportações
├── prisma/
│   ├── migrations/                # Migrações do banco
│   └── schema.prisma              # Schema do banco
├── public/
│   ├── home/                      # Imagens da landing
│   ├── uploads/
│   │   └── profiles/              # Fotos de perfil
│   └── *.png/svg                  # Logo e ícones
├── src/
│   ├── scripts/
│   │   └── cleanup-notifications.ts # Script de limpeza
│   └── types/                     # Tipos TypeScript (se houver)
├── exampleENV.txt                 # Exemplo de variáveis
├── next.config.ts                 # Configuração Next.js
├── package.json                   # Dependências e scripts
├── tailwind.config.*              # Configuração Tailwind
├── tsconfig.json                  # Configuração TypeScript
└── README.md                      # Este arquivo
```

## 🔌 **APIs Implementadas**

### **Sistema de Atividades**
- `GET /api/activities` - Lista atividades do usuário
- `GET /api/activities/[id]` - Detalhes de uma atividade
- `POST /api/activities/[id]` - Criar nova atividade
- `PUT /api/activities/[id]` - Atualizar atividade
- `DELETE /api/activities/[id]` - Excluir atividade

### **Participantes e Convites**
- `POST /api/activities/[id]/invite` - Convidar participantes
- `DELETE /api/activities/[id]/leave` - Abandonar atividade
- `PUT /api/activities/[id]/transfer-leadership` - Transferir liderança
- `POST /api/invitations/[id]/respond` - Responder convite

### **Observações**
- `GET /api/activities/[id]/observations` - Listar observações
- `POST /api/activities/[id]/observations` - Criar observação
- `DELETE /api/activities/[id]/observations/[observationId]` - Deletar observação

### **Links e Recursos**
- `GET /api/activities/[id]/links` - Listar links
- `POST /api/activities/[id]/links` - Adicionar link
- `DELETE /api/activities/[id]/links/[linkId]` - Remover link

### **Sistema de Medalhas**
- `GET /api/medals` - Listar tipos de medalha
- `POST /api/medals/award` - Conceder medalha
- `GET /api/users/[id]/medals` - Medalhas de um usuário

### **Notificações**
- `GET /api/notifications` - Listar notificações do usuário
- `PUT /api/notifications` - Marcar notificação como lida
- `DELETE /api/notifications/cleanup` - Limpeza automática (autenticada)

### **Perfil e Usuário**
- `GET /api/profile` - Dados do perfil
- `PUT /api/profile` - Atualizar perfil
- `POST /api/profile/upload-image` - Upload de foto

## 🚀 **Scripts Disponíveis**

```bash
# Desenvolvimento
npm run dev                    # Inicia servidor de desenvolvimento
npm run build                  # Build para produção
npm run start                  # Executa aplicação em produção

# Banco de Dados (Prisma)
npx prisma generate           # Gera cliente Prisma
npx prisma db push            # Aplica migrações no banco
npx prisma studio             # Abre interface gráfica do banco

# Manutenção
npm run cleanup:notifications # Limpa notificações lidas há 1h+

# Desenvolvimento Avançado
npx prisma migrate status     # Status das migrações
npx prisma migrate reset      # Reset do banco (CUIDADO!)
npx prisma db seed           # Popular banco com dados de teste
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

## 📊 **Modelo de Dados**

O banco de dados utiliza PostgreSQL com as seguintes entidades principais:

### **User** (Usuário)
- **Dados Pessoais**: nome, email, telefone, endereço, CEP, cidade, estado
- **Autenticação**: senha criptografada, email verificado
- **Tipo de Usuário**: 'aluno', 'recrutador', 'gestor'
- **Campos Específicos**:
  - Aluno: CPF, curso, universidade, período
  - Recrutador: CPF/CNPJ, nome empresa, cargo, setor
  - Gestor: CPF/CNPJ, nome universidade, departamento, cargo
- **Sistema de Medalhas**: contadores de ouro, prata, bronze
- **Plano**: 'free', 'plus', 'premium', 'pro'

### **Activity** (Atividade)
- **Informações Básicas**: título, descrição, status ('pending'/'completed')
- **Datas**: startDate (obrigatório), endDate (opcional)
- **Relacionamentos**: createdBy, leaderId (transferível)
- **Contadores**: participantes, observações, links

### **ActivityParticipant** (Participante)
- **Relações**: atividade e usuário
- **Papéis**: role (ex: 'Líder', 'Sem cargo')
- **Data**: joinedAt (quando entrou)

### **ActivityInvitation** (Convite)
- **Convite**: email do convidado, status ('pending'/'accepted'/'declined')
- **Rastreamento**: quem convidou, quando aceitou

### **ActivityObservation** (Observação)
- **Comentários**: conteúdo do comentário
- **Relacionamentos**: atividade, usuário autor
- **Auditoria**: createdAt, updatedAt

### **ActivityLink** (Link)
- **Recursos**: título e URL do link
- **Contexto**: relacionado a uma atividade

### **Notification** (Notificação)
- **Conteúdo**: tipo, título, mensagem
- **Estado**: lida/não lida, data de leitura
- **Tipos**: 'invitation', 'medal', 'activity_update'

### **Session/Account/Verification** (Autenticação)
- **Session**: controle de sessões ativas, segurança
- **Account**: integração OAuth, tokens de acesso
- **Verification**: verificação de email, tokens temporários

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🏗️ **Arquitetura e Boas Práticas**

### **Padrões Implementados**
- **Clean Architecture**: Separação clara entre camadas (UI/API/Business/Data)
- **SOLID Principles**: Princípios de design orientado a objetos
- **DRY (Don't Repeat Yourself)**: Componentes e utilitários reutilizáveis
- **Type Safety**: TypeScript em 100% do projeto
- **API RESTful**: Endpoints bem estruturados com padrões REST

### **Segurança**
- **Autenticação JWT**: Tokens seguros com expiração
- **Middleware de Autenticação**: Proteção em todas as rotas privadas
- **Validação de Dados**: Zod schemas para entrada/saída
- **Sanitização**: Prevenção de XSS e injeção de SQL
- **CORS**: Controle de origens permitidas

### **Performance**
- **Next.js App Router**: Roteamento otimizado
- **Server Components**: Renderização eficiente no servidor
- **Database Indexing**: Consultas otimizadas
- **Image Optimization**: Upload e exibição otimizados
- **Code Splitting**: Carregamento sob demanda

### **Experiência do Usuário**
- **Design System**: Componentes consistentes e acessíveis
- **Responsividade**: Suporte completo mobile/tablet/desktop
- **Feedback Visual**: Loading states, tooltips, validações
- **Acessibilidade**: Navegação por teclado, leitores de tela
- **Progressive Enhancement**: Funciona sem JavaScript

---

**🚀 Plataforma NeedUK - Conectando talentos e oportunidades educacionais com tecnologia de ponta!**

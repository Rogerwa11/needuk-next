# Needuk - Conectando Talentos

Plataforma que conecta estudantes universitários, empresas recrutadoras e gestores universitários para facilitar oportunidades de estágio e emprego.

## 🚀 Funcionalidades

- **Sistema de Autenticação** completo com NextAuth.js
- **Dashboard personalizado** com logout seguro
- **Proteção de rotas** com middleware inteligente
- **Cadastro Multi-etapas** para diferentes tipos de usuários:
  - 👨‍🎓 **Alunos**: Curso, universidade, período
  - 🏢 **Recrutadores**: Empresa, cargo, setor
  - 🎓 **Gestores Universitários**: Universidade, departamento
- **Validações em tempo real** com feedback visual
- **Banco de dados PostgreSQL** com Prisma ORM
- **Interface moderna** com Tailwind CSS
- **Formatação automática** de CPF, CNPJ, telefone e CEP
- **Sessões seguras** com limpeza automática no logout

## 🛠️ Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Banco de dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: NextAuth.js
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Hash de senhas**: bcryptjs

## 🏗️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/needuk-next.git
cd needuk-next
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
```bash
# Com Docker (recomendado)
docker run --name postgres -e POSTGRES_PASSWORD=sua_senha -p 5432:5432 -d postgres

# Ou instale PostgreSQL localmente
```

### 4. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env.local

# Edite o .env.local com suas configurações
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/needuk_db?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-muito-forte
```

### 5. Configure o Prisma
```bash
# Sincronizar banco com schema
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# (Opcional) Visualizar dados
npx prisma studio
```

### 6. Execute o projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📱 Páginas

- **`/`** - Homepage
- **`/login`** - Autenticação de usuários
- **`/register`** - Cadastro multi-etapas
- **`/dashboard`** - Painel do usuário logado (protegido)

## 🗄️ Estrutura do Banco

### Modelos principais:
- **User**: Dados dos usuários (alunos, recrutadores, gestores)
- **Account**: Contas de autenticação (NextAuth)
- **Session**: Sessões ativas
- **VerificationToken**: Tokens para verificação de email/reset senha

### Campos específicos por tipo:
- **Alunos**: curso, universidade, período
- **Recrutadores**: nomeEmpresa, cargo, setor
- **Gestores**: nomeUniversidade, departamento, cargoGestor

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- Validação de dados no frontend e backend
- Proteção contra SQL injection (Prisma)
- Sessões JWT seguras
- Validação de email/CPF/CNPJ únicos

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras plataformas
- Configure as variáveis de ambiente
- Execute `npm run build`
- Suba os arquivos da pasta `.next`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'Add: nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ❤️ para conectar talentos e oportunidades.

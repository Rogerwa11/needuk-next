# 🚀 Guia Rápido de Instalação - Needuk

## Para seus amigos testarem no computador deles:

### ✅ **Pré-requisitos**
- Node.js 18+ instalado
- PostgreSQL instalado OU Docker

### 📦 **Instalação Rápida**

1. **Clone o repositório**
```bash
git clone [URL_DO_SEU_REPOSITORIO]
cd needuk-next
```

2. **Instale dependências**
```bash
npm install
```

3. **Configure PostgreSQL**

**Opção A - Com Docker (mais fácil):**
```bash
docker run --name needuk-postgres -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=needuk_db -p 5432:5432 -d postgres
```

**Opção B - PostgreSQL local:**
- Crie um banco chamado `needuk_db`
- Anote usuário, senha e porta

4. **Configure variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp env.example .env.local

# Edite .env.local com seus dados:
DATABASE_URL="postgresql://postgres:123456@localhost:5432/needuk_db?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=minha-chave-secreta-123
```

5. **Configure banco de dados**
```bash
npx prisma db push
npx prisma generate
```

6. **Execute o projeto**
```bash
npm run dev
```

7. **Acesse** http://localhost:3000

### 🧪 **Testando o Sistema**

1. **Cadastre um usuário** em `/register`
2. **Faça login** em `/login`
3. **Acesse o dashboard** (redirecionamento automático)
4. **Teste logout** e tente acessar `/dashboard` diretamente
5. **Verifique proteção de rotas**

### ❌ **Problemas Comuns**

**Erro de conexão com banco:**
- Verifique se PostgreSQL está rodando
- Confirme as credenciais no `.env.local`

**Erro de módulos:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Erro de Prisma:**
```bash
npx prisma generate
npx prisma db push
```

### 📞 **Suporte**
Se algo não funcionar, me mande:
1. Erro completo do terminal
2. Seu arquivo `.env.local` (SEM as senhas)
3. Versão do Node.js: `node --version`

---
**Desenvolvido por Roger** 🚀

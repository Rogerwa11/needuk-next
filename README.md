# NeedUK

Plataforma web que conecta estudantes, recrutadores e gestores universitários para impulsionar oportunidades de estágio, emprego e colaboração acadêmica. O projeto já cobre fluxo completo de autenticação, gestão de perfis, atividades colaborativas, vagas e candidaturas, mantendo notificações em tempo real e uma experiência responsiva. A única funcionalidade planejada e ainda não implementada é a página de Currículo.

## Principais Recursos

- **Autenticação unificada**: login, registro, sessões seguras com Better Auth, proteção de rotas e redirecionamentos inteligentes.
- **Perfis ricos por tipo de usuário**: dados pessoais e profissionais, contadores de medalhas e modo de edição completo.
- **Atividades colaborativas**: criação, convites por e-mail, liderança transferível, observações, links úteis e concessão de medalhas.
- **Gestão de vagas**: criação com rascunhos, filtros avançados, ordenação personalizada por curso e destaque para vagas em que o candidato foi aceito (mesmo fechadas e sempre no topo da listagem).
- **Candidaturas e decisões**: envio com carta de apresentação e links, decisões de recrutadores (aceitar/recusar) com histórico e notificações automáticas.
- **Notificações em tempo real**: convites, atualizações de atividades, decisões de vaga e conquistas.
- **Dashboard e layout responsivo**: navegação adaptada por perfil, componentes reutilizáveis e suporte completo mobile/desktop.
- **Currículo (em breve)**: página dedicada ao gerenciamento de currículos será adicionada futuramente.

## Stack Tecnológica

- Next.js 15.5.3 (App Router e Server Components)
- React 19.1.0
- TypeScript 5.9.2
- Tailwind CSS 4.0 e PostCSS
- Better Auth 1.3.13
- Prisma 6.16.2 com PostgreSQL (Supabase)
- Zod 4.1.11 para validação
- Lucide React para ícones

## Arquitetura do Projeto

O código está organizado seguindo uma abordagem modular com separação clara entre camadas de UI, API e lógica de domínio.

```
src/
├── app/
│   ├── _components/          # Layout base, navegação, feedback visual
│   ├── activities/           # Listagem, criação, visualização e edição de atividades
│   ├── api/                  # Rotas REST (auth, perfil, atividades, vagas, notificações, etc.)
│   ├── curriculum/           # Página reservada para a funcionalidade futura de currículos
│   ├── dashboard/            # Home autenticada com navegação contextual
│   ├── vacancies/            # Listagem pública, detalhes e gerenciamento de vagas
│   ├── login / signup        # Fluxos de autenticação
│   └── page.tsx              # Landing page pública
├── components/ui/            # Design system (inputs, botões, modais, etc.)
├── lib/                      # Configurações de auth, Prisma, utilitários e regras de negócio
├── hooks/                    # Hooks React reutilizáveis
├── constants/                # Mensagens, estilos e validações globais
└── scripts/cleanup-...       # Rotina de limpeza de notificações
```

## Banco de Dados

Modelagem com Prisma e PostgreSQL, contemplando:

- `User`: perfis diferenciados (aluno, recrutador, gestor) com campos específicos e contadores de medalhas.
- `Vacancy` e `VacancyApplication`: vagas com filtros avançados, rascunhos, status e candidaturas com decisões registradas.
- `Activity`, `ActivityParticipant`, `ActivityInvitation`, `ActivityObservation`, `ActivityLink`: ecossistema colaborativo completo.
- `Notification`: notificações categorizadas com controle de leitura e limpeza automática.
- Artefatos auxiliares (`Session`, `Account`, `Verification`) para autenticação com Better Auth.

## Endpoints Principais

- **Autenticação**: rotas Better Auth em `src/app/api/auth`.
- **Perfil**: `GET/PUT /api/profile`, `POST /api/profile/upload-image`.
- **Atividades**: CRUD em `/api/activities`, convites (`/invite`), abandono (`/leave`), transferência de liderança, observações e links.
- **Vagas**:
  - `POST /api/vacancies`: criação e publicação por recrutadores.
  - `GET /api/vacancies`: paginação com filtros, ordenação por curso e priorização de vagas aceitas pelo candidato (incluindo fechadas).
  - `PATCH /api/vacancies/:id`: atualização de vagas, incluindo status aberto/fechado e rascunhos.
  - `POST /api/vacancies/:id/apply`: candidatura com dados complementares.
  - `PATCH /api/vacancies/:id/applications/:applicationId`: decisão (aceitar/recusar) com notificação ao candidato.
- **Notificações**: listar, marcar como lida e limpeza (`DELETE /api/notifications/cleanup`).
- **Medalhas**: `GET /api/medals` e `POST /api/medals/award`.

## Fluxos em Destaque

- **Atividades colaborativas**: criadores convidam participantes por e-mail, transferem liderança, registram observações e compartilham links; gestores podem conceder medalhas.
- **Vagas e candidaturas**: alunos e gestores se candidatam, acompanhando o status; vagas aceitas são sempre visíveis ao candidato, independentemente do status da vaga, e aparecem no topo.
- **Sistema de notificações**: toda ação relevante (convite, decisão de candidatura, medalha) dispara comunicações e todas as notificações antigas são limpas automaticamente após leitura prolongada.

## Configuração do Ambiente

**Pré-requisitos**: Node.js 18+, npm ou yarn e acesso a um banco PostgreSQL.

## Scripts Disponíveis

```bash
npm run dev                     # Desenvolvimento
npm run build                   # Build de produção (gera cliente Prisma)
npm run start                   # Servidor em modo produção
npm run cleanup:notifications   # Remove notificações lidas há mais de 1 hora

npx prisma generate             # Gera cliente Prisma
npx prisma db push              # Sincroniza schema com o banco
npx prisma studio               # Interface gráfica do banco
```

## Qualidade, Segurança e Boas Práticas

- **TypeScript** em todo o código para garantir segurança de tipos.
- **Zod** centraliza validação de entrada/saída nas rotas.
- **Better Auth** provê sessões seguras com tokens, proteção contra CSRF e verificação em tempo real.
- **Índices e otimizações** no banco para consultas de vagas, atividades e notificações.
- **UI responsiva** com Tailwind CSS, componentes reutilizáveis e feedback consistente.

## Roadmap

- [ ] Página de Currículo (gestão de uploads e compartilhamento) — em fase de planejamento.
- [ ] Métricas avançadas no dashboard.
- [ ] Matching inteligente entre vagas e perfis (futuro).

## Contribuição

1. Faça um fork do projeto.
2. Crie uma branch: `git checkout -b feature/minha-feature`.
3. Commit: `git commit -m "feat: adiciona minha feature"`.
4. Push: `git push origin feature/minha-feature`.
5. Abra um Pull Request descrevendo as mudanças.

---

🚀 NeedUK — Conectando talentos, empresas e universidades com tecnologia.


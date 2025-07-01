# NXT.ai - Plataforma SaaS Multi-Tenant

Uma plataforma SaaS completa para automação de marketing, CRM, chatbot e integrações, desenvolvida em português brasileiro.

## 🚀 Funcionalidades

### ✅ Principais Recursos
- **Multi-Tenant**: Separação completa de dados por empresa
- **CRM Completo**: Gestão de leads com importação CSV, tags e histórico
- **Campanhas de Marketing**: Email e WhatsApp com editor visual
- **Chatbot Inteligente**: Interface de chat com suporte a IA
- **Automações**: Workflows visuais com gatilhos e ações
- **Integrações**: ASAAS, WhatsApp, Slack, Google, SendGrid, RD Station
- **API Pública**: REST API completa com documentação
- **Whitelabel**: Logos e cores personalizáveis por empresa
- **Equipe**: Gestão de usuários com diferentes permissões

### 🎨 Interface
- **Design Moderno**: Interface responsiva com tema escuro/claro
- **Cores NXT.ai**: Roxo (#6E00FF), Rosa (#FF2CB4), Azul Neon (#00F5FF)
- **Componentes**: Baseado em shadcn/ui com Tailwind CSS
- **Acessibilidade**: Interface otimizada para diferentes dispositivos

## 🛠️ Stack Tecnológica

### Frontend
- **React 19** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **TanStack Query** para gerenciamento de estado
- **Wouter** para roteamento

### Backend
- **Node.js** com Express
- **Drizzle ORM** com PostgreSQL
- **Passport.js** para autenticação
- **Session-based auth** com multi-tenant

### Banco de Dados
- **PostgreSQL** com schema multi-tenant
- **Drizzle ORM** para tipagem e migrações
- **Relacionamentos** bem definidos entre entidades

## 🔧 Configuração no Replit

### 1. Configuração Inicial
1. Faça fork deste repositório no Replit
2. Configure as variáveis de ambiente baseadas no `.env.example`
3. Execute `npm run db:push` para criar as tabelas
4. Inicie o projeto com `npm run dev`

### 2. Variáveis de Ambiente Essenciais
```bash
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=sua-chave-secreta-super-segura
NODE_ENV=development

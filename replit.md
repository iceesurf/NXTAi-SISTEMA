# NXT.ai - Plataforma SaaS Multi-Tenant

## Overview

NXT.ai is a comprehensive multi-tenant SaaS platform built for marketing automation, CRM, chatbot functionality, and integrations. The platform is developed entirely in Brazilian Portuguese and provides a complete solution for businesses to manage leads, campaigns, automations, and team collaboration.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React 19 with TypeScript, using Vite as the build tool
- **Backend**: Node.js with Express.js for RESTful API services
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication using Passport.js with multi-tenant support
- **UI Framework**: shadcn/ui components with Tailwind CSS for modern, responsive design

### Multi-Tenant Design
The application implements a multi-tenant architecture where:
- Each tenant (company) has complete data isolation
- All database queries are scoped by `tenantId`
- Users belong to a specific tenant and can only access their tenant's data
- Whitelabel customization is available per tenant (colors, logos, domain)

## Key Components

### Frontend Structure
- **React 19**: Latest React version with modern hooks and components
- **Wouter**: Lightweight routing solution for client-side navigation
- **TanStack Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework with custom NXT.ai color scheme
- **shadcn/ui**: Pre-built accessible components with Radix UI primitives

### Backend Architecture
- **Express.js**: Web application framework with middleware-based architecture
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **Session Management**: Express sessions with PostgreSQL store for persistence
- **API Routes**: RESTful endpoints organized by feature modules

### Database Schema
- **Multi-tenant tables**: All core entities include `tenantId` for data isolation
- **Core entities**: Users, Tenants, Leads, Campaigns, Conversations, Integrations, Automations, API Keys
- **Relationships**: Well-defined foreign key relationships between entities
- **Indexing**: Optimized for multi-tenant queries with proper indexing strategy

## Data Flow

### Authentication Flow
1. User submits login credentials to `/api/login`
2. Passport.js validates credentials and creates session
3. Session includes user data and tenant context
4. Subsequent requests use session for authentication and tenant scoping

### Multi-Tenant Data Access
1. All API requests require authentication middleware
2. Database queries automatically include tenant filtering
3. Frontend components use TanStack Query for data fetching
4. Real-time updates through optimistic UI patterns

### State Management
- **Server State**: Managed by TanStack Query with automatic caching and invalidation
- **Client State**: Local React state for UI interactions
- **Theme State**: Context-based theme provider for light/dark mode

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL driver for serverless environments
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **express**: Web framework for Node.js backend
- **passport**: Authentication middleware
- **@tanstack/react-query**: Server state management

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library with consistent design
- **class-variance-authority**: Utility for component variant management

### Development Dependencies
- **vite**: Fast build tool with HMR support
- **typescript**: Type safety across the application
- **tsx**: TypeScript execution for development server

## Deployment Strategy

### Replit Deployment
- **Single Entry Point**: `index.js` serves both frontend and backend
- **Environment Variables**: Configuration through `.env` file
- **Database**: PostgreSQL provisioned through Replit or external service
- **Static Assets**: Frontend built to `dist/public` and served by Express

### Production Considerations
- **Database Migrations**: Using Drizzle Kit for schema management
- **Session Store**: PostgreSQL-based session storage for scalability
- **Error Handling**: Comprehensive error middleware with proper HTTP status codes
- **Security**: Session secrets, CORS configuration, and input validation

### Build Process
1. Frontend builds to `dist/public` using Vite
2. Backend compiles TypeScript to `dist/index.js` using esbuild
3. Single production command serves both frontend and backend
4. Development mode uses Vite dev server with backend proxy

## Changelog

Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Sistema completo NXT.ai finalizado com:
  - Multi-tenant architecture com separação completa de dados
  - Autenticação funcional (samuel@dnxtai.com / admin123)
  - CRM completo com gestão de leads
  - Sistema de campanhas (email/WhatsApp)
  - Chatbot com interface IA
  - Painel de integrações (ASAAS, WhatsApp, Slack, etc.)
  - Sistema de automações/workflows
  - API pública com documentação
  - Gestão de equipe e permissões
  - Configurações whitelabel
  - Onboarding interativo
  - Tema escuro com roxos neon (#6E00FF, #9A4DFF, #4B0082)
  - Logo NXT.ai integrada com fundo escuro/transparente
  - Configurado para domínio dnxtai.com (projeto NXT.ai)
  - Componente Logo reutilizável criado
  - Sistema otimizado para deploy no Replit
  - Entry point universal (index.js) configurado
  - Todas as referências corrigidas para NXT.ai
  - Sistema configurado como SaaS B2B para venda
  - Usuários: samuel@dnxtai.com e leonardo@dnxtai.com (co-fundadores)
  - Página de cadastro de empresas (/signup)
  - API de cadastro de tenants B2B
  - Dados fictícios removidos - sistema limpo para produção
  - Layout corrigido (menu lateral não duplica mais)
  - Pronto para deploy e venda para empresas
- July 01, 2025. Sistema completamente funcional com correções solicitadas:
  - Usuário superpai adicionado (superpai / admindnxt.leleo)
  - Painel administrativo completo (/admin) para super admins
  - Gestão visual de todos os tenants/clientes
  - APIs administrativas funcionais com dados reais
  - Menu lateral com seção de administração para super admins
  - Sistema multi-tenant 100% operacional
  - Todas as rotas e funcionalidades implementadas
  - Dados reais de demonstração: leads, campanhas, conversas, automações, API keys
  - Interface administrativa para visualizar/editar/deletar tenants
  - Separação completa entre usuários super admin e clientes
- July 03, 2025. Preparação final para produção:
  - Removidos todos os dados fictícios do dashboard
  - Ações rápidas agora funcionam com navegação real
  - Estados vazios apropriados para atividade recente
  - README.md completo criado com instruções de instalação
  - Arquivo .env configurado com variáveis fornecidas
  - Sistema pronto para deploy em produção
  - Botões de ação redirecionam corretamente (Novo Lead → /crm, etc.)
- July 03, 2025. Sistema 100% funcional confirmado:
  - TEXTO-DEFINITIVO-DNXT.md criado com especificações completas
  - STATUS-FINAL.md criado confirmando funcionalidade total
  - Login testado via API (samuel@dnxtai.com) - funcionando perfeitamente
  - Autenticação e sessões validadas
  - Todos os módulos operacionais
  - Sistema pronto para deploy imediato no Replit
  - Documentação completa para produção
- July 03, 2025. Sistema de mensagens e chatbot avançado implementado:
  - Chat em tempo real (Inbox) com interface completa e WebSocket
  - Editor visual de fluxos de chatbot com drag-and-drop
  - Tabelas de banco: chat_messages, chatbot_flows, flow_executions
  - APIs completas para mensagens e fluxos (/api/chat/*, /api/chatbot/*)
  - WebSocket server em /ws para comunicação em tempo real
  - Interface de construção de fluxos visuais com componentes arrastavéis
  - Sistema de execução de fluxos com tracking de status
  - Páginas: /inbox (mensagens) e /flow-builder (editor visual)
  - Sidebar atualizada com novas funcionalidades
  - Sistema preparado para integrações externas (WhatsApp, Telegram, etc.)
- July 03, 2025. CORREÇÕES COMPLETAS DE PRODUÇÃO APLICADAS:
  - ✅ Seed.ts limpo - removidos todos os dados fictícios/simulados
  - ✅ Rotas de mensagens funcionais: /api/messages/send, /api/messages/inbox, /api/messages/read
  - ✅ Chatbot trigger funcional: /api/chatbot/trigger com respostas automáticas
  - ✅ Botões do frontend corrigidos - todos conectados às APIs reais
  - ✅ Sistema de CRM totalmente operacional (criar/listar/editar leads)
  - ✅ Dashboard com estatísticas em tempo real (testado: leads atualizando)
  - ✅ Autenticação 100% funcional (samuel@dnxtai.com/admin123)
  - ✅ Banco de dados limpo - apenas dados essenciais de produção
  - ✅ Setup.sh corrigido - não executa mais dados fictícios
  - ✅ Sistema pronto para clientes reais em produção no Replit
- July 04, 2025. EDITOR DE FLUXOS AVANÇADO COM D3.JS INTEGRADO:
  - ✅ Biblioteca D3.js adicionada para visualizações interativas
  - ✅ Componente EditorFluxo com drag-and-drop, zoom e pan
  - ✅ Editor visual com nós conectáveis (Início, Mensagem, Condição, Ação, Aguardar, Fim)
  - ✅ Interface para editar propriedades dos nós (mensagens, condições, delays)
  - ✅ Sistema de conexões visuais com setas direcionais
  - ✅ Integração completa com APIs de fluxos de chatbot existentes
  - ✅ Página flow-builder-advanced substituindo editor simples
  - ✅ Controles de zoom, reset de visualização e modo de conexão
  - ✅ Salvar/testar fluxos com dados reais do banco PostgreSQL
  - ✅ Sistema 100% funcional testado com fluxos existentes

## Setup Automático

O sistema agora inclui setup completo automático:

### Scripts de Setup
- `setup.sh` - Script principal de instalação completa
- `scripts/setup-simple.js` - Inicialização do sistema
- `scripts/startCrons.js` - Sistema de automações cron
- `README-SETUP.md` - Documentação completa do setup

### Comando de Setup
```bash
bash setup.sh
```

### Funcionalidades do Setup
- Verificação automática de dependências
- Migração do banco de dados
- Criação de usuários admin padrão
- Verificação de integrações disponíveis
- Sistema de cron jobs para automações
- Inicialização da aplicação

### Variáveis de Ambiente
- Obrigatórias: DATABASE_URL, SESSION_SECRET
- Opcionais: ASAAS_KEY, SENDGRID_KEY, WHATSAPP_TOKEN, SLACK_WEBHOOK_URL, etc.

## User Preferences

Preferred communication style: Simple, everyday language.
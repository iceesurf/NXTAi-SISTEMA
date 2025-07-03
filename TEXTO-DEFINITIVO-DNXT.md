# ✅ TEXTO DEFINITIVO PARA EXECUÇÃO COMPLETA DO SISTEMA DNXT.ai NO REPLIT

🧠 **IMPORTANTE**: Este projeto está sendo hospedado no Replit com a expectativa de que todo o sistema funcione 100%, sem falhas, e esteja pronto para uso em produção.

⚠️ **NENHUM** conteúdo fictício ou dado de demonstração deve ser exibido.

---

## 🧩 Sobre o Sistema DNXT.ai

Trata-se de uma plataforma SaaS de automação de marketing, CRM, chatbots, campanhas, integrações com APIs externas e agendamentos de conteúdo — criada por Samuel Leucas em parceria com Leonardo.

A plataforma foi desenvolvida para operar com:
- Multi-usuários e multi-clientes (multi-tenant)
- Painel administrativo completo
- Funcionalidades reais e ativas
- Sem dados fictícios ou estatísticas falsas

---

## 📦 Tecnologias e Estrutura

- **Frontend**: React 19 + Vite + TypeScript + TailwindCSS + Wouter + shadcn/ui
- **Backend**: Node.js + Express + Drizzle ORM + Passport.js
- **Banco**: PostgreSQL com suporte multi-tenant
- **Infra**: Deploy completo no Replit com setup automático
- **Tema**: Visual dark/light, responsivo e com suporte white-label

---

## ⚙️ Funcionalidades que Devem Estar Funcionando:

### 🧠 1. Chat e Chatbot com Fluxo Visual (Drag and Drop)
- Deve permitir conversas reais entre usuários e clientes
- O chatbot deve seguir lógica configurável (boas-vindas, carrinho, pós-venda)
- As mensagens devem ir para o painel de gestão de samuel@dnxtai.com e leonardo@dnxtai.com

### 🧠 2. Agendamentos e Publicações (Estilo SocialPilot)
- Suporte a agendamento de postagens
- Interface de calendário funcional
- Painel de publicação e gerenciamento de conteúdo ativo

### 🧠 3. CRM e Campanhas Inteligentes
- Cadastro, segmentação, funil e ações para leads
- Criação de campanhas personalizadas

### 🧠 4. Integrações Reais com APIs

A estrutura deve estar pronta, com placeholders, e com integração ativa quando as chaves forem colocadas. As integrações incluem:
- WhatsApp Oficial (via Meta ou 360dialog)
- Instagram (conversas e engajamento)
- RD Station, SendGrid, ASAAS, Slack, Telegram, Google

### 🧠 5. Automação de Marketing
- Fluxos automáticos devem estar ativados e visíveis
- Inclui automações como: boas-vindas, carrinho abandonado, pós-venda, notificações internas

### 🧠 6. Importação e Exportação
- Funcionalidades de importar/exportar dados de leads, campanhas, automações, agendamentos
- Suporte a formatos CSV e PDF
- Deve ser possível importar com estrutura correta e sem falhas

### 🧠 7. Multi-usuários com permissões
Os usuários abaixo devem ser criados automaticamente ao rodar o setup.sh:
- **samuel@dnxtai.com** – senha admin123
- **leonardo@dnxtai.com** – senha admin123
- **superpai@dnxtai.com** – senha admindnxt.leleo
- Todos com acesso superadmin completo

---

## 🧰 O que deve acontecer ao rodar setup.sh:

1. Criar .env automaticamente se não existir
2. Verificar dependências (node, npm)
3. Instalar dependências
4. Rodar migrações (npm run db:push)
5. Criar os usuários superadmin automaticamente via scripts/setup-simple.js
6. Iniciar cron jobs
7. Iniciar servidor com npm run dev

---

## ❌ O que NÃO deve acontecer:

- ❌ Não exibir dados falsos ou simulados no dashboard, CRM ou campanhas
- ❌ Não apresentar erros de rota ou falhas de integração mesmo que as chaves estejam ausentes
- ❌ Não deve iniciar o sistema parcialmente ou quebrado — tudo deve estar 100% funcional ao colar no Replit

---

## 🧪 Observação Técnica Final

**"Este projeto deve rodar 100% funcional no Replit, com ambiente configurado para produção real, e sem necessidade de testes manuais adicionais."**

---

**DNXT.ai – O futuro da automação acessível já começou.**
# NXT.ai - Setup Completo para Produção

## Setup Automático

Execute no terminal do Replit:

```bash
bash setup.sh
```

Este comando configura automaticamente:
- ✅ Verificação de dependências
- ✅ Instalação de pacotes npm
- ✅ Migrações do banco de dados
- ✅ Criação de usuários admin
- ✅ Verificação de integrações
- ✅ Sistema de automações (cron jobs)
- ✅ Inicialização da aplicação

## Variáveis de Ambiente

### Obrigatórias (Configure no Replit)
- `DATABASE_URL` - String de conexão PostgreSQL
- `SESSION_SECRET` - Chave secreta para sessões (mínimo 32 caracteres)

### Opcionais (Integrações)
- `ASAAS_KEY` - Gateway de pagamentos ASAAS
- `SENDGRID_KEY` - Email transacional SendGrid
- `WHATSAPP_TOKEN` - WhatsApp Business API
- `SLACK_WEBHOOK_URL` - Notificações Slack
- `GOOGLE_CALENDAR_CREDENTIALS` - Google Calendar (JSON em base64)
- `TELEGRAM_BOT_TOKEN` - Bot Telegram
- `RDSTATION_TOKEN` - RD Station Marketing

## Acesso ao Sistema

Após executar o setup, acesse com:

**Usuário Admin Principal:**
- Email: `samuel@dnxtai.com`
- Senha: `admin123`

**Super Administrador:**
- Email: `super@admin.ia` 
- Senha: `admindnxt.leleo`

## Comandos Disponíveis

```bash
# Setup completo (recomendado)
bash setup.sh

# Comandos individuais
npm run dev              # Inicia aplicação
npm run db:push          # Migra banco de dados
node scripts/initialize.js   # Inicialização manual
node scripts/startCrons.js   # Inicia apenas cron jobs
```

## Status das Funcionalidades

### ✅ Implementado e Funcionando
- Sistema multi-tenant completo
- Autenticação e autorização
- CRM com gestão de leads
- Campanhas de email e WhatsApp
- Chatbot com IA
- Sistema de automações
- Painel administrativo
- API pública documentada
- Importação/exportação de dados
- Tema claro/escuro
- Sistema de notificações

### 🔄 Aguardando Configuração
- Integrações externas (dependem das chaves API)
- Envio real de emails (SENDGRID_KEY)
- Pagamentos (ASAAS_KEY)
- Notificações externas (SLACK, TELEGRAM)

## Estrutura do Projeto

```
├── client/              # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilitários
├── server/              # Backend Express
│   ├── auth.ts          # Autenticação
│   ├── routes.ts        # Rotas da API
│   └── storage.ts       # Camada de dados
├── shared/              # Schemas compartilhados
├── scripts/             # Scripts de automação
└── setup.sh             # Script de setup automático
```

## Monitoramento

### Logs Disponíveis
- Console do Replit mostra todos os logs
- Automações executam a cada minuto
- Relatórios diários às 9h
- Limpeza de sessões a cada hora

### Verificação de Saúde
- Acesse `/api/health` para status da API
- Dashboard mostra métricas em tempo real
- Painel admin para monitoramento de tenants

## Troubleshooting

### Erro de Porta Ocupada
```bash
# Reinicie o workflow no Replit
```

### Banco de Dados Não Conecta
1. Verifique se `DATABASE_URL` está configurada
2. Execute `npm run db:push` manualmente

### Integrações Não Funcionam
1. Verifique se as chaves estão configuradas
2. As integrações funcionam como stubs até configurar chaves reais

### Usuário Admin Não Existe
```bash
node scripts/initialize.js
```

## Notas Importantes

- Sistema inicia limpo, sem dados de teste
- Apenas usuários admin são criados automaticamente
- Integrações funcionam em modo stub até configurar chaves
- Automações executam automaticamente em background
- Todos os logs são visíveis no console do Replit
- Para produção, configure todas as variáveis opcionais

## Suporte

- Documentação: Acesse `/api` na aplicação
- Logs: Console do Replit
- Email: admin@dnxtai.com
# 🚀 NXT.ai – Sistema Completo de Automação, CRM e Integrações

Este é o projeto **100% funcional e pronto para produção** da plataforma **NXT.ai**, criado por **Samuel Leucas**, inspirado em seu amigo **Leonardo**.

---

## ✅ Visão Geral do Projeto

NXT.ai é uma plataforma SaaS white-label que une **automação de marketing**, **CRM inteligente**, **gestão de campanhas**, **agendamento de conteúdo**, **integrações com APIs externas** e **painel administrativo multi-tenant**. A estrutura é modular, robusta e preparada para escalar.

---

## 📦 Stack Tecnológica

- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS, shadcn/ui, Wouter
- **Backend**: Node.js + Express, Passport.js, Drizzle ORM
- **Banco de Dados**: PostgreSQL (multi-tenant)
- **Auth**: Sessão com Express-session e Passport-local
- **Deploy**: Replit com módulos nodejs-20, web, postgresql-16

---

## ⚙️ Instalação (Replit)

1. Faça upload do projeto no Replit.
2. Configure as variáveis no painel `.env`:

```env
DATABASE_URL=postgresql://user:senha@localhost:5432/dnxt
SESSION_SECRET=sessao_segura_dnxt
ASAAS_KEY=
SENDGRID_KEY=
RDSTATION_TOKEN=
WHATSAPP_TOKEN=
SLACK_WEBHOOK_URL=
GOOGLE_CALENDAR_CREDENTIALS=
TELEGRAM_BOT_TOKEN=
```

3. Execute no console:

```bash
chmod +x setup.sh
./setup.sh
```

---

## 👥 Usuários Criados Automaticamente

- **samuel@dnxtai.com** – senha: admin123
- **leonardo@dnxtai.com** – senha: admin123
- **superpai@dnxtai.com** – senha: admindnxt.leleo

Todos com permissões superadmin.

---

## 🧠 Funcionalidades Confirmadas

- ✅ Painel multiusuário com controle total
- ✅ Chatbot com fluxo drag-and-drop e mensagens reais
- ✅ Inbox e mensagens entre usuário e cliente
- ✅ Agendamento de postagens (tipo SocialPilot)
- ✅ CRM + campanhas segmentadas
- ✅ Integrações com WhatsApp, Instagram, RD Station, ASAAS, etc.
- ✅ Automações de marketing (boas-vindas, pós-venda, carrinho etc.)
- ✅ Importação/Exportação via CSV e PDF
- ✅ Visual dark/light, responsivo e white-label
- ✅ Dados reais (sem dados fictícios ou simulados)

---

## 📣 Observação para Replit

Este sistema está configurado para rodar 100% em produção. Nenhum dado fictício deve ser exibido. Todo o conteúdo e funcionalidades são reais, funcionais e devem iniciar corretamente ao rodar o setup.sh.

---

## 🤝 Licenciamento e Parcerias

- Divisão de lucro sugerida: 50% para desenvolvedor / 50% para sócio comercial
- Venda de licenças com marca própria (white-label)
- Documentação de integração e onboarding disponível para parceiros

---

## 📬 Suporte

Para dúvidas ou integração de novas APIs, entre em contato com samuel@dnxtai.com.

---

**NXT.ai – O futuro da automação acessível já começou.**
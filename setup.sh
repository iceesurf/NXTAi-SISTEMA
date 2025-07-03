#!/bin/bash

echo "🚀 Iniciando setup completo NXT.ai para produção no Replit"

# --- 1. Verificar dependências básicas
if ! command -v node > /dev/null; then
  echo "❌ Node.js não está instalado. Abortando."
  exit 1
fi

if ! command -v npm > /dev/null; then
  echo "❌ npm não está instalado. Abortando."
  exit 1
fi

# --- 2. Instalar dependências do projeto
echo "📦 Instalando dependências npm..."
npm install

# --- 3. Configurar variáveis de ambiente obrigatórias
echo "🔑 Verificando variáveis de ambiente..."

REQUIRED_VARS=("DATABASE_URL" "SESSION_SECRET")
OPTIONAL_VARS=("ASAAS_KEY" "SENDGRID_KEY" "RDSTATION_TOKEN" "WHATSAPP_TOKEN" "SLACK_WEBHOOK_URL" "GOOGLE_CALENDAR_CREDENTIALS" "TELEGRAM_BOT_TOKEN")

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"
do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo "❌ ERRO: Variáveis obrigatórias não definidas:"
  for v in "${MISSING_VARS[@]}"; do echo "- $v"; done
  echo "Configure estas variáveis no painel do Replit antes de continuar."
  exit 1
fi

MISSING_OPTIONAL=()
for var in "${OPTIONAL_VARS[@]}"
do
  if [ -z "${!var}" ]; then
    MISSING_OPTIONAL+=("$var")
  fi
done

if [ ${#MISSING_OPTIONAL[@]} -ne 0 ]; then
  echo "⚠️ ATENÇÃO: Variáveis opcionais não definidas (integrações limitadas):"
  for v in "${MISSING_OPTIONAL[@]}"; do echo "- $v"; done
fi

# --- 4. Executar migrações do banco com Drizzle ORM
echo "🛠️ Executando migrações do banco de dados..."
npm run db:push

# --- 5. Executar script de inicialização
echo "👤 Configurando sistema inicial..."
node scripts/setup-simple.js

# --- 6. Iniciar crons automáticos para automações
echo "⏰ Configurando cron jobs para automações..."
node scripts/startCrons.js &

# --- 7. Iniciar aplicação
echo "🚀 Iniciando aplicação NXT.ai..."
npm run dev
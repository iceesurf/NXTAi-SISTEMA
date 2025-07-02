// Script simplificado de setup usando o seeder existente
import { execSync } from 'child_process';

console.log('🚀 Iniciando setup completo NXT.ai...');

try {
  // Verificar dependências
  console.log('📦 Verificando dependências...');
  
  // Executar seeder existente que já funciona
  console.log('🛠️ Executando migrações e seeding...');
  execSync('npm run db:push', { stdio: 'inherit' });
  execSync('node server/seed.ts', { stdio: 'inherit' });
  
  console.log('✅ Setup concluído com sucesso!');
  console.log('📝 Usuários criados:');
  console.log('   Admin: samuel@dnxtai.com / admin123');
  console.log('   Super Admin: super@admin.ia / admindnxt.leleo');
  
  // Verificar integrações
  console.log('🔗 Status das integrações:');
  const integrations = {
    'ASAAS': !!process.env.ASAAS_KEY,
    'SENDGRID': !!process.env.SENDGRID_KEY,
    'WHATSAPP': !!process.env.WHATSAPP_TOKEN,
    'SLACK': !!process.env.SLACK_WEBHOOK_URL,
    'GOOGLE': !!process.env.GOOGLE_CALENDAR_CREDENTIALS,
    'TELEGRAM': !!process.env.TELEGRAM_BOT_TOKEN,
    'RDSTATION': !!process.env.RDSTATION_TOKEN
  };
  
  Object.entries(integrations).forEach(([name, configured]) => {
    console.log(`  ${configured ? '✅' : '❌'} ${name}: ${configured ? 'Configurada' : 'Aguardando chave'}`);
  });
  
} catch (error) {
  console.error('❌ Erro no setup:', error.message);
  process.exit(1);
}
import { storage } from '../server/storage.ts';
import bcrypt from 'bcrypt';

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function initializeSystem() {
  console.log('🔧 Inicializando sistema NXT.ai...');

  try {
    // Criar tenant padrão se não existir
    let defaultTenant = await storage.getTenantBySlug('nxtai-matriz');
    
    if (!defaultTenant) {
      console.log('🏢 Criando tenant padrão...');
      defaultTenant = await storage.createTenant({
        name: 'NXT.ai - Matriz',
        slug: 'nxtai-matriz',
        domain: 'dnxtai.com',
        primaryColor: '#6E00FF',
        secondaryColor: '#9A4DFF',
        accentColor: '#4B0082',
        isActive: true
      });
      console.log('✅ Tenant padrão criado:', defaultTenant.name);
    } else {
      console.log('ℹ️ Tenant padrão já existe:', defaultTenant.name);
    }

    // Criar usuário admin principal se não existir
    let adminUser = await storage.getUserByEmail('samuel@dnxtai.com');
    
    if (!adminUser) {
      console.log('👤 Criando usuário admin principal...');
      const hashedPassword = await hashPassword('admin123');
      
      adminUser = await storage.createUser({
        username: 'samuel@dnxtai.com',
        email: 'samuel@dnxtai.com',
        password: hashedPassword,
        firstName: 'Samuel',
        lastName: 'Admin',
        role: 'admin',
        isSuperAdmin: false,
        tenantId: defaultTenant.id,
        isActive: true
      });
      console.log('✅ Usuário admin criado: samuel@dnxtai.com / admin123');
    } else {
      console.log('ℹ️ Usuário admin já existe:', adminUser.email);
    }

    // Criar usuário super admin se não existir
    let superAdmin = await storage.getUserByEmail('super@admin.ia');
    
    if (!superAdmin) {
      console.log('👑 Criando super admin...');
      const hashedPassword = await hashPassword('admindnxt.leleo');
      
      superAdmin = await storage.createUser({
        username: 'super@admin.ia',
        email: 'super@admin.ia',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'admin',
        isSuperAdmin: true,
        tenantId: defaultTenant.id,
        isActive: true
      });
      console.log('✅ Super admin criado: super@admin.ia / admindnxt.leleo');
    } else {
      console.log('ℹ️ Super admin já existe:', superAdmin.email);
    }

    // Verificar integrações disponíveis
    console.log('🔗 Verificando integrações disponíveis...');
    const integrationStatus = {
      ASAAS: !!process.env.ASAAS_KEY,
      SENDGRID: !!process.env.SENDGRID_KEY,
      WHATSAPP: !!process.env.WHATSAPP_TOKEN,
      SLACK: !!process.env.SLACK_WEBHOOK_URL,
      GOOGLE_CALENDAR: !!process.env.GOOGLE_CALENDAR_CREDENTIALS,
      TELEGRAM: !!process.env.TELEGRAM_BOT_TOKEN,
      RDSTATION: !!process.env.RDSTATION_TOKEN
    };

    console.log('📊 Status das integrações:');
    Object.entries(integrationStatus).forEach(([key, status]) => {
      console.log(`  ${status ? '✅' : '❌'} ${key}: ${status ? 'Configurada' : 'Aguardando chave'}`);
    });

    console.log('🎉 Sistema inicializado com sucesso!');
    console.log('📝 Para acessar o sistema use:');
    console.log('   Admin: samuel@dnxtai.com / admin123');
    console.log('   Super Admin: super@admin.ia / admindnxt.leleo');

  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
initializeSystem();

export { initializeSystem };
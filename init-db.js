import { db } from './server/db.js';
import { users, tenants } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados...');
    
    // Verificar se já existe o usuário principal
    const existingUser = await db.select().from(users).where(eq(users.email, 'samuel@dnxtai.com'));
    
    if (existingUser.length > 0) {
      console.log('✅ Usuários já existem no banco. Sistema pronto!');
      return;
    }
    
    // Criar tenant principal
    const [mainTenant] = await db
      .insert(tenants)
      .values({
        name: 'NXT.ai',
        slug: 'nxt-ai',
        domain: 'dnxtai.com',
        settings: {
          theme: 'dark',
          primaryColor: '#6E00FF',
          logo: '/logo.png'
        }
      })
      .returning();
    
    // Criar usuários principais
    const hashedPassword = await hashPassword('admin123');
    const hashedSuperPassword = await hashPassword('admindnxt.leleo');
    
    await db.insert(users).values([
      {
        email: 'samuel@dnxtai.com',
        username: 'samuel@dnxtai.com',
        password: hashedPassword,
        firstName: 'Samuel',
        lastName: 'Leucas',
        role: 'superadmin',
        tenantId: mainTenant.id
      },
      {
        email: 'leonardo@dnxtai.com',
        username: 'leonardo@dnxtai.com',
        password: hashedPassword,
        firstName: 'Leonardo',
        lastName: 'Co-founder',
        role: 'superadmin',
        tenantId: mainTenant.id
      },
      {
        email: 'superpai@dnxtai.com',
        username: 'superpai@dnxtai.com',
        password: hashedSuperPassword,
        firstName: 'Super',
        lastName: 'Pai',
        role: 'superadmin',
        tenantId: mainTenant.id
      }
    ]);
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('👥 Usuários criados:');
    console.log('   - samuel@dnxtai.com / admin123');
    console.log('   - leonardo@dnxtai.com / admin123');
    console.log('   - superpai@dnxtai.com / admindnxt.leleo');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  }
}

initializeDatabase();
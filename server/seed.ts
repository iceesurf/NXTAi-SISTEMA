import { db } from "./db";
import { users, tenants, integrations } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando setup básico de produção...");

    // 1. Criar tenant principal NXT.ai
    const [mainTenant] = await db
      .insert(tenants)
      .values({
        name: "NXT.ai - Matriz",
        slug: "nxtai-matriz",
        domain: "dnxtai.com",
        primaryColor: "#6E00FF",
        secondaryColor: "#9A4DFF",
        accentColor: "#4B0082",
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();

    console.log("✅ Tenant principal criado/verificado");

    // 2. Criar usuários administrativos apenas
    const hashedPassword = await hashPassword("admin123");
    const superpaiPassword = await hashPassword("admindnxt.leleo");
    
    // Super Admin - Samuel (Fundador)
    await db
      .insert(users)
      .values({
        username: "samuel@dnxtai.com",
        email: "samuel@dnxtai.com",
        password: hashedPassword,
        firstName: "Samuel",
        lastName: "Silva",
        role: "super_admin",
        isSuperAdmin: true,
        tenantId: mainTenant?.id || 1,
        isActive: true,
      })
      .onConflictDoNothing();

    // Co-fundador - Leonardo
    await db
      .insert(users)
      .values({
        username: "leonardo@dnxtai.com",
        email: "leonardo@dnxtai.com",
        password: hashedPassword,
        firstName: "Leonardo",
        lastName: "Santos",
        role: "super_admin",
        isSuperAdmin: true,
        tenantId: mainTenant?.id || 1,
        isActive: true,
      })
      .onConflictDoNothing();

    // Super Admin Principal - SuperPai
    await db
      .insert(users)
      .values({
        username: "superpai",
        email: "superpai@dnxtai.com",
        password: superpaiPassword,
        firstName: "Super",
        lastName: "Admin",
        role: "super_admin",
        isSuperAdmin: true,
        tenantId: mainTenant?.id || 1,
        isActive: true,
      })
      .onConflictDoNothing();

    console.log("✅ Usuários administrativos criados/verificados");

    // 3. Criar integrações base disponíveis
    const integrationsData = [
      {
        name: "WhatsApp Business API",
        config: { provider: "whatsapp", status: "available" },
        isActive: false,
        tenantId: mainTenant?.id || 1
      },
      {
        name: "ASAAS Pagamentos",
        config: { provider: "asaas", status: "available" },
        isActive: false,
        tenantId: mainTenant?.id || 1
      },
      {
        name: "Google Analytics",
        config: { provider: "google", status: "available" },
        isActive: false,
        tenantId: mainTenant?.id || 1
      },
      {
        name: "Slack",
        config: { provider: "slack", status: "available" },
        isActive: false,
        tenantId: mainTenant?.id || 1
      },
      {
        name: "Facebook/Meta",
        config: { provider: "facebook", status: "available" },
        isActive: false,
        tenantId: mainTenant?.id || 1
      }
    ];

    for (const integrationData of integrationsData) {
      await db
        .insert(integrations)
        .values(integrationData)
        .onConflictDoNothing();
    }

    console.log("✅ Integrações base criadas/verificadas");
    console.log("🎯 Setup de produção finalizado!");
    console.log("🔑 Credenciais de acesso:");
    console.log("   samuel@dnxtai.com / admin123");
    console.log("   leonardo@dnxtai.com / admin123");
    console.log("   superpai@dnxtai.com / admindnxt.leleo");

  } catch (error) {
    console.error("❌ Erro no setup:", error);
    throw error;
  }
}

// Executar seed se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Seed executado com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Falha no seed:", error);
      process.exit(1);
    });
}

export default seedDatabase;
import { db } from "./db";
import { users, tenants } from "@shared/schema";
import { eq } from "drizzle-orm";
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
    console.log("🌱 Iniciando seed do banco de dados...");

    // Criar tenant padrão
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: "DNXT.ai",
        slug: "dnxtai",
        domain: "dnxtai.com",
        primaryColor: "#6E00FF",
        secondaryColor: "#FF2CB4",
        accentColor: "#00F5FF",
      })
      .onConflictDoNothing()
      .returning();

    if (!tenant) {
      console.log("✅ Tenant já existe, buscando...");
      const [existingTenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.slug, "dnxtai"))
        .limit(1);
      
      if (existingTenant) {
        console.log("✅ Tenant encontrado:", existingTenant.name);
      }
    } else {
      console.log("✅ Tenant criado:", tenant.name);
    }

    const tenantId = tenant?.id || 1;

    // Criar usuários administradores
    const adminPassword = await hashPassword("admin123");

    const adminUsers = [
      {
        username: "samuel@dnxtai.com",
        email: "samuel@dnxtai.com",
        password: adminPassword,
        firstName: "Samuel",
        lastName: "Admin",
        role: "admin",
        tenantId,
      },
      {
        username: "leo@dnxtai.com",
        email: "leo@dnxtai.com",
        password: adminPassword,
        firstName: "Leo",
        lastName: "Admin",
        role: "admin",
        tenantId,
      },
    ];

    for (const userData of adminUsers) {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoNothing()
        .returning();

      if (user) {
        console.log("✅ Usuário criado:", user.email);
      } else {
        console.log("⚠️ Usuário já existe:", userData.email);
      }
    }

    console.log("🎉 Seed concluído com sucesso!");
    console.log("");
    console.log("📧 Usuários de demonstração:");
    console.log("   samuel@dnxtai.com - Senha: admin123");
    console.log("   leo@dnxtai.com - Senha: admin123");
    console.log("");

  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  }
}

// Executar seed se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };

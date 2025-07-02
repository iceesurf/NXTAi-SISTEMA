import { db } from "./db";
import { 
  users, 
  tenants, 
  leads, 
  campaigns, 
  conversations, 
  integrations, 
  automations, 
  apiKeys 
} from "@shared/schema";
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
    console.log("🌱 Iniciando seed completo do banco de dados...");

    // 1. Criar tenant principal (NXT.ai)
    const [mainTenant] = await db
      .insert(tenants)
      .values({
        name: "NXT.ai",
        slug: "nxtai",
        domain: "dnxtai.com",
        primaryColor: "#6E00FF",
        secondaryColor: "#9A4DFF",
        accentColor: "#4B0082",
      })
      .onConflictDoNothing()
      .returning();

    // 2. Criar tenants clientes de demonstração
    const [clientTenant1] = await db
      .insert(tenants)
      .values({
        name: "TechStart Brasil",
        slug: "techstart",
        domain: "techstart.dnxtai.com",
        primaryColor: "#0066CC",
        secondaryColor: "#FF6600",
        accentColor: "#00CC66",
      })
      .onConflictDoNothing()
      .returning();

    const [clientTenant2] = await db
      .insert(tenants)
      .values({
        name: "Loja Virtual Plus",
        slug: "lojavirtual",
        domain: "loja.dnxtai.com",
        primaryColor: "#CC0066",
        secondaryColor: "#6600CC",
        accentColor: "#FF6666",
      })
      .onConflictDoNothing()
      .returning();

    const [clientTenant3] = await db
      .insert(tenants)
      .values({
        name: "Consultoria Premium",
        slug: "consultoria",
        domain: "consultoria.dnxtai.com",
        primaryColor: "#008080",
        secondaryColor: "#FF8080",
        accentColor: "#80FF80",
      })
      .onConflictDoNothing()
      .returning();

    console.log("✅ Tenants criados/verificados");

    // 3. Criar usuários administrativos (Super Admin)
    const hashedPassword = await hashPassword("admin123");
    
    // Super Admin - Acesso a todos os tenants
    const [superAdmin] = await db
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
      })
      .onConflictDoNothing()
      .returning();

    // Co-fundador
    const [coFounder] = await db
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
      })
      .onConflictDoNothing()
      .returning();

    // Super Pai - Usuário adicional com acesso total
    const superpaiPassword = await hashPassword("admindnxt.leleo");
    const [superPai] = await db
      .insert(users)
      .values({
        username: "superpai",
        email: "superpai@dnxtai.com",
        password: superpaiPassword,
        firstName: "Super",
        lastName: "Pai",
        role: "super_admin",
        isSuperAdmin: true,
        tenantId: mainTenant?.id || 1,
      })
      .onConflictDoNothing()
      .returning();

    // 4. Criar usuários clientes (Admins dos seus respectivos tenants)
    const clientPassword = await hashPassword("cliente123");

    // Cliente 1 - TechStart
    const [client1Admin] = await db
      .insert(users)
      .values({
        username: "admin@techstart.com",
        email: "admin@techstart.com",
        password: clientPassword,
        firstName: "Carlos",
        lastName: "Mendes",
        role: "admin",
        isSuperAdmin: false,
        tenantId: clientTenant1?.id || 2,
      })
      .onConflictDoNothing()
      .returning();

    const [client1User] = await db
      .insert(users)
      .values({
        username: "vendas@techstart.com",
        email: "vendas@techstart.com",
        password: clientPassword,
        firstName: "Ana",
        lastName: "Costa",
        role: "user",
        isSuperAdmin: false,
        tenantId: clientTenant1?.id || 2,
      })
      .onConflictDoNothing()
      .returning();

    // Cliente 2 - Loja Virtual
    const [client2Admin] = await db
      .insert(users)
      .values({
        username: "admin@lojavirtual.com",
        email: "admin@lojavirtual.com",
        password: clientPassword,
        firstName: "Maria",
        lastName: "Oliveira",
        role: "admin",
        isSuperAdmin: false,
        tenantId: clientTenant2?.id || 3,
      })
      .onConflictDoNothing()
      .returning();

    // Cliente 3 - Consultoria
    const [client3Admin] = await db
      .insert(users)
      .values({
        username: "admin@consultoria.com",
        email: "admin@consultoria.com",
        password: clientPassword,
        firstName: "João",
        lastName: "Fernandes",
        role: "admin",
        isSuperAdmin: false,
        tenantId: clientTenant3?.id || 4,
      })
      .onConflictDoNothing()
      .returning();

    console.log("✅ Usuários criados/verificados");

    // 5. Criar leads reais para cada tenant
    const leadsData = [
      // TechStart Brasil
      {
        name: "Pedro Almeida",
        email: "pedro@empresatec.com.br",
        phone: "+55 11 99123-4567",
        company: "Empresa Tec",
        position: "CTO",
        source: "website",
        status: "qualified",
        tags: ["tecnologia", "startup"],
        notes: "Interessado em soluções de automação",
        tenantId: clientTenant1?.id || 2,
        assignedTo: client1User?.id
      },
      {
        name: "Fernanda Lima",
        email: "fernanda@inovacorp.com.br",
        phone: "+55 11 98765-4321",
        company: "InovaCorp",
        position: "Gerente de Marketing",
        source: "indicacao",
        status: "new",
        tags: ["marketing", "inovacao"],
        notes: "Busca integração com WhatsApp",
        tenantId: clientTenant1?.id || 2,
        assignedTo: client1Admin?.id
      },
      // Loja Virtual Plus
      {
        name: "Ricardo Santos",
        email: "ricardo@comerciodigital.com.br",
        phone: "+55 21 99876-5432",
        company: "Comércio Digital",
        position: "Diretor Comercial",
        source: "google_ads",
        status: "contacted",
        tags: ["ecommerce", "vendas"],
        notes: "Precisa de CRM para e-commerce",
        tenantId: clientTenant2?.id || 3,
        assignedTo: client2Admin?.id
      },
      // Consultoria Premium
      {
        name: "Luciana Rodrigues",
        email: "luciana@consult.com.br",
        phone: "+55 31 99654-3210",
        company: "Consult & Partners",
        position: "Sócia-Diretora",
        source: "linkedin",
        status: "qualified",
        tags: ["consultoria", "B2B"],
        notes: "Interessada em automações para clientes",
        tenantId: clientTenant3?.id || 4,
        assignedTo: client3Admin?.id
      }
    ];

    for (const leadData of leadsData) {
      await db
        .insert(leads)
        .values(leadData)
        .onConflictDoNothing();
    }

    // 6. Criar campanhas ativas
    const campaignsData = [
      {
        name: "Campanha de Boas-vindas",
        type: "email",
        subject: "Bem-vindo ao nosso sistema!",
        content: "Olá! Obrigado por se cadastrar. Estamos aqui para ajudar você a crescer!",
        status: "sent",
        recipientCount: 150,
        openCount: 89,
        clickCount: 34,
        tenantId: clientTenant1?.id || 2,
        createdBy: client1Admin?.id || 3
      },
      {
        name: "Promoção Black Friday",
        type: "whatsapp",
        subject: "Oferta Especial",
        content: "🔥 Black Friday chegou! 50% OFF em todos os produtos!",
        status: "scheduled",
        recipientCount: 0,
        openCount: 0,
        clickCount: 0,
        tenantId: clientTenant2?.id || 3,
        createdBy: client2Admin?.id || 4
      }
    ];

    for (const campaignData of campaignsData) {
      await db
        .insert(campaigns)
        .values(campaignData)
        .onConflictDoNothing();
    }

    // 7. Criar conversas do chatbot
    const conversationsData = [
      {
        leadId: null,
        channel: "whatsapp",
        messages: [
          { id: 1, content: "Olá! Gostaria de saber mais sobre os planos", sender: "user", timestamp: new Date() },
          { id: 2, content: "Olá! Claro, posso ajudar. Temos 3 planos disponíveis...", sender: "bot", timestamp: new Date() }
        ],
        status: "active",
        tenantId: clientTenant1?.id || 2
      },
      {
        leadId: null,
        channel: "website",
        messages: [
          { id: 1, content: "Tenho um problema com meu pedido", sender: "user", timestamp: new Date() },
          { id: 2, content: "Obrigado! Problema resolvido", sender: "user", timestamp: new Date() }
        ],
        status: "closed",
        tenantId: clientTenant2?.id || 3
      }
    ];

    for (const conversationData of conversationsData) {
      await db
        .insert(conversations)
        .values(conversationData)
        .onConflictDoNothing();
    }

    // 8. Criar integrações configuradas
    const integrationsData = [
      {
        name: "WhatsApp Business API",
        config: { phone: "+5511999887766", apiKey: "demo_key", provider: "whatsapp" },
        isActive: true,
        tenantId: clientTenant1?.id || 2
      },
      {
        name: "ASAAS Pagamentos",
        config: { apiKey: "demo_asaas_key", environment: "sandbox", provider: "asaas" },
        isActive: true,
        tenantId: clientTenant2?.id || 3
      },
      {
        name: "Google Analytics",
        config: { trackingId: "GA-123456789", provider: "google" },
        isActive: false,
        tenantId: clientTenant3?.id || 4
      }
    ];

    for (const integrationData of integrationsData) {
      await db
        .insert(integrations)
        .values(integrationData)
        .onConflictDoNothing();
    }

    // 9. Criar automações ativas
    const automationsData = [
      {
        name: "Lead Scoring Automático",
        description: "Pontua leads baseado em ações",
        triggers: [{ type: "lead_action", actions: ["email_open", "link_click"] }],
        actions: [{ type: "score_increment", value: 10 }, { type: "tag_add", value: "engajado" }],
        isActive: true,
        tenantId: clientTenant1?.id || 2,
        createdBy: client1Admin?.id || 3
      },
      {
        name: "Follow-up Vendas",
        description: "Envia follow-up após 3 dias sem resposta",
        triggers: [{ type: "time_based", days_without_response: 3 }],
        actions: [{ type: "send_email", template: "follow_up_template" }],
        isActive: true,
        tenantId: clientTenant2?.id || 3,
        createdBy: client2Admin?.id || 4
      }
    ];

    for (const automationData of automationsData) {
      await db
        .insert(automations)
        .values(automationData)
        .onConflictDoNothing();
    }

    // 10. Criar chaves de API
    const apiKeysData = [
      {
        name: "API Principal",
        key: "nxt_" + Math.random().toString(36).substring(2, 15),
        permissions: ["read", "write"],
        tenantId: clientTenant1?.id || 2,
        createdBy: client1Admin?.id || 3
      },
      {
        name: "Integração E-commerce",
        key: "nxt_" + Math.random().toString(36).substring(2, 15),
        permissions: ["read"],
        tenantId: clientTenant2?.id || 3,
        createdBy: client2Admin?.id || 4
      }
    ];

    for (const apiKeyData of apiKeysData) {
      await db
        .insert(apiKeys)
        .values(apiKeyData)
        .onConflictDoNothing();
    }

    console.log("✅ Seed completo finalizado!");
    console.log("📋 Credenciais de acesso:");
    console.log("🔑 Super Admin: samuel@dnxtai.com / admin123");
    console.log("🔑 Co-fundador: leonardo@dnxtai.com / admin123");
    console.log("🔑 Super Admin Principal: super@admin.ia / admindnxt.leleo");
    console.log("🏢 Cliente TechStart: admin@techstart.com / cliente123");
    console.log("🏢 Cliente Loja Virtual: admin@lojavirtual.com / cliente123");
    console.log("🏢 Cliente Consultoria: admin@consultoria.com / cliente123");
    console.log("👤 Usuário TechStart: vendas@techstart.com / cliente123");

  } catch (error) {
    console.error("❌ Erro no seed:", error);
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
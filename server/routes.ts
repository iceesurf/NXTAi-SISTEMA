import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertLeadSchema, insertCampaignSchema, insertIntegrationSchema, insertAutomationSchema, insertSiteRequestSchema, insertScheduledPostSchema } from "@shared/schema";
import { randomBytes } from "crypto";

function requireAuth(req: any, res: any, next: any) {
  console.log("🔐 Verificando autenticação:", {
    isAuthenticated: req.isAuthenticated(),
    sessionID: req.sessionID,
    user: req.user ? `${req.user.email || req.user.username}` : 'null'
  });
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // API para cadastro de empresas (B2B SaaS)
  app.post("/api/tenant/signup", async (req, res) => {
    try {
      const {
        companyName,
        adminFirstName,
        adminLastName,
        adminEmail,
        adminPassword,
        phone,
        industry,
        employees,
        description,
        website
      } = req.body;

      // Verificar se email já existe
      const existingUser = await storage.getUserByEmail(adminEmail);
      if (existingUser) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }

      // Criar slug único para empresa
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Verificar se slug já existe
      const existingTenant = await storage.getTenantBySlug(slug);
      if (existingTenant) {
        return res.status(400).json({ error: "Nome da empresa já em uso" });
      }

      // Criar tenant (empresa)
      const tenant = await storage.createTenant({
        name: companyName,
        slug: slug,
        domain: `${slug}.dnxtai.com`,
        primaryColor: "#6E00FF",
        secondaryColor: "#9A4DFF",
        accentColor: "#4B0082"
      });

      // Hash da senha
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Criar usuário admin
      await storage.createUser({
        username: adminEmail,
        email: adminEmail,
        password: hashedPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: "admin",
        tenantId: tenant.id
      });

      res.status(201).json({ 
        message: "Empresa cadastrada com sucesso",
        tenantId: tenant.id,
        slug: slug
      });

    } catch (error) {
      console.error("Erro no cadastro:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Dashboard stats
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const leads = await storage.getLeadsByTenant(user.tenantId);
      const campaigns = await storage.getCampaignsByTenant(user.tenantId);
      const conversations = await storage.getConversationsByTenant(user.tenantId);
      
      res.json({
        totalLeads: leads.length,
        activeCampaigns: campaigns.filter(c => c.status !== 'sent').length,
        botConversations: conversations.length,
        conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : "0.0",
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // Leads CRUD
  app.get("/api/leads", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const leads = await storage.getLeadsByTenant(user.tenantId);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar leads" });
    }
  });

  app.post("/api/leads", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const leadData = insertLeadSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
      });
      const lead = await storage.createLead(leadData);
      res.status(201).json(lead);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para o lead" });
    }
  });

  app.put("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await storage.updateLead(parseInt(id), req.body);
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar lead" });
    }
  });

  app.delete("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLead(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Erro ao deletar lead" });
    }
  });

  // Bulk import leads
  app.post("/api/leads/bulk-import", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { leads } = req.body;
      
      if (!Array.isArray(leads) || leads.length === 0) {
        return res.status(400).json({ message: "Lista de leads é obrigatória" });
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const leadData of leads) {
        try {
          // Verificar se email já existe para este tenant
          const existingLeads = await storage.getLeadsByTenant(user.tenantId);
          const emailExists = existingLeads.some(l => l.email.toLowerCase() === leadData.email.toLowerCase());
          
          if (emailExists) {
            errors.push(`Email ${leadData.email} já existe`);
            errorCount++;
            continue;
          }

          // Validar e criar lead
          const validatedLead = insertLeadSchema.parse({
            ...leadData,
            tenantId: user.tenantId,
            assignedTo: user.id
          });
          
          await storage.createLead(validatedLead);
          successCount++;
        } catch (error: any) {
          errorCount++;
          errors.push(`Erro ao processar lead ${leadData.email}: ${error?.message || 'Erro desconhecido'}`);
        }
      }

      res.json({
        success: successCount,
        errors: errorCount,
        total: leads.length,
        errorDetails: errors.slice(0, 10) // Limitar detalhes de erro
      });
    } catch (error) {
      console.error("Erro na importação em lote:", error);
      res.status(500).json({ message: "Erro interno na importação" });
    }
  });

  // Campaigns CRUD
  app.get("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const campaigns = await storage.getCampaignsByTenant(user.tenantId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar campanhas" });
    }
  });

  app.post("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const campaignData = insertCampaignSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
        createdBy: user.id,
      });
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para a campanha" });
    }
  });

  app.put("/api/campaigns/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const campaign = await storage.updateCampaign(parseInt(id), req.body);
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar campanha" });
    }
  });

  app.delete("/api/campaigns/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCampaign(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Erro ao deletar campanha" });
    }
  });

  // Conversations
  app.get("/api/conversations", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const conversations = await storage.getConversationsByTenant(user.tenantId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar conversas" });
    }
  });

  // Integrations
  app.get("/api/integrations", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const integrations = await storage.getIntegrationsByTenant(user.tenantId);
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar integrações" });
    }
  });

  app.post("/api/integrations", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const integrationData = insertIntegrationSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
      });
      const integration = await storage.createIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para a integração" });
    }
  });

  app.put("/api/integrations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const integration = await storage.updateIntegration(parseInt(id), req.body);
      res.json(integration);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar integração" });
    }
  });

  // Automations
  app.get("/api/automations", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const automations = await storage.getAutomationsByTenant(user.tenantId);
      res.json(automations);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar automações" });
    }
  });

  app.post("/api/automations", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const automationData = insertAutomationSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
        createdBy: user.id,
      });
      const automation = await storage.createAutomation(automationData);
      res.status(201).json(automation);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para a automação" });
    }
  });

  app.put("/api/automations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const automation = await storage.updateAutomation(parseInt(id), req.body);
      res.json(automation);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar automação" });
    }
  });

  // API Keys
  app.get("/api/api-keys", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const apiKeys = await storage.getApiKeysByTenant(user.tenantId);
      res.json(apiKeys);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar chaves da API" });
    }
  });

  app.post("/api/api-keys", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { name, permissions } = req.body;
      const key = `nxt_${randomBytes(32).toString('hex')}`;
      
      const apiKey = await storage.createApiKey({
        name,
        key,
        permissions: permissions || [],
        tenantId: user.tenantId,
        createdBy: user.id,
      });
      
      res.status(201).json(apiKey);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar chave da API" });
    }
  });

  app.delete("/api/api-keys/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteApiKey(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Erro ao deletar chave da API" });
    }
  });

  // Team management
  app.get("/api/team", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const team = await storage.getUsersByTenant(user.tenantId);
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar equipe" });
    }
  });

  // Tenant settings
  app.get("/api/tenant", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const tenant = await storage.getTenant(user.tenantId);
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configurações" });
    }
  });

  app.put("/api/tenant", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const tenant = await storage.updateTenant(user.tenantId, req.body);
      res.json(tenant);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar configurações" });
    }
  });

  // Rota administrativa para seed de dados (apenas para super admin)
  app.post("/api/admin/seed", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.isSuperAdmin) {
        return res.status(403).json({ message: "Acesso negado - apenas super admin" });
      }

      // Criar dados de demonstração para clientes
      const clientTenant = await storage.createTenant({
        name: "TechStart Brasil",
        slug: "techstart-demo",
        domain: "techstart.dnxtai.com",
        primaryColor: "#0066CC",
        secondaryColor: "#FF6600",
        accentColor: "#00CC66"
      });

      // Criar usuário cliente
      const clientUser = await storage.createUser({
        username: "demo@techstart.com",
        email: "demo@techstart.com",
        password: "$hashed$demo$password", // Password fictício para demo
        firstName: "Demo",
        lastName: "Cliente",
        role: "admin",
        isSuperAdmin: false,
        tenantId: clientTenant.id
      });

      // Criar leads de demonstração
      const demoLeads = [
        {
          name: "Pedro Silva",
          email: "pedro@empresa.com.br",
          phone: "+55 11 99999-1234",
          company: "Empresa Tech",
          position: "CTO",
          source: "website",
          status: "qualified",
          tags: ["tecnologia", "interessado"],
          notes: "Lead qualificado, demonstrou interesse em automações",
          tenantId: clientTenant.id,
          assignedTo: clientUser.id
        },
        {
          name: "Ana Costa",
          email: "ana@startup.com.br",
          phone: "+55 11 88888-5678",
          company: "StartupXYZ",
          position: "CMO",
          source: "linkedin",
          status: "new",
          tags: ["marketing", "startup"],
          notes: "Primeiro contato, aguardando retorno",
          tenantId: clientTenant.id,
          assignedTo: clientUser.id
        },
        {
          name: "Carlos Mendes",
          email: "carlos@consultoria.com.br",
          phone: "+55 21 77777-9012",
          company: "Consultoria Premium",
          position: "Diretor",
          source: "indicacao",
          status: "contacted",
          tags: ["consultoria", "B2B"],
          notes: "Reunião agendada para próxima semana",
          tenantId: clientTenant.id,
          assignedTo: clientUser.id
        }
      ];

      for (const leadData of demoLeads) {
        await storage.createLead(leadData);
      }

      // Criar campanhas de demonstração
      const demoCampaigns = [
        {
          name: "Welcome Series",
          type: "email",
          subject: "Bem-vindo ao nosso sistema!",
          content: "Olá! Obrigado por se cadastrar. Vamos começar sua jornada!",
          status: "sent",
          recipientCount: 50,
          openCount: 32,
          clickCount: 15,
          tenantId: clientTenant.id,
          createdBy: clientUser.id
        },
        {
          name: "Reativação de Leads",
          type: "whatsapp",
          subject: "Que tal retomar nossa conversa?",
          content: "Oi! Notamos que você demonstrou interesse. Posso ajudar?",
          status: "scheduled",
          recipientCount: 0,
          openCount: 0,
          clickCount: 0,
          tenantId: clientTenant.id,
          createdBy: clientUser.id
        }
      ];

      for (const campaignData of demoCampaigns) {
        await storage.createCampaign(campaignData);
      }

      res.json({ 
        message: "Dados de demonstração criados com sucesso!",
        tenant: clientTenant,
        leadsCount: demoLeads.length,
        campaignsCount: demoCampaigns.length
      });

    } catch (error) {
      console.error("Erro no seed:", error);
      res.status(500).json({ message: "Erro ao criar dados de demonstração" });
    }
  });

  // Admin routes (apenas para super admins)
  app.get("/api/admin/stats", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.isSuperAdmin) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Buscar estatísticas gerais do sistema
      const allTenants = await storage.getAllTenants?.() || [];
      const allUsers = await storage.getAllUsers?.() || [];
      const allLeads = await storage.getAllLeads?.() || [];

      res.json({
        totalTenants: allTenants.length,
        activeTenants: allTenants.filter(t => t.isActive).length,
        totalUsers: allUsers.length,
        totalLeads: allLeads.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  app.get("/api/admin/tenants", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.isSuperAdmin) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const tenants = await storage.getAllTenants?.() || [];
      
      // Adicionar contadores para cada tenant
      const tenantsWithStats = await Promise.all(
        tenants.map(async (tenant) => {
          const users = await storage.getUsersByTenant(tenant.id);
          const leads = await storage.getLeadsByTenant(tenant.id);
          const campaigns = await storage.getCampaignsByTenant(tenant.id);
          
          return {
            ...tenant,
            userCount: users.length,
            leadCount: leads.length,
            campaignCount: campaigns.length,
          };
        })
      );

      res.json(tenantsWithStats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar tenants" });
    }
  });

  app.patch("/api/admin/tenants/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.isSuperAdmin) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { id } = req.params;
      const tenant = await storage.updateTenant(parseInt(id), req.body);
      res.json(tenant);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar tenant" });
    }
  });

  app.delete("/api/admin/tenants/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.isSuperAdmin) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { id } = req.params;
      await storage.deleteTenant?.(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Erro ao deletar tenant" });
    }
  });

  // Site Requests
  app.get("/api/site-requests", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const siteRequests = await storage.getSiteRequestsByTenant(user.tenantId);
      res.json(siteRequests);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar solicitações de site" });
    }
  });

  app.post("/api/site-requests", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const siteRequestData = insertSiteRequestSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
      });
      
      const siteRequest = await storage.createSiteRequest(siteRequestData);
      
      // Enviar email de notificação (stub - funcional sem SendGrid)
      console.log(`📧 Nova solicitação de site:`, {
        from: siteRequest.email,
        name: siteRequest.fullName,
        company: siteRequest.company,
        type: siteRequest.siteType,
        description: siteRequest.description
      });
      
      res.status(201).json(siteRequest);
    } catch (error) {
      console.error("Erro na solicitação de site:", error);
      res.status(400).json({ message: "Dados inválidos para solicitação de site" });
    }
  });

  app.patch("/api/site-requests/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const siteRequest = await storage.updateSiteRequest(parseInt(id), req.body);
      res.json(siteRequest);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar solicitação" });
    }
  });

  app.delete("/api/site-requests/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSiteRequest(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Erro ao deletar solicitação" });
    }
  });

  // Rota administrativa para ver todas as solicitações de site
  app.get("/api/admin/site-requests", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.isSuperAdmin) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const allSiteRequests = await storage.getAllSiteRequests();
      res.json(allSiteRequests);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar todas as solicitações" });
    }
  });

  // Scheduled Posts CRUD
  app.get("/api/scheduled-posts", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const posts = await storage.getScheduledPostsByTenant(user.tenantId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar posts agendados" });
    }
  });

  app.post("/api/scheduled-posts", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const postData = insertScheduledPostSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
        createdBy: user.id,
      });
      const post = await storage.createScheduledPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para post agendado" });
    }
  });

  app.put("/api/scheduled-posts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.updateScheduledPost(parseInt(id), req.body);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar post agendado" });
    }
  });

  app.delete("/api/scheduled-posts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteScheduledPost(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Erro ao deletar post agendado" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

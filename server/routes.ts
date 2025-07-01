import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertLeadSchema, insertCampaignSchema, insertIntegrationSchema, insertAutomationSchema } from "@shared/schema";
import { randomBytes } from "crypto";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}

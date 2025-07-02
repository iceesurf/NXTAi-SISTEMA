import { 
  users, 
  tenants, 
  leads, 
  campaigns, 
  conversations, 
  integrations, 
  automations, 
  apiKeys,
  siteRequests,
  type User, 
  type InsertUser,
  type Tenant,
  type InsertTenant,
  type Lead,
  type InsertLead,
  type Campaign,
  type InsertCampaign,
  type Conversation,
  type InsertConversation,
  type Integration,
  type InsertIntegration,
  type Automation,
  type InsertAutomation,
  type ApiKey,
  type InsertApiKey,
  type SiteRequest,
  type InsertSiteRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByTenant(tenantId: number): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  // Tenants
  getTenant(id: number): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, tenant: Partial<InsertTenant>): Promise<Tenant>;
  getAllTenants(): Promise<Tenant[]>;
  deleteTenant(id: number): Promise<void>;
  
  // Leads
  getLeadsByTenant(tenantId: number): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead>;
  deleteLead(id: number): Promise<void>;
  getAllLeads(): Promise<Lead[]>;
  
  // Campaigns
  getCampaignsByTenant(tenantId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;
  
  // Conversations
  getConversationsByTenant(tenantId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation>;
  
  // Integrations
  getIntegrationsByTenant(tenantId: number): Promise<Integration[]>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, integration: Partial<InsertIntegration>): Promise<Integration>;
  
  // Automations
  getAutomationsByTenant(tenantId: number): Promise<Automation[]>;
  createAutomation(automation: InsertAutomation): Promise<Automation>;
  updateAutomation(id: number, automation: Partial<InsertAutomation>): Promise<Automation>;
  
  // API Keys
  getApiKeysByTenant(tenantId: number): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  deleteApiKey(id: number): Promise<void>;
  
  // Site Requests
  getSiteRequestsByTenant(tenantId: number): Promise<SiteRequest[]>;
  createSiteRequest(siteRequest: InsertSiteRequest): Promise<SiteRequest>;
  updateSiteRequest(id: number, siteRequest: Partial<InsertSiteRequest>): Promise<SiteRequest>;
  deleteSiteRequest(id: number): Promise<void>;
  getAllSiteRequests(): Promise<SiteRequest[]>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUsersByTenant(tenantId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.tenantId, tenantId));
  }

  // Tenants
  async getTenant(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant || undefined;
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db
      .insert(tenants)
      .values(insertTenant)
      .returning();
    return tenant;
  }

  async updateTenant(id: number, updateTenant: Partial<InsertTenant>): Promise<Tenant> {
    const [tenant] = await db
      .update(tenants)
      .set({ ...updateTenant, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return tenant;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants);
  }

  async deleteTenant(id: number): Promise<void> {
    await db.delete(tenants).where(eq(tenants.id, id));
  }

  // Leads
  async getLeadsByTenant(tenantId: number): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.tenantId, tenantId)).orderBy(desc(leads.createdAt));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(insertLead)
      .returning();
    return lead;
  }

  async updateLead(id: number, updateLead: Partial<InsertLead>): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set({ ...updateLead, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }

  // Campaigns
  async getCampaignsByTenant(tenantId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.tenantId, tenantId)).orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db
      .insert(campaigns)
      .values(insertCampaign)
      .returning();
    return campaign;
  }

  async updateCampaign(id: number, updateCampaign: Partial<InsertCampaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updateCampaign, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Conversations
  async getConversationsByTenant(tenantId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.tenantId, tenantId)).orderBy(desc(conversations.createdAt));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: number, updateConversation: Partial<InsertConversation>): Promise<Conversation> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...updateConversation, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  }

  // Integrations
  async getIntegrationsByTenant(tenantId: number): Promise<Integration[]> {
    return await db.select().from(integrations).where(eq(integrations.tenantId, tenantId));
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const [integration] = await db
      .insert(integrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }

  async updateIntegration(id: number, updateIntegration: Partial<InsertIntegration>): Promise<Integration> {
    const [integration] = await db
      .update(integrations)
      .set({ ...updateIntegration, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return integration;
  }

  // Automations
  async getAutomationsByTenant(tenantId: number): Promise<Automation[]> {
    return await db.select().from(automations).where(eq(automations.tenantId, tenantId)).orderBy(desc(automations.createdAt));
  }

  async createAutomation(insertAutomation: InsertAutomation): Promise<Automation> {
    const [automation] = await db
      .insert(automations)
      .values(insertAutomation)
      .returning();
    return automation;
  }

  async updateAutomation(id: number, updateAutomation: Partial<InsertAutomation>): Promise<Automation> {
    const [automation] = await db
      .update(automations)
      .set({ ...updateAutomation, updatedAt: new Date() })
      .where(eq(automations.id, id))
      .returning();
    return automation;
  }

  // API Keys
  async getApiKeysByTenant(tenantId: number): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).where(eq(apiKeys.tenantId, tenantId)).orderBy(desc(apiKeys.createdAt));
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const [apiKey] = await db
      .insert(apiKeys)
      .values(insertApiKey)
      .returning();
    return apiKey;
  }

  async deleteApiKey(id: number): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  // Site Requests
  async getSiteRequestsByTenant(tenantId: number): Promise<SiteRequest[]> {
    return await db.select().from(siteRequests).where(eq(siteRequests.tenantId, tenantId)).orderBy(desc(siteRequests.createdAt));
  }

  async createSiteRequest(insertSiteRequest: InsertSiteRequest): Promise<SiteRequest> {
    const [siteRequest] = await db
      .insert(siteRequests)
      .values(insertSiteRequest)
      .returning();
    return siteRequest;
  }

  async updateSiteRequest(id: number, updateSiteRequest: Partial<InsertSiteRequest>): Promise<SiteRequest> {
    const [siteRequest] = await db
      .update(siteRequests)
      .set({ ...updateSiteRequest, updatedAt: new Date() })
      .where(eq(siteRequests.id, id))
      .returning();
    return siteRequest;
  }

  async deleteSiteRequest(id: number): Promise<void> {
    await db.delete(siteRequests).where(eq(siteRequests.id, id));
  }

  async getAllSiteRequests(): Promise<SiteRequest[]> {
    return await db.select().from(siteRequests).orderBy(desc(siteRequests.createdAt));
  }
}

export const storage = new DatabaseStorage();

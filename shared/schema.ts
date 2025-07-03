import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tenants (Empresas)
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  domain: text("domain"),
  logo: text("logo"),
  primaryColor: text("primary_color").default("#6E00FF"),
  secondaryColor: text("secondary_color").default("#FF2CB4"),
  accentColor: text("accent_color").default("#00F5FF"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"), // super_admin, admin, user, collaborator
  isSuperAdmin: boolean("is_super_admin").default(false),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  position: text("position"),
  source: text("source"), // website, imported, manual, etc.
  status: text("status").default("new"), // new, contacted, qualified, converted, lost
  tags: text("tags").array(),
  notes: text("notes"),
  assignedTo: integer("assigned_to").references(() => users.id),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaigns
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // email, whatsapp, sms
  subject: text("subject"),
  content: text("content").notNull(),
  status: text("status").default("draft"), // draft, scheduled, sent, paused
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chatbot Conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  channel: text("channel").notNull(), // whatsapp, website, telegram
  messages: jsonb("messages").default([]),
  status: text("status").default("active"), // active, closed, transferred
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Integrations
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // asaas, whatsapp, slack, google, etc.
  config: jsonb("config").default({}),
  isActive: boolean("is_active").default(false),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Automations/Workflows
export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  triggers: jsonb("triggers").default([]),
  actions: jsonb("actions").default([]),
  isActive: boolean("is_active").default(false),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Keys
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  permissions: text("permissions").array(),
  lastUsed: timestamp("last_used"),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Site Requests
export const siteRequests = pgTable("site_requests", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  company: text("company"),
  siteType: text("site_type").notNull(),
  description: text("description").notNull(),
  status: text("status").default("pendente"), // pendente, em_andamento, concluido
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scheduled Posts
export const scheduledPosts = pgTable("scheduled_posts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  content: text("content").notNull(),
  platform: text("platform").notNull(), // instagram, whatsapp, email, etc
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").default("scheduled"), // scheduled, published, failed, cancelled
  mediaUrls: text("media_urls").array(),
  metadata: jsonb("metadata").default({}), // platform-specific data
  publishedAt: timestamp("published_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat Messages  
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  leadId: integer("lead_id").references(() => leads.id),
  senderId: integer("sender_id").references(() => users.id),
  senderType: text("sender_type").notNull(), // user, lead, bot
  messageType: text("message_type").default("text"), // text, image, file, button_response
  content: text("content").notNull(),
  metadata: jsonb("metadata").default({}), // platform-specific data, attachments
  isRead: boolean("is_read").default(false),
  platform: text("platform").default("web"), // web, whatsapp, instagram, telegram
  externalId: text("external_id"), // ID from external platform
  createdAt: timestamp("created_at").defaultNow(),
});

// Chatbot Flows
export const chatbotFlows = pgTable("chatbot_flows", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  trigger: text("trigger").notNull(), // new_lead, keyword, webhook, manual
  triggerConditions: jsonb("trigger_conditions").default({}),
  flowData: jsonb("flow_data").notNull(), // visual flow structure
  isActive: boolean("is_active").default(false),
  version: integer("version").default(1),
  stats: jsonb("stats").default({}), // engagement statistics
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Flow Executions (track flow runs)
export const flowExecutions = pgTable("flow_executions", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  flowId: integer("flow_id").references(() => chatbotFlows.id).notNull(),
  leadId: integer("lead_id").references(() => leads.id),
  conversationId: integer("conversation_id").references(() => conversations.id),
  currentStep: text("current_step"),
  variables: jsonb("variables").default({}), // dynamic variables for this execution
  status: text("status").default("running"), // running, completed, failed, paused
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  leads: many(leads),
  campaigns: many(campaigns),
  conversations: many(conversations),
  integrations: many(integrations),
  automations: many(automations),
  apiKeys: many(apiKeys),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  assignedLeads: many(leads),
  campaigns: many(campaigns),
  automations: many(automations),
  apiKeys: many(apiKeys),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [leads.tenantId],
    references: [tenants.id],
  }),
  assignedUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  conversations: many(conversations),
}));

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  tenant: one(tenants, {
    fields: [campaigns.tenantId],
    references: [tenants.id],
  }),
  creator: one(users, {
    fields: [campaigns.createdBy],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [conversations.tenantId],
    references: [tenants.id],
  }),
  lead: one(leads, {
    fields: [conversations.leadId],
    references: [leads.id],
  }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [integrations.tenantId],
    references: [tenants.id],
  }),
}));

export const automationsRelations = relations(automations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [automations.tenantId],
    references: [tenants.id],
  }),
  creator: one(users, {
    fields: [automations.createdBy],
    references: [users.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  tenant: one(tenants, {
    fields: [apiKeys.tenantId],
    references: [tenants.id],
  }),
  creator: one(users, {
    fields: [apiKeys.createdBy],
    references: [users.id],
  }),
}));

export const siteRequestsRelations = relations(siteRequests, ({ one }) => ({
  tenant: one(tenants, {
    fields: [siteRequests.tenantId],
    references: [tenants.id],
  }),
}));

export const scheduledPostsRelations = relations(scheduledPosts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [scheduledPosts.tenantId],
    references: [tenants.id],
  }),
  creator: one(users, {
    fields: [scheduledPosts.createdBy],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  tenant: one(tenants, {
    fields: [chatMessages.tenantId],
    references: [tenants.id],
  }),
  conversation: one(conversations, {
    fields: [chatMessages.conversationId],
    references: [conversations.id],
  }),
  lead: one(leads, {
    fields: [chatMessages.leadId],
    references: [leads.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

export const chatbotFlowsRelations = relations(chatbotFlows, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [chatbotFlows.tenantId],
    references: [tenants.id],
  }),
  creator: one(users, {
    fields: [chatbotFlows.createdBy],
    references: [users.id],
  }),
  executions: many(flowExecutions),
}));

export const flowExecutionsRelations = relations(flowExecutions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [flowExecutions.tenantId],
    references: [tenants.id],
  }),
  flow: one(chatbotFlows, {
    fields: [flowExecutions.flowId],
    references: [chatbotFlows.id],
  }),
  lead: one(leads, {
    fields: [flowExecutions.leadId],
    references: [leads.id],
  }),
  conversation: one(conversations, {
    fields: [flowExecutions.conversationId],
    references: [conversations.id],
  }),
}));

// Schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAutomationSchema = createInsertSchema(automations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
});

export const insertSiteRequestSchema = createInsertSchema(siteRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduledPostSchema = createInsertSchema(scheduledPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertChatbotFlowSchema = createInsertSchema(chatbotFlows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFlowExecutionSchema = createInsertSchema(flowExecutions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = z.infer<typeof insertAutomationSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type SiteRequest = typeof siteRequests.$inferSelect;
export type InsertSiteRequest = z.infer<typeof insertSiteRequestSchema>;

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = z.infer<typeof insertScheduledPostSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type ChatbotFlow = typeof chatbotFlows.$inferSelect;
export type InsertChatbotFlow = z.infer<typeof insertChatbotFlowSchema>;

export type FlowExecution = typeof flowExecutions.$inferSelect;
export type InsertFlowExecution = z.infer<typeof insertFlowExecutionSchema>;

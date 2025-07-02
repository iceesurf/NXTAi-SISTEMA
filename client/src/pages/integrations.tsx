import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import { 
  Plus, 
  Settings, 
  DollarSign, 
  MessageCircle, 
  Calendar, 
  Mail,
  Slack,
  Zap,
  Globe,
  Database,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Integration, InsertIntegration } from "@shared/schema";

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    required?: boolean;
  }[];
  color: string;
}

const integrationTemplates: IntegrationTemplate[] = [
  {
    id: "asaas",
    name: "ASAAS",
    description: "Gateway de pagamentos brasileiro",
    icon: DollarSign,
    category: "Pagamentos",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "Sua chave da API ASAAS", required: true },
      { name: "environment", label: "Ambiente", type: "select", placeholder: "production" }
    ]
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business API",
    description: "Integração com WhatsApp para envio de mensagens",
    icon: MessageCircle,
    category: "Comunicação",
    color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    fields: [
      { name: "accessToken", label: "Access Token", type: "password", placeholder: "Token do WhatsApp Business", required: true },
      { name: "phoneNumberId", label: "Phone Number ID", type: "text", placeholder: "ID do número de telefone", required: true },
      { name: "webhookVerifyToken", label: "Webhook Verify Token", type: "password", placeholder: "Token de verificação" }
    ]
  },
  {
    id: "slack",
    name: "Slack",
    description: "Notificações e comandos via Slack",
    icon: Slack,
    category: "Comunicação",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    fields: [
      { name: "botToken", label: "Bot Token", type: "password", placeholder: "xoxb-...", required: true },
      { name: "channel", label: "Canal Principal", type: "text", placeholder: "#geral" }
    ]
  },
  {
    id: "meta",
    name: "Meta Business",
    description: "Facebook, Instagram e WhatsApp Business",
    icon: MessageCircle,
    category: "Marketing",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    fields: [
      { name: "accessToken", label: "Access Token", type: "password", placeholder: "Token de acesso do Meta", required: true },
      { name: "appId", label: "App ID", type: "text", placeholder: "ID da aplicação Meta", required: true },
      { name: "appSecret", label: "App Secret", type: "password", placeholder: "Segredo da aplicação", required: true },
      { name: "pageId", label: "Page ID", type: "text", placeholder: "ID da página do Facebook" },
      { name: "instagramBusinessId", label: "Instagram Business ID", type: "text", placeholder: "ID da conta comercial Instagram" }
    ]
  },
  {
    id: "google",
    name: "Google Workspace",
    description: "Calendar, Gmail e outras APIs do Google",
    icon: Calendar,
    category: "Produtividade",
    color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    fields: [
      { name: "clientId", label: "Client ID", type: "text", placeholder: "Google Client ID", required: true },
      { name: "clientSecret", label: "Client Secret", type: "password", placeholder: "Google Client Secret", required: true },
      { name: "refreshToken", label: "Refresh Token", type: "password", placeholder: "Token de atualização" }
    ]
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Envio de emails transacionais e marketing",
    icon: Mail,
    category: "Email",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "SG.xxxx", required: true },
      { name: "fromEmail", label: "Email Remetente", type: "email", placeholder: "noreply@suaempresa.com", required: true },
      { name: "fromName", label: "Nome Remetente", type: "text", placeholder: "Sua Empresa" }
    ]
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automações entre aplicativos",
    icon: Zap,
    category: "Automação",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    fields: [
      { name: "webhookUrl", label: "Webhook URL", type: "url", placeholder: "https://hooks.zapier.com/...", required: true }
    ]
  },
  {
    id: "rdstation",
    name: "RD Station",
    description: "Automação de marketing e vendas",
    icon: Database,
    category: "Marketing",
    color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    fields: [
      { name: "clientId", label: "Client ID", type: "text", placeholder: "RD Station Client ID", required: true },
      { name: "clientSecret", label: "Client Secret", type: "password", placeholder: "RD Station Client Secret", required: true },
      { name: "accessToken", label: "Access Token", type: "password", placeholder: "Token de acesso" }
    ]
  },
  {
    id: "webhook",
    name: "Webhook Personalizado",
    description: "Integração via webhook customizado",
    icon: Globe,
    category: "Desenvolvimento",
    color: "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
    fields: [
      { name: "url", label: "URL do Webhook", type: "url", placeholder: "https://api.suaempresa.com/webhook", required: true },
      { name: "secret", label: "Secret Key", type: "password", placeholder: "Chave secreta para validação" },
      { name: "headers", label: "Headers Customizados", type: "textarea", placeholder: "Authorization: Bearer token" }
    ]
  }
];

export default function Integrations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data: integrations = [], isLoading } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (integrationData: Partial<InsertIntegration>) => {
      const res = await apiRequest("POST", "/api/integrations", integrationData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsDialogOpen(false);
      setSelectedTemplate(null);
      setFormData({});
      toast({
        title: "Integração configurada",
        description: "A integração foi configurada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao configurar integração",
        description: "Verifique os dados e tente novamente",
        variant: "destructive",
      });
    },
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/integrations/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Status atualizado",
        description: "O status da integração foi alterado",
      });
    },
  });

  const handleConfigureIntegration = (template: IntegrationTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    createIntegrationMutation.mutate({
      name: selectedTemplate.id,
      config: formData,
      isActive: true,
    });
  };

  const getIntegrationStatus = (integrationId: string) => {
    const integration = integrations.find(i => i.name === integrationId);
    return integration?.isActive ? "connected" : integration ? "configured" : "not_connected";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        );
      case "configured":
        return (
          <Badge variant="outline">
            <Settings className="w-3 h-3 mr-1" />
            Configurado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Não configurado
          </Badge>
        );
    }
  };

  const categories = Array.from(new Set(integrationTemplates.map(t => t.category)));

  return (
    <div>
      <Header 
        title="Integrações" 
        description="Conecte a NXT.ai com suas ferramentas favoritas" 
      />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Integrações</p>
                  <p className="text-2xl font-bold">{integrationTemplates.length}</p>
                </div>
                <Globe className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Configuradas</p>
                  <p className="text-2xl font-bold">{integrations.length}</p>
                </div>
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ativas</p>
                  <p className="text-2xl font-bold">{integrations.filter(i => i.isActive).length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations by Category */}
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {categories.slice(0, 4).map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrationTemplates
                  .filter(template => template.category === category)
                  .map((template) => {
                    const Icon = template.icon;
                    const status = getIntegrationStatus(template.id);
                    const integration = integrations.find(i => i.name === template.id);
                    
                    return (
                      <Card key={template.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            {getStatusBadge(status)}
                          </div>
                          
                          <h3 className="font-semibold mb-2">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                          
                          <div className="space-y-2">
                            {status === "not_connected" ? (
                              <Button
                                onClick={() => handleConfigureIntegration(template)}
                                className="w-full"
                                variant="outline"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Configurar
                              </Button>
                            ) : (
                              <div className="flex gap-2">
                                <Switch
                                  checked={integration?.isActive || false}
                                  onCheckedChange={(checked) => {
                                    if (integration) {
                                      toggleIntegrationMutation.mutate({
                                        id: integration.id,
                                        isActive: checked,
                                      });
                                    }
                                  }}
                                />
                                <Button
                                  onClick={() => handleConfigureIntegration(template)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  Editar
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Configuration Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Configurar {selectedTemplate?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedTemplate && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className={`w-12 h-12 rounded-lg ${selectedTemplate.color} flex items-center justify-center`}>
                    <selectedTemplate.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedTemplate.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedTemplate.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.label} {field.required && "*"}
                      </Label>
                      {field.type === "textarea" ? (
                        <textarea
                          id={field.name}
                          className="w-full p-2 border rounded-md"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                          required={field.required}
                          rows={3}
                        />
                      ) : field.type === "select" ? (
                        <select
                          id={field.name}
                          className="w-full p-2 border rounded-md"
                          value={formData[field.name] || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                          required={field.required}
                        >
                          <option value="">Selecione...</option>
                          <option value="sandbox">Sandbox</option>
                          <option value="production">Produção</option>
                        </select>
                      ) : (
                        <Input
                          id={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Documentação
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Consulte a documentação oficial para obter as chaves de API e configurar corretamente a integração.
                      </p>
                      <Button variant="link" className="h-auto p-0 text-blue-600" asChild>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                          Ver documentação <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createIntegrationMutation.isPending}>
                    Salvar Configuração
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* API Documentation */}
        <Card className="bg-gradient-to-r from-primary/10 via-pink-500/10 to-cyan-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg gradient-nxt flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">API da DNXT.ai</h3>
                <p className="text-muted-foreground mb-4">
                  Use nossa API REST para integrar a DNXT.ai com qualquer aplicação. Acesse dados de leads, 
                  campanhas e automações programaticamente.
                </p>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Documentação da API
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

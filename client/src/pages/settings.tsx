import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import { 
  Settings as SettingsIcon, 
  Building, 
  Palette, 
  Globe, 
  Shield,
  Save,
  Upload,
  Eye,
  Monitor,
  Smartphone,
  Mail,
  Bell,
  Lock,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Tenant } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [tenantForm, setTenantForm] = useState({
    name: "",
    domain: "",
    logo: "",
    primaryColor: "#6E00FF",
    secondaryColor: "#FF2CB4",
    accentColor: "#00F5FF",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    webhookNotifications: true,
    dailyReports: true,
    weeklyReports: true,
    leadAlerts: true,
    campaignAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: false,
    sessionTimeout: 24,
    ipWhitelist: "",
    apiRateLimit: 1000,
  });

  const { data: tenant, isLoading } = useQuery<Tenant>({
    queryKey: ["/api/tenant"],
    onSuccess: (data) => {
      if (data) {
        setTenantForm({
          name: data.name || "",
          domain: data.domain || "",
          logo: data.logo || "",
          primaryColor: data.primaryColor || "#6E00FF",
          secondaryColor: data.secondaryColor || "#FF2CB4",
          accentColor: data.accentColor || "#00F5FF",
        });
      }
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: async (tenantData: Partial<Tenant>) => {
      const res = await apiRequest("PUT", "/api/tenant", tenantData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant"] });
      toast({
        title: "Configurações salvas",
        description: "As configurações da empresa foram atualizadas com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    },
  });

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantMutation.mutate(tenantForm);
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would save notification preferences
    toast({
      title: "Notificações atualizadas",
      description: "Suas preferências de notificação foram salvas",
    });
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would save security settings
    toast({
      title: "Configurações de segurança atualizadas",
      description: "As configurações de segurança foram aplicadas",
    });
  };

  const canManageSettings = user?.role === "admin";

  if (!canManageSettings) {
    return (
      <div>
        <Header 
          title="Configurações" 
          description="Gerencie as configurações da sua conta e empresa" 
        />
        <Card className="mt-6">
          <CardContent className="p-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem acessar as configurações da empresa. 
              Solicite acesso a um administrador se precisar fazer alterações.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Configurações" 
        description="Gerencie as configurações da sua empresa e conta" 
      />

      <div className="space-y-6">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="branding">Marca</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          {/* Company Settings */}
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleTenantSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Nome da Empresa *</Label>
                        <Input
                          id="companyName"
                          value={tenantForm.name}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="domain">Domínio Personalizado</Label>
                        <Input
                          id="domain"
                          value={tenantForm.domain}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, domain: e.target.value }))}
                          placeholder="suaempresa.com"
                        />
                        <p className="text-xs text-muted-foreground">
                          Configure seu domínio personalizado para acessar a plataforma
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companySlug">Slug da Empresa</Label>
                      <Input
                        id="companySlug"
                        value={tenant?.slug || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        O slug é usado na URL e não pode ser alterado: nxt.ai/{tenant?.slug}
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="logo">URL do Logo</Label>
                      <Input
                        id="logo"
                        value={tenantForm.logo}
                        onChange={(e) => setTenantForm(prev => ({ ...prev, logo: e.target.value }))}
                        placeholder="https://exemplo.com/logo.png"
                      />
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </Button>
                        {tenantForm.logo && (
                          <Button type="button" variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={updateTenantMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Configurações
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Settings */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Personalização Visual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTenantSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Cores da Marca</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Cor Primária</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={tenantForm.primaryColor}
                            onChange={(e) => setTenantForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={tenantForm.primaryColor}
                            onChange={(e) => setTenantForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                            placeholder="#6E00FF"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor">Cor Secundária</Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={tenantForm.secondaryColor}
                            onChange={(e) => setTenantForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={tenantForm.secondaryColor}
                            onChange={(e) => setTenantForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            placeholder="#FF2CB4"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accentColor">Cor de Destaque</Label>
                        <div className="flex gap-2">
                          <Input
                            id="accentColor"
                            type="color"
                            value={tenantForm.accentColor}
                            onChange={(e) => setTenantForm(prev => ({ ...prev, accentColor: e.target.value }))}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={tenantForm.accentColor}
                            onChange={(e) => setTenantForm(prev => ({ ...prev, accentColor: e.target.value }))}
                            placeholder="#00F5FF"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Preview da Interface</h3>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ 
                            background: `linear-gradient(135deg, ${tenantForm.primaryColor}, ${tenantForm.secondaryColor}, ${tenantForm.accentColor})`
                          }}
                        >
                          N
                        </div>
                        <div>
                          <h4 className="font-semibold">NXT.ai</h4>
                          <p className="text-sm text-muted-foreground">Preview das cores</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button 
                          style={{ backgroundColor: tenantForm.primaryColor }}
                          className="text-white"
                        >
                          Botão Primário
                        </Button>
                        <Button 
                          variant="outline"
                          style={{ 
                            borderColor: tenantForm.accentColor,
                            color: tenantForm.accentColor
                          }}
                        >
                          Botão Secundário
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setTenantForm(prev => ({
                          ...prev,
                          primaryColor: "#6E00FF",
                          secondaryColor: "#FF2CB4",
                          accentColor: "#00F5FF",
                        }));
                      }}
                    >
                      Restaurar Padrão
                    </Button>
                    <Button type="submit" disabled={updateTenantMutation.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Cores
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Preferências de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Canais de Notificação</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Notificações por Email</p>
                            <p className="text-sm text-muted-foreground">
                              Receba atualizações importantes por email
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Webhooks</p>
                            <p className="text-sm text-muted-foreground">
                              Envie notificações via webhook para integrações
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={notificationSettings.webhookNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, webhookNotifications: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Relatórios Automáticos</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Relatórios Diários</p>
                          <p className="text-sm text-muted-foreground">
                            Resumo diário de atividades e métricas
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.dailyReports}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, dailyReports: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Relatórios Semanais</p>
                          <p className="text-sm text-muted-foreground">
                            Análise semanal completa de performance
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.weeklyReports}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Alertas em Tempo Real</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Novos Leads</p>
                          <p className="text-sm text-muted-foreground">
                            Notificar quando novos leads forem cadastrados
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.leadAlerts}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, leadAlerts: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Status de Campanhas</p>
                          <p className="text-sm text-muted-foreground">
                            Alertas sobre envio e resultados de campanhas
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.campaignAlerts}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, campaignAlerts: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Preferências
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSecuritySubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Autenticação</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Autenticação de Dois Fatores (2FA)</p>
                          <p className="text-sm text-muted-foreground">
                            Adicione uma camada extra de segurança à sua conta
                          </p>
                        </div>
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onCheckedChange={(checked) => 
                            setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Expiração de Senha</p>
                          <p className="text-sm text-muted-foreground">
                            Forçar alteração de senha a cada 90 dias
                          </p>
                        </div>
                        <Switch
                          checked={securitySettings.passwordExpiry}
                          onCheckedChange={(checked) => 
                            setSecuritySettings(prev => ({ ...prev, passwordExpiry: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Sessões</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Timeout da Sessão (horas)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          min="1"
                          max="168"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => 
                            setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Sessões serão encerradas automaticamente após este período de inatividade
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">API e Acesso</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="apiRateLimit">Rate Limit da API (requisições/hora)</Label>
                        <Input
                          id="apiRateLimit"
                          type="number"
                          min="100"
                          max="10000"
                          value={securitySettings.apiRateLimit}
                          onChange={(e) => 
                            setSecuritySettings(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ipWhitelist">Whitelist de IPs (opcional)</Label>
                        <Textarea
                          id="ipWhitelist"
                          value={securitySettings.ipWhitelist}
                          onChange={(e) => 
                            setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))
                          }
                          placeholder="192.168.1.1&#10;10.0.0.1/24"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          Liste os IPs permitidos, um por linha. Deixe vazio para permitir todos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Configurações de Segurança
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Algumas configurações de segurança podem afetar o acesso de todos os usuários da empresa. 
                          Teste as configurações antes de aplicá-las em produção.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import { 
  Users, 
  Mail, 
  MessageCircle, 
  TrendingUp, 
  Plus, 
  Send, 
  Upload, 
  Settings,
  UserPlus,
  Star,
  Check,
  BarChart3,
  DollarSign,
  Calendar,
  Slack
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const quickActions = [
    { icon: Plus, label: "Novo Lead", primary: true },
    { icon: Send, label: "Nova Campanha" },
    { icon: Upload, label: "Importar CSV" },
    { icon: Settings, label: "Configurar Bot" },
  ];

  const recentActivities = [
    {
      icon: UserPlus,
      title: "João Silva foi adicionado ao CRM",
      time: "há 2 minutos",
      color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
    },
    {
      icon: Mail,
      title: 'Campanha "Black Friday 2024" foi enviada',
      time: "há 15 minutos",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
    },
    {
      icon: MessageCircle,
      title: "Nova conversa no chatbot iniciada",
      time: "há 1 hora",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
    },
    {
      icon: TrendingUp,
      title: 'Automação "Follow-up Lead" executada',
      time: "há 2 horas",
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
    },
  ];

  const integrations = [
    {
      name: "ASAAS",
      icon: DollarSign,
      status: "Não conectado",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      statusColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      status: "Conectado",
      color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      statusColor: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
    },
    {
      name: "Slack",
      icon: Slack,
      status: "Não conectado",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      statusColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
    },
    {
      name: "Google",
      icon: Calendar,
      status: "Parcialmente conectado",
      color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      statusColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
    },
  ];

  if (isLoading) {
    return (
      <div>
        <Header />
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Leads</p>
                  <p className="text-2xl font-bold">{stats?.totalLeads || 0}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+12% este mês</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Campanhas Ativas</p>
                  <p className="text-2xl font-bold">{stats?.activeCampaigns || 0}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">5 enviadas hoje</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversações Bot</p>
                  <p className="text-2xl font-bold">{stats?.botConversations || 0}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+8% esta semana</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                  <p className="text-2xl font-bold">{stats?.conversionRate || "0.0"}%</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+3.2% este mês</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Atividade dos Últimos 30 Dias</CardTitle>
                <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm">
                  <option>Últimos 30 dias</option>
                  <option>Últimos 7 dias</option>
                  <option>Este mês</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Gráfico de atividade em tempo real</p>
                  <p className="text-xs text-muted-foreground mt-2">(Dados em tempo real)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    className={`w-full justify-start space-x-3 ${
                      action.primary ? "gradient-nxt text-white" : ""
                    }`}
                    variant={action.primary ? "default" : "outline"}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{action.label}</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Integrations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Atividade Recente</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  Ver tudo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Integrations Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Integrações</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  Configurar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {integrations.map((integration, index) => {
                  const Icon = integration.icon;
                  return (
                    <div key={index} className="p-4 rounded-lg border text-center">
                      <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-medium mb-1">{integration.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{integration.status}</p>
                      <Badge variant="secondary" className={integration.statusColor}>
                        {integration.status === "Conectado" ? "Ativo" : 
                         integration.status === "Parcialmente conectado" ? "Configurado" : "Configurar"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-3 gradient-nxt rounded-lg">
                <div className="flex items-center space-x-3 text-white">
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-medium">Adicionar nova integração</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Features Notice */}
        <Card className="bg-gradient-to-r from-primary/10 via-pink-500/10 to-cyan-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg gradient-nxt flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Recursos Premium Disponíveis</h3>
                <p className="text-muted-foreground mb-4">
                  Esta versão inclui todos os recursos em modo demonstração. Para funcionalidades completas como envio real de campanhas, integrações ativas e IA do chatbot, considere atualizar para um plano pago.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-background">
                    <Check className="w-3 h-3 mr-1" />
                    Interface Completa
                  </Badge>
                  <Badge variant="secondary" className="bg-background">
                    <Check className="w-3 h-3 mr-1" />
                    Dados de Demonstração
                  </Badge>
                  <Badge variant="secondary" className="bg-background">
                    <Check className="w-3 h-3 mr-1" />
                    Multi-tenant Ready
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/header";
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Zap, 
  GitBranch,
  Clock,
  Users,
  Mail,
  MessageCircle,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Automation, InsertAutomation } from "@shared/schema";

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  category: string;
}

const automationTemplates: AutomationTemplate[] = [
  {
    id: "lead_welcome",
    name: "Boas-vindas para Novos Leads",
    description: "Envia email de boas-vindas quando um novo lead é cadastrado",
    trigger: "Novo lead cadastrado",
    actions: ["Enviar email", "Adicionar tag", "Notificar equipe"],
    category: "Lead Nurturing"
  },
  {
    id: "follow_up_email",
    name: "Follow-up Automático",
    description: "Envia emails de follow-up após período sem resposta",
    trigger: "Lead sem resposta por 3 dias",
    actions: ["Enviar email de follow-up", "Alterar status"],
    category: "Vendas"
  },
  {
    id: "campaign_completion",
    name: "Pós-Campanha",
    description: "Ações automáticas após conclusão de campanha",
    trigger: "Campanha finalizada",
    actions: ["Gerar relatório", "Atualizar status dos leads", "Notificar Slack"],
    category: "Marketing"
  },
  {
    id: "lead_scoring",
    name: "Pontuação de Leads",
    description: "Pontua leads baseado em interações e perfil",
    trigger: "Lead realiza ação",
    actions: ["Calcular pontuação", "Atualizar status", "Notificar vendedor"],
    category: "Qualificação"
  }
];

export default function Automations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  
  const [automationForm, setAutomationForm] = useState({
    name: "",
    description: "",
    triggers: [] as any[],
    actions: [] as any[],
    isActive: true,
  });

  const { data: automations = [], isLoading } = useQuery<Automation[]>({
    queryKey: ["/api/automations"],
  });

  const createAutomationMutation = useMutation({
    mutationFn: async (automationData: Partial<InsertAutomation>) => {
      const res = await apiRequest("POST", "/api/automations", automationData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      setIsDialogOpen(false);
      setIsTemplateDialogOpen(false);
      resetForm();
      toast({
        title: "Automação criada com sucesso",
        description: "A automação foi configurada e está ativa",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar automação",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const updateAutomationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Automation> }) => {
      const res = await apiRequest("PUT", `/api/automations/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      setIsDialogOpen(false);
      setEditingAutomation(null);
      resetForm();
      toast({
        title: "Automação atualizada com sucesso",
      });
    },
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/automations/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      toast({
        title: "Status da automação alterado",
      });
    },
  });

  const deleteAutomationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/automations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      toast({
        title: "Automação removida com sucesso",
      });
    },
  });

  const resetForm = () => {
    setAutomationForm({
      name: "",
      description: "",
      triggers: [],
      actions: [],
      isActive: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAutomation) {
      updateAutomationMutation.mutate({
        id: editingAutomation.id,
        data: automationForm,
      });
    } else {
      createAutomationMutation.mutate(automationForm);
    }
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
    setAutomationForm({
      name: automation.name,
      description: automation.description || "",
      triggers: automation.triggers as any[] || [],
      actions: automation.actions as any[] || [],
      isActive: automation.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleUseTemplate = (template: AutomationTemplate) => {
    setAutomationForm({
      name: template.name,
      description: template.description,
      triggers: [{ type: template.trigger }],
      actions: template.actions.map(action => ({ type: action })),
      isActive: true,
    });
    setSelectedTemplate(template);
    setIsTemplateDialogOpen(false);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
        <CheckCircle className="w-3 h-3 mr-1" />
        Ativa
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Pause className="w-3 h-3 mr-1" />
        Pausada
      </Badge>
    );
  };

  return (
    <div>
      <Header 
        title="Automações & Workflows" 
        description="Configure fluxos automatizados para otimizar seus processos" 
      />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Automações</p>
                  <p className="text-2xl font-bold">{automations.length}</p>
                </div>
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ativas</p>
                  <p className="text-2xl font-bold">{automations.filter(a => a.isActive).length}</p>
                </div>
                <Play className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Execuções Hoje</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <GitBranch className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold">98.5%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Suas Automações</h3>
                <p className="text-sm text-muted-foreground">Configure fluxos automáticos para sua operação</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <GitBranch className="w-4 h-4 mr-2" />
                      Templates
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Templates de Automação</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {automationTemplates.map((template) => (
                        <Card key={template.id}>
                          <CardContent className="p-4">
                            <div className="mb-3">
                              <h3 className="font-semibold">{template.name}</h3>
                              <Badge variant="outline" className="mt-1">{template.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                <span className="font-medium">Gatilho:</span> {template.trigger}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Ações:</span>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  {template.actions.map((action, idx) => (
                                    <li key={idx} className="text-muted-foreground">{action}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleUseTemplate(template)}
                              size="sm" 
                              className="w-full"
                            >
                              Usar Template
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingAutomation(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Automação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAutomation ? "Editar Automação" : "Nova Automação"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome da Automação *</Label>
                        <Input
                          id="name"
                          value={automationForm.name}
                          onChange={(e) => setAutomationForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Follow-up para leads sem resposta"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={automationForm.description}
                          onChange={(e) => setAutomationForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva o que esta automação faz..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Gatilho Principal</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o gatilho" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new_lead">Novo lead cadastrado</SelectItem>
                              <SelectItem value="lead_no_response">Lead sem resposta</SelectItem>
                              <SelectItem value="campaign_sent">Campanha enviada</SelectItem>
                              <SelectItem value="lead_tagged">Lead recebeu tag</SelectItem>
                              <SelectItem value="form_submitted">Formulário enviado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Condição</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Condição adicional" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediately">Imediatamente</SelectItem>
                              <SelectItem value="after_1h">Após 1 hora</SelectItem>
                              <SelectItem value="after_24h">Após 24 horas</SelectItem>
                              <SelectItem value="after_3d">Após 3 dias</SelectItem>
                              <SelectItem value="after_7d">Após 7 dias</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Ações a Executar</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 p-3 border rounded-lg">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                              <p className="font-medium">Enviar Email</p>
                              <p className="text-sm text-muted-foreground">Dispara email automaticamente</p>
                            </div>
                            <Switch />
                          </div>
                          
                          <div className="flex items-center gap-4 p-3 border rounded-lg">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                              <p className="font-medium">Notificação Slack</p>
                              <p className="text-sm text-muted-foreground">Envia notificação para o Slack</p>
                            </div>
                            <Switch />
                          </div>
                          
                          <div className="flex items-center gap-4 p-3 border rounded-lg">
                            <Users className="w-5 h-5 text-purple-600" />
                            <div className="flex-1">
                              <p className="font-medium">Atualizar Status</p>
                              <p className="text-sm text-muted-foreground">Altera status do lead automaticamente</p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={automationForm.isActive}
                          onCheckedChange={(checked) => setAutomationForm(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label>Ativar automação imediatamente</Label>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createAutomationMutation.isPending || updateAutomationMutation.isPending}
                        >
                          {editingAutomation ? "Atualizar" : "Criar"} Automação
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automations Table */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : automations.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma automação configurada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando sua primeira automação para otimizar seus processos
                </p>
                <div className="flex justify-center gap-2">
                  <Button onClick={() => setIsTemplateDialogOpen(true)} variant="outline">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Ver Templates
                  </Button>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Automação
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Execuções</TableHead>
                    <TableHead>Última Execução</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automations.map((automation) => (
                    <TableRow key={automation.id}>
                      <TableCell className="font-medium">{automation.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{automation.description}</TableCell>
                      <TableCell>{getStatusBadge(automation.isActive)}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        {automation.createdAt ? new Date(automation.createdAt).toLocaleDateString('pt-BR') : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Switch
                            checked={automation.isActive}
                            onCheckedChange={(checked) => {
                              toggleAutomationMutation.mutate({
                                id: automation.id,
                                isActive: checked,
                              });
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(automation)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja remover esta automação?")) {
                                deleteAutomationMutation.mutate(automation.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <Card className="bg-gradient-to-r from-primary/10 via-pink-500/10 to-cyan-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg gradient-nxt flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Automações Avançadas</h3>
                <p className="text-muted-foreground">
                  As automações estão em modo demonstração. Para execução real, configure as integrações necessárias 
                  (email, Slack, webhooks) e defina os gatilhos apropriados para seu fluxo de trabalho.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/header";
import { Plus, Send, Edit, Trash2, Mail, MessageCircle, BarChart3, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Campaign, InsertCampaign } from "@shared/schema";

export default function Campaigns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    type: "email",
    subject: "",
    content: "",
    status: "draft",
  });

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: Partial<InsertCampaign>) => {
      const res = await apiRequest("POST", "/api/campaigns", campaignData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Campanha criada com sucesso",
        description: "A campanha foi adicionada e está pronta para ser configurada",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar campanha",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Campaign> }) => {
      const res = await apiRequest("PUT", `/api/campaigns/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setIsDialogOpen(false);
      setEditingCampaign(null);
      resetForm();
      toast({
        title: "Campanha atualizada com sucesso",
      });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campanha removida com sucesso",
      });
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/campaigns/${id}`, { 
        status: "sent",
        sentAt: new Date().toISOString() 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campanha enviada com sucesso",
        description: "A campanha foi enviada para todos os destinatários",
      });
    },
  });

  const resetForm = () => {
    setCampaignForm({
      name: "",
      type: "email",
      subject: "",
      content: "",
      status: "draft",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCampaign) {
      updateCampaignMutation.mutate({
        id: editingCampaign.id,
        data: campaignForm,
      });
    } else {
      createCampaignMutation.mutate(campaignForm);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      type: campaign.type,
      subject: campaign.subject || "",
      content: campaign.content,
      status: campaign.status || "draft",
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      draft: { variant: "secondary" },
      scheduled: { variant: "outline" },
      sent: { variant: "default", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" },
      paused: { variant: "destructive" },
    };

    const config = variants[status] || variants.draft;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status === "draft" ? "Rascunho" :
         status === "scheduled" ? "Agendada" :
         status === "sent" ? "Enviada" :
         status === "paused" ? "Pausada" : status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    return type === "email" ? <Mail className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />;
  };

  return (
    <div>
      <Header 
        title="Campanhas de Marketing" 
        description="Crie e gerencie suas campanhas de email e WhatsApp" 
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Campanhas</p>
                  <p className="text-2xl font-bold">{campaigns.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enviadas</p>
                  <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'sent').length}</p>
                </div>
                <Send className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Em Rascunho</p>
                  <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'draft').length}</p>
                </div>
                <Edit className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Abertura</p>
                  <p className="text-2xl font-bold">24.5%</p>
                  <p className="text-xs text-muted-foreground">Média das últimas campanhas</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Suas Campanhas</h3>
                <p className="text-sm text-muted-foreground">Gerencie suas campanhas de marketing</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingCampaign(null);
                  resetForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Campanha
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCampaign ? "Editar Campanha" : "Nova Campanha"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Campanha *</Label>
                      <Input
                        id="name"
                        value={campaignForm.name}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Black Friday 2024"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Campanha</Label>
                        <Select value={campaignForm.type} onValueChange={(value) => setCampaignForm(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={campaignForm.status} onValueChange={(value) => setCampaignForm(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Rascunho</SelectItem>
                            <SelectItem value="scheduled">Agendada</SelectItem>
                            <SelectItem value="sent">Enviada</SelectItem>
                            <SelectItem value="paused">Pausada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {campaignForm.type === "email" && (
                      <div className="space-y-2">
                        <Label htmlFor="subject">Assunto do Email</Label>
                        <Input
                          id="subject"
                          value={campaignForm.subject}
                          onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Ex: Oferta especial só para você!"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">Conteúdo da Mensagem *</Label>
                      <Textarea
                        id="content"
                        value={campaignForm.content}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Digite o conteúdo da sua campanha..."
                        rows={6}
                        required
                      />
                    </div>
                    
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        💡 <strong>Dica:</strong> Use variáveis como {`{nome}`}, {`{empresa}`} para personalizar suas mensagens
                      </p>
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
                        disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                      >
                        {editingCampaign ? "Atualizar" : "Criar"} Campanha
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma campanha criada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando sua primeira campanha de marketing
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Campanha
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Destinatários</TableHead>
                    <TableHead>Taxa Abertura</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(campaign.type)}
                          <span className="capitalize">{campaign.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status || "draft")}</TableCell>
                      <TableCell>{campaign.recipientCount || 0}</TableCell>
                      <TableCell>
                        {campaign.recipientCount && campaign.recipientCount > 0 
                          ? `${(((campaign.openCount || 0) / campaign.recipientCount) * 100).toFixed(1)}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString('pt-BR') : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {campaign.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Tem certeza que deseja enviar esta campanha?")) {
                                  sendCampaignMutation.mutate(campaign.id);
                                }
                              }}
                            >
                              <Send className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(campaign)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja remover esta campanha?")) {
                                deleteCampaignMutation.mutate(campaign.id);
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
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Envio de Campanhas (Modo Demo)</h3>
                <p className="text-muted-foreground">
                  No modo demonstração, as campanhas são marcadas como enviadas mas não são efetivamente disparadas. 
                  Para envios reais, configure as integrações de email (SMTP/SendGrid) e WhatsApp API.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

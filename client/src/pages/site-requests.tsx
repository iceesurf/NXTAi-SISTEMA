import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Globe, Mail, Phone, Building, FileText, Plus, Download, Upload } from "lucide-react";

interface SiteRequest {
  id: number;
  fullName: string;
  email: string;
  whatsapp: string;
  company: string;
  siteType: string;
  description: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  createdAt: string;
  tenantId: number;
}

export default function SiteRequests() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    company: '',
    siteType: '',
    description: ''
  });

  const { toast } = useToast();

  const { data: requests = [], isLoading } = useQuery<SiteRequest[]>({
    queryKey: ['/api/site-requests'],
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest('POST', '/api/site-requests', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-requests'] });
      setFormData({
        fullName: '',
        email: '',
        whatsapp: '',
        company: '',
        siteType: '',
        description: ''
      });
      setShowForm(false);
      toast({
        title: "Solicitação enviada com sucesso!",
        description: "Entraremos em contato em breve para iniciar seu projeto.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PATCH', `/api/site-requests/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-requests'] });
      toast({
        title: "Status atualizado com sucesso!",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequestMutation.mutate(formData);
  };

  const handleExportCSV = () => {
    if (requests.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há solicitações para exportar.",
        variant: "destructive",
      });
      return;
    }

    const csvHeaders = ["ID", "Nome", "Email", "WhatsApp", "Empresa", "Tipo", "Status", "Data"];
    const csvData = requests.map(req => [
      req.id,
      req.fullName,
      req.email,
      req.whatsapp,
      req.company || '',
      req.siteType,
      req.status,
      new Date(req.createdAt).toLocaleDateString('pt-BR')
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `solicitacoes-site-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Exportação concluída!",
      description: "Arquivo CSV baixado com sucesso.",
    });
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          const headers = lines[0]?.split(',');
          
          if (lines.length > 1) {
            toast({
              title: "Importação processada!",
              description: `Arquivo com ${lines.length - 1} linhas processado.`,
            });
          } else {
            toast({
              title: "Arquivo vazio",
              description: "O arquivo CSV não contém dados válidos.",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Erro na importação",
            description: "Formato de arquivo CSV inválido.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500';
      case 'em_andamento': return 'bg-blue-500';
      case 'concluido': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Solicitar Site</h1>
          <p className="text-muted-foreground mt-2">
            Solicite a criação do seu site profissional
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportCSV}
            variant="outline"
            className="transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button 
            onClick={handleImportClick}
            variant="outline"
            className="transition-all duration-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Solicitação
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="animate-fade-in transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Solicitar Criação de Site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="siteType">Tipo de Site Desejado *</Label>
                <Select 
                  value={formData.siteType} 
                  onValueChange={(value) => setFormData({...formData, siteType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="institucional">Site Institucional</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="landing">Landing Page</SelectItem>
                    <SelectItem value="blog">Blog/Portal</SelectItem>
                    <SelectItem value="sistema">Sistema Web</SelectItem>
                    <SelectItem value="app">Aplicativo Mobile</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descrição do Projeto *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva detalhadamente o que você precisa..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createRequestMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createRequestMutation.isPending ? "Enviando..." : "Enviar Pedido"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Minhas Solicitações</h2>
        
        {isLoading ? (
          <div className="text-center py-8">Carregando solicitações...</div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request, index) => (
              <Card key={request.id} className="animate-fade-in transition-all duration-200 hover:shadow-lg" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{request.fullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Solicitado em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(request.status)} text-white`}>
                        {getStatusText(request.status)}
                      </Badge>
                      <Select
                        value={request.status}
                        onValueChange={(status) => updateStatusMutation.mutate({ id: request.id, status })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.whatsapp}</span>
                    </div>
                    {request.company && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{request.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.siteType}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                      <p className="text-sm">{request.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
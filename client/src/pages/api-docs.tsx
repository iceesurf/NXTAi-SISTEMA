import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import { 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Code, 
  Key, 
  Shield,
  ExternalLink,
  CheckCircle,
  Globe
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ApiKey } from "@shared/schema";

const apiEndpoints = [
  {
    method: "GET",
    endpoint: "/api/leads",
    description: "Listar todos os leads",
    parameters: "?status=new&limit=50",
    response: `{
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@empresa.com",
      "status": "new",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 156
}`
  },
  {
    method: "POST",
    endpoint: "/api/leads",
    description: "Criar novo lead",
    parameters: "",
    response: `{
  "id": 123,
  "name": "Maria Santos",
  "email": "maria@empresa.com",
  "status": "new",
  "createdAt": "2024-01-15T10:30:00Z"
}`
  },
  {
    method: "GET",
    endpoint: "/api/campaigns",
    description: "Listar campanhas",
    parameters: "?status=sent&type=email",
    response: `{
  "data": [
    {
      "id": 1,
      "name": "Black Friday 2024",
      "type": "email",
      "status": "sent",
      "recipientCount": 1500
    }
  ]
}`
  },
  {
    method: "POST",
    endpoint: "/api/campaigns",
    description: "Criar nova campanha",
    parameters: "",
    response: `{
  "id": 45,
  "name": "Campanha de Natal",
  "type": "email",
  "status": "draft",
  "createdAt": "2024-01-15T10:30:00Z"
}`
  },
  {
    method: "GET",
    endpoint: "/api/conversations",
    description: "Listar conversas do chatbot",
    parameters: "?status=active&channel=whatsapp",
    response: `{
  "data": [
    {
      "id": 1,
      "leadId": 123,
      "channel": "whatsapp",
      "status": "active",
      "messages": [...]
    }
  ]
}`
  }
];

export default function ApiDocs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [newKeyName, setNewKeyName] = useState("");

  const { data: apiKeys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/api-keys"],
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/api-keys", { 
        name, 
        permissions: ["read", "write"] 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setIsDialogOpen(false);
      setNewKeyName("");
      toast({
        title: "Chave da API criada",
        description: "Nova chave foi gerada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar chave",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "Chave removida",
        description: "A chave da API foi removida com sucesso",
      });
    },
  });

  const toggleKeyVisibility = (keyId: number) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 8) + "..." + key.slice(-4);
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      POST: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    };

    return (
      <Badge className={colors[method] || colors.GET}>
        {method}
      </Badge>
    );
  };

  return (
    <div>
      <Header 
        title="API Pública" 
        description="Integre a NXT.ai com suas aplicações via API REST" 
      />

      <div className="space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chaves Ativas</p>
                  <p className="text-2xl font-bold">{apiKeys.length}</p>
                </div>
                <Key className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Endpoints</p>
                  <p className="text-2xl font-bold">{apiEndpoints.length}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rate Limit</p>
                  <p className="text-2xl font-bold">1000/h</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Documentation Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="auth">Autenticação</TabsTrigger>
            <TabsTrigger value="keys">Chaves API</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo à API da NXT.ai</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Nossa API REST permite que você integre a NXT.ai com qualquer aplicação. 
                  Acesse dados de leads, campanhas, conversas e automações de forma programática.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Base URL</h3>
                    <code className="text-sm bg-muted p-2 rounded block">
                      https://api.nxt.ai/v1
                    </code>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Content Type</h3>
                    <code className="text-sm bg-muted p-2 rounded block">
                      application/json
                    </code>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Recursos Disponíveis
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Gestão completa de leads (CRUD)</li>
                    <li>Criação e gerenciamento de campanhas</li>
                    <li>Acesso a conversas do chatbot</li>
                    <li>Configuração de automações</li>
                    <li>Estatísticas e relatórios</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Endpoints Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {getMethodBadge(endpoint.method)}
                        <code className="font-mono text-sm">{endpoint.endpoint}</code>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{endpoint.description}</p>
                      
                      {endpoint.parameters && (
                        <div className="mb-3">
                          <h4 className="font-medium mb-2">Parâmetros:</h4>
                          <code className="text-sm bg-muted p-2 rounded block">
                            {endpoint.parameters}
                          </code>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-2">Resposta de Exemplo:</h4>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                          <code>{endpoint.response}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Autenticação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  A API da NXT.ai usa autenticação via chaves de API. Inclua sua chave no header de todas as requisições.
                </p>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Header de Autenticação</h3>
                  <code className="text-sm bg-muted p-2 rounded block">
                    Authorization: Bearer SUA_CHAVE_API
                  </code>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Exemplo com cURL</h3>
                  <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
                    <code>{`curl -H "Authorization: Bearer SUA_CHAVE_API" \\
     -H "Content-Type: application/json" \\
     https://api.nxt.ai/v1/leads`}</code>
                  </pre>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Exemplo com JavaScript</h3>
                  <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
                    <code>{`fetch('https://api.nxt.ai/v1/leads', {
  headers: {
    'Authorization': 'Bearer SUA_CHAVE_API',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}</code>
                  </pre>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
                    ⚠️ Segurança
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                    <li>Mantenha suas chaves de API seguras</li>
                    <li>Não compartilhe chaves em repositórios públicos</li>
                    <li>Use HTTPS para todas as requisições</li>
                    <li>Renove chaves periodicamente</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Chaves da API</CardTitle>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Chave
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Criar Nova Chave da API</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="keyName">Nome da Chave</Label>
                          <Input
                            id="keyName"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="Ex: Integração Mobile App"
                          />
                        </div>
                        
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">Permissões</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="read" defaultChecked />
                              <label htmlFor="read" className="text-sm">Leitura (GET)</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="write" defaultChecked />
                              <label htmlFor="write" className="text-sm">Escrita (POST, PUT, DELETE)</label>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            onClick={() => createApiKeyMutation.mutate(newKeyName)}
                            disabled={!newKeyName.trim() || createApiKeyMutation.isPending}
                          >
                            Criar Chave
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-12">
                    <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma chave criada</h3>
                    <p className="text-muted-foreground mb-4">
                      Crie sua primeira chave de API para começar a integrar
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Chave
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Chave</TableHead>
                        <TableHead>Permissões</TableHead>
                        <TableHead>Último Uso</TableHead>
                        <TableHead>Criada em</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((apiKey) => (
                        <TableRow key={apiKey.id}>
                          <TableCell className="font-medium">{apiKey.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-sm">
                                {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleKeyVisibility(apiKey.id)}
                              >
                                {visibleKeys.has(apiKey.id) ? 
                                  <EyeOff className="w-4 h-4" /> : 
                                  <Eye className="w-4 h-4" />
                                }
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(apiKey.key)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {(apiKey.permissions || []).map((permission) => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {apiKey.lastUsed ? 
                              new Date(apiKey.lastUsed).toLocaleDateString('pt-BR') : 
                              "Nunca"
                            }
                          </TableCell>
                          <TableCell>
                            {apiKey.createdAt ? 
                              new Date(apiKey.createdAt).toLocaleDateString('pt-BR') : 
                              "-"
                            }
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Tem certeza que deseja remover esta chave?")) {
                                  deleteApiKeyMutation.mutate(apiKey.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* SDK Links */}
        <Card className="bg-gradient-to-r from-primary/10 via-pink-500/10 to-cyan-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg gradient-nxt flex items-center justify-center flex-shrink-0">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">SDKs e Bibliotecas</h3>
                <p className="text-muted-foreground mb-4">
                  Facilite a integração com nossas bibliotecas oficiais para diferentes linguagens de programação.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    JavaScript SDK
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Python SDK
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    PHP SDK
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

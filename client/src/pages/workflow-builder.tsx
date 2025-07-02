import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Workflow, 
  Plus, 
  Play, 
  Square, 
  Mail, 
  MessageSquare, 
  Clock, 
  Tag, 
  Users, 
  Zap,
  Save,
  Download,
  Upload,
  Trash2,
  Edit
} from "lucide-react";

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  title: string;
  description: string;
  config: any;
  position: { x: number; y: number };
  connections: string[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
}

export default function WorkflowBuilder() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const { toast } = useToast();

  // Templates pré-configurados de automação
  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 'welcome-series',
      name: 'Sequência de Boas-vindas',
      description: 'Automatização para novos leads com email e WhatsApp',
      category: 'lead-nurturing',
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          title: 'Novo Lead',
          description: 'Quando um novo lead é capturado',
          config: { event: 'lead_created' },
          position: { x: 50, y: 50 },
          connections: ['action-1']
        },
        {
          id: 'action-1',
          type: 'action',
          title: 'Enviar Email',
          description: 'Email de boas-vindas',
          config: { 
            type: 'email',
            template: 'welcome',
            subject: 'Bem-vindo!',
            content: 'Obrigado por se inscrever!'
          },
          position: { x: 50, y: 150 },
          connections: ['delay-1']
        },
        {
          id: 'delay-1',
          type: 'delay',
          title: 'Aguardar',
          description: '24 horas',
          config: { duration: 24, unit: 'hours' },
          position: { x: 50, y: 250 },
          connections: ['action-2']
        },
        {
          id: 'action-2',
          type: 'action',
          title: 'WhatsApp',
          description: 'Mensagem de follow-up',
          config: { 
            type: 'whatsapp',
            message: 'Olá! Como posso te ajudar?'
          },
          position: { x: 50, y: 350 },
          connections: []
        }
      ]
    },
    {
      id: 'cart-abandonment',
      name: 'Carrinho Abandonado',
      description: 'Recuperação de vendas perdidas',
      category: 'sales',
      nodes: [
        {
          id: 'trigger-2',
          type: 'trigger',
          title: 'Carrinho Abandonado',
          description: 'Quando um lead abandona o carrinho',
          config: { event: 'cart_abandoned' },
          position: { x: 50, y: 50 },
          connections: ['delay-2']
        },
        {
          id: 'delay-2',
          type: 'delay',
          title: 'Aguardar',
          description: '1 hora',
          config: { duration: 1, unit: 'hours' },
          position: { x: 50, y: 150 },
          connections: ['action-3']
        },
        {
          id: 'action-3',
          type: 'action',
          title: 'Email Lembrete',
          description: 'Lembrar do carrinho',
          config: { 
            type: 'email',
            template: 'cart-reminder',
            subject: 'Você esqueceu algo!',
            content: 'Finalize sua compra com desconto especial!'
          },
          position: { x: 50, y: 250 },
          connections: []
        }
      ]
    }
  ];

  const nodeTypes = [
    { 
      type: 'trigger', 
      title: 'Gatilho', 
      icon: Zap, 
      color: 'bg-green-500',
      options: [
        { value: 'lead_created', label: 'Novo Lead' },
        { value: 'form_submitted', label: 'Formulário Enviado' },
        { value: 'tag_added', label: 'Tag Adicionada' },
        { value: 'date_reached', label: 'Data Específica' }
      ]
    },
    { 
      type: 'condition', 
      title: 'Condição', 
      icon: Users, 
      color: 'bg-blue-500',
      options: [
        { value: 'has_tag', label: 'Possui Tag' },
        { value: 'field_equals', label: 'Campo Igual a' },
        { value: 'time_since', label: 'Tempo Desde' }
      ]
    },
    { 
      type: 'action', 
      title: 'Ação', 
      icon: Mail, 
      color: 'bg-purple-500',
      options: [
        { value: 'send_email', label: 'Enviar Email' },
        { value: 'send_whatsapp', label: 'Enviar WhatsApp' },
        { value: 'add_tag', label: 'Adicionar Tag' },
        { value: 'webhook', label: 'Webhook' },
        { value: 'slack_notification', label: 'Notificação Slack' }
      ]
    },
    { 
      type: 'delay', 
      title: 'Espera', 
      icon: Clock, 
      color: 'bg-orange-500',
      options: [
        { value: 'minutes', label: 'Minutos' },
        { value: 'hours', label: 'Horas' },
        { value: 'days', label: 'Dias' }
      ]
    }
  ];

  const loadTemplate = useCallback((template: WorkflowTemplate) => {
    setNodes(template.nodes);
    setWorkflowName(template.name);
    setSelectedWorkflow(template.id);
    
    toast({
      title: "Template carregado!",
      description: `Workflow "${template.name}" carregado com sucesso.`,
    });
  }, [toast]);

  const addNode = useCallback((type: string) => {
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      title: `Novo ${type}`,
      description: `Configurar ${type}`,
      config: {},
      position: { x: 50 + nodes.length * 120, y: 50 + (nodes.length % 3) * 120 },
      connections: []
    };
    
    setNodes(prev => [...prev, newNode]);
  }, [nodes.length]);

  const removeNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
  }, []);

  const saveWorkflow = useCallback(() => {
    if (!workflowName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para o workflow.",
        variant: "destructive",
      });
      return;
    }

    // Aqui você salvaria no backend
    toast({
      title: "Workflow salvo!",
      description: `Workflow "${workflowName}" salvo com sucesso.`,
    });
  }, [workflowName, toast]);

  const runWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      toast({
        title: "Workflow vazio",
        description: "Adicione nós ao workflow antes de executar.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    
    // Simular execução
    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: "Workflow executado!",
        description: "Workflow executado com sucesso em modo de teste.",
      });
    }, 2000);
  }, [nodes.length, toast]);

  const exportWorkflow = useCallback(() => {
    const workflowData = {
      name: workflowName,
      nodes,
      created: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${workflowName.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Workflow exportado!",
      description: "Arquivo JSON baixado com sucesso.",
    });
  }, [workflowName, nodes, toast]);

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workflowData = JSON.parse(event.target?.result as string);
          setWorkflowName(workflowData.name || 'Workflow Importado');
          setNodes(workflowData.nodes || []);
          
          toast({
            title: "Workflow importado!",
            description: `Workflow "${workflowData.name}" importado com sucesso.`,
          });
        } catch (error) {
          toast({
            title: "Erro na importação",
            description: "Arquivo JSON inválido.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Workflow className="h-8 w-8" />
            Fluxograma de Automações
          </h1>
          <p className="text-muted-foreground mt-2">
            Crie fluxos visuais de automação drag-and-drop
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleImportClick} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={exportWorkflow} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={saveWorkflow} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button 
            onClick={runWorkflow} 
            disabled={isRunning}
            className="bg-primary hover:bg-primary/90"
          >
            {isRunning ? (
              <Square className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? "Executando..." : "Testar Workflow"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Templates Prontos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflowTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="p-3 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => loadTemplate(template)}
              >
                <h4 className="font-semibold text-sm">{template.name}</h4>
                <p className="text-xs text-muted-foreground">{template.description}</p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {template.category}
                </Badge>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Elementos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Elementos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nodeTypes.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <Button
                  key={nodeType.type}
                  onClick={() => addNode(nodeType.type)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <div className={`w-3 h-3 rounded-full ${nodeType.color} mr-2`} />
                  <Icon className="h-4 w-4 mr-2" />
                  {nodeType.title}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Canvas do Workflow */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Input
                    placeholder="Nome do workflow..."
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="text-lg font-semibold border-none p-0 h-auto"
                  />
                  <p className="text-sm text-muted-foreground">
                    {nodes.length} elemento{nodes.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button 
                  onClick={() => setNodes([])}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-96 border-2 border-dashed border-border rounded-lg p-4 relative bg-muted/10">
                {nodes.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Arraste elementos aqui para criar seu fluxo</p>
                      <p className="text-sm">ou use um template pronto</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nodes.map((node, index) => {
                      const nodeType = nodeTypes.find(nt => nt.type === node.type);
                      const Icon = nodeType?.icon || Workflow;
                      
                      return (
                        <div key={node.id} className="relative">
                          {index > 0 && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                              <div className="w-px h-4 bg-border"></div>
                              <div className="w-2 h-2 bg-border rounded-full -mt-1 -ml-0.5"></div>
                            </div>
                          )}
                          
                          <Card className="relative group hover:shadow-md transition-all">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${nodeType?.color}`} />
                                  <Icon className="h-4 w-4" />
                                  <span className="font-semibold text-sm">{node.title}</span>
                                </div>
                                <Button
                                  onClick={() => removeNode(node.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">{node.description}</p>
                              
                              {/* Configuração básica */}
                              <div className="mt-3 space-y-2">
                                {node.type === 'action' && (
                                  <div>
                                    <Label className="text-xs">Tipo de Ação</Label>
                                    <Select defaultValue="send_email">
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="send_email">Enviar Email</SelectItem>
                                        <SelectItem value="send_whatsapp">Enviar WhatsApp</SelectItem>
                                        <SelectItem value="add_tag">Adicionar Tag</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                                
                                {node.type === 'delay' && (
                                  <div className="flex gap-2">
                                    <div className="flex-1">
                                      <Label className="text-xs">Tempo</Label>
                                      <Input placeholder="1" className="h-8" />
                                    </div>
                                    <div className="flex-1">
                                      <Label className="text-xs">Unidade</Label>
                                      <Select defaultValue="hours">
                                        <SelectTrigger className="h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="minutes">Minutos</SelectItem>
                                          <SelectItem value="hours">Horas</SelectItem>
                                          <SelectItem value="days">Dias</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                                
                                {node.type === 'trigger' && (
                                  <div>
                                    <Label className="text-xs">Evento</Label>
                                    <Select defaultValue="lead_created">
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="lead_created">Novo Lead</SelectItem>
                                        <SelectItem value="form_submitted">Formulário Enviado</SelectItem>
                                        <SelectItem value="tag_added">Tag Adicionada</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
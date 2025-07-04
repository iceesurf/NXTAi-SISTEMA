import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/header";
import EditorFluxogramaModerno from "@/components/editor-fluxograma-moderno";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Play,
  Pause,
  Bot,
  Target,
  CheckCircle,
  Zap
} from "lucide-react";
import type { ChatbotFlow, FlowExecution } from "@shared/schema";

// Tipo para converter entre formatos
interface FlowData {
  nodes: Array<{
    id: string;
    type: 'start' | 'message' | 'condition' | 'action' | 'wait' | 'end';
    position: { x: number; y: number };
    data: {
      label: string;
      content?: string;
      conditions?: string[];
      actionType?: string;
      delay?: number;
      [key: string]: any;
    };
    connections: string[];
  }>;
  connections: Array<{ from: string; to: string; condition?: string }>;
}

export default function FlowBuilderAdvanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFlow, setSelectedFlow] = useState<ChatbotFlow | null>(null);
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);

  const [newFlow, setNewFlow] = useState({
    name: '',
    description: '',
    trigger: 'new_lead',
    triggerConditions: {},
    flowData: { nodes: [], connections: [] } as FlowData
  });

  // Query para buscar fluxos
  const { data: flows = [], isLoading } = useQuery<ChatbotFlow[]>({
    queryKey: ['/api/chatbot/flows']
  });

  // Query para buscar execuções
  const { data: executions = [] } = useQuery<FlowExecution[]>({
    queryKey: ['/api/chatbot/executions']
  });

  // Mutation para criar fluxo
  const createFlowMutation = useMutation({
    mutationFn: async (flowData: any) => {
      const res = await apiRequest('POST', '/api/chatbot/flows', flowData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot/flows'] });
      setIsFlowDialogOpen(false);
      setNewFlow({
        name: '',
        description: '',
        trigger: 'new_lead',
        triggerConditions: {},
        flowData: { nodes: [], connections: [] }
      });
      toast({
        title: "Fluxo criado com sucesso!",
        description: "Seu fluxo de chatbot está pronto para ser configurado."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar fluxo",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar fluxo
  const updateFlowMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest('PATCH', `/api/chatbot/flows/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot/flows'] });
      toast({
        title: "Fluxo atualizado!",
        description: "As alterações foram salvas com sucesso."
      });
    }
  });

  // Mutation para testar fluxo
  const testFlowMutation = useMutation({
    mutationFn: async (flowId: number) => {
      const res = await apiRequest('POST', '/api/chatbot/executions', {
        flowId,
        status: 'testing'
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Teste iniciado!",
        description: "O fluxo está sendo testado em modo simulação."
      });
    }
  });

  const triggers = [
    { value: 'new_lead', label: 'Novo Lead' },
    { value: 'keyword', label: 'Palavra-chave' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'manual', label: 'Manual' },
    { value: 'time_based', label: 'Baseado em Tempo' }
  ];

  const handleCreateFlow = () => {
    const startNode = {
      id: 'start_node',
      type: 'start' as const,
      position: { x: 50, y: 100 },
      data: { label: 'Início' },
      connections: []
    };

    createFlowMutation.mutate({
      ...newFlow,
      flowData: {
        nodes: [startNode],
        connections: []
      }
    });
  };

  const getExecutionStats = (flowId: number) => {
    const flowExecutions = executions.filter(exec => exec.flowId === flowId);
    return {
      total: flowExecutions.length,
      completed: flowExecutions.filter(exec => exec.status === 'completed').length,
      running: flowExecutions.filter(exec => exec.status === 'running').length,
      failed: flowExecutions.filter(exec => exec.status === 'failed').length
    };
  };

  return (
    <div className="space-y-6">
      <Header
        title="Construtor de Fluxos Avançado"
        description="Editor visual de fluxos de chatbot com React + D3.js"
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Fluxos</p>
                <p className="text-2xl font-bold">{flows.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Play className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">
                  {flows.filter(f => f.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Execuções</p>
                <p className="text-2xl font-bold">{executions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Taxa Sucesso</p>
                <p className="text-2xl font-bold">
                  {executions.length > 0 
                    ? Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Fluxos */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Meus Fluxos
              </CardTitle>
              <Dialog open={isFlowDialogOpen} onOpenChange={setIsFlowDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gradient-nxt text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Fluxo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Fluxo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Fluxo</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Boas-vindas para novos leads"
                        value={newFlow.name}
                        onChange={(e) => setNewFlow({...newFlow, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Descreva o objetivo deste fluxo..."
                        value={newFlow.description}
                        onChange={(e) => setNewFlow({...newFlow, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="trigger">Gatilho</Label>
                      <Select 
                        value={newFlow.trigger} 
                        onValueChange={(value) => setNewFlow({...newFlow, trigger: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {triggers.map(trigger => (
                            <SelectItem key={trigger.value} value={trigger.value}>
                              {trigger.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsFlowDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateFlow}
                        disabled={!newFlow.name || createFlowMutation.isPending}
                        className="gradient-nxt text-white"
                      >
                        Criar Fluxo
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Carregando fluxos...</div>
              ) : flows.length > 0 ? (
                <div className="space-y-1">
                  {flows.map((flow) => {
                    const stats = getExecutionStats(flow.id);
                    return (
                      <div
                        key={flow.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b ${
                          selectedFlow?.id === flow.id 
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200' 
                            : ''
                        }`}
                        onClick={() => setSelectedFlow(flow)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{flow.name}</h4>
                              <Badge 
                                variant="secondary" 
                                className={flow.isActive 
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                  : 'bg-gray-100 dark:bg-gray-800'
                                }
                              >
                                {flow.isActive ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {flow.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Total: {stats.total}</span>
                              <span>Sucesso: {stats.completed}</span>
                              <span>Executando: {stats.running}</span>
                            </div>
                          </div>
                          <Zap className="w-4 h-4 text-purple-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Nenhum fluxo criado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Crie seu primeiro fluxo de chatbot para começar a automatizar conversas.
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Editor Visual Avançado */}
        <Card className="lg:col-span-8">
          {selectedFlow ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      {selectedFlow.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedFlow.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={selectedFlow.isActive 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                        : 'bg-gray-100 dark:bg-gray-800'
                      }
                    >
                      {selectedFlow.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Button
                      variant={selectedFlow.isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFlowMutation.mutate({
                        id: selectedFlow.id,
                        data: { isActive: !selectedFlow.isActive }
                      })}
                    >
                      {selectedFlow.isActive ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="h-[600px]">
                  <EditorFluxogramaModerno
                    fluxoInicial={selectedFlow ? {
                      id: selectedFlow.id,
                      nome: selectedFlow.name,
                      descricao: selectedFlow.description,
                      trigger: selectedFlow.trigger,
                      isActive: selectedFlow.isActive,
                      nodes: (selectedFlow.flowData as FlowData)?.nodes?.map(node => ({
                        id: node.id,
                        x: node.position?.x || 100,
                        y: node.position?.y || 100,
                        tipo: node.type === 'start' ? 'gatilho' : 
                              node.type === 'end' ? 'fim' :
                              node.type === 'wait' ? 'aguardar' :
                              node.type === 'condition' ? 'condicao' : 'acao',
                        texto: node.data?.label || 'Novo Nó',
                        configuracao: {
                          mensagem: node.data?.content,
                          condicoes: node.data?.conditions,
                          delay: node.data?.delay,
                          acaoTipo: node.data?.actionType
                        }
                      })) || [],
                      links: (selectedFlow.flowData as FlowData)?.connections?.map(link => ({
                        source: link.from,
                        target: link.to,
                        condicao: link.condition
                      })) || []
                    } : undefined}
                    onSalvar={(fluxo) => {
                      const updatedFlowData: FlowData = {
                        nodes: fluxo.nodes.map(node => ({
                          id: node.id,
                          type: node.tipo === 'gatilho' ? 'start' : 
                                node.tipo === 'fim' ? 'end' :
                                node.tipo === 'aguardar' ? 'wait' :
                                node.tipo === 'condicao' ? 'condition' : 'action',
                          position: { x: node.x, y: node.y },
                          data: {
                            label: node.texto,
                            content: node.configuracao?.mensagem || "",
                            conditions: node.configuracao?.condicoes || [],
                            delay: node.configuracao?.delay || 0,
                            actionType: node.configuracao?.acaoTipo || ""
                          },
                          connections: fluxo.links.filter(l => l.source === node.id).map(l => l.target)
                        })),
                        connections: fluxo.links.map(link => ({
                          from: link.source,
                          to: link.target,
                          condition: link.condicao
                        }))
                      };
                      
                      updateFlowMutation.mutate({
                        id: selectedFlow!.id,
                        data: { flowData: updatedFlowData }
                      });
                    }}
                    onTestar={(fluxo) => {
                      testFlowMutation.mutate(selectedFlow!.id);
                    }}
                  />
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Selecione um fluxo para editar
                </h3>
                <p className="text-gray-500 mb-6">
                  Escolha um fluxo da lista ou crie um novo para começar a usar o editor visual.
                </p>
                <Button 
                  onClick={() => setIsFlowDialogOpen(true)}
                  className="gradient-nxt text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Fluxo
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Save, Play, ZoomIn, ZoomOut, RotateCcw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/api-request";

type NodeType = "gatilho" | "condicao" | "acao" | "aguardar" | "fim";
type FluxoNode = {
  id: string;
  x: number;
  y: number;
  tipo: NodeType;
  texto: string;
  configuracao: {
    mensagem?: string;
    condicoes?: string[];
    delay?: number;
    acaoTipo?: string;
  };
};
type FluxoLink = {
  source: string;
  target: string;
  condicao?: string;
};
type FluxoCompleto = {
  id?: number;
  nome: string;
  descricao: string | null;
  nodes: FluxoNode[];
  links: FluxoLink[];
  trigger: string;
  isActive: boolean | null;
};
interface EditorFluxogramaModernoProps {
  fluxoInicial?: FluxoCompleto;
  onSalvar?: (fluxo: FluxoCompleto) => void;
  onTestar?: (fluxo: FluxoCompleto) => void;
}

export default function EditorFluxogramaModerno({ 
  fluxoInicial, 
  onSalvar, 
  onTestar 
}: EditorFluxogramaModernoProps) {
  const { toast } = useToast();
  const [fluxo, setFluxo] = useState<FluxoCompleto>(fluxoInicial || {
    nome: "Novo Fluxo",
    descricao: null,
    nodes: [],
    links: [],
    trigger: "new_lead",
    isActive: false
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [editingNode, setEditingNode] = useState<FluxoNode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const isDraggingRef = useRef(false);

  const nodeColors = {
    gatilho: "#7C2DF1",
    condicao: "#3B82F6",
    acao: "#10B981",
    aguardar: "#F59E0B",
    fim: "#EF4444"
  };
  const nodeLabels = {
    gatilho: "Gatilho",
    condicao: "Condição", 
    acao: "Ação",
    aguardar: "Aguardar",
    fim: "Fim"
  };

  useEffect(() => {
    renderFluxograma();
  }, [fluxo.nodes, fluxo.links, zoom, pan, selectedNode, isConnecting, isEditDialogOpen]);

  const renderFluxograma = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svg.append("g")
      .attr("transform", `translate(${pan.x}, ${pan.y}) scale(${zoom})`);

    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#6B7280");

    // Linhas
    container.selectAll("line")
      .data(fluxo.links)
      .enter()
      .append("line")
      .attr("stroke", "#6B7280")
      .attr("stroke-width", 2)
      .attr("x1", d => {
        const sourceNode = fluxo.nodes.find(n => n.id === d.source);
        return sourceNode ? sourceNode.x + 60 : 0;
      })
      .attr("y1", d => {
        const sourceNode = fluxo.nodes.find(n => n.id === d.source);
        return sourceNode ? sourceNode.y + 20 : 0;
      })
      .attr("x2", d => {
        const targetNode = fluxo.nodes.find(n => n.id === d.target);
        return targetNode ? targetNode.x + 60 : 0;
      })
      .attr("y2", d => {
        const targetNode = fluxo.nodes.find(n => n.id === d.target);
        return targetNode ? targetNode.y + 20 : 0;
      })
      .attr("marker-end", "url(#arrow)")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        setFluxo(prev => ({
          ...prev,
          links: prev.links.filter(l => l.source !== d.source || l.target !== d.target)
        }));
      });

    // Nós com drag-and-drop
    const nodeGroups = container.selectAll("g.node")
      .data(fluxo.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("cursor", isConnecting ? "crosshair" : "move")
      .call(
        d3.drag<SVGGElement, FluxoNode>()
          .on("start", function (event, d) { isDraggingRef.current = false; })
          .on("drag", function (event, d) {
            isDraggingRef.current = true;
            d.x = event.x;
            d.y = event.y;
            setFluxo(prev => ({
              ...prev,
              nodes: prev.nodes.map(n => n.id === d.id ? { ...n, x: d.x, y: d.y } : n)
            }));
          })
          .on("end", function () { setTimeout(() => { isDraggingRef.current = false; }, 100); })
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        if (isDraggingRef.current) return;
        if (isConnecting) {
          if (selectedNode && selectedNode !== d.id) {
            const alreadyConnected = fluxo.links.some(l => l.source === selectedNode && l.target === d.id);
            if (!alreadyConnected) {
              setFluxo(prev => ({
                ...prev,
                links: [...prev.links, { source: selectedNode, target: d.id }]
              }));
              toast({ title: "Conexão criada", description: "Os nós foram conectados com sucesso!" });
            }
            setSelectedNode(null);
            setIsConnecting(false);
          } else {
            setSelectedNode(d.id);
            toast({ title: "Nó selecionado", description: "Agora clique em outro nó para criar a conexão." });
          }
        } else {
          setSelectedNode(selectedNode === d.id ? null : d.id);
        }
      })
      .on("dblclick", (event, d) => {
        event.stopPropagation();
        if (!isConnecting) {
          setEditingNode(d);
          setIsEditDialogOpen(true);
        }
      });

    // Retângulo do nó
    nodeGroups.append("rect")
      .attr("width", 120)
      .attr("height", 50)
      .attr("fill", d => nodeColors[d.tipo])
      .attr("stroke", d => {
        if (selectedNode === d.id && isConnecting) return "#FFD700";
        if (selectedNode === d.id) return "#FFFFFF";
        return "transparent";
      })
      .attr("stroke-width", 3)
      .attr("rx", 8)
      .attr("ry", 8)
      .style("filter", d => {
        if (selectedNode === d.id && isConnecting) return "drop-shadow(0 0 15px rgba(255,215,0,0.8))";
        if (selectedNode === d.id) return "drop-shadow(0 0 10px rgba(255,255,255,0.5))";
        return "none";
      })
      .style("cursor", isConnecting ? "crosshair" : "move");

    // Texto do nó
    nodeGroups.append("text")
      .text(d => d.texto || nodeLabels[d.tipo])
      .attr("x", 60)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .style("pointer-events", "none");

    // Ícone de tipo
    nodeGroups.append("text")
      .text(d => {
        switch(d.tipo) {
          case "gatilho": return "🎯";
          case "condicao": return "❓";
          case "acao": return "⚡";
          case "aguardar": return "⏰";
          case "fim": return "🏁";
          default: return "📋";
        }
      })
      .attr("x", 10)
      .attr("y", 15)
      .attr("font-size", "16px")
      .style("pointer-events", "none");
  };

  const adicionarNo = (tipo: NodeType) => {
    const novoNo: FluxoNode = {
      id: `node_${Date.now()}`,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200,
      tipo,
      texto: nodeLabels[tipo],
      configuracao: {}
    };
    setFluxo(prev => ({
      ...prev,
      nodes: [...prev.nodes, novoNo]
    }));
    toast({
      title: "Nó adicionado",
      description: `Nó do tipo "${nodeLabels[tipo]}" foi adicionado ao fluxo.`
    });
  };

  const removerNo = (nodeId: string) => {
    setFluxo(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      links: prev.links.filter(l => l.source !== nodeId && l.target !== nodeId)
    }));
  };

  const salvarFluxo = async () => {
    try {
      const flowData = {
        nodes: fluxo.nodes.map(node => ({
          id: node.id,
          type: node.tipo === "gatilho" ? "start" : 
                node.tipo === "fim" ? "end" :
                node.tipo === "aguardar" ? "wait" : node.tipo,
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
      if (fluxo.id) {
        await apiRequest("PUT", `/api/chatbot/flows/${fluxo.id}`, {
          name: fluxo.nome,
          description: fluxo.descricao,
          trigger: fluxo.trigger,
          flowData,
          isActive: fluxo.isActive
        });
      } else {
        await apiRequest("POST", "/api/chatbot/flows", {
          name: fluxo.nome,
          description: fluxo.descricao,
          trigger: fluxo.trigger,
          flowData,
          isActive: fluxo.isActive
        });
      }
      if (onSalvar) { onSalvar(fluxo); }
      toast({ title: "Fluxo salvo", description: "O fluxo foi salvo com sucesso!" });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar o fluxo.",
        variant: "destructive"
      });
    }
  };

  const testarFluxo = async () => {
    try {
      if (onTestar) { onTestar(fluxo); }
      toast({
        title: "Teste iniciado",
        description: "O fluxo está sendo testado..."
      });
    } catch (error: any) {
      toast({
        title: "Erro no teste",
        description: error.message || "Ocorreu um erro ao testar o fluxo.",
        variant: "destructive"
      });
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">Editor de Fluxograma - DNXT.ai</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isConnecting 
                  ? "🔗 Modo de conexão ativo - Clique em dois nós para conectá-los"
                  : "Arraste nós, duplo-clique para editar, clique 'Conectar Nós' para ligar elementos"
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={salvarFluxo} className="bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={testarFluxo} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Testar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Toolbar */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button 
                onClick={() => adicionarNo("gatilho")} 
                size="sm"
                style={{ backgroundColor: nodeColors.gatilho }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Gatilho
              </Button>
              <Button 
                onClick={() => adicionarNo("condicao")} 
                size="sm"
                style={{ backgroundColor: nodeColors.condicao }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Condição
              </Button>
              <Button 
                onClick={() => adicionarNo("acao")} 
                size="sm"
                style={{ backgroundColor: nodeColors.acao }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ação
              </Button>
              <Button 
                onClick={() => adicionarNo("aguardar")} 
                size="sm"
                style={{ backgroundColor: nodeColors.aguardar }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Aguardar
              </Button>
              <Button 
                onClick={() => adicionarNo("fim")} 
                size="sm"
                style={{ backgroundColor: nodeColors.fim }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Fim
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setIsConnecting(!isConnecting);
                  setSelectedNode(null);
                  if (!isConnecting) {
                    toast({
                      title: "Modo de conexão ativado",
                      description: "Clique em um nó e depois em outro para conectá-los."
                    });
                  }
                }}
                variant={isConnecting ? "default" : "outline"}
                size="sm"
                className={isConnecting ? "bg-primary text-white" : ""}
              >
                {isConnecting ? "🔗 Conectando..." : "🔗 Conectar Nós"}
              </Button>
              <div className="flex gap-1">
                <Button onClick={() => setZoom(zoom * 1.2)} size="sm" variant="outline">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button onClick={() => setZoom(zoom / 1.2)} size="sm" variant="outline">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button onClick={resetZoom} size="sm" variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Bar */}
      {isConnecting && selectedNode && (
        <Card className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <div className="animate-pulse w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-medium">
                Nó selecionado! Agora clique em outro nó para criar a conexão.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Canvas */}
      <Card className="flex-1">
        <CardContent className="p-0 h-full">
          <svg 
            ref={svgRef} 
            width="100%" 
            height="600" 
            className="border border-border bg-background"
            style={{ minHeight: "500px" }}
          />
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nó - {editingNode?.texto}</DialogTitle>
          </DialogHeader>
          {editingNode && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="texto">Texto do Nó</Label>
                <Input
                  id="texto"
                  value={editingNode.texto}
                  onChange={(e) => setEditingNode({ ...editingNode, texto: e.target.value })}
                />
              </div>
              {editingNode.tipo === "acao" && (
                <div>
                  <Label htmlFor="mensagem">Mensagem</Label>
                  <Textarea
                    id="mensagem"
                    value={editingNode.configuracao?.mensagem || ""}
                    onChange={(e) => setEditingNode({
                      ...editingNode,
                      configuracao: { ...editingNode.configuracao, mensagem: e.target.value }
                    })}
                    placeholder="Digite a mensagem que será enviada..."
                  />
                </div>
              )}
              {editingNode.tipo === "aguardar" && (
                <div>
                  <Label htmlFor="delay">Tempo de Espera (segundos)</Label>
                  <Input
                    id="delay"
                    type="number"
                    value={editingNode.configuracao?.delay || 0}
                    onChange={(e) => setEditingNode({
                      ...editingNode,
                      configuracao: { ...editingNode.configuracao, delay: parseInt(e.target.value) }
                    })}
                  />
                </div>
              )}
              <div className="flex justify-between">
                <Button
                  onClick={() => {
                    removerNo(editingNode.id);
                    setIsEditDialogOpen(false);
                  }}
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </Button>
                <Button
                  onClick={() => {
                    setFluxo(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n => n.id === editingNode.id ? editingNode : n)
                    }));
                    setIsEditDialogOpen(false);
                  }}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
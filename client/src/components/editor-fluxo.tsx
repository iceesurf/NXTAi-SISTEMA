import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  MessageSquare, 
  Filter, 
  Zap, 
  Clock, 
  XCircle, 
  Save,
  Plus,
  Trash2,
  Edit,
  Settings,
  Bot,
  Target,
  ArrowRight
} from "lucide-react";

// Tipos para os nós do fluxo
type FlowNode = {
  id: string;
  x: number;
  y: number;
  type: "start" | "message" | "condition" | "action" | "wait" | "end";
  label: string;
  data?: {
    message?: string;
    condition?: string;
    actionType?: string;
    delay?: number;
    [key: string]: any;
  };
};

type FlowLink = {
  source: string;
  target: string;
  label?: string;
};

type FlowData = {
  nodes: FlowNode[];
  links: FlowLink[];
};

interface EditorFluxoProps {
  flowData?: FlowData;
  onSave?: (flowData: FlowData) => void;
  onTest?: (flowData: FlowData) => void;
  readOnly?: boolean;
}

export default function EditorFluxo({ 
  flowData: initialFlowData, 
  onSave, 
  onTest,
  readOnly = false 
}: EditorFluxoProps) {
  const [flowData, setFlowData] = useState<FlowData>(
    initialFlowData || { nodes: [], links: [] }
  );
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isNodeDialogOpen, setIsNodeDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tipos de nós disponíveis
  const nodeTypes = [
    {
      type: "start",
      label: "Início",
      icon: Play,
      color: "#10B981", // Verde
      description: "Ponto de entrada do fluxo"
    },
    {
      type: "message",
      label: "Mensagem",
      icon: MessageSquare,
      color: "#3B82F6", // Azul
      description: "Enviar mensagem para o usuário"
    },
    {
      type: "condition",
      label: "Condição",
      icon: Filter,
      color: "#F59E0B", // Amarelo
      description: "Decisão baseada em condições"
    },
    {
      type: "action",
      label: "Ação",
      icon: Zap,
      color: "#8B5CF6", // Roxo
      description: "Executar ação (email, webhook, etc.)"
    },
    {
      type: "wait",
      label: "Aguardar",
      icon: Clock,
      color: "#F97316", // Laranja
      description: "Pausar por tempo determinado"
    },
    {
      type: "end",
      label: "Fim",
      icon: XCircle,
      color: "#EF4444", // Vermelho
      description: "Finalizar fluxo"
    }
  ];

  // Atualizar o SVG quando os dados mudarem
  useEffect(() => {
    if (!svgRef.current) return;
    renderFlow();
  }, [flowData, zoom, pan]);

  // Função para renderizar o fluxo com D3.js
  const renderFlow = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Criar grupo principal com zoom e pan
    const g = svg.append("g")
      .attr("transform", `translate(${pan.x}, ${pan.y}) scale(${zoom})`);

    // Definir marcadores para as setas
    const defs = svg.append("defs");
    
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#6B7280");

    // Renderizar links (conexões)
    const links = g.selectAll(".link")
      .data(flowData.links)
      .enter()
      .append("g")
      .attr("class", "link");

    links.append("line")
      .attr("x1", d => {
        const sourceNode = flowData.nodes.find(n => n.id === d.source);
        return sourceNode ? sourceNode.x + 60 : 0;
      })
      .attr("y1", d => {
        const sourceNode = flowData.nodes.find(n => n.id === d.source);
        return sourceNode ? sourceNode.y + 20 : 0;
      })
      .attr("x2", d => {
        const targetNode = flowData.nodes.find(n => n.id === d.target);
        return targetNode ? targetNode.x : 0;
      })
      .attr("y2", d => {
        const targetNode = flowData.nodes.find(n => n.id === d.target);
        return targetNode ? targetNode.y + 20 : 0;
      })
      .attr("stroke", "#6B7280")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    // Renderizar nós
    const nodes = g.selectAll(".node")
      .data(flowData.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("cursor", readOnly ? "default" : "pointer");

    // Adicionar retângulos dos nós
    nodes.append("rect")
      .attr("width", 120)
      .attr("height", 40)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", d => {
        const nodeType = nodeTypes.find(nt => nt.type === d.type);
        return nodeType?.color || "#6B7280";
      })
      .attr("stroke", d => selectedNode === d.id ? "#FFFFFF" : "transparent")
      .attr("stroke-width", 2)
      .attr("opacity", 0.9);

    // Adicionar texto dos nós
    nodes.append("text")
      .text(d => d.label)
      .attr("x", 60)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-size", 12)
      .attr("font-weight", "bold");

    // Adicionar interatividade se não for readonly
    if (!readOnly) {
      // Drag para mover nós
      nodes.call(d3.drag<SVGGElement, FlowNode>()
        .on("start", (event, d) => {
          setSelectedNode(d.id);
        })
        .on("drag", (event, d) => {
          d.x = event.x;
          d.y = event.y;
          setFlowData(prev => ({
            ...prev,
            nodes: prev.nodes.map(n => n.id === d.id ? { ...n, x: d.x, y: d.y } : n)
          }));
        })
      );

      // Click para selecionar ou conectar nós
      nodes.on("click", (event, d) => {
        event.stopPropagation();
        
        if (isConnecting && connectingFrom && connectingFrom !== d.id) {
          // Criar conexão
          const newLink: FlowLink = {
            source: connectingFrom,
            target: d.id
          };
          
          setFlowData(prev => ({
            ...prev,
            links: [...prev.links, newLink]
          }));
          
          setIsConnecting(false);
          setConnectingFrom(null);
        } else {
          setSelectedNode(d.id);
        }
      });

      // Double click para editar
      nodes.on("dblclick", (event, d) => {
        event.stopPropagation();
        setEditingNode(d);
        setIsNodeDialogOpen(true);
      });
    }

    // Click no SVG para deselecionar
    svg.on("click", () => {
      setSelectedNode(null);
      setIsConnecting(false);
      setConnectingFrom(null);
    });

  }, [flowData, selectedNode, isConnecting, connectingFrom, readOnly, zoom, pan]);

  // Adicionar novo nó
  const addNode = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    if (!nodeType) return;

    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      x: 50 + flowData.nodes.length * 20,
      y: 50 + flowData.nodes.length * 20,
      type: type as FlowNode["type"],
      label: nodeType.label,
      data: {}
    };

    setFlowData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    
    setSelectedNode(newNode.id);
  };

  // Remover nó selecionado
  const removeSelectedNode = () => {
    if (!selectedNode) return;

    setFlowData(prev => ({
      nodes: prev.nodes.filter(n => n.id !== selectedNode),
      links: prev.links.filter(l => l.source !== selectedNode && l.target !== selectedNode)
    }));
    
    setSelectedNode(null);
  };

  // Iniciar conexão
  const startConnection = () => {
    if (selectedNode) {
      setIsConnecting(true);
      setConnectingFrom(selectedNode);
    }
  };

  // Salvar fluxo
  const handleSave = () => {
    if (onSave) {
      onSave(flowData);
    }
  };

  // Testar fluxo
  const handleTest = () => {
    if (onTest) {
      onTest(flowData);
    }
  };

  // Atualizar nó editado
  const updateNode = (updatedNode: FlowNode) => {
    setFlowData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === updatedNode.id ? updatedNode : n)
    }));
    setIsNodeDialogOpen(false);
    setEditingNode(null);
  };

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-500" />
          <h3 className="font-medium">Editor de Fluxo Visual</h3>
          <Badge variant="secondary">
            {flowData.nodes.length} nós
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 mr-4">
            <Button size="sm" variant="outline" onClick={zoomOut}>-</Button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button size="sm" variant="outline" onClick={zoomIn}>+</Button>
            <Button size="sm" variant="outline" onClick={resetZoom}>Reset</Button>
          </div>

          {!readOnly && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={startConnection}
                disabled={!selectedNode}
                className={isConnecting ? "bg-blue-100 dark:bg-blue-900" : ""}
              >
                <ArrowRight className="w-4 h-4 mr-1" />
                {isConnecting ? "Conectando..." : "Conectar"}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={removeSelectedNode}
                disabled={!selectedNode}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remover
              </Button>
              
              <Button size="sm" onClick={handleSave} className="gradient-nxt text-white">
                <Save className="w-4 h-4 mr-1" />
                Salvar
              </Button>
              
              <Button size="sm" variant="outline" onClick={handleTest}>
                <Play className="w-4 h-4 mr-1" />
                Testar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Panel de Nós */}
        {!readOnly && (
          <div className="w-64 border-r bg-muted/30 p-4">
            <h4 className="font-medium mb-3">Adicionar Nós</h4>
            <div className="space-y-2">
              {nodeTypes.map((nodeType) => {
                const Icon = nodeType.icon;
                return (
                  <Button
                    key={nodeType.type}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => addNode(nodeType.type as FlowNode["type"])}
                  >
                    <Icon className="w-4 h-4 mr-2" style={{ color: nodeType.color }} />
                    {nodeType.label}
                  </Button>
                );
              })}
            </div>
            
            {selectedNode && (
              <div className="mt-6 p-3 bg-background rounded-lg border">
                <h5 className="font-medium mb-2">Nó Selecionado</h5>
                <p className="text-sm text-muted-foreground">
                  {flowData.nodes.find(n => n.id === selectedNode)?.label}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    const node = flowData.nodes.find(n => n.id === selectedNode);
                    if (node) {
                      setEditingNode(node);
                      setIsNodeDialogOpen(true);
                    }
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden" ref={containerRef}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            className="bg-grid-pattern"
            style={{
              backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          >
          </svg>
          
          {flowData.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Adicione nós para começar a construir seu fluxo</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para editar nó */}
      <Dialog open={isNodeDialogOpen} onOpenChange={setIsNodeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Editar Nó: {editingNode?.label}
            </DialogTitle>
          </DialogHeader>
          
          {editingNode && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="node-label">Rótulo</Label>
                <Input
                  id="node-label"
                  value={editingNode.label}
                  onChange={(e) => setEditingNode({
                    ...editingNode,
                    label: e.target.value
                  })}
                />
              </div>
              
              {editingNode.type === "message" && (
                <div>
                  <Label htmlFor="node-message">Mensagem</Label>
                  <Textarea
                    id="node-message"
                    value={editingNode.data?.message || ""}
                    onChange={(e) => setEditingNode({
                      ...editingNode,
                      data: { ...editingNode.data, message: e.target.value }
                    })}
                    rows={3}
                  />
                </div>
              )}
              
              {editingNode.type === "condition" && (
                <div>
                  <Label htmlFor="node-condition">Condição</Label>
                  <Input
                    id="node-condition"
                    value={editingNode.data?.condition || ""}
                    onChange={(e) => setEditingNode({
                      ...editingNode,
                      data: { ...editingNode.data, condition: e.target.value }
                    })}
                    placeholder="Ex: user.email contains '@gmail.com'"
                  />
                </div>
              )}
              
              {editingNode.type === "wait" && (
                <div>
                  <Label htmlFor="node-delay">Delay (segundos)</Label>
                  <Input
                    id="node-delay"
                    type="number"
                    value={editingNode.data?.delay || 5}
                    onChange={(e) => setEditingNode({
                      ...editingNode,
                      data: { ...editingNode.data, delay: parseInt(e.target.value) }
                    })}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNodeDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => updateNode(editingNode)} className="gradient-nxt text-white">
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
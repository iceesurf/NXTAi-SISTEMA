import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Settings, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Zap,
  Brain,
  Workflow,
  Save
} from "lucide-react";
import type { Conversation } from "@shared/schema";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatFlow {
  id: string;
  name: string;
  trigger: string;
  responses: string[];
  conditions: string[];
  active: boolean;
}

interface AIConfig {
  enabled: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  fallbackMessage: string;
}

export default function Chatbot() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estados para configuração de fluxos
  const [chatFlows, setChatFlows] = useState<ChatFlow[]>([
    {
      id: "welcome",
      name: "Boas-vindas",
      trigger: "iniciar conversa",
      responses: [
        "Olá! Bem-vindo ao atendimento da NXT.ai! 👋",
        "Como posso ajudá-lo hoje?",
        "Estou aqui para responder suas dúvidas sobre nossos produtos e serviços."
      ],
      conditions: ["primeira_mensagem"],
      active: true
    },
    {
      id: "products",
      name: "Informações de Produtos",
      trigger: "produtos|serviços|preços",
      responses: [
        "Temos uma linha completa de soluções para automação de marketing:",
        "🔹 CRM completo com gestão de leads",
        "🔹 Campanhas automatizadas de email e WhatsApp", 
        "🔹 Chatbot inteligente",
        "🔹 Integrações com principais plataformas",
        "Gostaria de saber mais sobre algum produto específico?"
      ],
      conditions: ["contains_keyword"],
      active: true
    }
  ]);

  // Estados para configuração de IA
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    enabled: true,
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 150,
    systemPrompt: "Você é um assistente especializado em marketing digital e automação. Seja útil, profissional e direto nas respostas. Foque em soluções práticas para os clientes.",
    fallbackMessage: "Desculpe, não entendi sua pergunta. Pode reformular ou falar com um de nossos especialistas?"
  });

  const [flowForm, setFlowForm] = useState({
    name: "",
    trigger: "",
    responses: [""],
    conditions: [""],
    active: true
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Olá! Como posso ajudá-lo hoje?",
      sender: "bot",
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: "2",
      content: "Gostaria de saber mais sobre seus produtos",
      sender: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 4)
    },
    {
      id: "3",
      content: "Claro! Temos uma linha completa de soluções para automação de marketing. Você gostaria de saber mais sobre algum produto específico?",
      sender: "bot",
      timestamp: new Date(Date.now() - 1000 * 60 * 3)
    }
  ]);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Scroll automático para o final do chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const mockConversations = [
    {
      id: "1",
      leadName: "João Silva",
      lastMessage: "Gostaria de saber mais sobre os preços",
      status: "active",
      channel: "whatsapp",
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: "2", 
      leadName: "Maria Santos",
      lastMessage: "Obrigada pelas informações!",
      status: "closed",
      channel: "website",
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    }
  ];

  const sendMessage = async () => {
    if (!messageInput.trim() || isTyping) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = messageInput;
    setMessageInput("");
    setIsTyping(true);

    try {
      // Enviar mensagem real para a API
      const response = await apiRequest("POST", "/api/chatbot/trigger", {
        trigger: "user_message",
        message: currentMessage,
        leadId: selectedConversation
      });

      const responseData = await response.json();
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: responseData.response || "Obrigado pela sua mensagem! Um de nossos especialistas entrará em contato em breve.",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);

      // Invalidar cache para atualizar dados
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/conversations"] });
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Funções para gerenciar fluxos do chatbot
  const addChatFlow = () => {
    if (!flowForm.name.trim() || !flowForm.trigger.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e gatilho são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newFlow: ChatFlow = {
      id: `flow-${Date.now()}`,
      name: flowForm.name,
      trigger: flowForm.trigger,
      responses: flowForm.responses.filter(r => r.trim()),
      conditions: flowForm.conditions.filter(c => c.trim()),
      active: flowForm.active
    };

    setChatFlows(prev => [...prev, newFlow]);
    setFlowForm({
      name: "",
      trigger: "",
      responses: [""],
      conditions: [""],
      active: true
    });
    setIsFlowDialogOpen(false);

    toast({
      title: "Fluxo criado!",
      description: `Fluxo "${newFlow.name}" adicionado com sucesso.`,
    });
  };

  const toggleFlowStatus = (flowId: string) => {
    setChatFlows(prev => 
      prev.map(flow => 
        flow.id === flowId 
          ? { ...flow, active: !flow.active }
          : flow
      )
    );
  };

  const deleteFlow = (flowId: string) => {
    setChatFlows(prev => prev.filter(flow => flow.id !== flowId));
    toast({
      title: "Fluxo removido",
      description: "Fluxo excluído com sucesso.",
    });
  };

  const saveAIConfig = () => {
    // Aqui salvaria no backend
    toast({
      title: "Configuração salva!",
      description: "Configurações de IA atualizadas com sucesso.",
    });
  };

  const addResponseField = () => {
    setFlowForm(prev => ({
      ...prev,
      responses: [...prev.responses, ""]
    }));
  };

  const removeResponseField = (index: number) => {
    setFlowForm(prev => ({
      ...prev,
      responses: prev.responses.filter((_, i) => i !== index)
    }));
  };

  const updateResponse = (index: number, value: string) => {
    setFlowForm(prev => ({
      ...prev,
      responses: prev.responses.map((response, i) => 
        i === index ? value : response
      )
    }));
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      active: { variant: "default", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" },
      waiting: { variant: "outline" },
      closed: { variant: "secondary" },
    };

    const config = variants[status] || variants.active;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status === "active" ? "Ativa" :
         status === "waiting" ? "Aguardando" :
         status === "closed" ? "Finalizada" : status}
      </Badge>
    );
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return "💬";
      case "website":
        return "🌐";
      case "telegram":
        return "✈️";
      default:
        return "💬";
    }
  };

  return (
    <div>
      <Header 
        title="Chatbot & Conversas" 
        description="Configure as respostas automáticas, fluxos de conversa e integrações com IA para um atendimento mais eficiente" 
      />

      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conversations">Conversas</TabsTrigger>
            <TabsTrigger value="flows">Configurar Fluxos</TabsTrigger>
            <TabsTrigger value="ai">Integrar IA</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Conversas Ativas</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Taxa de Resolução</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                      <p className="text-2xl font-bold">3.2min</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Satisfação</p>
                      <p className="text-2xl font-bold">4.8/5</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversations List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Conversas</CardTitle>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    <div className="space-y-2 p-4">
                      {mockConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedConversation === conversation.id
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-muted/50 hover:bg-muted"
                          }`}
                          onClick={() => setSelectedConversation(conversation.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{getChannelIcon(conversation.channel)}</span>
                                <h4 className="font-medium text-sm">{conversation.leadName}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {conversation.lastMessage}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {conversation.timestamp.toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            {getStatusBadge(conversation.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Window */}
              <div className="lg:col-span-2">
                <Card className="h-[500px] flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-sm">Simulador de Chat</CardTitle>
                          <p className="text-xs text-muted-foreground">Teste as respostas do bot</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        Online
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-4">
                    <ScrollArea className="flex-1 h-64 mb-4">
                      <div className="space-y-4 p-2">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-start gap-2 ${
                              message.sender === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            {message.sender === "bot" && (
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback>
                                  <Bot className="w-4 h-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`rounded-lg px-3 py-2 max-w-[70%] break-words ${
                                message.sender === "user"
                                  ? "bg-primary text-primary-foreground ml-auto"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <div className={`text-xs opacity-70 mt-1 ${
                                message.sender === "user" ? "text-right" : "text-left"
                              }`}>
                                {message.timestamp.toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                            {message.sender === "user" && (
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback>
                                  <User className="w-4 h-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex items-start gap-2 justify-start">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback>
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted text-foreground rounded-lg px-3 py-2">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    
                    <div className="flex gap-2 pt-4 border-t">
                      <Input
                        placeholder={isTyping ? "Bot está digitando..." : "Digite sua mensagem..."}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        disabled={isTyping}
                        className="flex-1"
                      />
                      <Button 
                        onClick={sendMessage} 
                        size="sm" 
                        disabled={isTyping || !messageInput.trim()}
                        className="min-w-[44px]"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Configuração de Fluxos */}
          <TabsContent value="flows" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Fluxos de Conversa</h3>
                <p className="text-muted-foreground">Configure respostas automáticas baseadas em gatilhos</p>
              </div>
              <Dialog open={isFlowDialogOpen} onOpenChange={setIsFlowDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Fluxo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Fluxo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="flow-name">Nome do Fluxo</Label>
                        <Input
                          id="flow-name"
                          value={flowForm.name}
                          onChange={(e) => setFlowForm(prev => ({...prev, name: e.target.value}))}
                          placeholder="Ex: Boas-vindas"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="flow-trigger">Gatilho</Label>
                        <Input
                          id="flow-trigger"
                          value={flowForm.trigger}
                          onChange={(e) => setFlowForm(prev => ({...prev, trigger: e.target.value}))}
                          placeholder="Ex: oi|olá|começar"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Respostas</Label>
                      {flowForm.responses.map((response, index) => (
                        <div key={index} className="flex gap-2">
                          <Textarea
                            value={response}
                            onChange={(e) => updateResponse(index, e.target.value)}
                            placeholder="Digite a resposta automática..."
                            className="flex-1"
                          />
                          {flowForm.responses.length > 1 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeResponseField(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" onClick={addResponseField}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Resposta
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={flowForm.active}
                        onCheckedChange={(checked) => setFlowForm(prev => ({...prev, active: checked}))}
                      />
                      <Label>Fluxo ativo</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={addChatFlow}>Criar Fluxo</Button>
                      <Button variant="outline" onClick={() => setIsFlowDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {chatFlows.map((flow) => (
                <Card key={flow.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{flow.name}</h4>
                          <Badge variant={flow.active ? "default" : "secondary"}>
                            {flow.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Gatilho: {flow.trigger}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {flow.responses.length} resposta(s) configurada(s)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFlowStatus(flow.id)}
                        >
                          {flow.active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFlow(flow.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Aba de Configuração de IA */}
          <TabsContent value="ai" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Integração com IA</h3>
              <p className="text-muted-foreground">Configure o comportamento da inteligência artificial do chatbot</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Configurações de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={aiConfig.enabled}
                    onCheckedChange={(checked) => setAiConfig(prev => ({...prev, enabled: checked}))}
                  />
                  <Label>Habilitar IA para respostas automáticas</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modelo de IA</Label>
                    <Select 
                      value={aiConfig.model} 
                      onValueChange={(value) => setAiConfig(prev => ({...prev, model: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Criatividade (Temperature): {aiConfig.temperature}</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiConfig.temperature}
                      onChange={(e) => setAiConfig(prev => ({...prev, temperature: parseFloat(e.target.value)}))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Prompt do Sistema</Label>
                  <Textarea
                    value={aiConfig.systemPrompt}
                    onChange={(e) => setAiConfig(prev => ({...prev, systemPrompt: e.target.value}))}
                    placeholder="Defina o comportamento da IA..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mensagem de Fallback</Label>
                  <Input
                    value={aiConfig.fallbackMessage}
                    onChange={(e) => setAiConfig(prev => ({...prev, fallbackMessage: e.target.value}))}
                    placeholder="Mensagem quando a IA não conseguir responder"
                  />
                </div>

                <Button onClick={saveAIConfig}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
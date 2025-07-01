import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/header";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Settings, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import type { Conversation } from "@shared/schema";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function Chatbot() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
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

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const mockConversations = [
    {
      id: "1",
      customerName: "João Silva",
      lastMessage: "Gostaria de saber mais sobre seus produtos",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: "active",
      channel: "whatsapp"
    },
    {
      id: "2",
      customerName: "Maria Santos",
      lastMessage: "Qual é o preço do plano premium?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: "waiting",
      channel: "website"
    },
    {
      id: "3",
      customerName: "Pedro Costa",
      lastMessage: "Obrigado pela informação!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: "closed",
      channel: "telegram"
    }
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Obrigado pela sua mensagem! Um de nossos especialistas entrará em contato em breve.",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
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
        description="Gerencie conversas automatizadas e atendimento" 
      />

      <div className="space-y-6">
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
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {conversation.customerName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{conversation.customerName}</p>
                            <div className="flex items-center gap-1">
                              <span className="text-xs">{getChannelIcon(conversation.channel)}</span>
                              <span className="text-xs text-muted-foreground capitalize">{conversation.channel}</span>
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(conversation.status)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conversation.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedConversation 
                    ? mockConversations.find(c => c.id === selectedConversation)?.customerName || "Conversa"
                    : "Selecione uma conversa"}
                </CardTitle>
                {selectedConversation && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {getChannelIcon(mockConversations.find(c => c.id === selectedConversation)?.channel || "whatsapp")}
                    </span>
                    {getStatusBadge(mockConversations.find(c => c.id === selectedConversation)?.status || "active")}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {selectedConversation ? (
                <div className="flex flex-col h-96">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex max-w-xs lg:max-w-md ${
                              message.sender === "user" ? "flex-row-reverse" : "flex-row"
                            } gap-2`}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`rounded-lg px-3 py-2 ${
                                message.sender === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                    <p className="text-muted-foreground">
                      Escolha uma conversa da lista para visualizar e responder mensagens
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bot Configuration */}
        <Card className="bg-gradient-to-r from-primary/10 via-pink-500/10 to-cyan-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg gradient-nxt flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Configuração do Chatbot</h3>
                <p className="text-muted-foreground mb-4">
                  Configure as respostas automáticas, fluxos de conversa e integrações com IA para um atendimento mais eficiente.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar Fluxos
                  </Button>
                  <Button variant="outline">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Integrar IA
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

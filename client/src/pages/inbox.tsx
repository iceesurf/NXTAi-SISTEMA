import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  MessageCircle,
  Send,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bot
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ChatMessage, Conversation, Lead } from "@shared/schema";

interface ConversationWithDetails extends Conversation {
  lead?: Lead;
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export default function Inbox() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Query para buscar mensagens
  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages']
  });

  // Query para buscar conversas
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations']
  });

  // Query para buscar leads
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ['/api/leads']
  });

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const res = await apiRequest('POST', '/api/chat/messages', messageData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      setNewMessage("");
      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada com sucesso."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await apiRequest('PATCH', `/api/chat/messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage.trim(),
      messageType: 'text'
    });
  };

  // Agrupar mensagens por conversa e contar não lidas
  const conversationDetails: ConversationWithDetails[] = conversations.map(conv => {
    const conversationMessages = messages.filter(msg => msg.conversationId === conv.id);
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    const unreadCount = conversationMessages.filter(msg => !msg.isRead && msg.senderType !== 'user').length;
    const lead = leads.find(l => l.id === conv.leadId);

    return {
      ...conv,
      lead,
      lastMessage,
      unreadCount
    };
  });

  // Filtrar conversas com base na busca
  const filteredConversations = conversationDetails.filter(conv =>
    conv.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lead?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mensagens da conversa selecionada
  const selectedMessages = selectedConversation
    ? messages.filter(msg => msg.conversationId === selectedConversation)
    : [];

  const getMessageStatusIcon = (message: ChatMessage) => {
    if (message.senderType === 'bot') {
      return <Bot className="w-3 h-3 text-purple-500" />;
    }
    if (message.isRead) {
      return <CheckCircle2 className="w-3 h-3 text-green-500" />;
    }
    return <Clock className="w-3 h-3 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <Header
        title="Inbox - Mensagens"
        description="Gerencie todas as conversas e mensagens em tempo real"
      />

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Conversas</p>
                <p className="text-2xl font-bold">{conversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Não Lidas</p>
                <p className="text-2xl font-bold">
                  {conversationDetails.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Bot Ativo</p>
                <p className="text-2xl font-bold">
                  {messages.filter(m => m.senderType === 'bot').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Respondidas</p>
                <p className="text-2xl font-bold">
                  {conversationDetails.filter(conv => conv.lastMessage?.senderType === 'user').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interface de Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Lista de Conversas */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Conversas
            </CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              {conversationsLoading ? (
                <div className="p-4 text-center text-gray-500">Carregando conversas...</div>
              ) : filteredConversations.length > 0 ? (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b ${
                        selectedConversation === conversation.id 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200' 
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation.id);
                        // Marcar mensagens como lidas
                        const unreadMessages = messages.filter(
                          msg => msg.conversationId === conversation.id && !msg.isRead && msg.senderType !== 'user'
                        );
                        unreadMessages.forEach(msg => markAsReadMutation.mutate(msg.id));
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                            {conversation.lead?.name?.charAt(0) || 'L'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium truncate">
                              {conversation.lead?.name || 'Lead sem nome'}
                            </h4>
                            <div className="flex items-center gap-2">
                              {conversation.unreadCount! > 0 && (
                                <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {conversation.lastMessage 
                                  ? format(new Date(conversation.lastMessage.createdAt), 'HH:mm')
                                  : ''
                                }
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {conversation.lead?.email}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {conversation.lastMessage?.content || 'Sem mensagens'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma conversa encontrada
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de Chat */}
        <Card className="lg:col-span-8">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                        {conversationDetails.find(c => c.id === selectedConversation)?.lead?.name?.charAt(0) || 'L'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {conversationDetails.find(c => c.id === selectedConversation)?.lead?.name || 'Lead sem nome'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {conversationDetails.find(c => c.id === selectedConversation)?.lead?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  {messagesLoading ? (
                    <div className="text-center text-gray-500">Carregando mensagens...</div>
                  ) : selectedMessages.length > 0 ? (
                    <div className="space-y-4">
                      {selectedMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderType === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.senderType === 'user'
                                ? 'bg-purple-600 text-white'
                                : message.senderType === 'bot'
                                ? 'bg-gray-100 dark:bg-gray-800 border-l-4 border-purple-500'
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-2 gap-2">
                              <span className="text-xs opacity-70">
                                {format(new Date(message.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                              {getMessageStatusIcon(message)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">Nenhuma mensagem ainda</div>
                  )}
                </ScrollArea>

                {/* Campo de envio de mensagem */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="gradient-nxt text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para começar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
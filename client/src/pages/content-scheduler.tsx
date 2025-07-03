import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Send,
  Instagram,
  MessageCircle,
  Mail,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { ScheduledPost, InsertScheduledPost } from "@shared/schema";

export default function ContentScheduler() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    platform: '',
    scheduledDate: new Date(),
    scheduledTime: '12:00'
  });

  // Query para buscar posts agendados
  const { data: scheduledPosts = [], isLoading } = useQuery<ScheduledPost[]>({
    queryKey: ['/api/scheduled-posts']
  });

  // Mutation para criar novo post
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const res = await apiRequest('POST', '/api/scheduled-posts', postData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      setIsCreateDialogOpen(false);
      setNewPost({
        content: '',
        platform: '',
        scheduledDate: new Date(),
        scheduledTime: '12:00'
      });
      toast({
        title: "Post agendado com sucesso!",
        description: "Seu conteúdo será publicado na data e hora especificadas."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao agendar post",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreatePost = () => {
    const [hours, minutes] = newPost.scheduledTime.split(':');
    const scheduledDateTime = new Date(newPost.scheduledDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    createPostMutation.mutate({
      ...newPost,
      scheduledDate: scheduledDateTime
    });
  };

  const platforms = [
    { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500' },
    { value: 'email', label: 'Email', icon: Mail, color: 'bg-blue-500' }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
      published: { label: 'Publicado', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      failed: { label: 'Falhou', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
  };

  const todayPosts = scheduledPosts.filter(post => {
    const postDate = new Date(post.scheduledDate);
    const today = new Date();
    return postDate.toDateString() === today.toDateString();
  });

  return (
    <div className="space-y-6">
      <Header
        title="Agendamento de Conteúdo"
        description="Gerencie e agende suas publicações em múltiplas plataformas"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={ptBR}
            />
            
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium">Posts de hoje</Label>
              {todayPosts.length > 0 ? (
                <div className="space-y-2">
                  {todayPosts.slice(0, 3).map((post) => (
                    <div key={post.id} className="p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {platforms.find(p => p.value === post.platform)?.icon && (
                          <div className={`w-4 h-4 rounded ${platforms.find(p => p.value === post.platform)?.color}`}></div>
                        )}
                        <span className="text-xs font-medium">{format(new Date(post.scheduledDate), 'HH:mm')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{post.content}</p>
                    </div>
                  ))}
                  {todayPosts.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{todayPosts.length - 3} mais...</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum post agendado para hoje</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Posts */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Posts Agendados</CardTitle>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-nxt text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Agendar Nova Publicação</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="platform">Plataforma</Label>
                      <Select value={newPost.platform} onValueChange={(value) => setNewPost({...newPost, platform: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma plataforma" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform.value} value={platform.value}>
                              <div className="flex items-center gap-2">
                                <platform.icon className="w-4 h-4" />
                                {platform.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="content">Conteúdo</Label>
                      <Textarea
                        id="content"
                        placeholder="Digite o conteúdo da sua publicação..."
                        value={newPost.content}
                        onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Data</Label>
                        <Input
                          id="date"
                          type="date"
                          value={format(newPost.scheduledDate, 'yyyy-MM-dd')}
                          onChange={(e) => setNewPost({...newPost, scheduledDate: new Date(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Horário</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newPost.scheduledTime}
                          onChange={(e) => setNewPost({...newPost, scheduledTime: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreatePost}
                        disabled={!newPost.content || !newPost.platform}
                        className="gradient-nxt text-white"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Agendar Post
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="scheduled">Agendados</TabsTrigger>
                <TabsTrigger value="published">Publicados</TabsTrigger>
                <TabsTrigger value="failed">Falhou</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  {scheduledPosts.length > 0 ? (
                    <div className="space-y-3">
                      {scheduledPosts.map((post) => {
                        const platform = platforms.find(p => p.value === post.platform);
                        const statusInfo = getStatusBadge(post.status);
                        
                        return (
                          <Card key={post.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {platform && (
                                    <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center`}>
                                      <platform.icon className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-medium">{platform?.label}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(post.scheduledDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm mb-3">{post.content}</p>
                                <Badge className={statusInfo.color}>
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum post agendado</h3>
                      <p className="text-muted-foreground mb-4">
                        Comece criando seu primeiro agendamento de conteúdo
                      </p>
                      <Button 
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="gradient-nxt text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Post
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Agendados</p>
                <p className="text-2xl font-bold">
                  {scheduledPosts.filter(p => p.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Publicados</p>
                <p className="text-2xl font-bold">
                  {scheduledPosts.filter(p => p.status === 'published').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{todayPosts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CalendarIcon className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold">
                  {scheduledPosts.filter(p => {
                    const postDate = new Date(p.scheduledDate);
                    const today = new Date();
                    const weekFromNow = new Date();
                    weekFromNow.setDate(today.getDate() + 7);
                    return postDate >= today && postDate <= weekFromNow;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
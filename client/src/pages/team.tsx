import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/header";
import { 
  Plus, 
  UserPlus, 
  Edit, 
  Trash2, 
  Users, 
  Shield, 
  Crown,
  Mail,
  MoreVertical,
  Settings
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { User, InsertUser } from "@shared/schema";

export default function Team() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [userForm, setUserForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "user",
  });

  const { data: teamMembers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/team"],
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (userData: Partial<InsertUser>) => {
      const res = await apiRequest("POST", "/api/team/invite", userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Convite enviado",
        description: "O usuário foi convidado para a equipe",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar convite",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      const res = await apiRequest("PUT", `/api/team/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar usuário",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/team/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido da equipe",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover usuário",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setUserForm({
      email: "",
      firstName: "",
      lastName: "",
      role: "user",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        data: userForm,
      });
    } else {
      inviteUserMutation.mutate({
        ...userForm,
        username: userForm.email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        tenantId: currentUser?.tenantId,
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
    setIsDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string; icon?: any }> = {
      admin: { 
        variant: "default", 
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
        icon: Crown
      },
      user: { 
        variant: "outline",
        icon: Users
      },
      collaborator: { 
        variant: "secondary",
        icon: Shield
      },
    };

    const config = variants[role] || variants.user;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {role === "admin" ? "Administrador" :
         role === "collaborator" ? "Colaborador" :
         "Usuário"}
      </Badge>
    );
  };

  const canManageUsers = currentUser?.role === "admin";

  return (
    <div>
      <Header 
        title="Equipe" 
        description="Gerencie os membros da sua equipe e suas permissões" 
      />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Membros</p>
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                  <p className="text-2xl font-bold">{teamMembers.filter(m => m.role === 'admin').length}</p>
                </div>
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{teamMembers.filter(m => m.isActive).length}</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Convites Pendentes</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Mail className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Membros da Equipe</h3>
                <p className="text-sm text-muted-foreground">
                  {canManageUsers 
                    ? "Gerencie membros e suas permissões"
                    : "Visualize os membros da sua equipe"
                  }
                </p>
              </div>
              {canManageUsers && (
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingUser(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Convidar Membro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingUser ? "Editar Membro" : "Convidar Novo Membro"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Nome *</Label>
                          <Input
                            id="firstName"
                            value={userForm.firstName}
                            onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Sobrenome *</Label>
                          <Input
                            id="lastName"
                            value={userForm.lastName}
                            onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!!editingUser}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Função</Label>
                        <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="collaborator">Colaborador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Permissões por Função</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Administrador:</strong> Acesso total, pode gerenciar equipe e configurações</p>
                          <p><strong>Usuário:</strong> Acesso a CRM, campanhas e relatórios</p>
                          <p><strong>Colaborador:</strong> Acesso limitado apenas para visualização</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={inviteUserMutation.isPending || updateUserMutation.isPending}
                        >
                          {editingUser ? "Atualizar" : "Convidar"} Membro
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Members Table */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Equipe vazia</h3>
                <p className="text-muted-foreground mb-4">
                  {canManageUsers 
                    ? "Comece convidando o primeiro membro da sua equipe"
                    : "Nenhum membro foi adicionado ainda"
                  }
                </p>
                {canManageUsers && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convidar Primeiro Membro
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Adicionado em</TableHead>
                    {canManageUsers && <TableHead>Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.firstName[0]}{member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.firstName} {member.lastName}</p>
                            {member.id === currentUser?.id && (
                              <Badge variant="outline" className="text-xs">Você</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? "default" : "secondary"} 
                               className={member.isActive 
                                 ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                 : ""}>
                          {member.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString('pt-BR') : "-"}
                      </TableCell>
                      {canManageUsers && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(member)}
                              disabled={member.id === currentUser?.id}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (member.id === currentUser?.id) {
                                  toast({
                                    title: "Ação não permitida",
                                    description: "Você não pode remover a si mesmo da equipe",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                if (confirm("Tem certeza que deseja remover este membro?")) {
                                  removeUserMutation.mutate(member.id);
                                }
                              }}
                              disabled={member.id === currentUser?.id}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Team Management Notice */}
        {!canManageUsers && (
          <Card className="bg-gradient-to-r from-primary/10 via-pink-500/10 to-cyan-500/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg gradient-nxt flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Permissões Limitadas</h3>
                  <p className="text-muted-foreground">
                    Você tem acesso de visualização à equipe. Para convidar novos membros ou gerenciar permissões, 
                    solicite acesso de administrador a um dos administradores atuais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

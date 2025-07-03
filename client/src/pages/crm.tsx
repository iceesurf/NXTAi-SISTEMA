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
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/header";
import { Plus, Download, Upload, Search, Edit, Trash2, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lead, InsertLead } from "@shared/schema";

export default function CRM() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    source: "",
    status: "new",
    notes: "",
  });

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const createLeadMutation = useMutation({
    mutationFn: async (leadData: Partial<InsertLead>) => {
      const res = await apiRequest("POST", "/api/leads", leadData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Lead criado com sucesso",
        description: "O lead foi adicionado ao seu CRM",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar lead",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Lead> }) => {
      const res = await apiRequest("PUT", `/api/leads/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsDialogOpen(false);
      setEditingLead(null);
      resetForm();
      toast({
        title: "Lead atualizado com sucesso",
      });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead removido com sucesso",
      });
    },
  });

  const resetForm = () => {
    setLeadForm({
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      source: "",
      status: "new",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      updateLeadMutation.mutate({
        id: editingLead.id,
        data: leadForm,
      });
    } else {
      createLeadMutation.mutate(leadForm);
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setLeadForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || "",
      company: lead.company || "",
      position: lead.position || "",
      source: lead.source || "",
      status: lead.status || "new",
      notes: lead.notes || "",
    });
    setIsDialogOpen(true);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há leads para exportar.",
        variant: "destructive",
      });
      return;
    }

    const csvHeaders = ["ID", "Nome", "Email", "Telefone", "Empresa", "Cargo", "Origem", "Status", "Notas"];
    const csvData = leads.map(lead => [
      lead.id,
      lead.name,
      lead.email,
      lead.phone || '',
      lead.company || '',
      lead.position || '',
      lead.source || '',
      lead.status || '',
      lead.notes || ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Exportação concluída!",
      description: "Arquivo CSV baixado com sucesso.",
    });
  };

  const importLeadsMutation = useMutation({
    mutationFn: async (leads: Partial<InsertLead>[]) => {
      const res = await apiRequest("POST", "/api/leads/bulk-import", { leads });
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Importação concluída!",
        description: `${result.success} leads importados com sucesso. ${result.errors || 0} erros.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const parseCSVRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length <= 1) {
            toast({
              title: "Arquivo vazio",
              description: "O arquivo CSV não contém dados válidos.",
              variant: "destructive",
            });
            return;
          }

          // Parse header row
          const headerRow = parseCSVRow(lines[0]);
          const normalizedHeaders = headerRow.map(h => h.toLowerCase().trim());
          
          // Map CSV columns to our lead fields
          const fieldMapping: Record<string, string> = {
            'nome': 'name',
            'name': 'name',
            'email': 'email',
            'e-mail': 'email',
            'telefone': 'phone',
            'phone': 'phone',
            'celular': 'phone',
            'empresa': 'company',
            'company': 'company',
            'cargo': 'position',
            'position': 'position',
            'origem': 'source',
            'source': 'source',
            'status': 'status',
            'notas': 'notes',
            'notes': 'notes',
            'observações': 'notes',
            'observacoes': 'notes'
          };

          // Process data rows
          const leadsToImport: Partial<InsertLead>[] = [];
          const errors: string[] = [];

          for (let i = 1; i < lines.length; i++) {
            try {
              const dataRow = parseCSVRow(lines[i]);
              const leadData: Partial<InsertLead> = {};

              // Map CSV data to lead fields
              normalizedHeaders.forEach((header, index) => {
                const fieldName = fieldMapping[header];
                if (fieldName && dataRow[index]) {
                  const value = dataRow[index].trim();
                  if (value) {
                    (leadData as any)[fieldName] = value;
                  }
                }
              });

              // Validate required fields
              if (!leadData.name || !leadData.email) {
                errors.push(`Linha ${i + 1}: Nome e email são obrigatórios`);
                continue;
              }

              // Validate email format
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(leadData.email)) {
                errors.push(`Linha ${i + 1}: Email inválido (${leadData.email})`);
                continue;
              }

              // Set default status if not provided
              if (!leadData.status) {
                leadData.status = 'new';
              }

              leadsToImport.push(leadData);
            } catch (error) {
              errors.push(`Linha ${i + 1}: Erro no processamento dos dados`);
            }
          }

          if (leadsToImport.length === 0) {
            toast({
              title: "Nenhum lead válido encontrado",
              description: "Verifique o formato do arquivo CSV e tente novamente.",
              variant: "destructive",
            });
            return;
          }

          // Show preview/confirmation if there are errors
          if (errors.length > 0) {
            const confirmImport = confirm(
              `Encontrados ${errors.length} erros no arquivo.\n` +
              `${leadsToImport.length} leads serão importados.\n\n` +
              `Primeiros erros:\n${errors.slice(0, 3).join('\n')}\n\n` +
              `Deseja continuar com a importação?`
            );
            
            if (!confirmImport) return;
          }

          // Import leads
          importLeadsMutation.mutate(leadsToImport);
          
        } catch (error) {
          toast({
            title: "Erro na leitura do arquivo",
            description: "Formato de arquivo CSV inválido.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file, 'UTF-8');
    };
    input.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      new: { variant: "secondary" },
      contacted: { variant: "outline" },
      qualified: { variant: "default", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" },
      converted: { variant: "default", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" },
      lost: { variant: "destructive" },
    };

    const config = variants[status] || variants.new;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status === "new" ? "Novo" :
         status === "contacted" ? "Contatado" :
         status === "qualified" ? "Qualificado" :
         status === "converted" ? "Convertido" :
         status === "lost" ? "Perdido" : status}
      </Badge>
    );
  };

  return (
    <div>
      <Header 
        title="CRM & Leads" 
        description="Gerencie seus leads e contatos" 
      />

      <div className="space-y-6">
        {/* Actions Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="new">Novos</SelectItem>
                    <SelectItem value="contacted">Contatados</SelectItem>
                    <SelectItem value="qualified">Qualificados</SelectItem>
                    <SelectItem value="converted">Convertidos</SelectItem>
                    <SelectItem value="lost">Perdidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleImportClick} variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar CSV
                </Button>
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingLead(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Lead
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingLead ? "Editar Lead" : "Novo Lead"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome *</Label>
                          <Input
                            id="name"
                            value={leadForm.name}
                            onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={leadForm.email}
                            onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={leadForm.phone}
                            onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Empresa</Label>
                          <Input
                            id="company"
                            value={leadForm.company}
                            onChange={(e) => setLeadForm(prev => ({ ...prev, company: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="position">Cargo</Label>
                          <Input
                            id="position"
                            value={leadForm.position}
                            onChange={(e) => setLeadForm(prev => ({ ...prev, position: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="source">Origem</Label>
                          <Select value={leadForm.source} onValueChange={(value) => setLeadForm(prev => ({ ...prev, source: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a origem" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="social">Redes Sociais</SelectItem>
                              <SelectItem value="referral">Indicação</SelectItem>
                              <SelectItem value="event">Evento</SelectItem>
                              <SelectItem value="imported">Importado</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={leadForm.status} onValueChange={(value) => setLeadForm(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Novo</SelectItem>
                            <SelectItem value="contacted">Contatado</SelectItem>
                            <SelectItem value="qualified">Qualificado</SelectItem>
                            <SelectItem value="converted">Convertido</SelectItem>
                            <SelectItem value="lost">Perdido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={leadForm.notes}
                          onChange={(e) => setLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                        />
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
                          disabled={createLeadMutation.isPending || updateLeadMutation.isPending}
                        >
                          {editingLead ? "Atualizar" : "Criar"} Lead
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum lead encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Tente ajustar os filtros ou busca"
                    : "Comece adicionando seu primeiro lead"}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Lead
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.company || "-"}</TableCell>
                      <TableCell>{getStatusBadge(lead.status || "new")}</TableCell>
                      <TableCell className="capitalize">{lead.source || "-"}</TableCell>
                      <TableCell>
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(lead)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja remover este lead?")) {
                                deleteLeadMutation.mutate(lead.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Logo from "@/components/logo";
import { Building2, Users, Rocket, CheckCircle } from "lucide-react";

const signupSchema = z.object({
  companyName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  adminFirstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  adminLastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  adminEmail: z.string().email("Email inválido"),
  adminPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  industry: z.string().min(2, "Segmento é obrigatório"),
  employees: z.string().min(1, "Número de funcionários é obrigatório"),
  description: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function TenantSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      companyName: "",
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPassword: "",
      phone: "",
      industry: "",
      employees: "",
      description: "",
      website: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/tenant/signup", data);
      setIsSuccess(true);
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua empresa foi cadastrada. Aguarde nosso contato para ativação.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro interno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Cadastro Realizado!</h1>
            <p className="text-muted-foreground mb-6">
              Recebemos seu cadastro e entraremos em contato em breve para ativar sua conta.
            </p>
            <Button onClick={() => window.location.href = "/"} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <Button variant="outline" onClick={() => window.location.href = "/auth"}>
            Já tenho conta
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Transforme sua empresa com{" "}
            <span className="text-gradient-nxt">Inteligência Artificial</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatize vendas, gerencie leads e aumente conversões com nossa plataforma completa de CRM + IA.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">CRM Inteligente</h3>
            <p className="text-muted-foreground">Gerencie leads, campanhas e vendas em uma plataforma única</p>
          </div>
          <div className="text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Automação Completa</h3>
            <p className="text-muted-foreground">Follow-ups automáticos, chatbots e workflows inteligentes</p>
          </div>
          <div className="text-center">
            <Rocket className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Integrações</h3>
            <p className="text-muted-foreground">WhatsApp, ASAAS, Slack e muito mais em um só lugar</p>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Cadastre sua Empresa</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para começar sua transformação digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Dados da Empresa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados da Empresa</h3>
                  
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Sua Empresa Ltda" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Segmento *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: E-commerce, Consultoria..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº Funcionários *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 1-10, 11-50, 50+" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://suaempresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Empresa</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Conte-nos sobre sua empresa e seus desafios atuais..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dados do Administrador */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados do Administrador</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adminFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adminLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu sobrenome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adminPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Empresa"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Ao cadastrar, você concorda com nossos termos de uso e política de privacidade.
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
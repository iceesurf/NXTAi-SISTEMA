import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Circle, 
  Users, 
  Mail, 
  MessageCircle, 
  Layers, 
  Zap, 
  Settings,
  ArrowRight,
  Sparkles,
  Target
} from "lucide-react";
import Layout from "@/components/layout";
import Header from "@/components/header";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  href: string;
  category: "essential" | "recommended" | "advanced";
}

export default function Onboarding() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: "profile",
      title: "Complete seu Perfil",
      description: "Configure informações da sua empresa e personalize a plataforma",
      icon: Settings,
      completed: true,
      href: "/settings",
      category: "essential"
    },
    {
      id: "crm",
      title: "Importe seus Leads",
      description: "Adicione seus primeiros leads ou importe via CSV",
      icon: Users,
      completed: false,
      href: "/crm",
      category: "essential"
    },
    {
      id: "integrations",
      title: "Configure Integrações",
      description: "Conecte WhatsApp, ASAAS, e-mail e outras ferramentas",
      icon: Layers,
      completed: false,
      href: "/integrations",
      category: "essential"
    },
    {
      id: "campaign",
      title: "Crie sua Primeira Campanha",
      description: "Lance uma campanha de e-mail ou WhatsApp",
      icon: Mail,
      completed: false,
      href: "/campaigns",
      category: "recommended"
    },
    {
      id: "chatbot",
      title: "Configure o Chatbot",
      description: "Ative o assistente IA para atendimento automático",
      icon: MessageCircle,
      completed: false,
      href: "/chatbot",
      category: "recommended"
    },
    {
      id: "automation",
      title: "Crie Automações",
      description: "Configure workflows para automatizar processos",
      icon: Zap,
      completed: false,
      href: "/automations",
      category: "advanced"
    }
  ];

  const essentialSteps = steps.filter(s => s.category === "essential");
  const recommendedSteps = steps.filter(s => s.category === "recommended");
  const advancedSteps = steps.filter(s => s.category === "advanced");

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "essential": return "bg-red-500";
      case "recommended": return "bg-yellow-500";
      case "advanced": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "essential": return "Essencial";
      case "recommended": return "Recomendado";
      case "advanced": return "Avançado";
      default: return "";
    }
  };

  const StepCard = ({ step }: { step: OnboardingStep }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {step.completed ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-muted-foreground" />
            )}
            <step.icon className="w-6 h-6 text-primary" />
          </div>
          <Badge variant="secondary" className={`text-xs ${getCategoryColor(step.category)} text-white`}>
            {getCategoryLabel(step.category)}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
        
        <Button 
          variant={step.completed ? "secondary" : "default"} 
          className="w-full group-hover:shadow-md transition-all"
          onClick={() => window.location.href = step.href}
        >
          {step.completed ? "Revisar" : "Começar"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <Header 
        title="Bem-vindo ao DNXT.ai!"
        description="Configure sua plataforma em alguns passos simples"
      />
      
      <div className="p-6">
        {/* Progress Overview */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-pink-500/10 to-cyan-500/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span>Progresso da Configuração</span>
                </CardTitle>
                <CardDescription>
                  {completedSteps} de {steps.length} etapas concluídas
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{Math.round(progress)}%</div>
                <div className="text-sm text-muted-foreground">Completo</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
            {progress === 100 && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Parabéns! Configuração concluída!</span>
                </div>
                <p className="text-sm text-green-600/80 mt-1">
                  Sua plataforma está pronta para uso. Explore todas as funcionalidades!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Essential Steps */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold">Etapas Essenciais</h2>
            <Badge variant="destructive" className="bg-red-500">
              Obrigatório
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {essentialSteps.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Recommended Steps */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Etapas Recomendadas</h2>
            <Badge variant="secondary" className="bg-yellow-500 text-white">
              Recomendado
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedSteps.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Advanced Steps */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold">Etapas Avançadas</h2>
            <Badge variant="secondary" className="bg-green-500 text-white">
              Avançado
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedSteps.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
        </div>

        {/* Help Section */}
        <Card className="mt-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span>Precisa de Ajuda?</span>
            </CardTitle>
            <CardDescription>
              Recursos para te ajudar a aproveitar ao máximo a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 text-left">
                <div>
                  <div className="font-medium">Documentação</div>
                  <div className="text-sm text-muted-foreground">Guias completos</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left">
                <div>
                  <div className="font-medium">Vídeo Tutoriais</div>
                  <div className="text-sm text-muted-foreground">Aprenda assistindo</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left">
                <div>
                  <div className="font-medium">Suporte</div>
                  <div className="text-sm text-muted-foreground">Fale conosco</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
import Header from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  Zap
} from "lucide-react";

export default function Help() {
  return (
    <>
      <Header 
        title="Central de Ajuda"
        description="Encontre respostas, documentação e dicas para usar o NXT.ai"
      />

      <div className="space-y-6">
        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Início Rápido
            </CardTitle>
            <CardDescription>
              Comece a usar o NXT.ai em poucos minutos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Tour Interativo</div>
                  <div className="text-sm text-muted-foreground">
                    Conheça todas as funcionalidades
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Configuração Inicial</div>
                  <div className="text-sm text-muted-foreground">
                    Configure suas integrações
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Documentação
            </CardTitle>
            <CardDescription>
              Guias detalhados para cada funcionalidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "CRM & Leads", desc: "Gerenciamento de clientes" },
                { title: "Campanhas", desc: "Email e WhatsApp marketing" },
                { title: "Chatbot", desc: "Automação de conversas" },
                { title: "Integrações", desc: "Conecte suas ferramentas" },
                { title: "Automações", desc: "Fluxos automatizados" },
                { title: "API Pública", desc: "Desenvolvimento personalizado" }
              ].map((item, index) => (
                <Button key={index} variant="ghost" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Suporte
            </CardTitle>
            <CardDescription>
              Entre em contato quando precisar de ajuda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                className="justify-start h-auto p-4"
                onClick={() => window.open('mailto:suporte@dnxtai.com', '_blank')}
              >
                <Mail className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Email</div>
                  <div className="text-sm opacity-90">suporte@dnxtai.com</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => {
                  // Simular chat ao vivo - em produção conectaria com sistema real
                  alert('Chat ao vivo será implementado em breve! Por enquanto, use o email suporte@dnxtai.com');
                }}
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Chat ao Vivo</div>
                  <div className="text-sm text-muted-foreground">Segunda a Sexta, 9h-18h</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Perguntas Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                q: "Como configurar minhas primeiras integrações?",
                a: "Acesse o menu Integrações e siga o guia passo-a-passo para conectar suas ferramentas."
              },
              {
                q: "Posso importar meus leads existentes?",
                a: "Sim! No CRM, use a função de importar para carregar seus dados via CSV ou Excel."
              },
              {
                q: "Como criar minha primeira campanha?",
                a: "Vá em Campanhas > Nova Campanha e escolha entre Email ou WhatsApp. O assistente irá te guiar."
              },
              {
                q: "O chatbot funciona 24/7?",
                a: "Sim! Uma vez configurado, o chatbot responde automaticamente seus clientes a qualquer hora."
              }
            ].map((faq, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <div className="font-medium mb-1">{faq.q}</div>
                <div className="text-sm text-muted-foreground">{faq.a}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
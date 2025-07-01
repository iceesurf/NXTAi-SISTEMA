import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import CRM from "@/pages/crm";
import Campaigns from "@/pages/campaigns";
import Chatbot from "@/pages/chatbot";
import Integrations from "@/pages/integrations";
import Automations from "@/pages/automations";
import ApiDocs from "@/pages/api-docs";
import Team from "@/pages/team";
import Settings from "@/pages/settings";
import Onboarding from "@/pages/onboarding";
import TenantSignup from "@/pages/tenant-signup";
import AdminPanel from "@/pages/admin-panel";
import Layout from "@/components/layout";

function ProtectedWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/signup" component={TenantSignup} />
      <Route>
        <ProtectedWrapper>
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/crm" component={CRM} />
              <Route path="/campaigns" component={Campaigns} />
              <Route path="/chatbot" component={Chatbot} />
              <Route path="/integrations" component={Integrations} />
              <Route path="/automations" component={Automations} />
              <Route path="/api" component={ApiDocs} />
              <Route path="/team" component={Team} />
              <Route path="/settings" component={Settings} />
              <Route path="/onboarding" component={Onboarding} />
              <Route path="/admin" component={AdminPanel} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </ProtectedWrapper>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nxt-ai-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

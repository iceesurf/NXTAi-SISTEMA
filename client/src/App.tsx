import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
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
import { ProtectedRoute } from "./lib/protected-route";
import Layout from "@/components/layout";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={() => <Layout><Dashboard /></Layout>} />
      <ProtectedRoute path="/crm" component={() => <Layout><CRM /></Layout>} />
      <ProtectedRoute path="/campaigns" component={() => <Layout><Campaigns /></Layout>} />
      <ProtectedRoute path="/chatbot" component={() => <Layout><Chatbot /></Layout>} />
      <ProtectedRoute path="/integrations" component={() => <Layout><Integrations /></Layout>} />
      <ProtectedRoute path="/automations" component={() => <Layout><Automations /></Layout>} />
      <ProtectedRoute path="/api" component={() => <Layout><ApiDocs /></Layout>} />
      <ProtectedRoute path="/team" component={() => <Layout><Team /></Layout>} />
      <ProtectedRoute path="/settings" component={() => <Layout><Settings /></Layout>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="nxt-ai-theme">
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

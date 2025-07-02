import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Mail, 
  MessageCircle, 
  Layers, 
  Zap, 
  Code, 
  Settings, 
  LogOut,
  BookOpen,
  Shield,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";

const menuItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/onboarding", label: "Primeiros Passos", icon: BookOpen },
  { href: "/crm", label: "CRM & Leads", icon: Users },
  { href: "/campaigns", label: "Campanhas", icon: Mail },
  { href: "/chatbot", label: "Chatbot", icon: MessageCircle },
  { href: "/integrations", label: "Integrações", icon: Layers },
  { href: "/automations", label: "Automações", icon: Zap },
  { href: "/site-requests", label: "Solicitar Site", icon: Globe },
  { href: "/api", label: "API Pública", icon: Code },
  { href: "/team", label: "Equipe", icon: Users },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border flex-shrink-0">
      <div className="p-6">
        {/* Logo */}
        <div className="mb-8">
          <Logo size="md" />
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start space-x-3",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
          
          {/* Admin Menu - apenas para super admins */}
          {user.isSuperAdmin && (
            <>
              <div className="my-4 border-t border-sidebar-border"></div>
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Administração
                </p>
              </div>
              <Link href="/admin">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    location === "/admin" && "bg-accent text-accent-foreground"
                  )}
                >
                  <Shield className="w-5 h-5" />
                  <span>Painel Admin</span>
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* User Info */}
        <div className="mt-8 pt-6 border-t border-sidebar-border">
          <div className="flex items-center space-x-3 px-3 py-2 mb-3">
            <div className="w-8 h-8 rounded-full gradient-nxt flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  );
}

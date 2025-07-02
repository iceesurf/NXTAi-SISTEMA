import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sun, Moon, Bell, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  title?: string;
  description?: string;
}

export default function Header({ 
  title, 
  description 
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Novo lead capturado", time: "há 5 min", read: false },
    { id: 2, title: "Campanha enviada com sucesso", time: "há 1 hora", read: false },
    { id: 3, title: "Integração ASAAS configurada", time: "há 2 horas", read: true }
  ]);

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    toast({
      title: "Tema alterado",
      description: `Tema ${newTheme === "light" ? "claro" : "escuro"} ativado`,
    });
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleThemeToggle}
            title={`Trocar para tema ${theme === "light" ? "escuro" : "claro"}`}
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
          
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="border-b border-border p-4">
                <h4 className="font-semibold">Notificações</h4>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} não lidas` : "Todas lidas"}
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhuma notificação
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                        {notification.read && (
                          <Check className="w-4 h-4 text-green-500 ml-2" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {unreadCount > 0 && (
                <div className="p-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setNotifications(prev => 
                      prev.map(n => ({ ...n, read: true }))
                    )}
                  >
                    Marcar todas como lidas
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}

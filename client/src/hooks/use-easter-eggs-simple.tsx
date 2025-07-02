import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface EasterEgg {
  id: string;
  name: string;
  unlocked: boolean;
  description: string;
  trigger: string;
  icon: string;
}

export function useEasterEggs() {
  const { toast } = useToast();
  
  const [easterEggs, setEasterEggs] = useState<EasterEgg[]>([
    {
      id: "triple_click",
      name: "Triple Click Master",
      unlocked: false,
      description: "Clique 3 vezes rapidamente no logo da NXT.ai",
      trigger: "triple_click_logo",
      icon: "🖱️"
    }
  ]);

  const [isMatrixMode, setIsMatrixMode] = useState(false);

  // Triple click handler for logo
  const handleTripleClick = useCallback(() => {
    const egg = easterEggs.find(e => e.id === "triple_click");
    if (egg && !egg.unlocked) {
      // Unlock the easter egg
      setEasterEggs(prev => 
        prev.map(e => 
          e.id === "triple_click" 
            ? { ...e, unlocked: true }
            : e
        )
      );

      // Activate Matrix mode
      setIsMatrixMode(true);
      
      toast({
        title: "🎉 Easter Egg Desbloqueado!",
        description: "🖱️ Triple Click Master - Modo Matrix ativado!",
        duration: 5000,
      });

      // Auto disable after 10 seconds
      setTimeout(() => setIsMatrixMode(false), 10000);
    } else if (egg?.unlocked) {
      // If already unlocked, just toggle Matrix mode
      setIsMatrixMode(!isMatrixMode);
      toast({
        title: isMatrixMode ? "Modo Matrix Desativado" : "Modo Matrix Ativado",
        description: "Clique 3 vezes no logo para alternar",
        duration: 2000,
      });
    }
  }, [easterEggs, isMatrixMode, toast]);

  return {
    easterEggs,
    isMatrixMode,
    handleTripleClick
  };
}
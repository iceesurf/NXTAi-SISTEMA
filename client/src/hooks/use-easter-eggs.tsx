import { useState, useEffect, useCallback } from "react";
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
    },
    {
      id: "dance_party",
      name: "Festa Dançante",
      unlocked: false,
      description: "Mantenha pressionado Alt por 5 segundos",
      trigger: "long_alt_press",
      icon: "💃"
    }
  ]);

  const [keySequence, setKeySequence] = useState("");
  const [altPressStart, setAltPressStart] = useState<number | null>(null);
  const [isMatrixMode, setIsMatrixMode] = useState(false);

  // Unlock easter egg
  const unlockEasterEgg = useCallback((eggId: string) => {
    setEasterEggs(prev => 
      prev.map(egg => 
        egg.id === eggId 
          ? { ...egg, unlocked: true }
          : egg
      )
    );

    const egg = easterEggs.find(e => e.id === eggId);
    if (egg && !egg.unlocked) {
      triggerEasterEggEffect(eggId);
      
      toast({
        title: `🎉 Easter Egg Desbloqueado!`,
        description: `${egg.icon} ${egg.name} - ${egg.description}`,
        duration: 5000,
      });
    }
  }, [easterEggs, toast]);

  // Trigger easter egg effects
  const triggerEasterEggEffect = (eggId: string) => {
    switch (eggId) {
      case "konami":
        // Rainbow animation
        document.body.style.animation = "rainbow 2s infinite";
        setTimeout(() => {
          document.body.style.animation = "";
        }, 5000);
        break;
        
      case "triple_click":
        // Bounce animation
        const logo = document.querySelector('[data-logo]');
        if (logo) {
          (logo as HTMLElement).style.animation = "bounce 1s ease-in-out 3";
          setTimeout(() => {
            (logo as HTMLElement).style.animation = "";
          }, 3000);
        }
        break;
        
      case "coffee_time":
        // Coffee break notification
        toast({
          title: "☕ Hora do Café!",
          description: "Que tal uma pausa para o café? Você merece!",
          duration: 8000,
        });
        break;
        
      case "matrix_mode":
        setIsMatrixMode(true);
        setTimeout(() => setIsMatrixMode(false), 10000);
        break;
        
      case "dance_party":
        // Party mode with confetti
        createConfetti();
        document.body.style.animation = "party 3s infinite";
        setTimeout(() => {
          document.body.style.animation = "";
        }, 6000);
        break;
    }
  };

  // Create confetti effect
  const createConfetti = () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.zIndex = '9999';
      confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear forwards`;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  };

  // Key sequence handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.code;
      const newSequence = keySequence + key;
      
      // Check for Konami code
      if (newSequence.includes("ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightKeyBKeyA")) {
        unlockEasterEgg("konami");
        setKeySequence("");
        return;
      }
      
      // Check for Matrix mode (Ctrl+Shift+M)
      if (e.ctrlKey && e.shiftKey && e.code === "KeyM") {
        unlockEasterEgg("matrix_mode");
        return;
      }
      
      // Track Alt key press for dance party
      if (e.code === "AltLeft" || e.code === "AltRight") {
        if (!altPressStart) {
          setAltPressStart(Date.now());
        }
      }
      
      // Reset sequence if too long
      if (newSequence.length > 100) {
        setKeySequence("");
      } else {
        setKeySequence(newSequence);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.code === "AltLeft" || e.code === "AltRight") && altPressStart) {
        const pressDuration = Date.now() - altPressStart;
        if (pressDuration >= 5000) {
          unlockEasterEgg("dance_party");
        }
        setAltPressStart(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [keySequence, altPressStart, unlockEasterEgg]);

  // Coffee search handler
  const handleSearch = useCallback((searchTerm: string) => {
    if (searchTerm.toLowerCase().includes("coffee")) {
      unlockEasterEgg("coffee_time");
    }
  }, [unlockEasterEgg]);

  // Triple click handler
  const handleTripleClick = useCallback(() => {
    unlockEasterEgg("triple_click");
  }, [unlockEasterEgg]);

  return {
    easterEggs,
    isMatrixMode,
    handleSearch,
    handleTripleClick,
    unlockedCount: easterEggs.filter(egg => egg.unlocked).length,
    totalCount: easterEggs.length
  };
}
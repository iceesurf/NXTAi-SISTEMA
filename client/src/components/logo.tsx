import logoPath from "@assets/8CCED2DB-5B67-42DC-BE59-662DB3764285_1751404592788.png";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  onTripleClick?: () => void;
}

export default function Logo({ 
  size = "md", 
  className,
  showText = true,
  onTripleClick
}: LogoProps) {
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    if (newCount === 3) {
      onTripleClick?.();
      setClickCount(0);
      setClickTimer(null);
    } else {
      const timer = setTimeout(() => {
        setClickCount(0);
        setClickTimer(null);
      }, 500);
      setClickTimer(timer);
    }
  };
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div 
      className={cn("flex items-center space-x-3 cursor-pointer select-none", className)}
      onClick={handleClick}
      data-logo
    >
      <img 
        src={logoPath} 
        alt="NXT.ai Logo" 
        className={cn("object-contain transition-transform duration-200 hover:scale-105", sizeClasses[size])}
      />
      {showText && (
        <div>
          <h1 className={cn("font-bold text-gradient-nxt", textSizeClasses[size])}>
            NXT.ai
          </h1>
          <p className="text-xs text-muted-foreground">Plataforma SaaS</p>
        </div>
      )}
    </div>
  );
}
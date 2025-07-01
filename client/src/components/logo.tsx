import logoPath from "@assets/8CCED2DB-5B67-42DC-BE59-662DB3764285_1751404592788.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export default function Logo({ 
  size = "md", 
  className,
  showText = true 
}: LogoProps) {
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
    <div className={cn("flex items-center space-x-3", className)}>
      <img 
        src={logoPath} 
        alt="DNXT.ai Logo" 
        className={cn("object-contain", sizeClasses[size])}
      />
      {showText && (
        <div>
          <h1 className={cn("font-bold text-gradient-nxt", textSizeClasses[size])}>
            DNXT.ai
          </h1>
          <p className="text-xs text-muted-foreground">Plataforma SaaS</p>
        </div>
      )}
    </div>
  );
}
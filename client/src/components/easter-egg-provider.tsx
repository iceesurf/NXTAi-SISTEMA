import { createContext, useContext, ReactNode } from "react";
import { useEasterEggs } from "@/hooks/use-easter-eggs-simple";

const EasterEggContext = createContext<ReturnType<typeof useEasterEggs> | null>(null);

export function EasterEggProvider({ children }: { children: ReactNode }) {
  const easterEggState = useEasterEggs();
  
  return (
    <EasterEggContext.Provider value={easterEggState}>
      {children}
    </EasterEggContext.Provider>
  );
}

export function useEasterEggContext() {
  const context = useContext(EasterEggContext);
  if (!context) {
    throw new Error("useEasterEggContext must be used within EasterEggProvider");
  }
  return context;
}
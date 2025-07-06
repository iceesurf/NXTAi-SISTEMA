// Hook de toast simples para não travar o build
export function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string, description?: string, variant?: string }) => {
      // Só loga no console, adapte depois para seu sistema de toast real!
      console.log(`[${variant || "info"}] ${title}: ${description || ""}`);
    }
  };
}
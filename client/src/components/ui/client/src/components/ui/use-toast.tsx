// Hook de toast básico para não travar o build
export function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string, description?: string, variant?: string }) => {
      // Apenas loga no console (substitua depois pelo seu sistema real)
      console.log(`[${variant || "info"}] ${title}: ${description || ""}`);
    }
  };
}
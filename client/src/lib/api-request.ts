// Faz uma requisição HTTP genérica (substitua depois pelo real)
export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<any> {
  // Exemplo simples, apenas para não travar o build
  console.log(`apiRequest: ${method} ${url}`, data);
  return { success: true, data: null };
}
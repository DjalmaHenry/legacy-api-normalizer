// Modelo básico para dados
export interface DataItem {
  id: number;
  name: string;
  value: string;
  date: string;
}

// Resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
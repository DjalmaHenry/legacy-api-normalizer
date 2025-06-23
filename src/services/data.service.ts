import { DataItem } from '../models/data.model';

export class DataService {
  private data: DataItem[] = [];

  // Processar dados simples
  processData(input: string): DataItem[] {
    const lines = input.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => ({
      id: index + 1,
      name: `Item ${index + 1}`,
      value: line.trim(),
      date: new Date().toISOString().split('T')[0]
    }));
  }

  // Salvar dados processados
  saveData(items: DataItem[]): void {
    this.data = items;
  }

  // Obter todos os dados
  getAllData(): DataItem[] {
    return this.data;
  }

  // Limpar dados
  clearData(): void {
    this.data = [];
  }

  // Filtrar por nome
  filterByName(name: string): DataItem[] {
    return this.data.filter(item => 
      item.name.toLowerCase().includes(name.toLowerCase())
    );
  }
}
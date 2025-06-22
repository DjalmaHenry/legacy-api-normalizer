export interface IBaseService<T, K> {
  create(data: T): Promise<K>;
  findAll(): Promise<K[]>;
  findById(id: string): Promise<K | null>;
  update(id: string, data: Partial<T>): Promise<K | null>;
  delete(id: string): Promise<boolean>;
}

export interface IBaseController {
  // Métodos base que os controllers podem implementar
}
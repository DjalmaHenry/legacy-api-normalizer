import { IBaseService } from '../interfaces/base.interface';

export abstract class BaseService<T, K> implements IBaseService<T, K> {
  protected data: K[] = [];

  abstract create(data: T): Promise<K>;
  abstract findAll(): Promise<K[]>;
  abstract findById(id: string): Promise<K | null>;
  abstract update(id: string, data: Partial<T>): Promise<K | null>;
  abstract delete(id: string): Promise<boolean>;

  protected generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
}
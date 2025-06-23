import { RawOrderLine, UserOrders } from '../models/order.model';

export interface IOrdersService {
  processFile(fileContent: string): Promise<{ message: string; total_records: number }>;
}

export interface IOrderProcessor {
  processFile(fileContent: string): Promise<{ message: string; total_records: number }>;
  getOrders(): Promise<UserOrders[]>;
  groupOrdersByUser(orders: RawOrderLine[]): UserOrders[];
}

export interface IOrderFilter {
  applyFilters(orders: RawOrderLine[]): RawOrderLine[];
}

export interface IOrderCalculator {
  calculateOrderTotals(userOrders: UserOrders[]): void;
}
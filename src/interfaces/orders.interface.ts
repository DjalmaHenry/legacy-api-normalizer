import { RawOrderLine, UserOrders, OrderFilters } from '../models/order.model';

export interface IOrdersService {
  processFile(fileContent: string): Promise<{ message: string; total_records: number }>;
  getOrders(filters?: OrderFilters): Promise<UserOrders[]>;
  clearOrders(): void;
}

export interface IOrderProcessor {
  processFile(fileContent: string): Promise<{ message: string; total_records: number }>;
  getOrders(filters?: OrderFilters): Promise<UserOrders[]>;
  clearOrders(): void;
  groupOrdersByUser(orders: RawOrderLine[]): UserOrders[];
}

export interface IOrderFilter {
  applyFilters(orders: RawOrderLine[], filters?: OrderFilters): RawOrderLine[];
}

export interface IOrderCalculator {
  calculateOrderTotals(userOrders: UserOrders[]): void;
}
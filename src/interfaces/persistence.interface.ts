import { UserOrders } from '../models/order.model';

export interface IPersistenceService {
  persistData(data: UserOrders[]): void;
}

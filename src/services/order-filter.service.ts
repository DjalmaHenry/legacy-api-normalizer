import { RawOrderLine, OrderFilters } from '../models/order.model';
import { IOrderFilter } from '../interfaces/orders.interface';

export class OrderFilterService implements IOrderFilter {
  applyFilters(orders: RawOrderLine[], filters?: OrderFilters): RawOrderLine[] {
    if (!filters) return [...orders];
    
    let filteredOrders = [...orders];

    if (filters.order_id) {
      filteredOrders = this.filterByOrderId(filteredOrders, filters.order_id);
    }

    if (filters.start_date) {
      filteredOrders = this.filterByStartDate(filteredOrders, filters.start_date);
    }

    if (filters.end_date) {
      filteredOrders = this.filterByEndDate(filteredOrders, filters.end_date);
    }

    return filteredOrders;
  }

  private filterByOrderId(orders: RawOrderLine[], orderId: number): RawOrderLine[] {
    return orders.filter(order => order.order_id === orderId);
  }

  private filterByStartDate(orders: RawOrderLine[], startDate: string): RawOrderLine[] {
    return orders.filter(order => order.date >= startDate);
  }

  private filterByEndDate(orders: RawOrderLine[], endDate: string): RawOrderLine[] {
    return orders.filter(order => order.date <= endDate);
  }
}
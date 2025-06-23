import { UserOrders } from '../models/order.model';
import { IOrderCalculator } from '../interfaces/orders.interface';

export class OrderCalculatorService implements IOrderCalculator {
  calculateOrderTotals(userOrders: UserOrders[]): void {
    userOrders.forEach((user) => {
      user.orders.forEach((order) => {
        order.total = this.calculateOrderTotal(order);
      });
    });
  }

  private calculateOrderTotal(order: any): string {
    const total = order.products.reduce((sum: number, product: any) => {
      return sum + parseFloat(product.value);
    }, 0);
    return total.toFixed(2);
  }
}

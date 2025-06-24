import { RawOrderLine, UserOrders, Product, Order } from '../models/order.model';
import { IOrderProcessor, IOrderFilter, IOrderCalculator } from '../interfaces/orders.interface';
import { IOrderParser } from '../interfaces/parser.interface';
import { OrderParser } from '../utils/parser';
import { OrderFilterService } from './order-filter.service';
import { OrderCalculatorService } from './order-calculator.service';
import { PersistenceService } from './persistence.service';

export class OrderProcessorService implements IOrderProcessor {
  private orders: RawOrderLine[] = [];
  private persistenceService: PersistenceService;

  constructor(
    private parser: IOrderParser = new OrderParser(),
    private filter: IOrderFilter = new OrderFilterService(),
    private calculator: IOrderCalculator = new OrderCalculatorService()
  ) {
    this.persistenceService = new PersistenceService();
  }

  async processFile(fileContent: string): Promise<{ message: string; total_records: number }> {
    try {
      const parsedOrders = this.parser.parseFile(fileContent);
      this.orders = parsedOrders;
      
      return {
        message: 'Arquivo processado com sucesso',
        total_records: parsedOrders.length
      };
    } catch (error) {
      throw new Error(`Erro ao processar arquivo: ${error}`);
    }
  }

  async getOrders(): Promise<UserOrders[]> {
    const filteredOrders = this.filter.applyFilters(this.orders);
    const groupedOrders = this.groupOrdersByUser(filteredOrders);
    this.calculator.calculateOrderTotals(groupedOrders);
    
    // Persistir dados no SQLite
    this.persistenceService.persistData(groupedOrders);
    
    return groupedOrders;
  }

  groupOrdersByUser(orders: RawOrderLine[]): UserOrders[] {
    const userMap = new Map<number, UserOrders>();

    orders.forEach(orderLine => {
      this.processOrderLine(orderLine, userMap);
    });

    return Array.from(userMap.values());
  }

  private processOrderLine(orderLine: RawOrderLine, userMap: Map<number, UserOrders>): void {
    const user = this.getOrCreateUser(orderLine, userMap);
    const order = this.getOrCreateOrder(orderLine, user);
    this.addProductToOrder(orderLine, order);
  }

  private getOrCreateUser(orderLine: RawOrderLine, userMap: Map<number, UserOrders>): UserOrders {
    if (!userMap.has(orderLine.user_id)) {
      userMap.set(orderLine.user_id, {
        user_id: orderLine.user_id,
        name: orderLine.name,
        orders: []
      });
    }
    return userMap.get(orderLine.user_id)!;
  }

  private getOrCreateOrder(orderLine: RawOrderLine, user: UserOrders): Order {
    let order = user.orders.find(o => o.order_id === orderLine.order_id);

    if (!order) {
      order = {
        order_id: orderLine.order_id,
        total: '0.00',
        date: orderLine.date,
        products: []
      };
      user.orders.push(order);
    }

    return order;
  }

  private addProductToOrder(orderLine: RawOrderLine, order: Order): void {
    const product: Product = {
      product_id: orderLine.product_id,
      value: orderLine.value
    };
    order.products.push(product);
  }
}
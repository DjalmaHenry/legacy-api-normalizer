import { RawOrderLine, UserOrders, OrderFilters } from '../models/order.model';
import { IOrdersService, IOrderProcessor, IOrderFilter, IOrderCalculator } from '../interfaces/orders.interface';
import { IOrderParser } from '../interfaces/parser.interface';
import { OrderParser } from '../utils/parser';
import { OrderFilterService } from './order-filter.service';
import { OrderProcessorService } from './order-processor.service';
import { OrderCalculatorService } from './order-calculator.service';

export class OrdersService implements IOrdersService {
  private orders: RawOrderLine[] = [];

  constructor(
    private parser: IOrderParser = new OrderParser(),
    private filter: IOrderFilter = new OrderFilterService(),
    private processor: IOrderProcessor = new OrderProcessorService(),
    private calculator: IOrderCalculator = new OrderCalculatorService()
  ) {}

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

  async getOrders(filters?: OrderFilters): Promise<UserOrders[]> {
    const filteredOrders = this.filter.applyFilters(this.orders, filters);
    const groupedOrders = this.processor.groupOrdersByUser(filteredOrders);
    this.calculator.calculateOrderTotals(groupedOrders);
    
    return groupedOrders;
  }

  clearOrders(): void {
    this.orders = [];
  }
}
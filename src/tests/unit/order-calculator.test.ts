import { OrderCalculatorService } from '../../services/order-calculator.service';
import { UserOrders } from '../../models/order.model';

describe('OrderCalculatorService', () => {
  let calculator: OrderCalculatorService;

  beforeEach(() => {
    calculator = new OrderCalculatorService();
  });

  describe('calculateOrderTotals', () => {
    it('deve calcular corretamente os totais dos pedidos', () => {
      const userOrders: UserOrders[] = [
        {
          user_id: 1,
          name: 'João Silva',
          orders: [
            {
              order_id: 1,
              total: '0.00',
              date: '2023-01-01',
              products: [
                { product_id: 1, value: '100.50' },
                { product_id: 2, value: '200.75' },
              ],
            },
            {
              order_id: 2,
              total: '0.00',
              date: '2023-01-02',
              products: [{ product_id: 3, value: '50.25' }],
            },
          ],
        },
        {
          user_id: 2,
          name: 'Maria Souza',
          orders: [
            {
              order_id: 3,
              total: '0.00',
              date: '2023-02-01',
              products: [
                { product_id: 4, value: '75.99' },
                { product_id: 5, value: '120.01' },
              ],
            },
          ],
        },
      ];

      calculator.calculateOrderTotals(userOrders);

      expect(userOrders[0].orders[0].total).toBe('301.25');
      expect(userOrders[0].orders[1].total).toBe('50.25');
      expect(userOrders[1].orders[0].total).toBe('196.00');
    });

    it('deve lidar com pedidos sem produtos', () => {
      const userOrders: UserOrders[] = [
        {
          user_id: 1,
          name: 'João Silva',
          orders: [
            {
              order_id: 1,
              total: '0.00',
              date: '2023-01-01',
              products: [],
            },
          ],
        },
      ];

      calculator.calculateOrderTotals(userOrders);

      expect(userOrders[0].orders[0].total).toBe('0.00');
    });
  });
});

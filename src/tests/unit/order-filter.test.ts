import { OrderFilterService } from '../../services/order-filter.service';
import { RawOrderLine } from '../../models/order.model';

describe('OrderFilterService', () => {
  let filter: OrderFilterService;

  beforeEach(() => {
    filter = new OrderFilterService();
  });

  describe('applyFilters', () => {
    it('deve retornar uma cópia dos pedidos sem modificá-los', () => {
      // Arrange
      const orders: RawOrderLine[] = [
        {
          user_id: 1,
          name: 'João Silva',
          order_id: 1,
          product_id: 1,
          value: '100.50',
          date: '2023-01-01'
        },
        {
          user_id: 2,
          name: 'Maria Souza',
          order_id: 2,
          product_id: 2,
          value: '200.75',
          date: '2023-02-01'
        }
      ];

      // Act
      const result = filter.applyFilters(orders);

      // Assert
      expect(result).toEqual(orders);
      expect(result).not.toBe(orders); // Verifica se é uma cópia e não a mesma referência
    });

    it('deve retornar um array vazio quando recebe um array vazio', () => {
      const result = filter.applyFilters([]);
      expect(result).toEqual([]);
    });
  });
});
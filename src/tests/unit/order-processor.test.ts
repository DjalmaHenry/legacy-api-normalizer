import { OrderProcessorService } from '../../services/order-processor.service';
import { OrderParser } from '../../utils/parser';
import { OrderFilterService } from '../../services/order-filter.service';
import { OrderCalculatorService } from '../../services/order-calculator.service';
import { PersistenceService } from '../../services/persistence.service';
import { RawOrderLine, UserOrders } from '../../models/order.model';

// Mock das dependências
jest.mock('../../utils/parser');
jest.mock('../../services/order-filter.service');
jest.mock('../../services/order-calculator.service');
jest.mock('../../services/persistence.service');

describe('OrderProcessorService', () => {
  let processor: OrderProcessorService;
  let mockParser: jest.Mocked<OrderParser>;
  let mockFilter: jest.Mocked<OrderFilterService>;
  let mockCalculator: jest.Mocked<OrderCalculatorService>;
  let mockPersistenceService: jest.Mocked<PersistenceService>;

  const sampleRawOrders: RawOrderLine[] = [
    {
      user_id: 1,
      name: 'João Silva',
      order_id: 1,
      product_id: 1,
      value: '100.50',
      date: '2023-01-01'
    },
    {
      user_id: 1,
      name: 'João Silva',
      order_id: 1,
      product_id: 2,
      value: '200.75',
      date: '2023-01-01'
    },
    {
      user_id: 2,
      name: 'Maria Souza',
      order_id: 2,
      product_id: 3,
      value: '150.25',
      date: '2023-02-01'
    }
  ];

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks();

    // Configurar os mocks
    mockParser = new OrderParser() as jest.Mocked<OrderParser>;
    mockFilter = new OrderFilterService() as jest.Mocked<OrderFilterService>;
    mockCalculator = new OrderCalculatorService() as jest.Mocked<OrderCalculatorService>;
    mockPersistenceService = new PersistenceService() as jest.Mocked<PersistenceService>;

    // Injetar os mocks no serviço, incluindo o PersistenceService
    processor = new OrderProcessorService(
      mockParser, 
      mockFilter, 
      mockCalculator,
      mockPersistenceService
    );
    
    // Configurar comportamento dos mocks
    mockParser.parseFile = jest.fn().mockReturnValue(sampleRawOrders);
    mockFilter.applyFilters = jest.fn().mockReturnValue(sampleRawOrders);
    mockCalculator.calculateOrderTotals = jest.fn();
    mockPersistenceService.persistData = jest.fn();
  });

  describe('processFile', () => {
    it('deve processar o conteúdo do arquivo corretamente', async () => {
      // Arrange
      const fileContent = 'conteúdo do arquivo';

      // Act
      const result = await processor.processFile(fileContent);

      // Assert
      expect(mockParser.parseFile).toHaveBeenCalledWith(fileContent);
      expect(result).toEqual({
        message: 'Arquivo processado com sucesso',
        total_records: 3
      });
    });

    it('deve lançar erro quando o parser falha', async () => {
      // Arrange
      const fileContent = 'conteúdo inválido';
      const error = new Error('Erro de parsing');
      mockParser.parseFile = jest.fn().mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(processor.processFile(fileContent)).rejects.toThrow('Erro ao processar arquivo: Error: Erro de parsing');
    });
  });

  describe('getOrders', () => {
    it('deve aplicar filtros, agrupar pedidos, calcular totais e persistir dados', async () => {
      // Arrange - configurar o estado interno do processador
      await processor.processFile('conteúdo do arquivo');

      // Configurar o resultado esperado do agrupamento
      const groupedOrders: UserOrders[] = [
        {
          user_id: 1,
          name: 'João Silva',
          orders: [
            {
              order_id: 1,
              total: '301.25',
              date: '2023-01-01',
              products: [
                { product_id: 1, value: '100.50' },
                { product_id: 2, value: '200.75' }
              ]
            }
          ]
        },
        {
          user_id: 2,
          name: 'Maria Souza',
          orders: [
            {
              order_id: 2,
              total: '150.25',
              date: '2023-02-01',
              products: [
                { product_id: 3, value: '150.25' }
              ]
            }
          ]
        }
      ];

      // Mock do método groupOrdersByUser
      jest.spyOn(processor, 'groupOrdersByUser').mockReturnValue(groupedOrders);

      // Act
      const result = await processor.getOrders();

      // Assert
      expect(mockFilter.applyFilters).toHaveBeenCalledWith(sampleRawOrders);
      expect(processor.groupOrdersByUser).toHaveBeenCalledWith(sampleRawOrders);
      expect(mockCalculator.calculateOrderTotals).toHaveBeenCalledWith(groupedOrders);
      expect(mockPersistenceService.persistData).toHaveBeenCalledWith(groupedOrders);
      expect(result).toEqual(groupedOrders);
    });
  });

  describe('groupOrdersByUser', () => {
    it('deve agrupar pedidos por usuário corretamente', () => {
      // Act
      const result = processor.groupOrdersByUser(sampleRawOrders);

      // Assert
      expect(result).toHaveLength(2); // 2 usuários distintos
      
      // Verificar usuário 1
      expect(result[0].user_id).toBe(1);
      expect(result[0].name).toBe('João Silva');
      expect(result[0].orders).toHaveLength(1); // 1 pedido
      expect(result[0].orders[0].order_id).toBe(1);
      expect(result[0].orders[0].products).toHaveLength(2); // 2 produtos
      
      // Verificar usuário 2
      expect(result[1].user_id).toBe(2);
      expect(result[1].name).toBe('Maria Souza');
      expect(result[1].orders).toHaveLength(1); // 1 pedido
      expect(result[1].orders[0].products).toHaveLength(1); // 1 produto
    });

    it('deve retornar array vazio quando não há pedidos', () => {
      const result = processor.groupOrdersByUser([]);
      expect(result).toEqual([]);
    });
  });
});
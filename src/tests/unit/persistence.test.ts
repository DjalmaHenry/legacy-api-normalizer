import { PersistenceService } from '../../services/persistence.service';
import Database from '../../database/database';
import { UserOrders } from '../../models/order.model';

// Mock do Database
jest.mock('../../database/database');

describe('PersistenceService', () => {
  let persistenceService: PersistenceService;
  let mockDatabase: jest.Mocked<Database>;

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks();

    // Configurar o mock do Database
    mockDatabase = {
      insertUser: jest.fn(),
      insertOrder: jest.fn(),
      insertProduct: jest.fn(),
      clearProductsForOrder: jest.fn(),
      getInstance: jest.fn(),
      getConnection: jest.fn(),
    } as unknown as jest.Mocked<Database>;

    // Mock do método estático getInstance
    (Database.getInstance as jest.Mock).mockReturnValue(mockDatabase);

    // Criar instância do serviço
    persistenceService = new PersistenceService();
  });

  describe('persistData', () => {
    it('deve persistir dados de usuários, pedidos e produtos corretamente', () => {
      // Arrange
      const data: UserOrders[] = [
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

      // Act
      persistenceService.persistData(data);

      // Assert
      // Verificar inserção de usuários
      expect(mockDatabase.insertUser).toHaveBeenCalledTimes(2);
      expect(mockDatabase.insertUser).toHaveBeenCalledWith(1, 'João Silva');
      expect(mockDatabase.insertUser).toHaveBeenCalledWith(2, 'Maria Souza');

      // Verificar inserção de pedidos
      expect(mockDatabase.insertOrder).toHaveBeenCalledTimes(2);
      expect(mockDatabase.insertOrder).toHaveBeenCalledWith(1, 1, '301.25', '2023-01-01');
      expect(mockDatabase.insertOrder).toHaveBeenCalledWith(2, 2, '150.25', '2023-02-01');

      // Verificar limpeza de produtos existentes
      expect(mockDatabase.clearProductsForOrder).toHaveBeenCalledTimes(2);
      expect(mockDatabase.clearProductsForOrder).toHaveBeenCalledWith(1);
      expect(mockDatabase.clearProductsForOrder).toHaveBeenCalledWith(2);

      // Verificar inserção de produtos
      expect(mockDatabase.insertProduct).toHaveBeenCalledTimes(3);
      expect(mockDatabase.insertProduct).toHaveBeenCalledWith(1, 1, '100.50');
      expect(mockDatabase.insertProduct).toHaveBeenCalledWith(1, 2, '200.75');
      expect(mockDatabase.insertProduct).toHaveBeenCalledWith(2, 3, '150.25');
    });

    it('deve lidar com array vazio de dados', () => {
      // Act
      persistenceService.persistData([]);

      // Assert
      expect(mockDatabase.insertUser).not.toHaveBeenCalled();
      expect(mockDatabase.insertOrder).not.toHaveBeenCalled();
      expect(mockDatabase.clearProductsForOrder).not.toHaveBeenCalled();
      expect(mockDatabase.insertProduct).not.toHaveBeenCalled();
    });

    it('deve propagar erros do banco de dados', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const data: UserOrders[] = [
        {
          user_id: 1,
          name: 'João Silva',
          orders: [
            {
              order_id: 1,
              total: '100.00',
              date: '2023-01-01',
              products: [
                { product_id: 1, value: '100.00' }
              ]
            }
          ]
        }
      ];
  
      const dbError = new Error('Erro de banco de dados');
      mockDatabase.insertUser.mockImplementation(() => {
        throw dbError;
      });
  
      // Act & Assert
      expect(() => persistenceService.persistData(data)).toThrow(dbError);
      
      // Cleanup
      consoleSpy.mockRestore();
    });
  });
});
import { PersistenceService } from '../../services/persistence.service';
import Database from '../../database/database';
import { UserOrders } from '../../models/order.model';

jest.mock('../../database/database');

describe('PersistenceService', () => {
  let persistenceService: PersistenceService;
  let mockDatabase: jest.Mocked<Database>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDatabase = {
      insertUser: jest.fn(),
      insertOrder: jest.fn(),
      insertProduct: jest.fn(),
      clearProductsForOrder: jest.fn(),
      getInstance: jest.fn(),
      getConnection: jest.fn(),
    } as unknown as jest.Mocked<Database>;

    (Database.getInstance as jest.Mock).mockReturnValue(mockDatabase);

    persistenceService = new PersistenceService();
  });

  describe('persistData', () => {
    it('deve persistir dados de usuários, pedidos e produtos corretamente', () => {
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

      persistenceService.persistData(data);

      expect(mockDatabase.insertUser).toHaveBeenCalledTimes(2);
      expect(mockDatabase.insertUser).toHaveBeenCalledWith(1, 'João Silva');
      expect(mockDatabase.insertUser).toHaveBeenCalledWith(2, 'Maria Souza');
      expect(mockDatabase.insertOrder).toHaveBeenCalledTimes(2);
      expect(mockDatabase.insertOrder).toHaveBeenCalledWith(1, 1, '301.25', '2023-01-01');
      expect(mockDatabase.insertOrder).toHaveBeenCalledWith(2, 2, '150.25', '2023-02-01');

      expect(mockDatabase.clearProductsForOrder).toHaveBeenCalledTimes(2);
      expect(mockDatabase.clearProductsForOrder).toHaveBeenCalledWith(1);
      expect(mockDatabase.clearProductsForOrder).toHaveBeenCalledWith(2);

      expect(mockDatabase.insertProduct).toHaveBeenCalledTimes(3);
      expect(mockDatabase.insertProduct).toHaveBeenCalledWith(1, 1, '100.50');
      expect(mockDatabase.insertProduct).toHaveBeenCalledWith(1, 2, '200.75');
      expect(mockDatabase.insertProduct).toHaveBeenCalledWith(2, 3, '150.25');
    });

    it('deve lidar com array vazio de dados', () => {
      persistenceService.persistData([]);

      expect(mockDatabase.insertUser).not.toHaveBeenCalled();
      expect(mockDatabase.insertOrder).not.toHaveBeenCalled();
      expect(mockDatabase.clearProductsForOrder).not.toHaveBeenCalled();
      expect(mockDatabase.insertProduct).not.toHaveBeenCalled();
    });

    it('deve propagar erros do banco de dados', () => {
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
  
      expect(() => persistenceService.persistData(data)).toThrow(dbError);
      
      consoleSpy.mockRestore();
    });
  });
});
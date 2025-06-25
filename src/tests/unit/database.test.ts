import Database from '../../database/database';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

jest.mock('node:sqlite', () => ({
  DatabaseSync: jest.fn(),
}));

jest.mock('fs');

interface MockDatabaseSync {
  exec: jest.Mock;
  prepare: jest.Mock;
  close: jest.Mock;
}

interface MockStatement {
  run: jest.Mock;
}

describe('Database', () => {
  let mockDb: MockDatabaseSync;
  let mockExec: jest.Mock;
  let mockPrepare: jest.Mock;
  let mockRun: jest.Mock;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  const DB_PATH = path.join(process.cwd(), 'database.db');

  beforeEach(() => {
    jest.clearAllMocks();

    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockRun = jest.fn();
    mockPrepare = jest.fn().mockReturnValue({ run: mockRun } as MockStatement);
    mockExec = jest.fn();

    mockDb = {
      exec: mockExec,
      prepare: mockPrepare,
      close: jest.fn(),
    };

    (DatabaseSync as jest.MockedClass<typeof DatabaseSync>).mockImplementation(
      () => mockDb as unknown as DatabaseSync,
    );

    (Database as unknown as { instance?: Database }).instance = undefined;
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    (Database as unknown as { instance?: Database }).instance = undefined;
  });

  describe('Singleton Pattern', () => {
    it('deve retornar a mesma instância quando chamado múltiplas vezes', () => {
      const instance1 = Database.getInstance();
      const instance2 = Database.getInstance();

      expect(instance1).toBe(instance2);
      expect(DatabaseSync).toHaveBeenCalledTimes(1);
      expect(DatabaseSync).toHaveBeenCalledWith(DB_PATH);
    });

    it('deve inicializar as tabelas na criação da instância', () => {
      Database.getInstance();

      expect(mockExec).toHaveBeenCalledTimes(3);
      expect(mockExec).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('CREATE TABLE IF NOT EXISTS users'),
      );
      expect(mockExec).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('CREATE TABLE IF NOT EXISTS orders'),
      );
      expect(mockExec).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('CREATE TABLE IF NOT EXISTS products'),
      );
      expect(consoleSpy).toHaveBeenCalledWith('Tabelas SQLite inicializadas com sucesso');
    });
  });

  describe('getConnection', () => {
    it('deve retornar a conexão do banco de dados', () => {
      const database = Database.getInstance();
      const connection = database.getConnection();

      expect(connection).toBe(mockDb);
    });
  });

  describe('initTables', () => {
    it('deve lançar erro se falhar ao criar tabelas', () => {
      const error = new Error('Erro ao criar tabela');
      mockExec.mockImplementation(() => {
        throw error;
      });

      expect(() => Database.getInstance()).toThrow(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao inicializar tabelas SQLite:', error);
    });
  });

  describe('insertUser', () => {
    let database: Database;

    beforeEach(() => {
      database = Database.getInstance();
    });

    it('deve inserir usuário com sucesso', () => {
      const userId = 1;
      const name = 'João Silva';

      database.insertUser(userId, name);

      expect(mockPrepare).toHaveBeenCalledWith(`
      INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)
    `);
      expect(mockRun).toHaveBeenCalledWith(userId, name);
    });

    it('deve usar INSERT OR IGNORE para evitar duplicatas', () => {
      database.insertUser(1, 'João Silva');

      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('INSERT OR IGNORE'));
    });
  });

  describe('insertOrder', () => {
    let database: Database;

    beforeEach(() => {
      database = Database.getInstance();
    });

    it('deve inserir pedido com sucesso', () => {
      const orderId = 1;
      const userId = 1;
      const total = '100.00';
      const date = '2023-01-01';

      database.insertOrder(orderId, userId, total, date);

      expect(mockPrepare).toHaveBeenCalledWith(`
      INSERT OR REPLACE INTO orders (id, user_id, total, date) VALUES (?, ?, ?, ?)
    `);
      expect(mockRun).toHaveBeenCalledWith(orderId, userId, total, date);
    });

    it('deve usar INSERT OR REPLACE para substituir pedidos existentes', () => {
      database.insertOrder(1, 1, '100.00', '2023-01-01');

      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('INSERT OR REPLACE'));
    });
  });

  describe('insertProduct', () => {
    let database: Database;

    beforeEach(() => {
      database = Database.getInstance();
    });

    it('deve inserir produto com sucesso', () => {
      const orderId = 1;
      const productId = 1;
      const value = '50.00';

      database.insertProduct(orderId, productId, value);

      expect(mockPrepare).toHaveBeenCalledWith(`
      INSERT INTO products (order_id, product_id, value) VALUES (?, ?, ?)
    `);
      expect(mockRun).toHaveBeenCalledWith(orderId, productId, value);
    });
  });

  describe('clearProductsForOrder', () => {
    let database: Database;

    beforeEach(() => {
      database = Database.getInstance();
    });

    it('deve limpar produtos de um pedido específico', () => {
      const orderId = 1;

      database.clearProductsForOrder(orderId);

      expect(mockPrepare).toHaveBeenCalledWith(`
      DELETE FROM products WHERE order_id = ?
    `);
      expect(mockRun).toHaveBeenCalledWith(orderId);
    });
  });

  describe('Integração dos métodos', () => {
    let database: Database;

    beforeEach(() => {
      database = Database.getInstance();
    });

    it('deve executar fluxo completo de inserção de dados', () => {
      database.insertUser(1, 'João Silva');

      database.insertOrder(1, 1, '150.00', '2023-01-01');

      database.clearProductsForOrder(1);

      database.insertProduct(1, 1, '100.00');
      database.insertProduct(1, 2, '50.00');

      expect(mockPrepare).toHaveBeenCalledTimes(5);
      expect(mockRun).toHaveBeenCalledTimes(5);
    });
  });

  describe('Tratamento de erros', () => {
    let database: Database;

    beforeEach(() => {
      database = Database.getInstance();
    });

    it('deve propagar erros do prepare statement', () => {
      const error = new Error('Erro no prepare');
      mockPrepare.mockImplementation(() => {
        throw error;
      });

      expect(() => database.insertUser(1, 'João Silva')).toThrow(error);
    });

    it('deve propagar erros do run statement', () => {
      const error = new Error('Erro no run');
      mockRun.mockImplementation(() => {
        throw error;
      });

      expect(() => database.insertUser(1, 'João Silva')).toThrow(error);
    });
  });
});

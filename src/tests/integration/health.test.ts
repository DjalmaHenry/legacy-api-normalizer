import { buildApp } from '../../app';
import { FastifyInstance } from 'fastify';

// Mock do Database para evitar persistência real durante os testes
jest.mock('../../database/database', () => {
  return {
    __esModule: true,
    default: class MockDatabase {
      static instance: MockDatabase;
      
      static getInstance() {
        if (!MockDatabase.instance) {
          MockDatabase.instance = new MockDatabase();
        }
        return MockDatabase.instance;
      }
      
      insertUser = jest.fn();
      insertOrder = jest.fn();
      insertProduct = jest.fn();
      clearProductsForOrder = jest.fn();
      getConnection = jest.fn();
    }
  };
});

describe('Health Check Endpoint', () => {
  let app: FastifyInstance;
  
  beforeAll(async () => {
    app = await buildApp();
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  it('deve retornar status 200 e informações de saúde', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });
    
    expect(response.statusCode).toBe(200);
    
    const result = JSON.parse(response.payload);
    expect(result).toHaveProperty('status', 'OK');
    expect(result).toHaveProperty('timestamp');
    
    // Verificar se o timestamp é uma data válida
    const timestamp = new Date(result.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(isNaN(timestamp.getTime())).toBe(false);
  });
});
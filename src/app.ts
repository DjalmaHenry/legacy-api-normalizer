import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { ordersRoutes } from './routes/orders.routes';
import { FILE_SIZE_LIMIT } from './utils/constants';
import Database from './database/database';

export async function buildApp() {
  const fastify = Fastify({ logger: true });

  Database.getInstance();

  await fastify.register(multipart, {
    limits: { fileSize: FILE_SIZE_LIMIT },
  });

  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'API REST - Processamento de Pedidos Legados',
        description: 'API para processar arquivos de pedidos com formato de largura fixa',
        version: '1.0.0',
      },
      schemes: ['http'],
      host: process.env.HOST_URL || 'localhost:3000',
      consumes: ['application/json', 'multipart/form-data'],
      produces: ['application/json'],
      tags: [{ name: 'Orders', description: 'Operações relacionadas a pedidos' }],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });

  await fastify.register(ordersRoutes);

  fastify.get('/health', async () => {
    return { status: 'OK', timestamp: new Date().toISOString() };
  });

  return fastify;
}

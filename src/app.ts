import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { dataRoutes } from './routes/data.routes';

export async function buildApp() {
  const fastify = Fastify({ logger: true });

  // Swagger básico
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Data Normalizer API',
        description: 'API simples para normalização de dados',
        version: '0.1.0',
      },
      host: 'localhost:3000',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Registrar rotas
  await fastify.register(dataRoutes);

  // Health check simples
  fastify.get('/health', async () => {
    return { status: 'OK' };
  });

  return fastify;
}

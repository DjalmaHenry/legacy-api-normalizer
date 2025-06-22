import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { healthRoutes } from './routes/health.routes';

export async function buildApp() {
  const fastify = Fastify({ logger: true });

  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Legacy API Normalizer',
        description: 'API para normalização de dados legados',
        version: '1.0.0',
      },
      schemes: ['http'],
      host: process.env.HOST_URL || 'localhost:3000',
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [{ name: 'Health', description: 'Operações de saúde da API' }],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });

  await fastify.register(healthRoutes);

  return fastify;
}

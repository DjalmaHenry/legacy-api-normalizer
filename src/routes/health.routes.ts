import { FastifyInstance } from 'fastify';
import { HealthController } from '../controllers/health.controller';

export async function healthRoutes(fastify: FastifyInstance) {
  const healthController = new HealthController();

  fastify.get(
    '/health',
    {
      schema: {
        description: 'Verificação de saúde da API',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
            },
          },
        },
      },
    },
    healthController.check.bind(healthController)
  );
}
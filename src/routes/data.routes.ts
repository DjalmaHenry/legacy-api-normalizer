import { FastifyInstance } from 'fastify';
import { DataController } from '../controllers/data.controller';

export async function dataRoutes(fastify: FastifyInstance) {
  const dataController = new DataController();

  // Processar dados
  fastify.post('/data/process', {
    schema: {
      description: 'Processar dados de texto',
      tags: ['Data'],
      body: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Conteúdo para processar' }
        },
        required: ['content']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  value: { type: 'string' },
                  date: { type: 'string' }
                }
              }
            },
            message: { type: 'string' }
          }
        }
      }
    }
  }, dataController.processData.bind(dataController));

  // Obter dados
  fastify.get('/data', {
    schema: {
      description: 'Obter dados processados',
      tags: ['Data'],
      querystring: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Filtrar por nome' }
        }
      }
    }
  }, dataController.getData.bind(dataController));

  // Limpar dados
  fastify.delete('/data', {
    schema: {
      description: 'Limpar todos os dados',
      tags: ['Data']
    }
  }, dataController.clearData.bind(dataController));
}
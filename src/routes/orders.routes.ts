import { FastifyInstance } from 'fastify';
import { OrdersController } from '../controllers/orders.controller';
import { OrderProcessorService } from '../services/order-processor.service';
import { OrderParser } from '../utils/parser';
import { OrderFilterService } from '../services/order-filter.service';
import { OrderCalculatorService } from '../services/order-calculator.service';
import { userOrdersJsonSchema } from '../schemas/upload.schema';

export async function ordersRoutes(fastify: FastifyInstance) {
  const parser = new OrderParser();
  const filter = new OrderFilterService();
  const calculator = new OrderCalculatorService();
  const orderProcessor = new OrderProcessorService(parser, filter, calculator);
  const ordersController = new OrdersController(orderProcessor);

  fastify.post(
    '/orders/upload',
    {
      schema: {
        description: 'Upload de arquivo .txt e retorna dados normalizados',
        tags: ['Orders'],
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'array',
            items: userOrdersJsonSchema,
            description: 'Lista de usuários com seus pedidos normalizados',
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
            required: ['error'],
            description: 'Erro de validação ou processamento',
          },
        },
      },
    },
    ordersController.uploadFile.bind(ordersController),
  );
}

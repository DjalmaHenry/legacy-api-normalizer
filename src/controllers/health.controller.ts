import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './base.controller';

export class HealthController extends BaseController {
  async check(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };

      this.handleSuccess(reply, healthData);
    } catch (error) {
      this.handleError(reply, error, 'Erro ao verificar saúde da API');
    }
  }
}
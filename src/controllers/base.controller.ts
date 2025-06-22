import { FastifyReply } from 'fastify';
import { IBaseController } from '../interfaces/base.interface';

export abstract class BaseController implements IBaseController {
  protected handleError(reply: FastifyReply, error: unknown, message = 'Erro interno do servidor'): void {
    console.error(error);
    reply.code(500).send({
      success: false,
      error: message,
    });
  }

  protected handleNotFound(reply: FastifyReply, message = 'Recurso não encontrado'): void {
    reply.code(404).send({
      success: false,
      error: message,
    });
  }

  protected handleSuccess<T>(reply: FastifyReply, data: T, message?: string, statusCode = 200): void {
    reply.code(statusCode).send({
      success: true,
      data,
      message,
    });
  }
}
import { FastifyRequest, FastifyReply } from 'fastify';
import { IOrderProcessor } from '../interfaces/orders.interface';
import { MultipartFile } from '@fastify/multipart';

export class OrdersController {
  constructor(private orderProcessor: IOrderProcessor) {}

  async uploadFile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await request.file();
      
      this.validateFileUpload(data);
      
      const content = await this.extractFileContent(data!);
      await this.orderProcessor.processFile(content);
      
      const normalizedData = await this.orderProcessor.getOrders();
      
      return reply.status(200).send(normalizedData);
    } catch (error) {
      return this.handleError(reply, error);
    }
  }

  private validateFileUpload(data: MultipartFile | undefined): void {
    if (!data) {
      throw new Error('Nenhum arquivo enviado');
    }

    if (!data.filename.endsWith('.txt')) {
      throw new Error('Apenas arquivos .txt são aceitos');
    }
  }

  private async extractFileContent(data: MultipartFile): Promise<string> {
    const buffer = await data.toBuffer();
    return buffer.toString('utf-8');
  }

  private handleError(reply: FastifyReply, error: unknown): FastifyReply {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return reply.status(400).send({ error: errorMessage });
  }
}
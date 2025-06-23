import { FastifyRequest, FastifyReply } from 'fastify';
import { DataService } from '../services/data.service';
import { ApiResponse, DataItem } from '../models/data.model';

interface ProcessRequest {
  Body: { content: string };
}

interface FilterRequest {
  Querystring: { name?: string };
}

export class DataController {
  private dataService = new DataService();

  // Processar dados
  async processData(request: FastifyRequest<ProcessRequest>, reply: FastifyReply) {
    try {
      const { content } = request.body;
      
      if (!content) {
        return reply.code(400).send({
          success: false,
          message: 'Conteúdo é obrigatório'
        });
      }

      const processedData = this.dataService.processData(content);
      this.dataService.saveData(processedData);

      const response: ApiResponse<DataItem[]> = {
        success: true,
        data: processedData,
        message: `${processedData.length} itens processados`
      };

      return reply.send(response);
    } catch (error) {
      return reply.code(500).send({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter dados
  async getData(request: FastifyRequest<FilterRequest>, reply: FastifyReply) {
    try {
      const { name } = request.query;
      
      let data: DataItem[];
      if (name) {
        data = this.dataService.filterByName(name);
      } else {
        data = this.dataService.getAllData();
      }

      const response: ApiResponse<DataItem[]> = {
        success: true,
        data,
        message: `${data.length} itens encontrados`
      };

      return reply.send(response);
    } catch (error) {
      return reply.code(500).send({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Limpar dados
  async clearData(request: FastifyRequest, reply: FastifyReply) {
    try {
      this.dataService.clearData();
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Dados limpos com sucesso'
      };

      return reply.send(response);
    } catch (error) {
      return reply.code(500).send({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
import { OrdersController } from "../../controllers/orders.controller";
import { IOrderProcessor } from "../../interfaces/orders.interface";
import { MultipartFile } from "@fastify/multipart";
import { FastifyReply, FastifyRequest } from "fastify";

describe("OrdersController", () => {
  let controller: OrdersController;
  let mockOrderProcessor: jest.Mocked<IOrderProcessor>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFile: Partial<MultipartFile>;

  beforeEach(() => {
    mockOrderProcessor = {
      processFile: jest.fn(),
      getOrders: jest.fn(),
      groupOrdersByUser: jest.fn(),
    } as jest.Mocked<IOrderProcessor>;

    mockFile = {
      filename: "test.txt",
      toBuffer: jest.fn().mockResolvedValue(Buffer.from("conteúdo do arquivo")),
    } as Partial<MultipartFile>;

    mockRequest = {
      file: jest.fn().mockResolvedValue(mockFile),
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    controller = new OrdersController(mockOrderProcessor);
  });

  describe("uploadFile", () => {
    it("deve processar o upload de arquivo com sucesso", async () => {
      const processResult = {
        message: "Arquivo processado com sucesso",
        total_records: 3,
      };
      const normalizedData = [{ user_id: 1, name: "João Silva", orders: [] }];

      mockOrderProcessor.processFile.mockResolvedValue(processResult);
      mockOrderProcessor.getOrders.mockResolvedValue(normalizedData);

      await controller.uploadFile(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockRequest.file).toHaveBeenCalled();
      expect(mockFile.toBuffer).toHaveBeenCalled();
      expect(mockOrderProcessor.processFile).toHaveBeenCalledWith(
        "conteúdo do arquivo",
      );
      expect(mockOrderProcessor.getOrders).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(normalizedData);
    });

    it("deve retornar erro 400 quando nenhum arquivo é enviado", async () => {
      mockRequest.file = jest.fn().mockResolvedValue(undefined);

      await controller.uploadFile(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Nenhum arquivo enviado",
      });
    });

    it("deve retornar erro 400 quando o arquivo não é .txt", async () => {
      mockFile.filename = "test.pdf";

      await controller.uploadFile(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Apenas arquivos .txt são aceitos",
      });
    });

    it("deve retornar erro 400 quando o processamento falha", async () => {
      const error = new Error("Erro de processamento");
      mockOrderProcessor.processFile.mockRejectedValue(error);

      await controller.uploadFile(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro de processamento",
      });
    });
  });
});

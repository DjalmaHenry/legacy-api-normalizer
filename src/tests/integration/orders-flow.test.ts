import { buildApp } from "../../app";
import { FastifyInstance } from "fastify";
import { UserOrders } from "../../models/order.model";

jest.mock("../../database/database", () => {
  return {
    __esModule: true,
    default: class MockDatabase {
      static instance: MockDatabase;

      static getInstance() {
        if (!MockDatabase.instance) {
          MockDatabase.instance = new MockDatabase();
        }
        return MockDatabase.instance;
      }

      insertUser = jest.fn();
      insertOrder = jest.fn();
      insertProduct = jest.fn();
      clearProductsForOrder = jest.fn();
      getConnection = jest.fn();
    },
  };
});

describe("Fluxo de Processamento de Pedidos (Integração)", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("deve processar um arquivo de pedidos e retornar dados normalizados", async () => {
    const testFileContent = [
      "0000000001João Silva                                   0000000001000000000100000123.45 20230101",
      "0000000001João Silva                                   0000000001000000000200000056.78 20230101",
      "0000000002Maria Souza                                  0000000002000000000300000099.99 20230202",
    ].join("\n");

    const fileBuffer = Buffer.from(testFileContent);

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: "text/plain" });
    formData.append("file", blob, "orders.txt");

    const response = await app.inject({
      method: "POST",
      url: "/orders/upload",
      payload: formData,
      headers: {
        "content-type":
          "multipart/form-data; boundary=" + Math.random().toString().substr(2),
      },
    });

    expect(response.statusCode).toBe(200);

    const result = JSON.parse(response.payload) as UserOrders[];

    expect(result).toHaveLength(2);

    expect(result[0].user_id).toBe(1);
    expect(result[0].name).toBe("João Silva");
    expect(result[0].orders).toHaveLength(1);
    expect(result[0].orders[0].products).toHaveLength(2);
    expect(result[0].orders[0].total).toBe("180.23");

    expect(result[1].user_id).toBe(2);
    expect(result[1].name).toBe("Maria Souza");
    expect(result[1].orders).toHaveLength(1);
    expect(result[1].orders[0].products).toHaveLength(1);
    expect(result[1].orders[0].total).toBe("99.99");
  });

  it("deve retornar erro 400 para arquivo inválido", async () => {
    const invalidFileContent = "conteúdo inválido";

    const fileBuffer = Buffer.from(invalidFileContent);

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: "text/plain" });
    formData.append("file", blob, "invalid.txt");

    const response = await app.inject({
      method: "POST",
      url: "/orders/upload",
      payload: formData,
      headers: {
        "content-type":
          "multipart/form-data; boundary=" + Math.random().toString().substr(2),
      },
    });

    expect(response.statusCode).toBe(400);

    const result = JSON.parse(response.payload);
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("Erro na linha 1:");
  });
});

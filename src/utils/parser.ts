import { RawOrderLine } from "../models/order.model";
import { IOrderParser } from "../interfaces/parser.interface";
import { ExtractedFields, FieldPositions } from "../interfaces/parser.model";

const LINE_LENGTH = 95;
const FIELD_POSITIONS: FieldPositions = {
  USER_ID: { start: 0, end: 10 },
  NAME: { start: 10, end: 55 },
  ORDER_ID: { start: 55, end: 65 },
  PRODUCT_ID: { start: 65, end: 75 },
  VALUE: { start: 75, end: 87 },
  DATE: { start: 87, end: 95 },
} as const;

export class OrderParser implements IOrderParser {
  parseLine(line: string): RawOrderLine {
    this.validateLineLength(line);

    const fields = this.extractFields(line);
    this.validateFields(fields);

    return {
      user_id: fields.user_id,
      name: fields.name,
      order_id: fields.order_id,
      product_id: fields.product_id,
      value: fields.value,
      date: fields.date,
    };
  }

  private validateLineLength(line: string): void {
    if (line.length !== LINE_LENGTH) {
      throw new Error(
        `Linha inválida: tamanho esperado ${LINE_LENGTH}, recebido ${line.length}`,
      );
    }
  }

  private extractFields(line: string): ExtractedFields {
    const user_id = parseInt(
      line
        .substring(FIELD_POSITIONS.USER_ID.start, FIELD_POSITIONS.USER_ID.end)
        .trim(),
      10,
    );
    const name = line
      .substring(FIELD_POSITIONS.NAME.start, FIELD_POSITIONS.NAME.end)
      .trim();
    const order_id = parseInt(
      line
        .substring(FIELD_POSITIONS.ORDER_ID.start, FIELD_POSITIONS.ORDER_ID.end)
        .trim(),
      10,
    );
    const product_id = parseInt(
      line
        .substring(
          FIELD_POSITIONS.PRODUCT_ID.start,
          FIELD_POSITIONS.PRODUCT_ID.end,
        )
        .trim(),
      10,
    );
    const value = parseFloat(
      line
        .substring(FIELD_POSITIONS.VALUE.start, FIELD_POSITIONS.VALUE.end)
        .trim(),
    ).toFixed(2);
    const dateStr = line
      .substring(FIELD_POSITIONS.DATE.start, FIELD_POSITIONS.DATE.end)
      .trim();

    const date = this.formatDate(dateStr);

    return { user_id, name, order_id, product_id, value, date };
  }

  private formatDate(dateStr: string): string {
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }

  private validateFields(fields: ExtractedFields): void {
    if (
      isNaN(fields.user_id) ||
      isNaN(fields.order_id) ||
      isNaN(fields.product_id)
    ) {
      throw new Error("Campos numéricos inválidos na linha");
    }

    if (!fields.name) {
      throw new Error("Nome do usuário não pode estar vazio");
    }
  }

  parseFile(content: string): RawOrderLine[] {
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    return lines.map((line, index) => {
      try {
        return this.parseLine(line);
      } catch (error) {
        throw new Error(`Erro na linha ${index + 1}: ${error}`);
      }
    });
  }
}

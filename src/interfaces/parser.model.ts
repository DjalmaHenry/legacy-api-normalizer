export interface ExtractedFields {
  user_id: number;
  name: string;
  order_id: number;
  product_id: number;
  value: string;
  date: string;
}

export interface FieldPositions {
  USER_ID: { start: number; end: number };
  NAME: { start: number; end: number };
  ORDER_ID: { start: number; end: number };
  PRODUCT_ID: { start: number; end: number };
  VALUE: { start: number; end: number };
  DATE: { start: number; end: number };
}

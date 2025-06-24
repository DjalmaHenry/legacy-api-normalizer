import { z } from "zod";

export const uploadResponseSchema = z.object({
  message: z.string(),
  total_records: z.number(),
});

export const productSchema = z.object({
  product_id: z.number(),
  value: z.string(),
});

export const orderSchema = z.object({
  order_id: z.number(),
  total: z.string(),
  date: z.string(),
  products: z.array(productSchema),
});

export const userOrdersSchema = z.object({
  user_id: z.number(),
  name: z.string(),
  orders: z.array(orderSchema),
});

export const productJsonSchema = {
  type: "object",
  properties: {
    product_id: { type: "number" },
    value: { type: "string" },
  },
  required: ["product_id", "value"],
};

export const orderJsonSchema = {
  type: "object",
  properties: {
    order_id: { type: "number" },
    total: { type: "string" },
    date: { type: "string" },
    products: {
      type: "array",
      items: productJsonSchema,
    },
  },
  required: ["order_id", "total", "date", "products"],
};

export const userOrdersJsonSchema = {
  type: "object",
  properties: {
    user_id: { type: "number" },
    name: { type: "string" },
    orders: {
      type: "array",
      items: orderJsonSchema,
    },
  },
  required: ["user_id", "name", "orders"],
};

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
export type ProductSchema = z.infer<typeof productSchema>;
export type OrderSchema = z.infer<typeof orderSchema>;
export type UserOrdersSchema = z.infer<typeof userOrdersSchema>;

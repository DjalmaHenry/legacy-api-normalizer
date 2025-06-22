import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    error: z.string().optional(),
  });

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const baseEntityJsonSchema = zodToJsonSchema(BaseEntitySchema);

export type BaseEntityType = z.infer<typeof BaseEntitySchema>;
export type PaginationType = z.infer<typeof PaginationSchema>;
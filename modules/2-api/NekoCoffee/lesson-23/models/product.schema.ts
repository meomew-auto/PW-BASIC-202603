import { z } from "zod";
import { paginationMetaSchema } from "./common.schema";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ☕ PRODUCT ZOD SCHEMAS & RUNTIME CONTRACTS
 * ════════════════════════════════════════════════════════════════════════════
 */

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ☕ PRODUCT ENUMS & VALUE CONSTRAINTS (Trích xuất từ OpenAPI / Scalar)
 * ════════════════════════════════════════════════════════════════════════════
 */

// import { z } from "zod"

// export const schema = z.object({
//   data: z.array(
//     z.object({
//       id: z.number(),
//       name: z.string(),
//       type: z.string(),
//       unit_type: z.string(),
//       origin: z.string(),
//       roast_level: z.string(),
//       price_per_unit: z.number(),
//       image_url: z.string(),
//       specifications: z.object({
//         region: z.string(),
//         altitude: z.string(),
//         processing: z.string(),
//         grade: z.string(),
//         flavor_profile: z.object({
//           acidity: z.number(),
//           sweetness: z.number(),
//           notes: z.array(z.string())
//         })
//       }),
//       is_active: z.boolean()
//     })
//   ),
//   pagination: z.object({
//     page: z.number(),
//     limit: z.number(),
//     total: z.number(),
//     total_pages: z.number()
//   })
// })

export const productTypeEnum = z.enum(["bean", "equipment", "accessory"]);
export type ProductType = z.infer<typeof productTypeEnum>;

export const roastLevelEnum = z.enum(["Light", "Medium", "Dark"]);
export type RoastLevel = z.infer<typeof roastLevelEnum>;

export const unitTypeEnum = z.enum(["kg", "piece", "box"]);
export type UnitType = z.infer<typeof unitTypeEnum>;

/**
 * ☕ Product DTO Schema dùng trong bảng và danh sách sản phẩm
 */
export const productDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price_per_unit: z.number(),
  type: productTypeEnum,
  unit_type: unitTypeEnum.nullable().optional(),
  origin: z.string().nullable().optional(),
  roast_level: roastLevelEnum.nullable().optional(),
  weight_grams: z.number().nullable().optional(),
  stock_quantity: z.number().nullable().optional(),
  category: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});
export type ProductDto = z.infer<typeof productDtoSchema>;

/**
 * 🔍 Query Parameters dùng để lọc sản phẩm trong API & UI Table
 */
export const productFilterQuerySchema = z.object({
  type: productTypeEnum.optional(),
  origin: z.string().optional(),
  roast_level: roastLevelEnum.optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  in_stock: z.boolean().optional(),
});
export type ProductFilterQuery = z.infer<typeof productFilterQuerySchema>;
export const productListResponseSchema = z.object({
  data: z.array(productDtoSchema),
  pagination: paginationMetaSchema,
});
export type ProductListResponse = z.infer<typeof productListResponseSchema>;

export const uploadProductImageResponseSchema = z.object({
  message: z.string(),
  image_url: z.string().url("Phải là URL hợp lệ"),
  thumbnail_url: z.string().url("Phải là URL hợp lệ"),
});
export type UploadProductImageResponse = z.infer<
  typeof uploadProductImageResponseSchema
>;

/**
 * ☕ Chi tiết sản phẩm Neko Coffee được trích xuất trực tiếp từ OpenAPI /components/schemas/Product
 */
export const nekoProductDetailSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  type: productTypeEnum.nullable().optional(),
  unit_type: unitTypeEnum.nullable().optional(),
  origin: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  roast_level: roastLevelEnum.nullable().optional(),
  price_per_unit: z.number().positive("Đơn giá phải là số dương"),
  warranty_months: z.number().nullable().optional(),
  image_url: z
    .string()
    .url("URL ảnh không đúng định dạng")
    .nullable()
    .optional(),
  gallery: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.any()).nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type NekoProductDetail = z.infer<typeof nekoProductDetailSchema>;

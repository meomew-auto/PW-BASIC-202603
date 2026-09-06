import { z } from "zod";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🌐 COMMON ZOD SCHEMAS & RUNTIME CONTRACTS (TẦNG HỢP ĐỒNG DỮ LIỆU DÙNG CHUNG)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Tệp này đóng vai trò "Single Source of Truth" cho các cấu trúc dữ liệu dùng
 * chung trên toàn bộ hệ thống API Neko Coffee:
 *   1. Phân trang (Pagination Metadata & Query Parameters)
 *   2. Kiểm tra sức khỏe hệ thống (Ping Response)
 *   3. Chuẩn hóa phản hồi lỗi từ Backend (Error Response)
 *   4. Hàm bao đóng phản hồi tổng quát (Generic ApiResponse Wrapper)
 *
 * Mọi Schema ở đây vừa dùng để thẩm định Runtime (Zod parse), vừa tự động
 * sinh ra kiểu dữ liệu TypeScript (z.infer) cho Compile-time.
 */

// ── 1. SCHEMA PHÂN TRANG (PAGINATION METADATA) ──────────────────────────────
/**
 * Schema thẩm định thông tin phân trang do Backend trả về trong data list.
 * Đảm bảo số trang, giới hạn, tổng số bản ghi luôn là số nguyên hợp lệ.
 */
export const paginationMetaSchema = z.object({
  /** Trang hiện tại (bắt đầu từ 1) */
  page: z.number().int().min(1, "Trang hiện tại tối thiểu là 1"),

  /** Số lượng bản ghi trên một trang */
  limit: z.number().int().min(1, "Số lượng bản ghi tối thiểu là 1"),

  /** Tổng số bản ghi thỏa mãn điều kiện lọc trong database */
  total_items: z.number().int().nonnegative("Tổng số bản ghi không được âm"),

  /** Tổng số trang được tính toán */
  total_pages: z.number().int().nonnegative("Tổng số trang không được âm"),

  /** Cờ báo hiệu có trang kế tiếp hay không */
  has_next: z.boolean(),

  /** Cờ báo hiệu có trang phía trước hay không */
  has_prev: z.boolean(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

// ── 2. SCHEMA THAM SỐ TRUY VẤN PHÂN TRANG (QUERY PARAMS) ────────────────────
/**
 * Schema kiểm định các tham số phân trang mà Client gửi lên Server qua URL.
 * Sử dụng .passthrough() để cho phép các tham số filter nghiệp vụ khác đi kèm.
 */
export const paginationQuerySchema = z
  .object({
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
  })
  .passthrough();
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

// ── 3. SCHEMA KIỂM TRA SỨC KHỎE HỆ THỐNG (PING / HEALTH CHECK) ─────────────
/**
 * Schema phản hồi từ endpoint /public/test/ping
 */
export const pingResponseSchema = z.object({
  message: z.literal("pong"),
  timestamp: z.string(),
  client_ip: z.string().optional(),
});
export type PingResponse = z.infer<typeof pingResponseSchema>;

// ── 4. SCHEMA PHẢN HỒI LỖI TỔNG QUÁT (API ERROR RESPONSE) ───────────────────
/**
 * Schema chuẩn hóa các gói tin lỗi mà Backend Neko Coffee trả về khi gặp sự cố
 * (HTTP Status: 400, 401, 403, 404, 422, 500).
 */
export const apiErrorResponseSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
  detail: z.string().optional(),
  status_code: z.number().int().optional(),
});
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;

// ── 5. GENERIC API RESPONSE BUILDER (BAO ĐÓNG PHẢN HỒI DỮ LIỆU) ─────────────
/**
 * Hàm trợ giúp tạo Zod Schema cho phản hồi có bọc Envelope: { data: T, message?: string }
 */
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
    message: z.string().optional(),
    timestamp: z.string().optional(),
    client_ip: z.string().optional(),
  });
}


import { APIRequestContext, APIResponse } from "@playwright/test";
import { z } from "zod";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🏛️ BASE API CLIENT (TẦNG NỀN TẢNG CHO TẤT CẢ DOMAIN SERVICES)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Nhiệm vụ:
 * 1. Đóng gói APIRequestContext của Playwright.
 * 2. Quản lý Bearer Token an toàn và tự động tiêm Header Authorization.
 * 3. Chuẩn hóa các phương thức gọi HTTP (GET, POST, PUT, PATCH, DELETE).
 * 4. Tích hợp ZOD RUNTIME VALIDATION: Kiểm tra tính toàn vẹn của phản hồi Backend!
 */
export abstract class BaseApiClient {
  protected request: APIRequestContext;
  protected authToken?: string;

  constructor(request: APIRequestContext, authToken?: string) {
    this.request = request;
    this.authToken = authToken;
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  public getAuthToken(): string | undefined {
    return this.authToken;
  }

  protected buildHeaders(
    customHeaders?: Record<string, string>,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...customHeaders,
    };

    if (this.authToken && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  public async get(
    endpoint: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
    },
  ): Promise<APIResponse> {
    return this.request.get(endpoint, {
      params: options?.params,
      headers: this.buildHeaders(options?.headers),
    });
  }

  public async post(
    endpoint: string,
    options?: {
      data?: any;
      form?: Record<string, any>;
      multipart?: Record<string, any>;
      headers?: Record<string, string>;
    },
  ): Promise<APIResponse> {
    return this.request.post(endpoint, {
      data: options?.data,
      form: options?.form,
      multipart: options?.multipart,
      headers: this.buildHeaders(options?.headers),
    });
  }

  public async put(
    endpoint: string,
    options?: { data?: any; headers?: Record<string, string> },
  ): Promise<APIResponse> {
    return this.request.put(endpoint, {
      data: options?.data,
      headers: this.buildHeaders(options?.headers),
    });
  }

  public async patch(
    endpoint: string,
    options?: { data?: any; headers?: Record<string, string> },
  ): Promise<APIResponse> {
    return this.request.patch(endpoint, {
      data: options?.data,
      headers: this.buildHeaders(options?.headers),
    });
  }

  public async delete(
    endpoint: string,
    options?: { headers?: Record<string, string> },
  ): Promise<APIResponse> {
    return this.request.delete(endpoint, {
      headers: this.buildHeaders(options?.headers),
    });
  }

  /**
   * 🛡️ XÁC THỰC PHẢN HỒI QUA ZOD SCHEMA (CONTRACT RUNTIME ASSERTION)
   * Tự động parse JSON và kiểm tra kiểu dữ liệu của Backend theo Schema.
   * Ném lỗi chi tiết nếu Backend vi phạm hợp đồng (breaking change).
   */
  public async parseResponse<T>(
    response: APIResponse,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const json = await response.json();
    const result = schema.safeParse(json);
    if (!result.success) {
      throw new Error(
        `❌ [BaseApiClient] Vi phạm hợp đồng Zod Schema!\n` +
          `📍 URL: ${response.url()} (Status: ${response.status()})\n` +
          `⚠️ Chi tiết lỗi:\n${JSON.stringify(result.error.format(), null, 2)}`,
      );
    }
    return result.data;
  }
}

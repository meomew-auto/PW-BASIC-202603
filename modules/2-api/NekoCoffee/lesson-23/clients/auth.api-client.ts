import { APIRequestContext, APIResponse } from "@playwright/test";
import { BaseApiClient } from "./base.api-client";
import {
  RegisterRequest,
  LoginRequest,
  userProfileSchema,
  UserProfile,
  authTokenResponseSchema,
  AuthTokenResponse,
} from "../models";

/**
 * 🔐 AUTH API CLIENT: Quản lý đăng ký, đăng nhập và thông tin xác thực
 */
export class AuthApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, authToken?: string) {
    super(request, authToken);
  }

  // ── 1. HTTP RAW METHODS (Dành cho kiểm thử Status Code, Header, Test lỗi 401/403) ──

  public async register(payload: RegisterRequest): Promise<APIResponse> {
    return this.post("/auth/register", { data: payload });
  }

  public async login(payload: LoginRequest): Promise<APIResponse> {
    return this.post("/auth/login", { data: payload });
  }

  public async getMe(tokenOverride?: string): Promise<APIResponse> {
    const headers = tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : undefined;
    return this.get("/auth/me", { headers });
  }

  public async refreshToken(refreshToken: string): Promise<APIResponse> {
    return this.post("/auth/refresh", { data: { refresh_token: refreshToken } });
  }

  // ── 2. SMART DATA METHODS (Tự động thẩm định Zod Contract & trả về dữ liệu an toàn kiểu) ──

  /**
   * ⚡ Smart Data Method: Đăng nhập và tự động thẩm định Auth Token qua Zod Schema.
   * Trả về AuthTokenResponse chứa JWT token và thông tin user đã kiểm chứng.
   */
  public async loginData(payload: LoginRequest): Promise<AuthTokenResponse> {
    const response = await this.login(payload);
    return this.parseResponse(response, authTokenResponseSchema);
  }

  /**
   * ⚡ Smart Data Method: Lấy User Profile và tự động validate qua userProfileSchema.
   * Tester chỉ việc gọi hàm, nhận về UserProfile có type an toàn mà không cần nhớ Schema!
   */
  public async getMeData(tokenOverride?: string): Promise<UserProfile> {
    const response = await this.getMe(tokenOverride);
    return this.parseResponse(response, userProfileSchema);
  }
}

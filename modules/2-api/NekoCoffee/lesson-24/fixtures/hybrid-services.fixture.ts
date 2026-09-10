import { test as base } from "@playwright/test";
import { AuthApiClient } from "../../lesson-23/clients/auth.api-client";
import { ProductApiClient } from "../../lesson-23/clients/product.api-client";
import { EchoApiClient } from "../../lesson-23/clients/echo.api-client";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🌐 TẦNG API SERVICE CLIENTS FIXTURE (AOM - API OBJECT MODEL)
 * ════════════════════════════════════════════════════════════════════════════
 * Cung cấp các API Client độc lập (Unauthenticated) dùng cho kiểm thử API:
 * 1. authApi: Quản lý đăng ký, đăng nhập, thông tin user
 * 2. productApi: Quản lý sản phẩm, danh mục, audit hợp đồng Zod
 * 3. echoApi: Kiểm thử mạng, phản hồi header và payload
 */

export interface HybridServicesFixtures {
  authApi: AuthApiClient;
  productApi: ProductApiClient;
  echoApi: EchoApiClient;
}

export const hybridServicesFixtures = {
  authApi: async (
    { request }: any,
    use: (r: AuthApiClient) => Promise<void>,
  ) => {
    await use(new AuthApiClient(request));
  },
  productApi: async (
    { request }: any,
    use: (r: ProductApiClient) => Promise<void>,
  ) => {
    await use(new ProductApiClient(request));
  },
  echoApi: async (
    { request }: any,
    use: (r: EchoApiClient) => Promise<void>,
  ) => {
    await use(new EchoApiClient(request));
  },
};

export const hybridServices =
  base.extend<HybridServicesFixtures>(hybridServicesFixtures);

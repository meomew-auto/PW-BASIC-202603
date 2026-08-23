/**
 * ============================================================================
 * HYBRID ENVIRONMENT CONFIGURATION (TypeScript Type-Safe Config)
 * ============================================================================
 * Mục đích:
 * - Cung cấp cấu hình dữ liệu lồng nhau phức tạp (Nested Object, Feature Flags, Endpoints).
 * - Type-Safe 100% với TypeScript Interface, có autocomplete IntelliSense.
 * - Kết hợp hoàn hảo với .env (để lấy secrets/passwords bảo mật).
 * ============================================================================
 */

export interface AppEnvironmentConfig {
  envName: string;
  baseUrl: string;
  timeoutMs: number;
  features: {
    enableMockApi: boolean;
    enableRealtimeChat: boolean;
    maxRetryCount: number;
  };
  endpoints: {
    login: string;
    customers: string;
    projects: string;
  };
}

export const HYBRID_ENV_CONFIGS: Record<string, AppEnvironmentConfig> = {
  development: {
    envName: "development",
    baseUrl: "https://crm-dev.anhtester.com",
    timeoutMs: 10000,
    features: {
      enableMockApi: true,
      enableRealtimeChat: false,
      maxRetryCount: 0,
    },
    endpoints: {
      login: "/admin/authentication",
      customers: "/admin/clients",
      projects: "/admin/projects",
    },
  },
  staging: {
    envName: "staging",
    baseUrl: "https://crm.anhtester.com",
    timeoutMs: 15000,
    features: {
      enableMockApi: false,
      enableRealtimeChat: true,
      maxRetryCount: 1,
    },
    endpoints: {
      login: "/admin/authentication",
      customers: "/admin/clients",
      projects: "/admin/projects",
    },
  },
  uat: {
    envName: "uat",
    baseUrl: "https://crm.anhtester.com",
    timeoutMs: 15000,
    features: {
      enableMockApi: false,
      enableRealtimeChat: true,
      maxRetryCount: 2,
    },
    endpoints: {
      login: "/admin/authentication",
      customers: "/admin/clients",
      projects: "/admin/projects",
    },
  },
  test: {
    envName: "test",
    baseUrl: "https://crm.anhtester.com",
    timeoutMs: 20000,
    features: {
      enableMockApi: false,
      enableRealtimeChat: false,
      maxRetryCount: 2,
    },
    endpoints: {
      login: "/admin/authentication",
      customers: "/admin/clients",
      projects: "/admin/projects",
    },
  },
};

/**
 * Hàm giải quyết cấu hình theo Profile dòng lệnh (NODE_ENV)
 */
export function resolveHybridConfig(): AppEnvironmentConfig {
  const profile = process.env.NODE_ENV ?? "development";
  return HYBRID_ENV_CONFIGS[profile] ?? HYBRID_ENV_CONFIGS.development;
}

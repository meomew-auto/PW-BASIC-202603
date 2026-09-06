import { test as base } from "@playwright/test";
import { ProductApiClient } from "../clients/product.api-client";
import { EchoApiClient } from "../clients/echo.api-client";

export type ApiServicesFixtures = {
  productApi: ProductApiClient;
  echoApi: EchoApiClient;
};

export const apiServicesFixtures = {
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

export const apiServices =
  base.extend<ApiServicesFixtures>(apiServicesFixtures);

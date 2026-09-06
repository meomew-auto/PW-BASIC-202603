import { APIRequestContext, APIResponse } from "@playwright/test";
import { BaseApiClient } from "./base.api-client";
import {
  ProductFilterQuery,
  productListResponseSchema,
  ProductListResponse,
  nekoProductDetailSchema,
  NekoProductDetail,
  uploadProductImageResponseSchema,
  UploadProductImageResponse,
} from "../models";

/**
 * ☕ PRODUCT API CLIENT: Quản lý danh mục sản phẩm và upload hình ảnh
 */
export class ProductApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, authToken?: string) {
    super(request, authToken);
  }

  // ── 1. HTTP RAW METHODS (Phục vụ kiểm tra mã Status HTTP, Header, Test lỗi 4xx/5xx) ──

  public async getProducts(query?: ProductFilterQuery): Promise<APIResponse> {
    return this.get("/public/products", { params: query });
  }

  public async getProductById(id: number | string): Promise<APIResponse> {
    return this.get(`/public/products/${id}`);
  }

  public async createProduct(payload: {
    name: string;
    price_per_unit: number;
    type?: string;
  }): Promise<APIResponse> {
    return this.post("/api/products", { data: payload });
  }

  public async uploadImage(
    productId: number | string,
    imagePayload: { name: string; mimeType: string; buffer: Buffer },
    tokenOverride?: string,
  ): Promise<APIResponse> {
    const headers = tokenOverride
      ? { Authorization: `Bearer ${tokenOverride}` }
      : undefined;
    return this.post(`/api/products/${productId}/image`, {
      headers,
      multipart: {
        image: imagePayload,
      },
    });
  }

  // ── 2. SMART DATA METHODS (Tự động thẩm định Zod Contract & trả về dữ liệu an toàn kiểu) ──

  /**
   * ⚡ Smart Data Method: Lấy danh sách sản phẩm và tự động validate qua productListResponseSchema.
   * Tester chỉ việc gọi hàm, nhận về ProductListResponse đầy đủ gợi ý code mà KHÔNG CẦN nhớ Schema!
   */
  public async getProductsData(
    query?: ProductFilterQuery,
  ): Promise<ProductListResponse> {
    const response = await this.getProducts(query);
    return this.parseResponse(response, productListResponseSchema);
  }

  /**
   * ⚡ Smart Data Method: Lấy chi tiết sản phẩm và tự động validate qua nekoProductDetailSchema.
   */
  public async getProductDetailData(
    id: number | string,
  ): Promise<NekoProductDetail> {
    const response = await this.getProductById(id);
    return this.parseResponse(response, nekoProductDetailSchema);
  }

  /**
   * ⚡ Smart Data Method: Upload ảnh sản phẩm và tự động validate phản hồi Cloudinary CDN.
   */
  public async uploadImageData(
    productId: number | string,
    imagePayload: { name: string; mimeType: string; buffer: Buffer },
    tokenOverride?: string,
  ): Promise<UploadProductImageResponse> {
    const response = await this.uploadImage(
      productId,
      imagePayload,
      tokenOverride,
    );
    return this.parseResponse(response, uploadProductImageResponseSchema);
  }
}

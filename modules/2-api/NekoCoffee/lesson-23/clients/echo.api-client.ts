import { APIRequestContext, APIResponse } from "@playwright/test";
import { BaseApiClient } from "./base.api-client";
import { pingResponseSchema, PingResponse } from "../models";

/**
 * 🧪 ECHO & UTILITY API CLIENT: Phục vụ kiểm thử gói tin, form data và sức khỏe hệ thống
 */
export class EchoApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, authToken?: string) {
    super(request, authToken);
  }

  public async ping(): Promise<APIResponse> {
    return this.get("/public/test/ping");
  }
  //ping = pong
  //metric theo dõi xem server còn sống hay ko? -> ko thể call nghiệp vụ -> call thằng health để checkj server
  /**
   * ⚡ Smart Data Method: Gọi ping và tự động thẩm định hợp đồng qua Zod Schema
   * Tester chỉ việc gọi hàm, nhận về PingResponse có type an toàn mà không cần nhớ Schema!
   */
  public async pingData(): Promise<PingResponse> {
    const response = await this.ping();
    return this.parseResponse(response, pingResponseSchema);
  }

  public async echoJson(
    data: any,
    customHeaders?: Record<string, string>,
  ): Promise<APIResponse> {
    return this.post("/public/test/echo", { data, headers: customHeaders });
  }

  public async echoForm(multipart: Record<string, any>): Promise<APIResponse> {
    return this.post("/public/test/echo-form", { multipart });
  }

  public async echoUrlEncoded(form: Record<string, any>): Promise<APIResponse> {
    return this.post("/public/test/echo", { form });
  }

  public async echoOctetStream(
    buffer: Buffer,
    headers?: Record<string, string>,
  ): Promise<APIResponse> {
    return this.post("/public/test/echo", {
      headers: {
        "Content-Type": "application/octet-stream",
        ...headers,
      },
      data: buffer,
    });
  }
}

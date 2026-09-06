import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 21 - PHẦN 5: ĐIỀU HƯỚNG DỮ LIỆU — PARAMS & THUẬT TOÁN PAGINATION LOOP
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Kiến thức cốt lõi:
 * 1. Path Params (/public/products/{id}): Định danh tài nguyên cụ thể.
 * 2. Query Params (?type=bean&page=1): Lọc, tìm kiếm, phân trang và tự động URL Encode.
 * 3. Thuật toán Tuần Tự (Sequential While Loop): Quét an toàn khi không biết trước tổng số trang.
 * 4. Thuật toán Song Song 2 Pha (2-Phase Parallel Promise.all): Tối ưu tốc độ siêu tốc (Nhanh gấp 3-5 lần).
 * 5. Boundary Testing: Kiểm tra các trường hợp biên của Phân Trang (page vượt ngưỡng & page 0).
 */

test.describe("🛣️ [LESSON 21] 04 - Điều Hướng Dữ Liệu: Params & Vòng Lặp Phân Trang", () => {
  // 🟢 1. PATH PARAMETER
  test("01 - [PATH PARAMS] Tra cứu chi tiết sản phẩm theo ID", async ({ request }) => {
    // Bước 1: Lấy danh sách để lấy 1 ID hợp lệ trong DB
    const listRes = await request.get("/public/products");
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();
    const products = listBody.data;
    expect(products.length).toBeGreaterThan(0);

    const targetId = products[0].id;

    // Bước 2: Dùng Path Parameter để tra cứu trực tiếp sản phẩm ID đó
    const detailRes = await request.get(`/public/products/${targetId}`);
    expect(detailRes.status()).toBe(200);

    const detailBody = await detailRes.json();
    expect(detailBody.id).toBe(targetId);
    console.log(`Chi tiết sản phẩm ID [${targetId}]:`, detailBody.name);
  });

  // 🟡 2. QUERY PARAMETERS & TỰ ĐỘNG URL ENCODING
  test("02 - [QUERY PARAMS] Lọc sản phẩm theo loại và xác minh Metadata Phân Trang", async ({ request }) => {
    const response = await request.get("/public/products", {
      params: {
        type: "bean",
        page: 1,
        limit: 5,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    console.log(`Tìm thấy ${body.data.length} sản phẩm loại 'bean':`);
    expect(Array.isArray(body.data)).toBe(true);

    // Xác minh cấu trúc đối tượng Metadata Pagination của Neko Coffee
    expect(body.pagination).toBeDefined();
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(5);
    expect(body.pagination.total_items).toBeGreaterThan(0);
    expect(body.pagination.total_pages).toBeGreaterThan(0);
    expect(typeof body.pagination.has_next).toBe("boolean");
    console.log("Metadata Pagination:", body.pagination);
  });

  // 🐌 3. THUẬT TOÁN TUẦN TỰ (SEQUENTIAL WHILE LOOP)
  test("03 - [PAGINATION: SEQUENTIAL] Quét dữ liệu tuần tự từng trang bằng While Loop", async ({ request }) => {
    const startTime = Date.now();
    let currentPage = 1;
    const pageSize = 5;
    let hasMore = true;
    const allCollectedProducts: any[] = [];
    const MAX_PAGES_SAFETY = 4; // Quét 4 trang để đo benchmark

    while (hasMore && currentPage <= MAX_PAGES_SAFETY) {
      const response = await request.get("/public/products", {
        params: { page: currentPage, limit: pageSize },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      const items = body.data;
      const pagination = body.pagination;

      if (Array.isArray(items) && items.length > 0) {
        allCollectedProducts.push(...items);

        if (pagination && pagination.has_next === false) {
          hasMore = false;
        } else if (items.length < pageSize) {
          hasMore = false;
        } else {
          currentPage++;
        }
      } else {
        hasMore = false;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`🐌 [Sequential While] Thu thập ${allCollectedProducts.length} sản phẩm mất: ${duration}ms`);
    expect(allCollectedProducts.length).toBeGreaterThan(0);
  });

  // ⚡ 4. THUẬT TOÁN SONG SONG 2 PHA (2-PHASE PARALLEL PROMISE.ALL - SIÊU TỐC)
  test("04 - [PAGINATION: 2-PHASE PARALLEL] Tối ưu hóa tốc độ quét bằng Promise.all", async ({ request }) => {
    const startTime = Date.now();
    const pageSize = 5;
    const allCollectedProducts: any[] = [];

    // 🚀 PHA 1: Thăm dò Trang 1 để lấy Metadata (Biết được total_pages) & Dữ liệu Trang 1
    const page1Res = await request.get("/public/products", {
      params: { page: 1, limit: pageSize },
    });
    expect(page1Res.status()).toBe(200);
    const page1Body = await page1Res.json();
    allCollectedProducts.push(...(page1Body.data || []));

    const totalPagesInDb = page1Body.pagination?.total_pages || 1;
    const targetPagesToFetch = Math.min(totalPagesInDb, 4); // Lấy tối đa 4 trang để so sánh công bằng

    // 🚀 PHA 2: Bắn đồng thời song song các trang còn lại (Trang 2 -> targetPagesToFetch)
    if (targetPagesToFetch > 1) {
      const remainingPagePromises: Promise<any>[] = [];
      for (let page = 2; page <= targetPagesToFetch; page++) {
        remainingPagePromises.push(
          request.get("/public/products", { params: { page, limit: pageSize } })
        );
      }

      // Đợi tất cả các trang hoàn tất song song cùng 1 lượt
      const responses = await Promise.all(remainingPagePromises);
      for (const res of responses) {
        expect(res.status()).toBe(200);
        const body = await res.json();
        allCollectedProducts.push(...(body.data || []));
      }
    }

    const duration = Date.now() - startTime;
    console.log(`⚡ [2-Phase Parallel] Thu thập ${allCollectedProducts.length} sản phẩm mất: ${duration}ms`);
    expect(allCollectedProducts.length).toBe(targetPagesToFetch * pageSize);
  });

  // 🎯 5. BOUNDARY TESTING - KIỂM THỬ CÁC TRƯỜNG HỢP BIÊN CỦA PHÂN TRANG
  test("05 - [BOUNDARY TESTING] Kiểm thử các trường hợp biên (Trang vượt ngưỡng & Trang 0)", async ({ request }) => {
    // Kịch bản A: Truy vấn trang vượt quá tổng số trang (page = 99999)
    const overPageRes = await request.get("/public/products", {
      params: { page: 99999, limit: 10 },
    });
    expect(overPageRes.status(), "Phải trả về 200 OK, không được sập 500").toBe(200);
    const overBody = await overPageRes.json();
    expect(overBody.pagination.has_next).toBe(false);
    expect(overBody.pagination.has_prev).toBe(true);

    // Kịch bản B: Truy vấn trang 0 -> Server tự động chuẩn hóa về trang 1
    const zeroPageRes = await request.get("/public/products", {
      params: { page: 0, limit: 10 },
    });
    expect(zeroPageRes.status()).toBe(200);
    const zeroBody = await zeroPageRes.json();
    expect(zeroBody.pagination.page).toBe(1);
    console.log("Kiểm thử thành công các kịch bản biên của Phân Trang!");
  });
});

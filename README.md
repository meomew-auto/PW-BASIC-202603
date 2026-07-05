# 202603 - Playwright Basic

## Yêu cầu

- Node.js LTS
- Cài dependencies và browser:

```bash
npm install
npx playwright install
```

## Cấu trúc

```
modules/
  1-basics/
    01-locators/     # lesson 1 & 3 - cách tìm element, text methods, expect assertions
    02-actions/      # lesson 4 - mouse & keyboard actions
tests/               # test mẫu mặc định của Playwright
note.md              # ghi chú lý thuyết (CSS selector, XPath, accessibility...)
```

Mỗi file spec tương ứng một bài trên UI, đặt tên `NN.tên-bài.spec.ts`.

## Chạy test

```bash
npm test                          # chạy toàn bộ
npx playwright test --project=01-locators   # chạy riêng một module
npx playwright test 03.text-methods         # chạy theo tên file
npx playwright test --ui          # mở UI mode
npx playwright show-report        # xem report gần nhất
```

Test chạy ở chế độ `headless: false` (mở trình duyệt thật) — xem `playwright.config.ts`.

## Lint & type-check

ESLint được cấu hình để bắt lỗi **thiếu `await`** — lỗi phổ biến nhất khi học Playwright:

- `@typescript-eslint/no-floating-promises` — bắt `page.click()`, `page.goto()`... quên await.
- `playwright/missing-playwright-await` — bắt `expect(...)` quên await.

```bash
npm run lint        # kiểm tra
npm run lint:fix    # tự sửa những chỗ fix được
npm run typecheck   # kiểm tra kiểu TypeScript
```

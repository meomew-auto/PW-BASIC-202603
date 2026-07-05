import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      "playwright-report/",
      "test-results/",
      "blob-report/",
    ],
  },
  {
    files: ["**/*.ts"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      playwright,
    },
    rules: {
      // Bắt Promise bị bỏ quên (thiếu await): page.click(), page.goto()...
      "@typescript-eslint/no-floating-promises": "warn",
      // Bắt expect(...) của Playwright thiếu await.
      "playwright/missing-playwright-await": "warn",
      // Nới lỏng vài rule gắt cho code học tập.
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },
);

import path from "path";
import fs from "fs";
import crypto from "crypto";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🛠️ ENTERPRISE TEST ASSET & FILE HELPER (CHUẨN ĐA NỀN TẢNG CHO API & UI)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cung cấp 6 nhóm năng lực toàn diện trong Kiểm thử Tự động:
 * 1. 📂 File Resolver & Path Normalizer: Chuẩn hóa đường dẫn tuyệt đối đa hệ điều hành.
 * 2. 📦 API Multipart & Payload Packaging: Đóng gói Buffer + MIME Type cho request.
 * 3. 📄 Test Data Reader: Đọc Type-safe JSON, Text, CSV cho Data-driven testing.
 * 4. 📥 UI Download Manager: Lưu trữ, kiểm tra dung lượng & dọn dẹp file tải về.
 * 5. ⚡ Dynamic Dummy File Generator: Tạo nhanh file kích thước lớn (Test lỗi 413 Payload Too Large).
 * 6. 🔐 File Integrity & Checksum: Tính toán mã băm SHA-256 / MD5 xác minh tính toàn vẹn.
 */

export class FileResolverHelper {
  private static defaultDataDir = path.resolve(__dirname, "../data");
  private static tempDir = path.resolve(process.cwd(), "test-results/temp-assets");

  private static mimeTypeMap: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".txt": "text/plain",
    ".pdf": "application/pdf",
    ".json": "application/json",
    ".csv": "text/csv",
    ".xml": "application/xml",
    ".zip": "application/zip",
    ".bin": "application/octet-stream",
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 📂 NHÓM 1: ĐƯỜNG DẪN & MIME TYPE (CROSS-PLATFORM RESOLVER)
  // ══════════════════════════════════════════════════════════════════════════

  public static getAssetPath(fileName: string, customDir?: string): string {
    const baseDir = customDir ? path.resolve(process.cwd(), customDir) : this.defaultDataDir;
    const resolvedPath = path.join(baseDir, fileName);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `❌ [FileResolverHelper] Không tìm thấy tệp: "${fileName}"\n` +
        `📍 Đường dẫn đã kiểm tra: ${resolvedPath}`
      );
    }

    return path.normalize(resolvedPath);
  }

  public static getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    return this.mimeTypeMap[ext] || "application/octet-stream";
  }

  public static getAssetBuffer(fileName: string, customDir?: string): Buffer {
    const filePath = this.getAssetPath(fileName, customDir);
    return fs.readFileSync(filePath);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📦 NHÓM 2: ĐÓNG GÓI PAYLOAD MULTIPART CHO API
  // ══════════════════════════════════════════════════════════════════════════

  public static getMultipartPayload(
    fileName: string,
    options?: { customName?: string; customMimeType?: string; customDir?: string }
  ) {
    const buffer = this.getAssetBuffer(fileName, options?.customDir);
    const mimeType = options?.customMimeType || this.getMimeType(fileName);
    const name = options?.customName || fileName;

    return { name, mimeType, buffer };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 📄 NHÓM 3: ĐỌC DỮ LIỆU TEST DATA TYPE-SAFE (JSON / TEXT / BASE64)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Đọc tệp JSON và parse thành kiểu đối tượng TypeScript mong muốn
   */
  public static readJson<T = any>(fileName: string, customDir?: string): T {
    const content = fs.readFileSync(this.getAssetPath(fileName, customDir), "utf8");
    return JSON.parse(content) as T;
  }

  /**
   * Đọc tệp văn bản thuần (Text / HTML / XML / CSV)
   */
  public static readText(fileName: string, customDir?: string): string {
    return fs.readFileSync(this.getAssetPath(fileName, customDir), "utf8");
  }

  /**
   * Mã hóa tệp sang chuỗi Base64 (có tùy chọn kèm Data URI prefix)
   */
  public static getAssetAsBase64(fileName: string, includeDataUriPrefix = false): string {
    const buffer = this.getAssetBuffer(fileName);
    const base64 = buffer.toString("base64");
    if (includeDataUriPrefix) {
      const mime = this.getMimeType(fileName);
      return `data:${mime};base64,${base64}`;
    }
    return base64;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ⚡ NHÓM 4: TẠO DỮ LIỆU FILE GIẢ LẬP ĐỘNG (DYNAMIC DUMMY GENERATOR)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Tạo nhanh tệp tin nhị phân có dung lượng tùy ý (Ví dụ 3MB để test mã lỗi 413 Payload Too Large)
   */
  public static createDummyFile(fileName: string, sizeInBytes: number): string {
    this.ensureTempDir();
    const targetPath = path.join(this.tempDir, fileName);
    const buffer = Buffer.alloc(sizeInBytes, "A"); // Điền chuỗi byte 'A'
    fs.writeFileSync(targetPath, buffer);
    return path.normalize(targetPath);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🔐 NHÓM 5: TÍNH TOÁN CHECKSUM XÁC MINH TOÀN VẸN FILE
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Tính mã băm SHA-256 hoặc MD5 của tệp tin để so sánh file trước và sau khi upload/download
   */
  public static getFileChecksum(fileName: string, algorithm: "sha256" | "md5" = "sha256"): string {
    const buffer = this.getAssetBuffer(fileName);
    return crypto.createHash(algorithm).update(buffer).digest("hex");
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🧹 NHÓM 6: QUẢN LÝ THƯ MỤC TẠM & DỌN DẸP SAU TEST (CLEANUP)
  // ══════════════════════════════════════════════════════════════════════════

  public static ensureTempDir(): string {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    return this.tempDir;
  }

  public static cleanTempDir(): void {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }
}

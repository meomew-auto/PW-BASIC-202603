# ==============================================================================
# 📊 ALLURE HISTORY AUTOMATION SCRIPT (Windows PowerShell)
# ==============================================================================
# Script này tự động lưu chuyển thư mục history/ để bảo tồn biểu đồ xu hướng (Trends)
# ==============================================================================

param (
    [string]$ResultsDir = "allure-results",
    [string]$ReportDir  = "allure-report"
)

Write-Host "=== TIẾN TRÌNH KHỞI TẠO ALLURE REPORT KÈM LỊCH SỬ ===" -ForegroundColor Cyan

# 1. BẢO TỒN DỮ LIỆU HISTORY TỪ LẦN CHẠY TRƯỚC
if (Test-Path "$ReportDir\history") {
    Write-Host "[1/3] 🔄 Đang sao chép dữ liệu History cũ sang kết quả mới..." -ForegroundColor Yellow
    if (-not (Test-Path $ResultsDir)) {
        New-Item -ItemType Directory -Path $ResultsDir | Out-Null
    }
    if (Test-Path "$ResultsDir\history") {
        Remove-Item -Recurse -Force "$ResultsDir\history"
    }
    Copy-Item -Recurse "$ReportDir\history" "$ResultsDir\history"
    Write-Host "      ✅ Hoàn tất sao chép thư mục history!" -ForegroundColor Green
} else {
    Write-Host "[1/3] ℹ️ Chưa có lịch sử trước đó (Lần chạy đầu tiên)." -ForegroundColor Gray
}

# 2. SINH BÁO CÁO ALLURE MỚI TỪ DỮ LIỆU JSON
Write-Host "[2/3] 🛠️ Đang tổng hợp Allure HTML Report..." -ForegroundColor Cyan
npx allure generate $ResultsDir -o $ReportDir --clean

# 3. MỞ BÁO CÁO TRÊN TRÌNH DUYỆT
if ($LASTEXITCODE -eq 0) {
    Write-Host "[3/3] 🚀 Báo cáo đã sẵn sàng! Mở trình duyệt..." -ForegroundColor Green
    npx allure open $ReportDir
} else {
    Write-Host "❌ Thất bại khi sinh báo cáo Allure!" -ForegroundColor Red
    exit 1
}

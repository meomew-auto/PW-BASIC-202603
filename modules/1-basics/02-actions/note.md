Biến môi trường thường có dạng
key=value
url=anhtester.com
macos/ubuntu/linux
NODE_ENV=staging npx playwright test

thằng pw sẽ truy cập đc biến môi trường
thông qua process.env.NODE_ENV => staging

$env:NODE_ENV="staging"; npx playwright test
process.env.NODE_ENV => staging

cross-env NODE_ENV=staging CRM_DEMO_TAG=automation-pro npx playwright test modules/1-basics/03-pom/CRM/specs/cross-env-demo.spec.ts --project=03-pom-crm

shorcut -> chuyển nó thành câu lệnh ngắn hơn

"test:cross-env-demo": "cross-env NODE_ENV=staging CRM_DEMO_TAG=automation-pro npx playwright test modules/1-basics/03-pom/CRM/specs/cross-env-demo.spec.ts --project=03-pom-crm",

npm run tên key trong script

npm run test:cross-env-demo

thư viện thứ 2 là dotenv-flow
quản lý biến môi trường bằng file -> có sự phân cấp giữa các file
và dễ dàng linh hoạt khi thay đổi môi trường
=>

nó sẽ quản lý cấpp độ môi trường qua profile
test
uat
cú pháp là
.env.{profile}.tên của file env

Tầng 1
.env.development.local
(.env.uat.local)
env._.local chặn tất cả các file
có dạng format là env._.local

Tầng 2
.env.developmment
(.env.uat)

Tầng 3.
.env

Tầng2
CRM_BASE_URL=Tang2\_https://crm.anhtester.com

Tầng 3
CRM_BASE_URL=Tang3\_https://crm.anhtester.com

dạng SHELL/CI (set trực tiếp trên file .yml CI/CD hoặc set trực tiếp trên câu lệnh chạy test)
NODE_ENV -> quản lý profile
NODE_ENV=development
NODE_ENV = staging

nếu quên thì sao??? thì thằng dotenv flow sẽ lấy mặc định là thằng nao???
https://crm.anhtester.com/admin/authentication

base url + endpoint -> https://crm-uat.anhtester.com
tên domain

endpoint (route) /admin/authentication

page.goto('/admin/authentication')

    "env:dev": "cross-env NODE_ENV=development npx playwright test modules/1-basics/03-pom/CRM/specs/env-demo.spec.ts --project=03-pom-crm",

NODE_ENV=development

env (Cấp 4 - Mặc định chung):
CRM_BASE_URL=https://crm.anhtester.com
CRM_ENV_NAME=default
CRM_TIMEOUT_MS=10000

% .env.development (Cấp 3 - Dev):
% CRM_BASE_URL=https://crm.anhtester.com
% CRM_ENV_NAME=development
% CRM_TIMEOUT_MS=10000

.env.development.local (Cấp 2 - Bảo Mật Máy Cá Nhân - Gitignored):
CRM_ADMIN_EMAIL=admin@example.com
CRM_ADMIN_PASSWORD=123456
process.env.
sẽ ko đọc đc là file của ta có những key nào

npx playwright test [đường-dẫn-file-spec]

--config=[file-config] --project=[tên-project]

làm sao để PW phân vùng và chọn đúng đc bài test cần chạy

quy trình sàng lọc các lớp từ file config -> thực thi
giá trị mà tga cần quan tâm
testDir
testMatch

Từ file config.ts
testDir
testMatch

Bước 1: Scoping Dựng hàng rào -> khóa phạm vi trong thư mục đc ghi ở testDir (bỏ qa tất cả thư mục khác - -> xác định đc phạm vi sẽ quét những file chạy tgesst)

testDir: "../modules/1-basics/03-pom/CRM/lesson-17/specs",
testDir: "./modules/1-basics/02-actions",
.. -> chạy ra root

Bước 2: Matching (lập danh sách các file)
testMatch: là sẽ khớp xem sử dụng các file có format như nào

Bước 3. filtering (lọc theo CLI)

npx playwrigh test login
(so khớp contain path.includes('login')
\*\* -> cú pháp glob -> cú pháp để tìm kiếm file theo mẫu trong hệ sinh thái nodejs

\*.spec.ts -> chỉ tìm file ở cấp thư mục hiện tại (ko đệ quy) -> ở trong thư mục specs/ khớp toàn bộ tên.spec.ts \_ -> tên
khớp toàn bộ file .spec.ts ở thư mục /specs
\*.spec.ts -> ko tìm được ở thư mục specs/auth/auth.spec.ts

**/\*.spec.ts => tìm ở mọi thư mục con, ko giới hạn ddooj sâu
-> specs/auth/auth.spec.ts
specs/3 file
** -> được hiểu là bất kì thư mục nào, sâu bao nhiêu cũng đc

- bất kfi tên file nào

auth/\*.spec.ts -> tôi chỉ quét ở trong thư mục auth (thjuoocj specs)

auth/**/\*.spec.ts
['**/\*.spec.ts', '!**/auth/**']
! -> loại trừ
["**/config-matrix.spec.ts", "**/under-the-hood.spec.ts"],

npx playwright test modules/1-basics/03-pom/CRM/lesson-17/specs/config-matrix.spec.ts --config=configs/playwright.debug.config.ts --project=chrome-visual-debug -g "01 -"

cơ chế project dependencies
Setup
chạy
teardown

project dependencies ->
'on-first-retry: run lần đầu tiên fail -> ko quay. retry lần đầu tiên thì quay

'retain-on-first-failure' - > laafn đầu tiên chạy fail -> quay -> retry thì k qay

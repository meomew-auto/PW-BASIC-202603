có nhiều flow xây dựng AI agent liên quan đến testing
//chia các model theo vùng
model tàu

- GLM(5.2) (z), qwen(3.8), deepseek(v4), kimi K3(moonshot), minimax(3.0), (đều public trọng số-> tự host các model này ở local để chạy )
  mua trực tiếp từ nhà phát hành ()

  model mỹ

- GPT(5.6 sol, terra, luna), claude (fable, opus 5.0), groK(xAi - 4.5), gemini (tạo ảnh, video) (ko public trọng số bát phải mua )

upstream(đảm bảo cho mình truy cập ko bị nghẽn, tốc độ nhanh)

mỗi nền tảng nó sẽ có 1 rule là ta có chấp nhận để chia sẻ thông tin dự án để nó thu thập train data hay ko -> có thể based gói sử dụng(doanh nghiệp -> sẽ có rule về bảo mậ thôtng tin)

(để sử dụng ta sẽ phải tiêu tốn token ,in/out/cache )

5$/30$
0.0028/0.25$

cách sử dụng khôn ngoan
bao giờ làm việc với coding agent AI
ta sẽ có nhiều multi agent (nhiều model)
ta sẽ có 1 model lên plan, review: model xịn từ mỹ (claude, gpt)
model search, excution: model tàu
-> tiết kiệm chi phí rất nhiều

nghi ngờ bảo mật
ta có thể tự host model -> local -> để chạy nếu mà thực sự quan tâm tới dữ liệu các thứ thì có thể sử dụng hướng này > nhưng bài toán vạn hành và chi phí lớn

- giá cả
- chất lượng
  => cùng 1 task đầu vào input -> trải qua nhiều step -> thì các model tàu ko thua klesm nhiều so với model top -> mà giá cả rẻ hơn rất nhiều

.Để sử dụng model thì sẽ có rất nhiều cách
+IDE + extension : gpt, claude, model tàu -> sử dụng extension
claude thì có claude extension , gpt -> codex, model tàu thì họ sẽ cài 1 extension thứ 3 -> và kết nối qua endpoint + api key, github copilot

(bản chất mình chat với AI -> chẳng qua là cũng gọi qua API mà thôi
)
oauth -> đăng nhập qua tài khoản -> tự ghi nhớ thông tin -> lần sau calal api -> sẽ có authen, author

- sử dụng app trực tiếp của model: gpt thì codex app -> , claude có claude desktop app,
- sử dụng ide chuyên dụng (cursor, kiro, )bản chất nó tích hợp sẵn các model để mình sử dụng nghĩa là bên ide dứng trung gian
  mình trả tiền để sử dụng những model mà ide cung cấp
  mình trả tiền cho cursor (20$) -> mình toàn quyền sử dụng nhiều loại model khác nhau dựa trên ide cung cấp (nhưng có ggiớihanj quota)
- CLI (sử dụng qua thư viện và chạy trên terminal) -> mình sẽ dùng qua giao diện terminal ko nhìn thấy các file -> mình chủ yếu base trên kết quả của model agent
  1 dựa án mình có thể mở nhiều terminal -> để có thể sử dụng nhiều model -> giao tiếp rồi phản biện -> nâng cao kêt quả dầu ra

  -> khi mở 1 session -> nó sẽ index project của mình

- web (thường cho dân viết lách, rồi hỏi dấp nhanh- ko đọc đc code của mình)
  copy code lên web -> chờ trl -> copy lại

cách xây dựng AI agent phục vụ testing
rất nhiều ý tưởng để sử dụng AI trong testing

- sử dụng AI để automated script cho dự án auto
- gen testcase dự trên tài liệu
- phân tích log dự án (đưa ra insight , dự đoán)
- AI để scan security (dự án) mình quả lý source code qua gitlab (cty )-> có quyu trình scan code (sonar) *dùng thư viện bị hack(sử dụng các thư viện liên quan đến npm cài mã độc -> lây lan), đảm bảo là ta ko rò rỉ thông tin hay bảo mật *rò rỉ env, key aws.....

vấn đề là gì???
ý tưởng rời rạc -> chưa có full flow hoàn chỉnh
nghĩa là khi xây dựng AI > chjusng ta phải 1 flow hoàn chỉnh
kết nối rất nhiều bước tron testing ->để có đc đầu ra thích hợp
o
ví dụ mình có flow như thế này mà AI có thể apply được

- ta sẽ quản lý test case: jira
- quản lý tài liệu qua: conflutent, (jira), hoặc là file excel, google sheet.....
- quản lý resource(hệ thống): gitlab, grafana(quản lý metric tài nguyên), splunk (quản lý log), rancher(rks) ....
- kênh thông tin truyền đạt: ví dụ như mail(team,), slack(), zalo, ...
- kênh report kết quả kpi: sẽ qua jira, báo cáo docs

-> đẻ ra cái gọi là mcp server (thằng ai bản thân nó ko biết các hệ thống như thế nào, )
-> lúc đấy thằng ai nó sẽ hỏi ngc lại là cách vào như nào, rồi thông tin các thứ như nào.... có nghĩa là nó mù tịt (và chưa có thông tinc só ưanx)
(data train sẽ cso thời gian cut off , hiện tượng ảo giác , lú, tìm kiếm loạn -> ko ra kết qả -> trl bừa -> càng tôtns tiền)
mcp server (giống như 1 menu -> cung câp các câu lệnh đẻ tương tac với bên thứ 3)
: ví dụ jira mcp (họ sẽ cung cấp các method CURD ticket,) -> ai agent gọi trực tiếp mà cần đi tìm (API)
thì chung ta sẽ phải có 1 flow hoàn chỉnh để xâ dựng ai agent
bất dầu 1 sprint
Gate 1 (kĩ thuật RAG )

- thằng cu AI sẽ đọc hết ticket + tài liệu
- nó sẽ đánh giá với sprint này thì tài liệu đủ hay chưa, thiếu gfi không -> mention lại BA, PO để update
  Gate 1 Ok ->
  Gate2 :
  sinh test case -> (đầu vào tài liệu và yêu cầu ) -> notice approve -> ok thì update lên jira, excel, google sheet... -> tưk độngk update lại test case nếu ticket có sự thay đổi hay verision tài liệu tahy đổi
  bắt đầu viết test script -> approve-> chạy tự động (đọc log) -> update kết quả + report -> lên jira +> đánh dấu lại test case manual ->
  (combo kết hợp auto k6 perfomance testing - sử dụng mcp để test perfomance )
  Gate3: trả kết quả
  -> bắn tự dộng qua các kênh
  -> review (chưa ok thì chạy lại )
  Gate 4
  qua n các vòng lặp và làm việc: nó sẽ tự thống kê được kết quả và phân ích -> update kpi

có 2 cách trả tiền
1 là mua gói (dùng hết là nhịn)
2 pay as you go
context windows thường là 250-300k token là đẹp
đến giới hạn context windows -> compact (sẽ giải phóng context bộ nhớ, memory thông tin cần thiết)

qản lý qa file settings -> mình có thể tùy chỉnh model, endpoint, apikey

hiện tại là nếu như có nhiều bài test -> cần login đầu tiên

context login tạm

- cookie jar
- context.storageState() => snapshot => mang sử dụng vào context khác
  -> 2 cách ghi snapshot -> 1 dạng file (project dependencies)
  => lưu trên RAM thông qua worker fixture

  trong playwright 1 bài test() block -> sẽ tạohr a 1 context hoàn toàn mới

Test A: browser,newContext({storageState: ''})

Test B: browser,newContext({storageState: ''})

worker là gì: 1 tiến trình chạy test -> 1 worker sẽ đại diệncho 1 browser instawnce mới;
khi 1 worker fixture đc chạy -> nó sẽ lưu thông tin trên RAM -> và cung cấp hết cho các bài test
cùng thuộc 1 worker -> thì khi đó nó sẽ chia sẻ chung file thong tin lưu trên ram
chỉ cần 1 bài test gọi tới fixture có scope là worker (hoặc fixture có dependencies phụ thuộc vào fixture worker scope )

để kihcs hoạt worker state fixture có nhiều cách
1 là gọi trực tiếp
2 là thông qua fixture chianing

worker fixture có 1 cơ chế gọi là lazy activation

Running 3 tests using 1 worker
[03-pom-crm] › modules\1-basics\03-pom\CRM\specs\scope-basic.spec.ts:345:1 › 00 - không phụ thuộc nên chưa kích hoạt workerState
[test không phụ thuộc] browser=chromium; workerState chưa được kích hoạt
[03-pom-crm] › modules\1-basics\03-pom\CRM\specs\scope-basic.spec.ts:356:1 › 01 - test đầu tiên tạo worker state
[worker setup] tạo worker-0
[test setup] tạo test-state-1 từ worker-0 cho "01 - test đầu tiên tạo worker state"
[test teardown] bỏ test-state-1
[03-pom-crm] › modules\1-basics\03-pom\CRM\specs\scope-basic.spec.ts:373:1 › 02 - không xin trực tiếp workerState vẫn dùng được
[test setup] tạo test-state-2 từ worker-0 cho "02 - không xin trực tiếp workerState vẫn dùng được"
[test 02] chỉ nhận testState nhưng testState được tạo từ worker-0
[test teardown] bỏ test-state-2
[worker teardown] đóng worker-0; đã phục vụ 2 test
3 passed (323ms)
ngoaif login sẽ phục vụ tât cả các yêu cầu về teiefn điều kiện
tạo data test
kết nối db
clear connect db
kết nối kafka

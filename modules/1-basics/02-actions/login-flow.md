- LOGIN - đăng nhập - cái danh tính đc lưu như thế nào
- Browser -> gửi username/password lên server
- Server sẽ keierm tra thông tin đó với user/account ở phía server -> nếu đúng -> server xác nhận request này là user A
- bước này sẽ có 2 trường hợp

* server sẽ tạo hoặc cấp 1 bằng chứng phiên đăng nhập -> gọi là session_id
* hoặc tạo 1 access token
  -> rồi trả về browser

- browser sẽ cât bằng chứng vào

* cookie: browser tự động làm
* storage: (access token) -> dev FE làm

- những request sau sẽ tự gửi lại bằng chứng này -> nên ko phải gửi password mỗ lần
- server đọc bằng chứng ở mỗi reqeust -> tra cứu hoặc verify nó -> rồi mới qd user đc xem và làm gì

server sẽ biế user là ai...
browser sẽ giữ tấm vé (ở client)
-> server side sessionL server giữ phiên , browser giữ session id
-> cookie
jwt -. bearer ...token

playwright sẽ có cơ chế là storageState -> lưu được danh tính đã đăng nhập thành công
chụp lại được phần cookie và token từ phía client để sử dụng cho các reqest tiêp stheo

cây phân cấp 3 tầng
Browser -> context -> page

Browser (1 browser instnace -> 1 cây process chromium thật )
-> context (1 hồ sơ ẩn danh nằm trong browser -> ko có process riêng)
-> page: (1 TAB - đếm đc bằng context .pages())

Browser - sinh ra khi goij chromium.launch()
PID mới sau launch: [ 51512, 51784, 65144 ]
browser.isConnected(): true
browser.isConnected() sau close: false
PID mới còn sống sau close: []
khi chạy 1 bài test của PW -> dưới core sẽ chạy code để tạo browser -> PID browser process tree
1 process to sẽ bao gồm cá helper như là renderer/utility/GPU

context - > THẾ GIỚI RIÊNG NẰM TRONG Tiến trình browser(chỉ ăn ram)
mỗi context sinh ra KO SINH PROCESS MỚI -> CONTEXT chỉ là 1 hồ sơ ẩn danh trong bộ nhớ của tiến tình browser.
[context] PID mới do launch: 3
[context] PID mới sau khi thêm 2 context: 3
[context] context tạo thêm PID: false
ctxB thấy role của ctxA: null
ctxA thấy cookie probe: true
ctxB thấy cookie probe: false
context rẻ vì ko tốn process, chỉ tốn ram và storage partion trong browser.
và quan trọng nhất cookie jar và localstroage vẫn tách biệt theo context
Page mở thêm trong cùng context chia sẻ cùng 1 cookie hoặc danh tính

const page = await context.newPage()

await context.newpage()

Page và POM state sốgn ở đâu
POM nhận page qua constructor -> paste cùng page qua nhiều POM (hay nhiều POM cùng dùng) thì trạng thái nhưthees nào????? cs phải vì page đã login nên POM khác nhận đúng state
ĐÚNG
page là 1 object duy nhất truyền ko nhân bản
new CRMDashboardPage(page) chỉ giữ tham chiếu cùng đến 1 page object . ko có bản copy page -> 2 POM cùng nhìn đúng qua 1 cửa sổ \*(hjay 1 page)

state KO NẰM TRONG POM- nằm trong context . đã login = cookies hay access token nằm trong conext -> POM chỉ là điều khiển từ xa (ra lệnhc ho page) -> nó ko giữu sesiosn
.. nên bất kì POM nào nhận page đều thấy đúng trạng thái của page đó

object ở trong JS/TS thì copy là copy tham chiếu : 2 biến cùng tỏ cùng 1 object

const a = {ten: "abc"}

//b ko phải là bản sao - b chỉ trỏ đúng objectg của a
const b = a

b.ten = 123
clg(a.ten) = 123

VẤN ĐỀ ĐA TÀI KHOẢN - vfi sao 1 context ko đủ
mục đích 1 test phải giữ 2 danh tính cùng 1 thời điểm
nếu login user -> logut -> login thì test chi cso 1 dánh tính tại 1 thời điểm -> đó là đổi vai tuần tự. ko phải mô phỏng 2 người đang dùng tỏng hệ thống
thêm page ko tạo thêm tài khoản
SAI LẦM -> mở 2 tab trong cùng 1 context -> rồi gọi 1 tab là user
1 tab là admin -> là sai

MẪU CHUẨN -> 2 context -> 2page -> 2 vòng độc lập

bài toán thực chiến; ADMIN chat với guest trên 1 cùng test
admin phải đăng nhpaja guest truy cập công khai bằng context riêng, nhận tin và trả lời -> admin reload để kiểm tra phản hồi

harness agent

https://crm.anhtester.com/contract/412/4b8d2d2a13e968325029c89ed0a10f8e

FLow: create testcase + phân tích question -> cho BA/PO
ISTQB
context và ngữ cảnh , tài liệu -> phân chia tài liệu hay việc độc tài lliệunhuw ào cho hiệu quả và tích kiệm -> liên quan đén việc quản lý prompt + context và câu hỏi
1k tài liệu -> break thành chunk (từng mảnh) -> khi mà hỏi AI -> cho tôi rule về phần payment liên quan đến rút tiền online
-> đánh giá và xếp hạn câu hỏi -> payment -> trả ra 100 kết quả tài liệu liên quan -> filter thêm trả ra kq

snapshot (chụp lại state đăng nhập)
storageSate() -> đc giọ từ context()
mang cái phần đã chụp -> context B -> nạp phần đã đăng nhập -> và hành vi là có dnah tính

tạo mới mỗi lần mà ko có state
bên em thì khi tạo new acc ở SSO -> lúc nhập password bắt nhập captcha trước --> xong captcha, nhập password rồi submit --> email gửi về gmail -> link verify thì nên xử lý như thế nào ạ?
bypass qua 1 số trick khoai hơn
là sử dụng 1 số browser có thể khả năng bypass auto detect + proxy

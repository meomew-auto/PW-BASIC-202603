Giới hạn phương pháp cũ

- các bài test vẫn phải tự gọi việc khởi tạo mới 1 page object
  và phải truyèn thằng page vào. nếu quên thì test sẽ fail vì ko có page để chạy
  với fixture sẽ giải quyết bằng cách: Plyawright tự chọn đúng những cái test cần
  trest chỉ cần khai báo ({})
- ko có teardown: phương pháp cũ ko có cách nào hay gom nhóm để xử lý sau khi chạy test xong. ->  
  fixture luôn có cấu trúc setup -> chạy -> teardown
  ví dụ khi đi ăn nhà hàng
  ví dú với fxiture tôi cần ăn bnahs mì trứng

- ko dùng chung được cho nhiều worker/test. muốn login 1 lần, dùng chung 10 spec
  global (before all -> )

bản chât thằng fixture là dependency injection - đối tượng ko tự đi tìm cái nso cần
-> nó khai báo nhu cầu và nhận đồ do bên ngoài bơm vào.

    //mỗi spec lại lăoj lại kiến trúc nfay

const loginPage = new CRMLoginPage(page)

với fixture (DI) test chi khai nhu cầu, runner bơm vào

test('bca', async({crm}))=>{
await crm.dashboardpage...
}

//Vòng đời DI trong playwright -> từ CLI đến test

b1.npx playwright test -> cli đọc config, tìm spec files , chia worker

b2. runner khởi động từng worker (mỗi worker 1 tiến trình)
-> phân tích từng test ()=> đock danh sách fixture test XIN

b3. RESOLVE fixture-> trước khi chạy test -> test xin loiChao -> chạy setup (chạy code trước await use) -> await use -> bơm giá trị (value) vào tham số tương ứng trong test()

b4.test body chạy () -> chạu xogn hoăc FAIL > TEARDOWNm đc chạy

Pattern GateKeeper - 3 tầng tự động đặng nhậph
Ý tưởng : tách thành 3 tầng:

- Tầng 1 Trang login (ai cũng vào đc)
- tầng 2: cổng an ninh (authedPage) (đã login)
- tàng 3: Các trang nghiệp vụ (bất buộc đi qua cổng an ninh)
  -> fixture ngieepj vuj ko xin page trống mà xin authed Page -> playwright tự kéo cả chuỗi loin gkhi can ftest
  => cho tôi giao diện đăng nhập -> tầng 1 trả lời (các bài test quên mk, nhập sai)
  -> cho tôi phiên đã đăgn nhập -> authedpage (tầng2) => mọi tes cần vào hehe thống
  -> cho tôi trang X khi đa có phiên -< > trang nghiệp vụ \*tầng 3 -> dashboard page, new customer page
  //ưu điểm
  test ko cần biết login đã tồn tại -> xim customerpage -> là phiên đã có sẵnl ko before each, ko login thủ công
  // 1 điẻm chặn duy nhất (đổi login Ui-> aoi, đổi user) -> sửa đúng authedpage
  lazy; ko cần đăng nhập thì bị kéo vào login
  lỗi rõ tầng: login fial hiện ở tầng 2l ko lẫn vào test

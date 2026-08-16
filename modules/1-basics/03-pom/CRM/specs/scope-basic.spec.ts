import { expect, test as base } from "@playwright/test";

/*
 * ============================================================================
 * MỤC TIÊU CỦA FILE & TÁC DỤNG LỚN NHẤT CỦA WORKER FIXTURE
 * ============================================================================
 *
 * 1. TÁC DỤNG LỚN NHẤT CỦA WORKER FIXTURE (KHI CHƯA DÙNG PROJECT DEPENDENCIES):
 *
 * - Nếu chỉ dùng TEST FIXTURE thông thường: Mỗi bài test đều phải lặp lại các tác vụ
 *   khởi tạo nặng từ đầu (ví dụ: mở form Login UI, điền tài khoản, chờ redirect).
 *   -> 10 bài test chat 3 vai sẽ phải login 30 lần (~90 giây lãng phí).
 *
 * - Khi dùng WORKER FIXTURE: Test đầu tiên chạy trên worker sẽ thực hiện tác vụ nặng
 *   (Login UI) đúng 1 LẦN DUY NHẤT và lưu snapshot trong RAM. Các test kế tiếp (Test 2, 3,...)
 *   trên cùng worker đó lấy snapshot từ RAM ra dùng ngay lập tức (0ms).
 *
 * - Ưu thế vượt trội so với Project Dependencies:
 *   + 100% In-Memory (RAM): Không cần cấu hình `setup project` trong `playwright.config.ts`.
 *   + Không sinh file rác: Không cần tạo thư mục `.auth/*.json` trên ổ đĩa.
 *   + Bảo mật: Tự hủy sạch khi worker kết thúc, không sợ commit nhầm cookie/token lên Git.
 *   + Cô lập an toàn: Snapshot trong RAM là read-only template, mỗi test vẫn tạo
 *     BrowserContext độc lập riêng.
 *
 * 2. MINH HỌA VÒNG ĐỜI TRONG FILE NÀY:
 * Ví dụ này không mở website và không login thật. Ta dùng hai object đơn giản để
 * nhìn rõ vòng đời fixture:
 * - `workerState`: tạo MỘT LẦN cho worker, nhiều test trong worker dùng chung object.
 * - `testState`: tạo MỚI cho TỪNG TEST, test sau không nhận object của test trước.
 *
 * File cố ý chạy ba test theo serial trong cùng một worker:
 * - test 00: không phụ thuộc workerState nên chưa kích hoạt worker fixture (Lazy).
 * - test 01: xin testState -> kích hoạt workerState lần đầu tiên.
 * - test 02: xin testState -> TÁI SỬ DỤNG workerState đã có từ test 01 (không tạo lại).
 * ============================================================================
 */

type WorkerState = {
  // Mã nhận diện worker đã tạo object này.
  id: string;

  // Browser engine thuộc project hiện tại, ví dụ "chromium".
  browserName: string;

  // Mảng này chỉ dùng để minh họa rằng cùng một object sống qua nhiều test.
  // Trong code auth thật, nên coi storageState worker-scoped là dữ liệu chỉ đọc.
  visitedTests: string[];
  sharedNotes: string[];
};

type TestState = {
  // Mỗi lần test fixture setup, id này sẽ khác.
  id: string;

  // Cho biết testState hiện tại được tạo từ workerState nào.
  workerStateId: string;

  // Số thứ tự test đã dùng workerState này.
  usageNumber: number;

  // Dữ liệu cục bộ: test sau phải nhận một mảng mới và không thấy dữ liệu test trước.
  localNotes: string[];
};

// Generic thứ nhất là các fixture mặc định ở TEST scope.
type TestFixtures = {
  testState: TestState;
};

// Generic thứ hai là các fixture được phép khai báo ở WORKER scope.
type WorkerFixtures = {
  workerState: WorkerState;
};

/*
 * CÚ PHÁP TYPE CỦA extend
 *
 *   base.extend<TestFixtures, WorkerFixtures>({ ... })
 *               ^             ^
 *               |             +-- fixture sống theo worker
 *               +---------------- fixture sống theo từng test
 *
 * Nếu chỉ viết `base.extend<TestFixtures>()`, ta chỉ khai báo fixture test-scoped.
 * Muốn dùng `{ scope: "worker" }`, tên fixture phải nằm trong generic thứ hai.
 */

/*
 * BA THAM SỐ CỦA MỘT FIXTURE FACTORY
 *
 * Cả test-scoped fixture và worker-scoped fixture đều có tối đa ba tham số:
 *
 *   test-scoped:
 *   async (dependencies, use, testInfo) => { ... }
 *
 *   worker-scoped:
 *   async (dependencies, use, workerInfo) => { ... }
 *
 * 1. `dependencies`
 *
 * Đây là object chứa các fixture khác mà fixture hiện tại cần. Ta destructure để lấy
 * đúng dependency muốn dùng:
 *
 *   async ({ browserName }, ...) => { ... }
 *   async ({ workerState }, ...) => { ... }
 *
 * - `{}` nghĩa là fixture không phụ thuộc fixture nào khác.
 * - `{ browserName }` xin option fixture có sẵn của Playwright. Giá trị nhận được là
 *   `"chromium"`, `"firefox"` hoặc `"webkit"` tùy project đang chạy.
 * - `{ workerState }` nói rằng testState phụ thuộc workerState. Playwright sẽ setup
 *   workerState trước rồi mới gọi factory của testState.
 *
 * Riêng WORKER fixture, dependency object chỉ được nhận giá trị cũng sống ở worker
 * scope. Theo type của Playwright đang cài trong dự án, có thể lấy:
 *
 * - Worker args có sẵn:
 *   `playwright`  -> API gốc của Playwright;
 *   `browser`     -> Browser instance dùng chung trong worker.
 *
 * - Worker options có sẵn:
 *   `browserName`, `defaultBrowserType`, `headless`, `channel`, `launchOptions`,
 *   `connectOptions`, `screenshot`, `trace`, `video`.
 *
 * - Custom worker fixtures khác đã khai báo trong generic thứ hai `WorkerFixtures`.
 *   Ví dụ nếu WorkerFixtures còn có `databasePool`, workerState có thể xin
 *   `{ browserName, databasePool }`, miễn không tạo dependency cycle.
 *
 * Có thể hình dung type của object đầu tiên trong worker factory là:
 *
 *   PlaywrightWorkerArgs
 *   & PlaywrightWorkerOptions
 *   & các custom worker fixtures đã extend
 *
 * Ví dụ hợp lệ:
 *
 *   async ({ playwright, browser, browserName, headless }, use, workerInfo) => {}
 *
 * Không phải lấy càng nhiều càng tốt. Chỉ destructure dependency fixture thực sự cần;
 * xin `browser` sẽ làm Playwright setup Browser, còn chỉ xin `browserName` thì ta mới
 * đọc chuỗi cấu hình và chưa cần khởi tạo Browser cho fixture này.
 *
 * Worker fixture KHÔNG được phụ thuộc fixture ngắn hạn thuộc test scope, ví dụ:
 *
 *   `page`, `context`, `request`, `testState`
 *
 * Lý do: workerState phải sống qua nhiều test, còn các giá trị trên bị tạo và huỷ theo
 * từng test. Giá trị sống lâu không thể giữ dependency đã hết vòng đời. Chiều ngược
 * lại thì hợp lệ: testState sống ngắn được phép phụ thuộc workerState sống lâu.
 *
 * `workerInfo` cũng không nằm trong dependency object. Đây là metadata được Playwright
 * truyền riêng ở tham số thứ ba. Tương tự, `testInfo` không phải fixture dependency.
 * TypeScript/autocomplete sẽ báo lỗi nếu destructure một tên không hợp lệ ở đây.
 *
 * 2. `use`
 *
 * `use` là callback do Playwright truyền vào. Fixture phải gọi `await use(value)` để
 * giao value của mình cho fixture phụ thuộc hoặc test body:
 *
 *   code trước `await use(value)` = setup fixture
 *   lúc đang chờ `use`            = test/fixture phụ thuộc đang chạy
 *   code sau `await use(value)`   = teardown fixture
 *
 * Type của value phải khớp type fixture:
 *
 * - `workerState: WorkerState` phải gọi `use(state)` với một WorkerState.
 * - `testState: TestState` phải gọi `use(state)` với một TestState.
 *
 * 3. `testInfo` hoặc `workerInfo`
 *
 * - Test-scoped fixture nhận `testInfo`: thông tin TEST hiện tại, gồm title, testId,
 *   retry, workerIndex, project...
 * - Worker-scoped fixture nhận `workerInfo`: thông tin WORKER hiện tại, gồm
 *   workerIndex, parallelIndex, project, config...
 *
 * WorkerInfo không có một `title` test duy nhất vì cùng workerState có thể phục vụ
 * nhiều test. Trong ví dụ này, workerInfo.workerIndex được dùng để tạo ID worker.
 *
 * Tham số thứ ba có thể bỏ nếu không dùng:
 *
 *   async ({ workerState }, use) => { ... }    // bỏ testInfo
 *   async ({ browserName }, use) => { ... }    // bỏ workerInfo
 *
 * Vì vậy ví dụ test fixture chỉ có `dependencies` và `use` không có nghĩa test scope
 * chỉ hỗ trợ hai tham số. Tác giả đơn giản là không cần `testInfo`. Fixture testState
 * bên dưới dùng đủ ba tham số vì cần `testInfo.title`.
 *
 * Đừng nhầm FIXTURE FACTORY với TEST CALLBACK:
 *
 *   test("name", (fixtures, testInfo) => { ... });
 *
 * Test callback chỉ có hai tham số là fixture bag và TestInfo. Nó không có `use`.
 * `use` chỉ có trong factory chịu trách nhiệm tạo một fixture.
 *
 * Đọc trực tiếp dòng workerState bên dưới:
 *
 *   workerState: [
 *     async ({ browserName }, use, workerInfo) => { ... },
 *     { scope: "worker" },
 *   ]
 *
 * - `{ browserName }`: dependency mà workerState xin từ Playwright.
 * - `use`: callback giao cùng một WorkerState cho các test trong worker.
 * - `workerInfo`: metadata của worker đang sở hữu state này.
 * - `{ scope: "worker" }`: option vòng đời của fixture, không phải tham số function.
 *
 * `workerInfo` là tham số thứ ba, không nằm trong dependency object. Viết
 * `async ({ browserName, workerInfo }, use)` là sai vì workerInfo không phải fixture.
 */
const test = base.extend<TestFixtures, WorkerFixtures>({
  /*
   * Worker fixture phải viết dạng tuple:
   *
   *   [fixtureFunction, { scope: "worker" }]
   *
   * Phần tử đầu là hàm setup/teardown. Phần tử thứ hai nói với Playwright rằng giá trị
   * này thuộc worker, không thuộc từng test.
   *
   * LAZY ACTIVATION - KHI NÀO SETUP THỰC SỰ CHẠY?
   *
   * Việc khai báo workerState trong `extend()` chưa làm fixture chạy. Mặc định fixture
   * là lazy (`auto` không bật). Với từng test, Playwright đi ngược dependency graph:
   *
   * - Test xin `workerState` trực tiếp -> kích hoạt workerState.
   * - Test xin `testState`; testState lại xin workerState -> kích hoạt gián tiếp.
   * - Hook hoặc fixture khác phụ thuộc workerState -> cũng kích hoạt.
   * - Test chỉ xin fixture không liên quan -> không kích hoạt workerState.
   *
   * Lần đầu một test trong worker cần workerState:
   *
   *   1. Playwright chạy code setup trước `await use(state)`.
   *   2. Worker giữ lại đúng instance `state` đó.
   *   3. Test sau trong CÙNG worker nếu cần sẽ nhận lại instance này.
   *   4. Worker khác tạo instance riêng khi test của worker đó cần fixture.
   *   5. Code sau `await use(state)` chạy khi worker kết thúc.
   *
   * Nếu một worker chỉ nhận test không phụ thuộc workerState, worker đó không tạo
   * instance. Nếu fixture đã được test trước kích hoạt, test không liên quan chạy sau
   * không sử dụng nó, nhưng instance vẫn sống cho tới worker teardown.
   *
   * Ngoại lệ: `{ scope: "worker", auto: true }` là auto fixture. Khi đó Playwright tự
   * kích hoạt nó cho worker chạy test dù test không xin workerState.
   *
   * KHÔNG CẦN VÀ KHÔNG NÊN TẠO "TEST MỒI"
   *
   * Ta không cần sắp xếp một test chuyên gọi workerState trước. Mỗi test chỉ khai báo
   * đúng fixture nghiệp vụ nó cần; Playwright tự đảm bảo dependency được setup trước
   * test đó. Ví dụ test chỉ xin `customerPage`, nhưng dependency graph là:
   *
   *   customerPage -> authedPage -> adminState(worker)
   *
   * thì ngay trước test, Playwright tự setup adminState rồi authedPage, cuối cùng mới
   * tạo customerPage. Test không cần biết adminState được tạo ở test nào trước nó.
   *
   * Ví dụ scheduler phân test cho ba worker:
   *
   *   Worker 0: A(không cần), B(cần), C(cần)
   *             A chạy không setup -> B setup state một lần -> C dùng lại
   *
   *   Worker 1: D(cần), E(cần)
   *             D setup instance RIÊNG của worker 1 -> E dùng lại
   *
   *   Worker 2: F(không cần)
   *             không bao giờ setup workerState
   *
   * Không cần biết B hay D chạy trước trên toàn suite. Mỗi worker tự setup đúng lúc
   * test đầu tiên CỦA CHÍNH WORKER ĐÓ cần fixture. Nếu mọi test đều cần auth, hãy để
   * fixture nghiệp vụ chung như authedPage phụ thuộc adminState; mọi test xin authedPage
   * và dependency graph tự xử lý. Dùng `auto: true` chỉ khi fixture thực sự phải chạy
   * cho mọi test, không dùng nó để bù cho dependency khai báo thiếu.
   */
  workerState: [
    async (
      // (1) Chỉ xin `browserName` trong nhóm worker dependencies được phép.
      // Có thể xin thêm `browser`, `playwright`, worker options hoặc custom worker
      // fixtures khác nếu logic setup thật sự cần chúng.
      { browserName },
      use, // (2) giao WorkerState cho các test trong worker.
      workerInfo, // (3) metadata của worker hiện tại.
    ) => {
      // ---------------------- WORKER SETUP ----------------------
      // Chỉ chạy khi test đầu tiên trong worker xin workerState (fixture là lazy).
      const state: WorkerState = {
        id: `worker-${workerInfo.workerIndex}`,
        browserName,
        visitedTests: [],
        sharedNotes: [],
      };

      console.log(`[worker setup] tạo ${state.id}`);

      // `await use(state)` giao CÙNG object này cho mọi test thuộc worker.
      // Hàm tạm dừng ở đây trong suốt thời gian worker còn dùng fixture.
      await use(state);

      // --------------------- WORKER TEARDOWN --------------------
      // Chạy sau test cuối cùng dùng workerState trong worker này.
      console.log(
        `[worker teardown] đóng ${state.id}; đã phục vụ ${state.visitedTests.length} test`,
      );
    },
    { scope: "worker" },
  ],

  /*
   * Không có tuple `{ scope: "worker" }` nên testState mặc định là TEST scope.
   * Hàm này chạy lại trước MỖI test và được teardown ngay sau test đó.
   *
   * Một test fixture được phép phụ thuộc vào worker fixture. Đây chính là hướng dữ
   * liệu Gate Multi đang dùng:
   *
   *   worker storageState -> test BrowserContext -> test Page
   */
  testState: async (
    { workerState }, // (1) dependency worker-scoped đã setup xong.
    use, // (2) giao TestState cho test body hiện tại.
    testInfo, // (3) metadata của test hiện tại.
  ) => {
    // ----------------------- TEST SETUP ------------------------
    workerState.visitedTests.push(testInfo.title);

    const state: TestState = {
      id: `test-state-${workerState.visitedTests.length}`,
      workerStateId: workerState.id,
      usageNumber: workerState.visitedTests.length,
      localNotes: [],
    };

    console.log(
      `[test setup] tạo ${state.id} từ ${state.workerStateId} cho "${testInfo.title}"`,
    );

    await use(state);

    // ---------------------- TEST TEARDOWN ----------------------
    console.log(`[test teardown] bỏ ${state.id}`);
  },
});

/*
 * `serial` ở đây chỉ phục vụ bài học: ba test chạy lần lượt trong cùng một worker.
 * Nếu bỏ dòng này và bật parallel, mỗi test có thể vào worker khác nhau. Khi đó mỗi
 * worker có workerState riêng; worker state KHÔNG dùng chung giữa các worker/process.
 */
test.describe.configure({ mode: "serial" });

test("00 - không phụ thuộc nên chưa kích hoạt workerState", ({
  browserName,
}) => {
  // Test dùng custom `test` đã extend nhưng không destructure workerState/testState.
  // Dependency graph chưa chạm workerState nên log [worker setup] chưa xuất hiện.
  console.log(
    `[test không phụ thuộc] browser=${browserName}; workerState chưa được kích hoạt`,
  );
  expect(["chromium", "firefox", "webkit"]).toContain(browserName);
});

test("01 - test đầu tiên tạo worker state", ({
  workerState,
  testState,
}, testInfo) => {
  // testState biết nó được tạo từ workerState hiện tại.
  expect(testState.workerStateId).toBe(workerState.id);
  expect(testState.usageNumber).toBe(1);
  expect(workerState.visitedTests).toEqual([testInfo.title]);

  // Ghi một dữ liệu vào TEST state và một dữ liệu vào WORKER state.
  testState.localNotes.push("chỉ thuộc test 01");
  workerState.sharedNotes.push("được ghi bởi test 01");

  expect(testState.localNotes).toEqual(["chỉ thuộc test 01"]);
  expect(workerState.sharedNotes).toEqual(["được ghi bởi test 01"]);
});

test("02 - không xin trực tiếp workerState vẫn dùng được", ({ testState }) => {
  // Test body KHÔNG destructure `workerState`.
  // Nhưng fixture testState có dependency `{ workerState }`, nên dependency graph là:
  //
  //   test 02 -> testState -> workerState đã được test 01 kích hoạt
  //
  // Playwright lấy lại instance workerState cũ; không chạy [worker setup] lần hai.
  // testState được setup lại nên đây là object test-state-2 hoàn toàn mới.
  expect(testState.id).toBe("test-state-2");

  // testState fixture tăng counter nằm trong workerState. Giá trị 2 chứng minh nó đã
  // thấy state mà test 01 từng dùng, dù test body không nhận workerState trực tiếp.
  expect(testState.usageNumber).toBe(2);
  expect(testState.workerStateId).toMatch(/^worker-\d+$/);
  expect(testState.localNotes).toEqual([]);

  console.log(
    `[test 02] chỉ nhận testState nhưng testState được tạo từ ${testState.workerStateId}`,
  );
});

/*
 * THỨ TỰ LOG KỲ VỌNG KHI CHẠY FILE NÀY
 *
 *   [test không phụ thuộc] ...                <- chưa có worker setup
 *   [worker setup] tạo worker-X               <- test 01 mới kích hoạt, một lần
 *     [test setup] tạo test-state-1
 *       test 01 chạy
 *     [test teardown] bỏ test-state-1
 *     [test setup] tạo test-state-2
 *       test 02 chạy
 *     [test teardown] bỏ test-state-2
 *   [worker teardown] đóng worker-X           <- một lần
 *
 * LAZY CÓ PHẢI ĐIỂM YẾU KHÔNG?
 *
 * Bản thân lazy activation là điểm mạnh:
 *
 * - không login, mở database hoặc tạo data cho test không cần;
 * - test chỉ trả chi phí cho dependency graph nó thực sự dùng;
 * - mỗi worker có instance riêng, không phải đồng bộ object giữa các process.
 *
 * Tradeoff cần hiểu nằm ở WORKER SCOPE, không nằm ở việc lazy:
 *
 * - Có W worker cùng cần fixture thì setup/login khoảng W lần, không phải một lần cho
 *   toàn suite. Muốn login toàn run một lần có thể dùng setup project + state file.
 * - Worker crash hoặc bị thay khi retry thì instance RAM mất; worker mới setup lại.
 * - Resource đã kích hoạt thường sống đến hết worker dù các test sau không cần nữa.
 * - Setup lỗi có thể làm mọi test phụ thuộc fixture đó trong worker bị lỗi.
 * - Mutable state dùng chung có thể khiến test sau phụ thuộc dữ liệu test trước.
 *
 * Với auth state, pattern an toàn là coi workerState như snapshot chỉ đọc rồi tạo
 * BrowserContext test-scoped mới. Ta giảm số lần login mà vẫn giữ isolation.
 *
 * WORKER FIXTURE VÀ PROJECT DEPENDENCY GIẢI QUYẾT HAI PHẠM VI KHÁC NHAU
 *
 * Worker fixture phù hợp khi resource phải được tạo hoặc giữ riêng trong từng worker:
 *
 * - Browser instance (Playwright đã dùng worker scope cho built-in `browser`);
 * - database connection/API client sống trong process worker;
 * - account hoặc data lease riêng để các worker không đụng nhau;
 * - auth snapshot trong RAM, chấp nhận login một lần cho mỗi worker cần role đó.
 *
 * Project dependency phù hợp khi có bước chuẩn bị phải hoàn tất trước project test:
 *
 * - setup project login một lần cho mỗi role;
 * - ghi creator.json/member2.json/member3.json xuống đĩa;
 * - dependent project chỉ bắt đầu sau khi setup thành công;
 * - mọi worker test đọc cùng các file state rồi tạo context test-scoped riêng.
 *
 * So sánh ngắn:
 *
 *   worker fixture
 *     vòng đời: một instance cho mỗi worker cần nó
 *     truyền dữ liệu: object trong RAM của worker
 *     số login với W worker: tối đa khoảng W lần cho mỗi role
 *
 *   project dependency + state file
 *     vòng đời: setup trước dependent project trong mỗi Playwright invocation
 *     truyền dữ liệu: artifact/file trên đĩa
 *     số login: thường một lần cho mỗi role trong setup project
 *
 * Vì vậy học project dependency sẽ cho cách tối ưu hơn khi auth state có thể dùng
 * chung an toàn giữa nhiều worker. Nhưng worker fixture vẫn hữu dụng cho resource
 * không thể serialize thành file hoặc bắt buộc phải riêng theo worker. Hai cơ chế có
 * thể kết hợp: setup project tạo state file chung, còn worker fixture tạo API client
 * hoặc account lease riêng bằng dữ liệu đã chuẩn bị.
 *
 * LIÊN HỆ VỚI GATE MULTI AUTH
 *
 * Trong engine mới, `roleStateStore` tương đương workerState. Mỗi role là một entry
 * lazy trong Map của store:
 *
 *   1. Test gọi roleSessions.page("creator").
 *   2. Manager gọi roleStateStore.get("creator").
 *   3. Store chưa có role -> adapter login creator và chụp storageState một lần.
 *   4. Snapshot nằm trong RAM và được test cùng worker dùng lại.
 *   5. Mỗi test vẫn tạo BrowserContext MỚI từ snapshot rồi tạo Page riêng.
 *   6. Worker kết thúc -> Map state trong RAM mất; lần chạy sau login lại.
 *
 * LƯU Ý QUAN TRỌNG
 *
 * Ví dụ này mutate `sharedNotes` để chứng minh object worker được dùng lại. Test thật
 * không nên dựa vào dữ liệu mutable do test trước để lại, vì nó tạo phụ thuộc thứ tự
 * và khó chạy parallel. Gate Multi tránh lỗi đó bằng cách coi storageState là template
 * chỉ đọc, sau đó tạo BrowserContext độc lập cho từng test.
 */

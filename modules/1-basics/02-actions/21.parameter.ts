//Paremeter là gì  - kĩ thuật sao chép type
//khi làm viẹc với thư viện (mình ko đc sửa file )
//mình muốn copy lại type của thư viện để làm việc thì sao?

interface AnalyticsLibrary {
  trackEvent(
    eventName: string, //tham số [0]
    properties: {
      userId: string;
      timestamp: number;
      device: "mobile" | "desktop";
      region?: string;
      metaData?: Record<string, string>;
    }, //tham số [1]
    priority?: number, //tham số [2]
  ): void;
}

const analytics: AnalyticsLibrary = {
  trackEvent: (eventName, properties, priority) => {
    console.log(`[SDK] ${eventName}`, properties, priority);
  },
};

type EventProps = Parameters<AnalyticsLibrary["trackEvent"]>[1];

function logAndTrack(
  name: string,
  props: {
    userId: string;
    timestamp: number;
    device: "mobile" | "desktop";
    region?: string;
    metaData?: Record<string, string>;
  },
  prio?: number,
) {
  //b1: In ra log
  console.log(`Tracking ${name}`);

  //Bước2: gọi hàm gốc của thư việc
  analytics.trackEvent(name, props, prio);
}

function logAndTrack2(name: string, props: EventProps, prio?: number) {
  //b1: In ra log
  console.log(`Tracking ${name}`);

  //Bước2: gọi hàm gốc của thư việc
  analytics.trackEvent(name, props, prio);
}

//requestID; id......

logAndTrack("button_click", {
  userId: "user_123",
  timestamp: Date.now(),
  device: "desktop",
});

logAndTrack2("button_click", {
  userId: "user_1232",
  timestamp: Date.now(),
  device: "desktop",
});

//rủi ro : tuân sau , thư viện update thêm trường, source vào properites. Hàm mình sẽ bị lỗi thời
//  protected createLocatorGetter<
//     T extends Record<string, string | ((page: Page) => Locator)>,
//   >(locatorMap: T): (locatorName: keyof T) => Locator {
//     return (locatorName: keyof T): Locator => {
//       const locatorDef = locatorMap[locatorName];
//       if (typeof locatorDef === "function") {
//         return locatorDef(this.page);
//       }
//       return this.page.locator(locatorDef);
//     };
//   }

//nhận vào

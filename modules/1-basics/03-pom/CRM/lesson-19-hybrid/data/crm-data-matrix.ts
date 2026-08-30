/**
 * BẢNG DỮ LIỆU CỐ ĐỊNH CHO DATA-DRIVEN TESTING (DATA FIXATION)
 * Đảm bảo 100% đồng bộ giữa Main Process (Pha phát vé) và Worker Process (Pha soát vé)
 */
export interface CrmCustomerRecord {
  id: string;
  customerName: string;
  phone: string;
  category: string;
  expectedStatus: string;
  tag: string[];
}

export const CRM_CUSTOMER_MATRIX: CrmCustomerRecord[] = [
  {
    id: "CUST_01",
    customerName: "Công ty Cổ phần Alpha Global",
    phone: "0901234567",
    category: "Doanh nghiệp lớn",
    expectedStatus: "Active",
    tag: ["@smoke", "@customer"],
  },
  {
    id: "CUST_02",
    customerName: "Tập đoàn Công nghệ Beta Tech",
    phone: "0912345678",
    category: "Đối tác chiến lược",
    expectedStatus: "Active",
    tag: ["@regression", "@customer"],
  },
  {
    id: "CUST_03",
    customerName: "Công ty TNHH Gamma Logistics",
    phone: "0923456789",
    category: "Vận tải quốc tế",
    expectedStatus: "Active",
    tag: ["@regression", "@customer"],
  },
  {
    id: "CUST_04",
    customerName: "Trung tâm Dịch vụ Delta Services",
    phone: "0934567890",
    category: "Khách hàng thân thiết",
    expectedStatus: "Active",
    tag: ["@smoke", "@customer"],
  },
];

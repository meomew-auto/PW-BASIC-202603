// @ts-nocheck
import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const LoginRequest = z
  .object({ username: z.string(), password: z.string() })
  .passthrough();
const UserInfo = z
  .object({
    id: z.number().int(),
    username: z.string(),
    email: z.string(),
    role: z.enum(["admin", "manager", "staff", "viewer"]),
  })
  .partial()
  .passthrough();
const LoginResponse = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
    token_type: z.string(),
    expires_in: z.number().int(),
    expires_at: z.string().datetime({ offset: true }),
    user: UserInfo,
  })
  .partial()
  .passthrough();
const postAuthregister_Body = z
  .object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
  })
  .passthrough();
const RefreshRequest = z.object({ refresh_token: z.string() }).passthrough();
const postAuthchangePassword_Body = z
  .object({ current_password: z.string(), new_password: z.string().min(8) })
  .partial()
  .passthrough();
const PaginatedResponse = z
  .object({
    data: z.array(z.unknown()),
    pagination: z
      .object({
        page: z.number().int(),
        limit: z.number().int(),
        total_items: z.number().int(),
        total_pages: z.number().int(),
        has_next: z.boolean(),
        has_prev: z.boolean(),
      })
      .partial()
      .passthrough(),
  })
  .partial()
  .passthrough();
const UserCreate = z
  .object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["admin", "manager", "staff", "viewer"]),
  })
  .passthrough();
const putApiusersId_Body = z
  .object({
    email: z.string().email(),
    role: z.enum(["admin", "manager", "staff", "viewer"]),
    is_active: z.boolean(),
  })
  .partial()
  .passthrough();
const patchApiusersId_Body = z
  .object({ email: z.string(), role: z.string(), is_active: z.boolean() })
  .partial()
  .passthrough();
const BeanSpecifications = z.object({
  region: z.string(),
  altitude: z.string(),
  processing: z.string(),
  grade: z.string().optional(),
  flavor_profile: z
    .object({
      acidity: z.number().gte(0).lte(10),
      bitterness: z.number().gte(0).lte(10),
      sweetness: z.number().gte(0).lte(10),
      floral: z.number().gte(0).lte(10),
      notes: z.array(z.string()),
    })
    .partial()
    .passthrough()
    .optional(),
  grind_options: z.array(z.string()).optional(),
  weight_options: z.array(z.number().int()).optional(),
  brewing_guide: z
    .object({
      temperature: z.string(),
      ratio: z.string(),
      time: z.string(),
      method: z.string(),
    })
    .partial()
    .passthrough()
    .optional(),
  story: z.string().optional(),
});
const EquipmentSpecifications = z
  .object({
    brand: z.string(),
    model: z.string(),
    type: z.string().optional(),
    power: z.string().optional(),
    voltage: z.string().optional(),
    capacity: z.string().optional(),
    pressure: z.string().optional(),
    dimensions: z.string().optional(),
    weight: z.string().optional(),
    material: z.string().optional(),
    origin: z.string().optional(),
    features: z.array(z.string()).optional(),
    includes: z.array(z.string()).optional(),
    color_options: z.array(z.string()).optional(),
    burr_type: z.string().optional(),
    grind_settings: z.string().optional(),
    temp_range: z.string().optional(),
    filter_type: z.string().optional(),
    brewing_methods: z.array(z.string()).optional(),
    brewing_time: z.string().optional(),
  })
  .passthrough();
const ProductCreate = z
  .object({
    name: z.string(),
    type: z.enum(["bean", "equipment", "accessory"]),
    unit_type: z.enum(["kg", "piece", "box"]).optional().default("piece"),
    origin: z.string().optional(),
    description: z.string().optional(),
    roast_level: z.enum(["Light", "Medium", "Dark"]).optional(),
    price_per_unit: z.number(),
    warranty_months: z.number().int().optional(),
    specifications: z
      .union([BeanSpecifications, EquipmentSpecifications])
      .optional(),
    image_url: z.string().optional(),
    gallery: z.array(z.string()).optional(),
  })
  .passthrough();
const Product = z
  .object({
    id: z.number().int(),
    name: z.string(),
    type: z.enum(["bean", "equipment", "accessory"]),
    unit_type: z.enum(["kg", "piece", "box"]),
    origin: z.string(),
    description: z.string(),
    roast_level: z.enum(["Light", "Medium", "Dark"]),
    price_per_unit: z.number(),
    warranty_months: z.number().int(),
    image_url: z.string(),
    gallery: z.array(z.string()),
    specifications: z.union([
      z
        .object({
          region: z.string(),
          altitude: z.string(),
          processing: z.string(),
          grade: z.string(),
          flavor_profile: z
            .object({
              acidity: z.number(),
              bitterness: z.number(),
              sweetness: z.number(),
              floral: z.number(),
              notes: z.array(z.string()),
            })
            .partial()
            .passthrough(),
          grind_options: z.array(z.string()),
          weight_options: z.array(z.number().int()),
          brewing_guide: z
            .object({
              temperature: z.string(),
              ratio: z.string(),
              time: z.string(),
              method: z.string(),
            })
            .partial()
            .passthrough(),
          story: z.string(),
        })
        .partial()
        .passthrough(),
      z
        .object({
          brand: z.string(),
          model: z.string(),
          power: z.string(),
          voltage: z.string(),
          capacity: z.string(),
          pressure: z.string(),
          dimensions: z.string(),
          weight: z.string(),
          features: z.array(z.string()),
          includes: z.array(z.string()),
          color_options: z.array(z.string()),
        })
        .partial()
        .passthrough(),
    ]),
    is_active: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const patchApiproductsId_Body = z
  .object({
    name: z.string(),
    description: z.string(),
    price_per_unit: z.number(),
    is_active: z.boolean(),
    origin: z.string(),
    roast_level: z.enum(["Light", "Medium", "Dark"]),
    warranty_months: z.number().int(),
    specifications: z.object({}).partial().passthrough(),
    image_url: z.string(),
    gallery: z.array(z.string()),
  })
  .partial()
  .passthrough();
const OrderItemInput = z
  .object({ product_id: z.number().int(), quantity: z.number().gte(1) })
  .passthrough();
const CheckoutRequest = z
  .object({
    email: z.string().email(),
    phone: z.string(),
    shipping_name: z.string(),
    shipping_address: z.string(),
    shipping_note: z.string().optional(),
    payment_method: z.enum(["cod", "bank_transfer", "stripe", "vnpay"]),
    items: z.array(OrderItemInput).min(1),
  })
  .passthrough();
const CheckoutResponse = z
  .object({
    order_id: z.number().int(),
    order_number: z.string(),
    total_amount: z.number(),
    checkout_url: z.string(),
    bank_info: z.string(),
    message: z.string(),
  })
  .partial()
  .passthrough();
const OrderItem = z
  .object({
    product_id: z.number().int(),
    quantity: z.number(),
    unit_price: z.number(),
    line_total: z.number(),
  })
  .partial()
  .passthrough();
const OrderTrackResponse = z
  .object({
    order_id: z.number().int(),
    order_number: z.string(),
    status: z.enum([
      "pending",
      "confirmed",
      "processing",
      "ready",
      "shipped",
      "delivered",
      "cancelled",
    ]),
    payment_status: z.enum(["unpaid", "partial", "paid", "refunded"]),
    payment_method: z.string(),
    total_amount: z.number(),
    email: z.string(),
    phone: z.string(),
    shipping_name: z.string(),
    shipping_address: z.string(),
    shipping_note: z.string(),
    items: z.array(OrderItem),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const OrderListByEmail = z
  .object({
    email: z.string(),
    orders: z.array(
      z
        .object({
          order_id: z.number().int(),
          order_number: z.string(),
          status: z.string(),
          payment_status: z.string(),
          total_amount: z.number(),
          created_at: z.string().datetime({ offset: true }),
        })
        .partial()
        .passthrough()
    ),
    total: z.number().int(),
  })
  .partial()
  .passthrough();
const postPublictestecho_Body = z
  .object({
    name: z.string(),
    email: z.string(),
    message: z.string(),
    age: z.number().int(),
    data: z.string(),
    file: z.instanceof(File),
  })
  .partial()
  .passthrough();
const postPublictestechoForm_Body = z
  .object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    message: z.string(),
    age: z.number().int(),
    data: z.string(),
    avatar: z.instanceof(File),
    documents: z.instanceof(File),
  })
  .partial()
  .passthrough();
const postPublictestechoUrlencoded_Body = z
  .object({ name: z.string(), message: z.string(), email: z.string() })
  .partial()
  .passthrough();
const Inventory = z
  .object({
    id: z.number().int(),
    product_id: z.number().int(),
    product: Product,
    quantity: z.number(),
    reserved: z.number(),
    available: z.number(),
    min_threshold: z.number(),
    max_capacity: z.number(),
    batch_number: z.string(),
    expiry_date: z.string().datetime({ offset: true }),
    warehouse_location: z.string(),
    is_low_stock: z.boolean(),
    is_expiring_soon: z.boolean(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const putApiinventoryProduct_id_Body = z
  .object({ min_threshold: z.number(), max_capacity: z.number() })
  .partial()
  .passthrough();
const postApiinventoryProduct_idadjust_Body = z
  .object({ quantity: z.number(), reason: z.string() })
  .passthrough();
const postApiinventoryProduct_idimport_Body = z
  .object({
    quantity: z.number(),
    batch_number: z.string().optional(),
    expiry_date: z.string().optional(),
  })
  .passthrough();
const postApicustomers_Body = z
  .object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    tier: z
      .enum(["Bronze", "Silver", "Gold", "Platinum"])
      .optional()
      .default("Bronze"),
    credit_limit: z.number().optional().default(10000000),
  })
  .passthrough();
const putApicustomersId_Body = z
  .object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    address: z.string().optional(),
    tier: z.enum(["Bronze", "Silver", "Gold", "Platinum"]).optional(),
    credit_limit: z.number().optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough();
const patchApicustomersId_Body = z
  .object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    tier: z.string(),
    credit_limit: z.number(),
    is_active: z.boolean(),
  })
  .partial()
  .passthrough();
const postApiorders_Body = z
  .object({
    customer_id: z.number().int(),
    items: z.array(OrderItemInput).min(1),
    payment_method: z.enum(["cod", "bank_transfer"]).optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const Customer = z
  .object({
    id: z.number().int(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    tier: z.enum(["Bronze", "Silver", "Gold", "Platinum"]),
    total_orders: z.number().int(),
    total_spent: z.number(),
    credit_limit: z.number(),
    current_debt: z.number(),
    is_active: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const Order = z
  .object({
    id: z.number().int(),
    order_number: z.string(),
    order_type: z.enum(["b2b", "b2c"]),
    customer_id: z.number().int(),
    customer: Customer,
    status: z.enum([
      "pending",
      "pending_approval",
      "confirmed",
      "processing",
      "ready",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ]),
    items: z.array(OrderItem),
    subtotal: z.number(),
    discount_percent: z.number(),
    discount_amount: z.number(),
    tax_amount: z.number(),
    total_amount: z.number(),
    paid_amount: z.number(),
    payment_status: z.enum(["unpaid", "partial", "paid", "refunded"]),
    payment_method: z.enum(["cod", "bank_transfer", "stripe", "vnpay"]),
    notes: z.string(),
    approved_by: z.string(),
    approved_at: z.string().datetime({ offset: true }),
    shipped_at: z.string().datetime({ offset: true }),
    delivered_at: z.string().datetime({ offset: true }),
    stripe_session_id: z.string(),
    stripe_payment_id: z.string(),
    vnpay_transaction_no: z.string(),
    vnpay_bank_code: z.string(),
    vnpay_pay_date: z.string(),
    email: z.string(),
    phone: z.string(),
    shipping_name: z.string(),
    shipping_address: z.string(),
    shipping_note: z.string(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const postApiorderscalculatePrice_Body = z
  .object({ customer_id: z.number().int(), items: z.array(OrderItemInput) })
  .passthrough();
const patchApiordersId_Body = z
  .object({
    payment_method: z.enum(["cod", "bank_transfer", "stripe", "vnpay"]),
    payment_status: z.enum(["unpaid", "partial", "paid", "refunded"]),
    notes: z.string(),
  })
  .partial()
  .passthrough();
const postApiordersIdpayPartial_Body = z
  .object({
    amount: z.number().gte(1),
    payment_method: z.enum(["cod", "bank_transfer"]).optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const postWebhooksvnpaycallback_Body = z
  .object({
    orderId: z.string(),
    amount: z.number().int(),
    transactionNo: z.string(),
    bankCode: z.string().optional(),
    responseCode: z.string().optional(),
    transactionStatus: z.string().optional(),
    payDate: z.string().optional(),
    success: z.boolean().optional(),
  })
  .passthrough();
const postAuthloginCaptcha_Body = z
  .object({
    username: z.string(),
    password: z.string(),
    turnstile_token: z.string(),
  })
  .passthrough();
const postAuthloginCaptchaGoogle_Body = z
  .object({
    username: z.string(),
    password: z.string(),
    recaptcha_token: z.string(),
  })
  .passthrough();
const patchAuthprofile_Body = z
  .object({ full_name: z.string(), phone: z.string(), avatar_url: z.string() })
  .partial()
  .passthrough();
const postApirooms_Body = z
  .object({
    type: z.enum(["direct", "group"]),
    name: z.string().optional(),
    member_ids: z.array(z.number().int()).optional(),
  })
  .passthrough();
const postApiroomsIdmembers_Body = z
  .object({ user_ids: z.array(z.number().int()) })
  .passthrough();

export const schemas = {
  LoginRequest,
  UserInfo,
  LoginResponse,
  postAuthregister_Body,
  RefreshRequest,
  postAuthchangePassword_Body,
  PaginatedResponse,
  UserCreate,
  putApiusersId_Body,
  patchApiusersId_Body,
  BeanSpecifications,
  EquipmentSpecifications,
  ProductCreate,
  Product,
  patchApiproductsId_Body,
  OrderItemInput,
  CheckoutRequest,
  CheckoutResponse,
  OrderItem,
  OrderTrackResponse,
  OrderListByEmail,
  postPublictestecho_Body,
  postPublictestechoForm_Body,
  postPublictestechoUrlencoded_Body,
  Inventory,
  putApiinventoryProduct_id_Body,
  postApiinventoryProduct_idadjust_Body,
  postApiinventoryProduct_idimport_Body,
  postApicustomers_Body,
  putApicustomersId_Body,
  patchApicustomersId_Body,
  postApiorders_Body,
  Customer,
  Order,
  postApiorderscalculatePrice_Body,
  patchApiordersId_Body,
  postApiordersIdpayPartial_Body,
  postWebhooksvnpaycallback_Body,
  postAuthloginCaptcha_Body,
  postAuthloginCaptchaGoogle_Body,
  patchAuthprofile_Body,
  postApirooms_Body,
  postApiroomsIdmembers_Body,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/customers",
    alias: "getApicustomers",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(10),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "tier",
        type: "Query",
        schema: z.enum(["Bronze", "Silver", "Gold", "Platinum"]).optional(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/customers",
    alias: "postApicustomers",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApicustomers_Body,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Validation error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/customers/:id",
    alias: "getApicustomersId",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/api/customers/:id",
    alias: "putApicustomersId",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putApicustomersId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/customers/:id",
    alias: "patchApicustomersId",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchApicustomersId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/customers/:id/orders",
    alias: "getApicustomersIdorders",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(10),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Customer not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/inventory",
    alias: "getApiinventory",
    requestFormat: "json",
    response: PaginatedResponse,
  },
  {
    method: "get",
    path: "/api/inventory/:product_id",
    alias: "getApiinventoryProduct_id",
    requestFormat: "json",
    parameters: [
      {
        name: "product_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Inventory,
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/api/inventory/:product_id",
    alias: "putApiinventoryProduct_id",
    description: `Replace toàn bộ inventory settings`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putApiinventoryProduct_id_Body,
      },
      {
        name: "product_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/inventory/:product_id",
    alias: "patchApiinventoryProduct_id",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putApiinventoryProduct_id_Body,
      },
      {
        name: "product_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/inventory/:product_id/adjust",
    alias: "postApiinventoryProduct_idadjust",
    description: `Điều chỉnh thủ công số lượng tồn kho (sửa sai lệch, kiểm kê)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiinventoryProduct_idadjust_Body,
      },
      {
        name: "product_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Insufficient stock`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/inventory/:product_id/import",
    alias: "postApiinventoryProduct_idimport",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiinventoryProduct_idimport_Body,
      },
      {
        name: "product_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Exceeds capacity`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/inventory/:product_id/transactions",
    alias: "getApiinventoryProduct_idtransactions",
    description: `Xem lịch sử nhập/xuất/điều chỉnh của sản phẩm`,
    requestFormat: "json",
    parameters: [
      {
        name: "product_id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(10),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Product not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/me/orders",
    alias: "getApimeorders",
    description: `Lấy lịch sử đơn hàng gắn liền với User ID của tài khoản hiện tại.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/orders",
    alias: "getApiorders",
    description: `Lấy danh sách đơn hàng với phân trang và bộ lọc. Hỗ trợ lọc theo trạng thái, khách hàng, và khoảng thời gian.`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(10),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum([
            "pending",
            "pending_approval",
            "confirmed",
            "processing",
            "ready",
            "shipped",
            "delivered",
            "cancelled",
            "returned",
          ])
          .optional(),
      },
      {
        name: "customer_id",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "customer_name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "from_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "to_date",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedResponse,
    errors: [
      {
        status: 400,
        description: `Query parameters không hợp lệ`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders",
    alias: "postApiorders",
    description: `Tạo đơn hàng mới với kiểm tra tồn kho và tính giá tự động. Tự động áp dụng giảm giá theo tier khách hàng và thuế VAT 8%.

**Yêu cầu approval**: Đơn hàng &gt;100kg hoặc &gt;50M VND sẽ chuyển sang &#x60;pending_approval&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiorders_Body,
      },
    ],
    response: Order,
    errors: [
      {
        status: 400,
        description: `Thiếu tồn kho, vượt hạn mức công nợ, hoặc sản phẩm không hoạt động`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Khách hàng hoặc sản phẩm không tìm thấy`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/orders/:id",
    alias: "getApiordersId",
    description: `Lấy thông tin chi tiết đơn hàng kèm danh sách items và thông tin sản phẩm`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/orders/:id",
    alias: "patchApiordersId",
    description: `Cập nhật một phần đơn hàng. Chỉ cập nhật các trường được gửi.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchApiordersId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 400,
        description: `Dữ liệu không hợp lệ`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/:id/approve",
    alias: "postApiordersIdapprove",
    description: `Duyệt đơn hàng cần phê duyệt (&gt;100kg hoặc &gt;50M VND). Chuyển từ &#x60;pending_approval&#x60; → &#x60;confirmed&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "approver_id",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 400,
        description: `Trạng thái không hợp lệ`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/:id/cancel",
    alias: "postApiordersIdcancel",
    description: `Hủy đơn hàng và hoàn trả tồn kho đã giữ (release reserved stock).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ reason: z.string() }).partial().passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 400,
        description: `Trạng thái không hợp lệ`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/:id/confirm",
    alias: "postApiordersIdconfirm",
    description: `Xác nhận đơn hàng và giữ tồn kho (reserve inventory). Chuyển từ &#x60;pending&#x60; → &#x60;confirmed&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 400,
        description: `Trạng thái không hợp lệ`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/:id/deliver",
    alias: "postApiordersIddeliver",
    description: `Đánh dấu đã giao thành công. Cập nhật thống kê khách hàng (total_orders, total_spent) và công nợ. &#x60;shipped&#x60; → &#x60;delivered&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 400,
        description: `Trạng thái không hợp lệ`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/orders/:id/history",
    alias: "getApiordersIdhistory",
    description: `Timeline các thay đổi trạng thái của đơn hàng`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.array(
      z
        .object({
          from_status: z.string(),
          to_status: z.string(),
          changed_by: z.string(),
          reason: z.string(),
          changed_at: z.string().datetime({ offset: true }),
        })
        .partial()
        .passthrough()
    ),
    errors: [
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/:id/pay",
    alias: "postApiordersIdpay",
    description: `Xử lý thanh toán toàn bộ đơn hàng. Giảm công nợ khách hàng.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z
      .object({
        message: z.string(),
        paid_amount: z.number(),
        payment_status: z.string(),
        customer_debt: z.number(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Đã thanh toán`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/:id/pay-partial",
    alias: "postApiordersIdpayPartial",
    description: `Xử lý thanh toán một phần đơn hàng.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiordersIdpayPartial_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z
      .object({
        message: z.string(),
        paid_amount: z.number(),
        remaining: z.number(),
        payment_status: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Đã thanh toán đủ hoặc số tiền không hợp lệ`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/:id/process",
    alias: "postApiordersIdprocess",
    description: `Chuyển đơn hàng sang trạng thái đang xử lý. &#x60;confirmed&#x60; → &#x60;processing&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 400,
        description: `Trạng thái không hợp lệ`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/:id/ready",
    alias: "postApiordersIdready",
    description: `Đánh dấu đơn hàng sẵn sàng giao hàng. &#x60;processing&#x60; → &#x60;ready&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 400,
        description: `Trạng thái không hợp lệ`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/:id/refund",
    alias: "postApiordersIdrefund",
    description: `Hoàn tiền cho đơn hàng đã trả (returned). Trả lại công nợ về 0.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z
      .object({
        message: z.string(),
        refund_amount: z.number(),
        payment_status: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Đơn hàng chưa trả hoặc không cần hoàn tiền`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/:id/return",
    alias: "postApiordersIdreturn",
    description: `Xử lý trả hàng và hoàn tồn kho. &#x60;delivered&#x60; → &#x60;returned&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ reason: z.string() }).partial().passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 400,
        description: `Trạng thái không hợp lệ`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/:id/ship",
    alias: "postApiordersIdship",
    description: `Giao hàng và trừ tồn kho (deduct inventory). &#x60;ready&#x60; → &#x60;shipped&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 400,
        description: `Trạng thái không hợp lệ hoặc thiếu tồn kho`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Đơn hàng không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/orders/calculate-price",
    alias: "postApiorderscalculatePrice",
    description: `Preview giá đơn hàng trước khi tạo: giảm giá theo tier, thuế VAT, yêu cầu approval.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiorderscalculatePrice_Body,
      },
    ],
    response: z
      .object({
        subtotal: z.number(),
        discount_percent: z.number(),
        discount_amount: z.number(),
        tax_amount: z.number(),
        total_amount: z.number(),
        requires_approval: z.boolean(),
        items: z.array(OrderItem),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Dữ liệu không hợp lệ`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Khách hàng hoặc sản phẩm không tìm thấy`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/orders/stats",
    alias: "getApiordersstats",
    description: `Thống kê số lượng đơn hàng theo trạng thái cho dashboard`,
    requestFormat: "json",
    response: z
      .object({
        total: z.number().int(),
        pending: z.number().int(),
        pending_approval: z.number().int(),
        confirmed: z.number().int(),
        processing: z.number().int(),
        ready: z.number().int(),
        shipped: z.number().int(),
        delivered: z.number().int(),
        cancelled: z.number().int(),
        returned: z.number().int(),
      })
      .partial()
      .passthrough(),
  },
  {
    method: "get",
    path: "/api/products",
    alias: "getApiproducts",
    description: `Lấy tất cả sản phẩm (cà phê hạt, thiết bị, phụ kiện). Dùng &#x60;type&#x60; filter để lọc theo loại.`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(10),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "type",
        type: "Query",
        schema: z.enum(["bean", "equipment", "accessory"]).optional(),
      },
      {
        name: "origin",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "roast_level",
        type: "Query",
        schema: z.enum(["Light", "Medium", "Dark"]).optional(),
      },
    ],
    response: PaginatedResponse,
  },
  {
    method: "post",
    path: "/api/products",
    alias: "postApiproducts",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductCreate,
      },
    ],
    response: Product,
    errors: [
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate name`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/products/:id",
    alias: "getApiproductsId",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
    errors: [
      {
        status: 404,
        description: `Product not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/api/products/:id",
    alias: "putApiproductsId",
    description: `**PUT &#x3D; Replace toàn bộ** (RESTful chuẩn)

⚠️ Phải gửi TẤT CẢ các trường. Fields không gửi sẽ thành **null**.

✅ **Các trường có thể update:**
- name, type, unit_type, origin, description (required)
- roast_level, price_per_unit, warranty_months
- specifications (JSON object - null nếu không gửi)
- image_url (string URL - null nếu không gửi)
- gallery (array URLs - null nếu không gửi)
- is_active

💡 **Tip:** Dùng PATCH nếu chỉ muốn cập nhật 1-2 trường.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProductCreate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
    errors: [
      {
        status: 400,
        description: `Dữ liệu không hợp lệ (thiếu required fields)`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Không tìm thấy sản phẩm`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/products/:id",
    alias: "patchApiproductsId",
    description: `**PATCH &#x3D; Partial update**

Chỉ gửi các trường cần thay đổi. Các trường **KHÔNG gửi sẽ GIỮ NGUYÊN** giá trị cũ.

✅ **Có thể update:**
- Thông tin cơ bản: name, type, description, price_per_unit...
- specifications (JSON object)
- image_url (string URL)
- gallery (array URLs)
- is_active (boolean)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchApiproductsId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
    errors: [
      {
        status: 400,
        description: `Dữ liệu không hợp lệ`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Không tìm thấy sản phẩm`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/products/:id",
    alias: "deleteApiproductsId",
    description: `⚠️ **Chỉ admin mới có quyền xóa**. Xóa vĩnh viễn sản phẩm khỏi database.

💡 **Tip:** Nếu chỉ muốn ẩn sản phẩm, dùng PATCH với &#x60;{ &quot;is_active&quot;: false }&#x60; thay vì xóa.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Không có quyền (cần role admin)`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Không tìm thấy sản phẩm`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/products/:id/gallery/:slot",
    alias: "postApiproductsIdgallerySlot",
    description: `Upload ảnh chi tiết vào slot 1-5. Ảnh sẽ ghi đè nếu slot đã có.

**⚠️ Production**: Sử dụng domain &#x60;uploads-neko-coffee.autoneko.com&#x60; để upload.

**Ví dụ**: &#x60;POST https://uploads-neko-coffee.autoneko.com/api/products/1/gallery/1&#x60;`,
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ image: z.instanceof(File) }).passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "slot",
        type: "Path",
        schema: z.number().int().gte(1).lte(5),
      },
    ],
    response: z
      .object({
        slot: z.number().int(),
        image_url: z.string(),
        thumbnail_url: z.string(),
        message: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid file or slot`,
        schema: z.void(),
      },
      {
        status: 429,
        description: `Rate limited`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/products/:id/gallery/:slot",
    alias: "deleteApiproductsIdgallerySlot",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "slot",
        type: "Path",
        schema: z.number().int().gte(1).lte(5),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/products/:id/image",
    alias: "postApiproductsIdimage",
    description: `Upload ảnh lên Cloudinary. Rate limit: 20 uploads/ngày/user. Max 2MB, chỉ jpg/png/webp.

**⚠️ Production**: Sử dụng domain &#x60;uploads-neko-coffee.autoneko.com&#x60; để upload, không qua Cloudflare.

**Ví dụ**: &#x60;POST https://uploads-neko-coffee.autoneko.com/api/products/1/image&#x60;`,
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ image: z.instanceof(File) }).passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z
      .object({
        image_url: z.string(),
        thumbnail_url: z.string(),
        message: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid file`,
        schema: z.void(),
      },
      {
        status: 429,
        description: `Rate limited`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/products/:id/image",
    alias: "deleteApiproductsIdimage",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/reports/expiring-soon",
    alias: "getApireportsexpiringSoon",
    description: `Danh sách sản phẩm sắp hết hạn trong 7 ngày tới`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/reports/inventory-summary",
    alias: "getApireportsinventorySummary",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/reports/low-stock",
    alias: "getApireportslowStock",
    description: `Danh sách sản phẩm có tồn kho dưới ngưỡng tối thiểu`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/rooms",
    alias: "getApirooms",
    description: `Trả về danh sách các phòng chat direct và group mà người dùng là thành viên kèm tin nhắn mới nhất.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/rooms",
    alias: "postApirooms",
    description: `Tạo phòng chat trực tiếp 1-1 với một nhân viên khác hoặc tạo phòng chat nhóm.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApirooms_Body,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/rooms/:id",
    alias: "getApiroomsId",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "patch",
    path: "/api/rooms/:id",
    alias: "patchApiroomsId",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string() }).partial().passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "delete",
    path: "/api/rooms/:id",
    alias: "deleteApiroomsId",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/rooms/:id/leave",
    alias: "postApiroomsIdleave",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/rooms/:id/members",
    alias: "postApiroomsIdmembers",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiroomsIdmembers_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "delete",
    path: "/api/rooms/:id/members/:userId",
    alias: "deleteApiroomsIdmembersUserId",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "userId",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/rooms/:id/messages",
    alias: "getApiroomsIdmessages",
    description: `Lấy danh sách tin nhắn cũ hơn message ID chỉ định thông qua tham số before.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "before",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(50),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/rooms/:id/read",
    alias: "postApiroomsIdread",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/users",
    alias: "getApiusers",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(10),
      },
      {
        name: "role",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedResponse,
    errors: [
      {
        status: 403,
        description: `Forbidden - requires manager role`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/users",
    alias: "postApiusers",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserCreate,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Forbidden - requires admin role`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Username/email exists`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/users/:id",
    alias: "getApiusersId",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: UserInfo,
    errors: [
      {
        status: 404,
        description: `User not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/api/users/:id",
    alias: "putApiusersId",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putApiusersId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/users/:id",
    alias: "patchApiusersId",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchApiusersId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/users/:id",
    alias: "deleteApiusersId",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Forbidden`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/users/:id/lock",
    alias: "postApiusersIdlock",
    description: `Khóa tài khoản nhân viên (ngăn không cho đăng nhập vào hệ thống).`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/users/:id/unlock",
    alias: "postApiusersIdunlock",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/users/search",
    alias: "getApiuserssearch",
    description: `Tìm kiếm nhân viên theo username, email hoặc tên.`,
    requestFormat: "json",
    parameters: [
      {
        name: "q",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/auth/change-password",
    alias: "postAuthchangePassword",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postAuthchangePassword_Body,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Current password incorrect`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/auth/google",
    alias: "getAuthgoogle",
    description: `Chuyển hướng người dùng đến trang xác thực Google Account. Hỗ trợ tham số locale để điều hướng trang callback về đúng ngôn ngữ giao diện.`,
    requestFormat: "json",
    parameters: [
      {
        name: "locale",
        type: "Query",
        schema: z.enum(["vi", "en", "ja"]).optional().default("vi"),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 302,
        description: `Redirect đến trang đăng nhập Google`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/auth/google/callback",
    alias: "getAuthgooglecallback",
    description: `Google chuyển hướng về kèm authorization code. Server xác thực và cấp token JWT cho người dùng.`,
    requestFormat: "json",
    parameters: [
      {
        name: "code",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "state",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 302,
        description: `Redirect về Frontend kèm access_token`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/auth/login",
    alias: "postAuthlogin",
    description: `Authenticate and receive JWT tokens`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LoginRequest,
      },
    ],
    response: LoginResponse,
    errors: [
      {
        status: 401,
        description: `Invalid credentials`,
        schema: z.void(),
      },
      {
        status: 423,
        description: `Account locked`,
        schema: z.void(),
      },
      {
        status: 429,
        description: `Too many login attempts`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/auth/login-captcha",
    alias: "postAuthloginCaptcha",
    description: `Xác thực tài khoản kèm token Turnstile chống brute-force và bot.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postAuthloginCaptcha_Body,
      },
    ],
    response: LoginResponse,
    errors: [
      {
        status: 400,
        description: `Token captcha không hợp lệ hoặc thiếu dữ liệu`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/auth/login-captcha-google",
    alias: "postAuthloginCaptchaGoogle",
    description: `Xác thực tài khoản kèm token Google reCAPTCHA v3.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postAuthloginCaptchaGoogle_Body,
      },
    ],
    response: LoginResponse,
  },
  {
    method: "post",
    path: "/auth/logout",
    alias: "postAuthlogout",
    description: `Revoke all refresh tokens`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/auth/me",
    alias: "getAuthme",
    requestFormat: "json",
    response: UserInfo,
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/auth/profile",
    alias: "patchAuthprofile",
    description: `Thay đổi tên hiển thị (full_name), số điện thoại hoặc avatar của tài khoản đang đăng nhập.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchAuthprofile_Body,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/auth/refresh",
    alias: "postAuthrefresh",
    description: `Exchange refresh token for new access token`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ refresh_token: z.string() }).passthrough(),
      },
    ],
    response: LoginResponse,
    errors: [
      {
        status: 401,
        description: `Invalid or expired token`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/auth/register",
    alias: "postAuthregister",
    description: `Đăng ký tài khoản mới (PUBLIC - không cần đăng nhập). Mặc định role &#x3D; staff`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postAuthregister_Body,
      },
    ],
    response: LoginResponse,
    errors: [
      {
        status: 400,
        description: `Validation error`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Username or email already exists`,
        schema: z.void(),
      },
      {
        status: 429,
        description: `Too many registration attempts`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/docs",
    alias: "getDocs",
    description: `Cung cấp cẩm nang lộ trình 7 chặng cho học viên kèm sơ đồ tương tác Pan &amp; Zoom.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "head",
    path: "/docs",
    alias: "headDocs",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/health",
    alias: "getHealth",
    description: `Trả về trạng thái healthy của dịch vụ Neko Coffee Logistics API.`,
    requestFormat: "json",
    response: z
      .object({ service: z.string(), status: z.string(), version: z.string() })
      .partial()
      .passthrough(),
  },
  {
    method: "post",
    path: "/public/checkout",
    alias: "postPubliccheckout",
    description: `Tạo đơn hàng từ FE website. **Không cần đăng nhập.**

**Payment Methods:**
- &#x60;cod&#x60;: Thanh toán khi nhận hàng
- &#x60;bank_transfer&#x60;: Chuyển khoản ngân hàng
- &#x60;stripe&#x60;: Thẻ quốc tế
- &#x60;vnpay&#x60;: VNPay (redirect đến cổng thanh toán)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CheckoutRequest,
      },
    ],
    response: CheckoutResponse,
    errors: [
      {
        status: 400,
        description: `Validation error - Product không tồn tại hoặc không active`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/public/checkout/:id",
    alias: "getPubliccheckoutId",
    description: `Lấy thông tin đơn hàng B2C theo order ID. Không cần đăng nhập.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: OrderTrackResponse,
    errors: [
      {
        status: 404,
        description: `Không tìm thấy đơn hàng`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/public/metadata",
    alias: "getPublicmetadata",
    description: `Cung cấp danh mục các trạng thái đơn hàng (pending, confirmed, processing, ready, shipped, delivered, cancelled, returned), nhãn hiển thị tiếng Việt và mã màu CSS hỗ trợ render UI frontend.`,
    requestFormat: "json",
    response: z
      .object({
        order_statuses: z.array(z.object({}).partial().passthrough()),
        order_types: z.array(z.string()),
        payment_methods: z.array(z.string()),
        payment_statuses: z.array(z.string()),
      })
      .partial()
      .passthrough(),
  },
  {
    method: "get",
    path: "/public/orders",
    alias: "getPublicorders",
    description: `Guest có thể xem tất cả đơn hàng đã đặt bằng email. Giới hạn 50 đơn gần nhất.`,
    requestFormat: "json",
    parameters: [
      {
        name: "email",
        type: "Query",
        schema: z.string().email(),
      },
    ],
    response: OrderListByEmail,
    errors: [
      {
        status: 400,
        description: `Missing email`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/public/orders/track",
    alias: "getPublicorderstrack",
    description: `Track đơn hàng bằng mã đơn + email (để xác thực).`,
    requestFormat: "json",
    parameters: [
      {
        name: "order_number",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "email",
        type: "Query",
        schema: z.string().email(),
      },
    ],
    response: OrderTrackResponse,
    errors: [
      {
        status: 400,
        description: `Missing params`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Không tìm thấy hoặc email không khớp`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/public/products",
    alias: "getPublicproducts",
    description: `API công khai để lấy danh sách sản phẩm. Không cần authentication.`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(10),
      },
      {
        name: "type",
        type: "Query",
        schema: z.enum(["bean", "equipment", "accessory"]).optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedResponse,
  },
  {
    method: "get",
    path: "/public/products/:id",
    alias: "getPublicproductsId",
    description: `API công khai để lấy chi tiết sản phẩm với đầy đủ specifications. Không cần authentication.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
    errors: [
      {
        status: 404,
        description: `Không tìm thấy sản phẩm`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/public/test/client-info",
    alias: "getPublictestclientInfo",
    description: `Trả về IP, User-Agent, Referer của client.`,
    requestFormat: "json",
    response: z
      .object({
        user_agent: z.string(),
        referer: z.string(),
        host: z.string(),
        timestamp: z.string().datetime({ offset: true }),
      })
      .partial()
      .passthrough(),
  },
  {
    method: "get",
    path: "/public/test/cors",
    alias: "getPublictestcors",
    description: `Kiểm tra header Origin gửi lên, đối chiếu Whitelist (localhost:3000, *.autoneko.com), trả về status ALLOWED hoặc BLOCKED_BY_CORS và cẩm nang debug CORS.`,
    requestFormat: "json",
    parameters: [
      {
        name: "Origin",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z
      .object({
        status: z.string(),
        is_allowed: z.boolean(),
        origin_received: z.string(),
        allowed_origins: z.array(z.string()),
        explanation: z.string(),
        learning_guide: z.object({}).partial().passthrough(),
      })
      .partial()
      .passthrough(),
  },
  {
    method: "options",
    path: "/public/test/cors",
    alias: "optionsPublictestcors",
    description: `Mô phỏng Preflight request mà trình duyệt tự động gửi trước khi gọi API có method phức tạp hoặc custom header.`,
    requestFormat: "json",
    parameters: [
      {
        name: "Origin",
        type: "Header",
        schema: z.string().optional(),
      },
      {
        name: "Access-Control-Request-Method",
        type: "Header",
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/public/test/cors",
    alias: "postPublictestcors",
    description: `Kiểm tra CORS khi gửi dữ liệu phương thức POST.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/public/test/echo",
    alias: "postPublictestecho",
    description: `Trả về thông tin request bao gồm headers, body, files. Không lưu trữ dữ liệu. Max 5MB. Dùng cho học sinh test API.`,
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postPublictestecho_Body,
      },
    ],
    response: z
      .object({
        method: z.string(),
        path: z.string(),
        content_type: z.string(),
        headers: z.object({}).partial().passthrough(),
        query_params: z.object({}).partial().passthrough(),
        form_fields: z.object({}).partial().passthrough(),
        json_body: z.object({}).partial().passthrough(),
        files: z.array(
          z
            .object({
              field_name: z.string(),
              filename: z.string(),
              size: z.number().int(),
              content_type: z.string(),
            })
            .partial()
            .passthrough()
        ),
        timestamp: z.string().datetime({ offset: true }),
        message: z.string(),
      })
      .partial()
      .passthrough(),
  },
  {
    method: "get",
    path: "/public/test/echo",
    alias: "getPublictestecho",
    description: `Trả về thông tin request. Dùng cho học sinh test API.`,
    requestFormat: "json",
    parameters: [
      {
        name: "any_param",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/public/test/echo",
    alias: "putPublictestecho",
    description: `Trả về thông tin request. Dùng cho học sinh test API.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "patch",
    path: "/public/test/echo",
    alias: "patchPublictestecho",
    description: `Trả về thông tin request. Dùng cho học sinh test API.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "delete",
    path: "/public/test/echo",
    alias: "deletePublictestecho",
    description: `Trả về thông tin request. Dùng cho học sinh test API.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/public/test/echo-form",
    alias: "postPublictestechoForm",
    description: `Gửi form-data bao gồm text fields và files. Files KHÔNG được lưu trữ, chỉ trả về metadata.`,
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postPublictestechoForm_Body,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/public/test/echo-json",
    alias: "postPublictestechoJson",
    description: `Gửi JSON và nhận response echo. Dùng để test gửi dữ liệu JSON.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/public/test/echo-urlencoded",
    alias: "postPublictestechoUrlencoded",
    description: `Gửi form data dạng application/x-www-form-urlencoded (như HTML form submit).

**⚠️ LƯU Ý**: Scalar UI không gửi đúng format form-urlencoded. Hãy **copy curl** hoặc dùng **Postman** để test!

**Postman**: Body → x-www-form-urlencoded → nhập key/value

**curl**:
&#x60;&#x60;&#x60;
curl -X POST &#x27;https://api-neko-coffee.autoneko.com/public/test/echo-urlencoded&#x27; \
  -H &#x27;Content-Type: application/x-www-form-urlencoded&#x27; \
  -d &#x27;name&#x3D;Nguyễn+Văn+A&amp;message&#x3D;Xin+chào&#x27;
&#x60;&#x60;&#x60;

**Response sẽ hiển thị:**
- &#x60;raw_body_encoded&#x60;: Dữ liệu browser gửi đi (đã URL-encode)
- &#x60;form_fields_decoded&#x60;: Dữ liệu sau khi server decode

**Ví dụ URL Encoding:**
- &#x27;xin chào&#x27; → &#x27;xin+ch%C3%A0o&#x27;
- &#x27;Học lập trình&#x27; → &#x27;H%E1%BB%8Dc+l%E1%BA%ADp+tr%C3%ACnh&#x27;`,
    requestFormat: "form-url",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postPublictestechoUrlencoded_Body,
      },
    ],
    response: z
      .object({
        raw_body_encoded: z.string(),
        form_fields_decoded: z.object({}).partial().passthrough(),
        explanation: z.object({}).partial().passthrough(),
      })
      .partial()
      .passthrough(),
  },
  {
    method: "head",
    path: "/public/test/file-check",
    alias: "headPublictestfileCheck",
    description: `Mô phỏng Amazon S3, Cloudflare R2 kiểm tra file handbook PDF 5MB trước khi tải. Trả về headers: Content-Type, Content-Length, ETag, Last-Modified, Accept-Ranges và body rỗng 0 bytes.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/public/test/file-check",
    alias: "getPublictestfileCheck",
    description: `Trả về JSON giải thích cơ chế HEAD và metadata của file handbook PDF 5MB.`,
    requestFormat: "json",
    response: z
      .object({
        method: z.string(),
        message: z.string(),
        instruction: z.string(),
        file_metadata: z.object({}).partial().passthrough(),
      })
      .partial()
      .passthrough(),
  },
  {
    method: "get",
    path: "/public/test/headers",
    alias: "getPublictestheaders",
    description: `Trả về tất cả headers trong request (trừ Authorization và Cookie).`,
    requestFormat: "json",
    response: z
      .object({
        headers: z.object({}).partial().passthrough(),
        count: z.number().int(),
        timestamp: z.string().datetime({ offset: true }),
      })
      .partial()
      .passthrough(),
  },
  {
    method: "get",
    path: "/public/test/ping",
    alias: "getPublictestping",
    description: `Kiểm tra kết nối đến server. Trả về pong.`,
    requestFormat: "json",
    response: z
      .object({
        message: z.string(),
        timestamp: z.string().datetime({ offset: true }),
      })
      .partial()
      .passthrough(),
  },
  {
    method: "head",
    path: "/public/test/ping",
    alias: "headPublictestping",
    description: `Gửi request HEAD đến /public/test/ping. Trả về status 200 OK với body rỗng 0 bytes.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/public/test/sample-data",
    alias: "getPublictestsampleData",
    description: `Trả về JSON phức tạp có nhiều lớp lồng nhau: objects, arrays, strings, numbers, booleans, null. Dùng để test Playwright toMatchObject() partial matching.`,
    requestFormat: "json",
    response: z
      .object({
        success: z.boolean(),
        message: z.string(),
        data: z
          .object({
            id: z.number().int(),
            name: z.string(),
            email: z.string(),
            tags: z.array(z.string()),
            profile: z
              .object({
                location: z
                  .object({
                    city: z.string(),
                    coordinates: z
                      .object({ lat: z.number(), lng: z.number() })
                      .partial()
                      .passthrough(),
                  })
                  .partial()
                  .passthrough(),
                social_links: z.array(
                  z
                    .object({ platform: z.string(), url: z.string() })
                    .partial()
                    .passthrough()
                ),
              })
              .partial()
              .passthrough(),
            orders: z.array(
              z
                .object({
                  order_id: z.string(),
                  status: z.string(),
                  items: z.array(z.any()),
                })
                .partial()
                .passthrough()
            ),
            statistics: z.object({}).partial().passthrough(),
            nullable_field: z.null(),
            empty_array: z.array(z.any()),
            empty_object: z.object({}).partial().passthrough(),
          })
          .partial()
          .passthrough(),
        timestamp: z.string().datetime({ offset: true }),
      })
      .partial()
      .passthrough(),
  },
  {
    method: "post",
    path: "/webhooks/stripe",
    alias: "postWebhooksstripe",
    description: `Webhook endpoint nhận thông báo checkout.session.completed từ Stripe.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/webhooks/vnpay/callback",
    alias: "postWebhooksvnpaycallback",
    description: `Callback từ VNPay Worker để cập nhật trạng thái đơn hàng sau khi thanh toán. Worker gọi endpoint này sau khi nhận IPN từ VNPay.

**Authentication**: Header &#x60;X-Webhook-Secret&#x60;

**Flow**:
1. User thanh toán trên VNPay
2. VNPay gọi Worker IPN
3. Worker verify và gọi endpoint này
4. BE cập nhật order status`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postWebhooksvnpaycallback_Body,
      },
      {
        name: "X-Webhook-Secret",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        message: z.string(),
        orderId: z.number().int(),
        orderNumber: z.string(),
        paymentStatus: z.string(),
        orderStatus: z.string(),
        success: z.boolean(),
        alreadyProcessed: z.boolean(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid request body`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Invalid or missing X-Webhook-Secret`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Order không tồn tại`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/ws/chat",
    alias: "getWschat",
    description: `Nâng cấp kết nối HTTP lên WebSocket (101 Switching Protocols). Yêu cầu gửi tin nhắn đầu tiên dạng JSON: {&quot;type&quot;: &quot;auth&quot;, &quot;token&quot;: &quot;JWT_TOKEN&quot;} để xác thực.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 101,
        description: `Chuyển giao thức sang WebSocket thành công`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/ws/online",
    alias: "getWsonline",
    requestFormat: "json",
    response: z
      .object({ online_user_ids: z.array(z.number().int()) })
      .partial()
      .passthrough(),
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

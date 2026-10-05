// Dữ liệu demo cho SQL Playground — 5 bảng, đủ quan hệ 1:1, 1:n, n:n.
// Chỉ dữ liệu cơ bản để học viên tập query. Không phải dữ liệu thật.
window.SQL_DEMO = {
  // Schema các bảng (dùng để dựng ERD & gợi ý)
  tables: [
    {
      name: "customers",
      desc: "Khách hàng",
      columns: [
        { name: "id", type: "INTEGER", key: "PK" },
        { name: "name", type: "TEXT" },
        { name: "city", type: "TEXT" },
        { name: "age", type: "INTEGER" },
      ],
    },
    {
      name: "customer_profiles",
      desc: "Hồ sơ khách (1:1 với customers)",
      columns: [
        { name: "customer_id", type: "INTEGER", key: "PK/FK", ref: "customers.id" },
        { name: "phone", type: "TEXT" },
        { name: "vip", type: "INTEGER" },
      ],
    },
    {
      name: "orders",
      desc: "Đơn hàng (1:n — 1 khách nhiều đơn)",
      columns: [
        { name: "id", type: "INTEGER", key: "PK" },
        { name: "customer_id", type: "INTEGER", key: "FK", ref: "customers.id" },
        { name: "total_amount", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "created_at", type: "TEXT" },
      ],
    },
    {
      name: "products",
      desc: "Sản phẩm",
      columns: [
        { name: "id", type: "INTEGER", key: "PK" },
        { name: "name", type: "TEXT" },
        { name: "price", type: "INTEGER" },
        { name: "category", type: "TEXT" },
      ],
    },
    {
      name: "order_items",
      desc: "Dòng đơn (n:n — nối orders ↔ products)",
      columns: [
        { name: "order_id", type: "INTEGER", key: "FK", ref: "orders.id" },
        { name: "product_id", type: "INTEGER", key: "FK", ref: "products.id" },
        { name: "quantity", type: "INTEGER" },
      ],
    },
  ],

  // Quan hệ để vẽ ERD
  relations: [
    { from: "customer_profiles", to: "customers", kind: "1:1", label: "hồ sơ" },
    { from: "orders", to: "customers", kind: "1:n", label: "đặt" },
    { from: "order_items", to: "orders", kind: "n:1", label: "thuộc" },
    { from: "order_items", to: "products", kind: "n:1", label: "gồm" },
  ],

  // Câu lệnh dựng bảng + nạp dữ liệu (chạy 1 lần khi mở playground)
  schemaSql: `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  age INTEGER
);
CREATE TABLE customer_profiles (
  customer_id INTEGER PRIMARY KEY REFERENCES customers(id),
  phone TEXT,
  vip INTEGER DEFAULT 0
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  total_amount INTEGER,
  status TEXT,
  created_at TEXT
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER,
  category TEXT
);
CREATE TABLE order_items (
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER,
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO customers (id, name, city, age) VALUES
  (1, 'An',   'Hà Nội',  25),
  (2, 'Bình', 'Đà Nẵng', 30),
  (3, 'Chi',  'Hà Nội',  28),
  (4, 'Dũng', 'TP.HCM',  35),
  (5, 'Hoa',  'Huế',     22);

-- 1:1 — không phải khách nào cũng có hồ sơ (Hoa chưa có → tập LEFT JOIN)
INSERT INTO customer_profiles (customer_id, phone, vip) VALUES
  (1, '0901111111', 1),
  (2, '0902222222', 0),
  (3, '0903333333', 1),
  (4, '0904444444', 0);

-- 1:n — Hoa (id 5) chưa có đơn nào (tập LEFT JOIN / khách chưa mua)
INSERT INTO orders (id, customer_id, total_amount, status, created_at) VALUES
  (101, 1, 1200000, 'completed', '2026-01-05'),
  (102, 1,  450000, 'completed', '2026-02-10'),
  (103, 2,  850000, 'pending',   '2026-02-15'),
  (104, 3,  300000, 'completed', '2026-03-01'),
  (105, 3,  990000, 'cancelled', '2026-03-08'),
  (106, 4, 2100000, 'completed', '2026-03-20');

INSERT INTO products (id, name, price, category) VALUES
  (1, 'Bàn phím cơ',  800000, 'Phụ kiện'),
  (2, 'Chuột không dây', 350000, 'Phụ kiện'),
  (3, 'Màn hình 24"', 2500000, 'Màn hình'),
  (4, 'Tai nghe',     450000, 'Âm thanh'),
  (5, 'Webcam',       600000, 'Phụ kiện');

-- n:n — mỗi đơn có nhiều sản phẩm, mỗi sản phẩm ở nhiều đơn
INSERT INTO order_items (order_id, product_id, quantity) VALUES
  (101, 1, 1), (101, 2, 2),
  (102, 4, 1),
  (103, 3, 1), (103, 2, 1),
  (104, 2, 1),
  (105, 5, 2),
  (106, 3, 1), (106, 1, 1), (106, 4, 1);
`,

  // Query mẫu gợi ý theo chủ đề bài học
  samples: [
    {
      label: "SELECT + WHERE cơ bản",
      sql: "SELECT name, city, age\nFROM customers\nWHERE city = 'Hà Nội'\nORDER BY age DESC;",
    },
    {
      label: "1:n — JOIN khách với đơn",
      sql: "SELECT c.name, o.id AS order_id, o.total_amount\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nORDER BY o.total_amount DESC;",
    },
    {
      label: "LEFT JOIN — kể cả khách chưa mua",
      sql: "SELECT c.name, COUNT(o.id) AS so_don\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY so_don DESC;",
    },
    {
      label: "1:1 — khách + hồ sơ VIP",
      sql: "SELECT c.name, p.phone, p.vip\nFROM customers c\nLEFT JOIN customer_profiles p ON p.customer_id = c.id;",
    },
    {
      label: "n:n — đơn gồm những sản phẩm nào",
      sql: "SELECT o.id AS order_id, pr.name AS product, oi.quantity\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products pr ON pr.id = oi.product_id\nORDER BY o.id;",
    },
    {
      label: "GROUP BY — doanh thu theo khách",
      sql: "SELECT c.name, SUM(o.total_amount) AS doanh_thu\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE o.status = 'completed'\nGROUP BY c.id, c.name\nHAVING SUM(o.total_amount) > 500000\nORDER BY doanh_thu DESC;",
    },
    {
      label: "UPDATE (chỉ xem, không chạy thật)",
      sql: "UPDATE orders SET status = 'completed'\nWHERE status = 'pending';",
    },
    {
      label: "DELETE (chỉ xem, không chạy thật)",
      sql: "DELETE FROM orders WHERE status = 'cancelled';",
    },
  ],
};

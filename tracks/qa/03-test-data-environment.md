---
level: "intermediate"
order: 6
title: "Chuẩn bị test data & môi trường"
est: "3-4 giờ"
checklist:
  - "Phân loại được test data: valid, invalid, boundary, edge case và cho ví dụ mỗi loại"
  - "Chọn được cách sinh data phù hợp: tay, SQL seed, factory/fixture, hay công cụ sinh giả"
  - "Xử lý đúng data nhạy cảm (PII): masking/anonymize, không copy prod thô về test"
  - "Phân biệt được môi trường dev, test, staging, production và mục đích mỗi cái"
  - "Đảm bảo test chạy lại được: data reset về trạng thái sạch, không phụ thuộc lần chạy trước"
related:
  - "skill:nta-test-data"
  - "skill:nta-db-seed"
---

## Test data quyết định chất lượng test

Test case tốt mà data sai thì kết quả vô nghĩa. Data phải **phủ đúng các lớp** bạn đã thiết
kế ở bài 2 (equivalence + boundary).

## 4 loại test data

| Loại | Là gì | Ví dụ (ô email) |
|------|-------|-----------------|
| **Valid** | Data hợp lệ, luồng happy path | `user@example.com` |
| **Invalid** | Data sai để test validation | `user@` , để trống |
| **Boundary** | Ở ranh giới giới hạn | Email đúng 254 ký tự (max) |
| **Edge case** | Bất thường nhưng có thể xảy ra | Ký tự Unicode `名前@例え.jp`, khoảng trắng đầu/cuối |

> Đừng chỉ chuẩn bị data đẹp. Bug thật hay lộ ra với **invalid** và **edge case** — chuỗi
> rỗng, ký tự đặc biệt (`'`, `"`, emoji), số 0, số âm, ngày 29/02.

## Cách sinh test data

| Cách | Khi nào dùng | Ưu / Nhược |
|------|--------------|------------|
| **Nhập tay** | Vài bản ghi, test nhanh | Nhanh nhưng không lặp lại được |
| **SQL seed script** | Cần bộ data cố định, nhiều bảng có quan hệ | Lặp lại được, phiên bản hóa trong git |
| **Factory / Fixture** | Test tự động (unit/integration) | Sinh trong code, linh hoạt |
| **Công cụ sinh giả** (Faker) | Cần khối lượng lớn, đa dạng | Nhanh, thực tế; cần kiểm soát để reproduce |

Với data nhiều bảng có quan hệ (user → order → order_item), viết **SQL seed** theo đúng thứ
tự khóa ngoại và bọc trong transaction để dễ rollback. `/nta-test-data` và `/nta-db-seed`
sinh được các script này consistent với ràng buộc quan hệ.

## Data nhạy cảm (PII) — cực kỳ quan trọng

Tuyệt đối **không copy nguyên data production về môi trường test**. Đó là rò rỉ dữ liệu cá
nhân (họ tên, email, số điện thoại, số thẻ) — vi phạm bảo mật và có thể vi phạm luật.

Cách xử lý:

- **Anonymize / masking**: thay tên thật bằng tên giả, che số thẻ còn `**** 1234`.
- **Synthetic data**: sinh data giả hoàn toàn bằng Faker, không dính người thật.
- **Subset + scramble**: lấy một phần nhỏ prod rồi xáo trộn các trường nhạy cảm.

> Data test cũng **không được hard-code mật khẩu/token thật**. Dùng tài khoản test riêng,
> secret để trong biến môi trường — không commit vào git.

## Các môi trường

| Môi trường | Mục đích | Đặc điểm data |
|------------|----------|---------------|
| **Development** (dev) | Dev tự code & test nhanh | Data lộn xộn, thay đổi liên tục |
| **Test / QA** | QA chạy test case có hệ thống | Data kiểm soát, reset được |
| **Staging** | Bản gần giống prod nhất, UAT | Cấu hình = prod, data giống thật (đã masking) |
| **Production** (prod) | Người dùng thật | KHÔNG test phá hoại ở đây |

> **Staging vs Test**: staging phải mô phỏng production càng sát càng tốt (cùng version, cùng
> config, cùng loại DB) để bắt lỗi "chạy ở test nhưng hỏng ở prod". Test/QA thì linh hoạt hơn,
> dành cho việc chạy test case hằng ngày.

## Đảm bảo test chạy lại được (repeatable)

Nguyên tắc vàng: **mỗi lần chạy test phải xuất phát từ trạng thái sạch giống nhau**. Nếu test
A tạo 1 user rồi test B đếm user, chạy 2 lần ra kết quả khác — đó là test không đáng tin.

Cách đảm bảo:

- **Setup / teardown**: trước mỗi test seed data cần thiết, sau đó dọn sạch (xóa hoặc rollback
  transaction).
- **Tránh phụ thuộc thứ tự**: test B không được dựa vào data test A để lại.
- **Data cố định cho case cụ thể**: dùng id/giá trị biết trước thay vì "lấy bản ghi đầu tiên".

## Cạm bẫy hay gặp

- **Copy prod về test không masking** → rò rỉ PII, rủi ro pháp lý.
- **Chỉ chuẩn bị data đẹp** → bỏ lọt bug ở invalid/edge case.
- **Test phụ thuộc data lần chạy trước** → kết quả không ổn định, khó tin.
- **Test phá hoại nhầm trên production** → hỏng data thật. Luôn xác nhận đang ở môi trường nào.
- **Hard-code tài khoản/token thật trong data** → lộ secret khi commit.

## Ghi nhớ

Chuẩn bị đủ **4 loại data** (valid/invalid/boundary/edge) để phủ các lớp đã thiết kế. Data
nhạy cảm phải **masking/anonymize**, không bao giờ copy prod thô. Chọn đúng **môi trường**
(staging sát prod, test để chạy hằng ngày, không phá trên prod). Và test phải **chạy lại
được**: reset về trạng thái sạch, không phụ thuộc lần chạy trước.

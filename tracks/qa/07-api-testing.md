---
level: "intermediate"
order: 8
title: "API testing chuyên sâu"
est: "3-4 giờ"
checklist:
  - "Giải thích vì sao test ở tầng API rẻ, nhanh và ổn định hơn test qua UI"
  - "Đọc được request/response HTTP: method, status code, header, body, auth"
  - "Kiểm đúng contract: status code, schema/kiểu dữ liệu, field bắt buộc, giá trị biên"
  - "Test cả happy path lẫn lỗi: 400/401/403/404/422/500 và message tương ứng"
  - "Kiểm bảo mật cơ bản qua API: authz vượt quyền, input validation, rò dữ liệu nhạy cảm"
---

## Vì sao QA nên test ở tầng API

Bài automation gọi API là "điểm ngọt cho QA". Bài này đi sâu: API testing là kỹ năng **đứng
riêng**, không phải chỉ một bước trong automation. Test ở API kiểm được **logic nghiệp vụ** mà
không phụ thuộc UI còn đang đổi.

| Test qua UI | Test qua API |
|-------------|--------------|
| Chậm (render, chờ trình duyệt) | Nhanh (mili-giây) |
| Giòn (đổi layout là vỡ) | Ổn định (chỉ vỡ khi contract đổi) |
| Test được cả giao diện | Test thẳng logic & dữ liệu |
| Khó phủ nhiều tổ hợp data | Dễ data-driven, chạy hàng loạt |

> Nhiều lỗi nghiệp vụ (tính sai tiền, phân quyền hớ, validate thiếu) nằm ở **tầng logic**, không
> phải UI. Test qua UI để lộ chúng thì chậm và hay bị nhiễu bởi lỗi giao diện. Test thẳng API,
> bạn chạm đúng chỗ lỗi sống — nhanh hơn và ít nhiễu hơn.

## Đọc một request/response

```
POST /api/orders            ← method + endpoint
Authorization: Bearer <token>   ← auth
Content-Type: application/json  ← header
Body: { "productId": 42, "qty": 2 }

→ 201 Created                ← status code
  Body: { "orderId": 1001, "total": 51000, "status": "pending" }
```

Bốn thứ luôn phải để mắt: **method** (GET/POST/PUT/PATCH/DELETE), **status code**, **header**
(auth, content-type), **body** (request gửi gì, response trả gì).

## Kiểm contract

Contract = "API hứa trả về đúng cấu trúc này". QA kiểm lời hứa đó:

| Kiểm gì | Ví dụ |
|---------|-------|
| **Status code** | Tạo thành công → 201, không tìm thấy → 404 |
| **Schema / kiểu** | `total` là số, `status` là chuỗi trong tập cho phép |
| **Field bắt buộc** | Thiếu `orderId` trong response là lỗi |
| **Giá trị biên** | `qty = 0`, `qty = -1`, `qty` cực lớn xử lý thế nào |

```javascript
pm.test("tạo order trả 201 + schema đúng", () => {
  pm.response.to.have.status(201);
  const b = pm.response.json();
  pm.expect(b.orderId).to.be.a("number");
  pm.expect(b.status).to.be.oneOf(["pending", "confirmed"]);
  pm.expect(b.total).to.be.above(0);
});
```

## Đừng chỉ test happy path

Phần lớn giá trị API testing nằm ở **các nhánh lỗi** — nơi dev hay quên xử lý:

| Tình huống | Status kỳ vọng |
|-----------|----------------|
| Input sai định dạng | 400 Bad Request |
| Chưa đăng nhập | 401 Unauthorized |
| Đăng nhập nhưng không đủ quyền | 403 Forbidden |
| Tài nguyên không tồn tại | 404 Not Found |
| Dữ liệu không hợp lệ về nghiệp vụ | 422 Unprocessable Entity |
| Lỗi server | 500 (và **không** lộ stack trace ra ngoài) |

> Happy path thường đã chạy đúng trước khi tới tay QA — dev tự thử rồi. Giá trị của bạn nằm ở
> **đường lỗi**: gửi thiếu field, sai kiểu, vượt quyền, gọi khi chưa auth. Đó là nơi bug thật
> ẩn náu, và cũng là nơi lỗ hổng bảo mật lộ ra.

## Bảo mật cơ bản qua API

QA không cần là pentester, nhưng API test bắt được nhiều lỗ hổng phổ biến (chi tiết ở bài
Security testing):

- **Vượt quyền (IDOR/authz)**: đăng nhập user A, gọi API sửa/đọc dữ liệu của user B → phải bị
  403, không được cho.
- **Input validation**: gửi chuỗi cực dài, ký tự lạ, `null` — server phải từ chối gọn, không 500.
- **Rò dữ liệu**: response có vô tình trả `password`, token, thông tin nội bộ không?

```
# Vượt quyền — kinh điển
GET /api/users/123/orders   (đăng nhập là user 456)
→ PHẢI 403. Nếu trả 200 kèm đơn của user 123 → lỗ hổng nghiêm trọng.
```

## Công cụ

Với API spec (OpenAPI/Swagger), dùng nó làm nguồn contract để đối chiếu.

## Cạm bẫy hay gặp

- **Chỉ test happy path** → bỏ sót nhánh lỗi, nơi bug và lỗ hổng ẩn.
- **Chỉ kiểm status code, bỏ body/schema** → 200 nhưng data sai vẫn lọt.
- **Không test authz** → bỏ lỡ lỗ hổng vượt quyền, loại nghiêm trọng nhất.
- **Hardcode token/data trong collection** → hết hạn là vỡ; dùng biến môi trường.
- **Bỏ qua giá trị biên** (`qty=0`, âm, cực lớn) → lỗi tính toán/tràn lọt lưới.
- **Test API tách rời spec** → không phát hiện API lệch contract đã hứa.

## Ghi nhớ

Test ở **tầng API** rẻ, nhanh, ổn định hơn qua UI và chạm đúng chỗ **logic nghiệp vụ** sống.
Kiểm **contract**: status code, schema, field bắt buộc, giá trị biên. Giá trị lớn nhất nằm ở
**nhánh lỗi** (400/401/403/404/422/500), không phải happy path. Và luôn thử **vượt quyền + input
lạ** — API test là tuyến đầu bắt lỗ hổng bảo mật.

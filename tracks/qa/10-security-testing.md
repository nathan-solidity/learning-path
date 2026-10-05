---
level: "advanced"
order: 12
title: "Security testing cho QA"
est: "4-5 giờ"
checklist:
  - "Hiểu vai trò QA trong bảo mật: bắt lỗ hổng phổ biến, không thay thế pentester chuyên nghiệp"
  - "Nhận diện các lỗ hổng OWASP hay gặp: injection, broken authz, XSS, lộ dữ liệu nhạy cảm"
  - "Test được vượt quyền (IDOR) và các lỗi kiểm soát truy cập cơ bản"
  - "Kiểm input validation: SQL injection, XSS đơn giản qua ô nhập"
  - "Biết khi nào cần chuyển cho chuyên gia bảo mật/pentest thay vì tự làm"
---

## QA là tuyến phòng thủ bảo mật đầu tiên

QA không phải pentester, nhưng nhiều lỗ hổng nghiêm trọng **lộ ra ngay trong quá trình test
thường ngày** nếu bạn biết nhìn. Bắt chúng trước khi lên prod rẻ hơn nhiều so với xử lý sau khi
bị khai thác. Bài này trang bị đủ để QA **phát hiện lỗ hổng phổ biến** — phần chuyên sâu để cho
chuyên gia.

> Ranh giới rõ ràng: QA bắt các lỗ hổng **phổ biến, dễ thấy** (vượt quyền, ô nhập không validate,
> response lộ dữ liệu). Pentester chuyên nghiệp mới đào **lỗ hổng sâu, kỹ thuật cao**. Đừng nghĩ
> "có QA test bảo mật rồi thì khỏi thuê pentest" — hai vai bổ sung, không thay thế.

## OWASP — vài lỗ hổng QA hay chạm

| Lỗ hổng | QA test thế nào |
|---------|-----------------|
| **Broken access control** | Đăng nhập user A, thử truy cập dữ liệu/chức năng của B hoặc admin |
| **Injection (SQL/…)** | Nhập `' OR '1'='1`, ký tự đặc biệt vào ô nhập, xem có lọt/lỗi lạ |
| **XSS** | Nhập `<script>alert(1)</script>` vào field text, xem có bị thực thi |
| **Lộ dữ liệu nhạy cảm** | Response/URL/log có chứa password, token, PII không |
| **Auth yếu** | Cho phép mật khẩu yếu? Session không hết hạn? Không khóa sau nhiều lần sai? |

## Vượt quyền (IDOR) — dễ test, hậu quả nặng

Lỗ hổng phổ biến và nguy hiểm nhất QA bắt được: hệ thống **không kiểm tra** người dùng có quyền
với tài nguyên họ yêu cầu.

```
Đăng nhập là user 456. Đổi ID trên URL/API:
GET /api/users/123/profile    → PHẢI 403 Forbidden
GET /api/orders/999           → chỉ được nếu order 999 thuộc về 456

Nếu trả 200 kèm dữ liệu người khác → IDOR, lỗ hổng nghiêm trọng.
```

> Cách test đơn giản đến bất ngờ: đổi một con số trên URL hoặc trong request. Nhiều hệ thống
> kiểm quyền ở UI (ẩn nút) nhưng **quên kiểm ở API** — gọi thẳng API là lộ. Đây là thứ QA phải
> thử một cách có hệ thống với mọi tài nguyên gắn với người dùng.

## Input validation — cửa vào của injection

Mọi ô nhập là một cửa tấn công tiềm tàng. Thử input **độc hại** để xem server có lọc:

```
Ô tìm kiếm / form:
- SQL injection:  ' OR '1'='1  |  '; DROP TABLE users; --
- XSS:            <script>alert(document.cookie)</script>
- Chuỗi cực dài:  'A' × 100000  (test tràn/DoS)
- Ký tự lạ:       null byte, unicode, emoji
```

Server phải **từ chối gọn** (400/422 kèm message), không được: chạy câu lệnh, thực thi script,
crash 500 lộ stack trace, hay lưu nguyên payload rồi bung ra ở màn hình khác (stored XSS).

> Test XSS quan trọng ở chỗ **stored**: nhập `<script>` vào ô hồ sơ, rồi mở trang khác nơi tên
> hiển thị — nếu script chạy ở đó, một user đã tấn công được user khác. Luôn kiểm cả nơi **nhập**
> lẫn nơi **hiển thị** lại dữ liệu đó.

## Khi nào chuyển cho chuyên gia

> Biết giới hạn của mình là một phần chuyên nghiệp. Gặp dấu hiệu lỗ hổng sâu — logic phân quyền
> phức tạp, nghi ngờ về mã hóa/lưu trữ credential, hệ thống thanh toán, dữ liệu y tế/tài chính bị
> quản lý — **báo và chuyển cho chuyên gia bảo mật/pentest**, đừng tự mò. Với dự án khách Nhật,
> nhiều hợp đồng bắt buộc có pentest độc lập; QA làm tốt phần phổ biến để pentest tập trung vào
> phần sâu.

## Cạm bẫy hay gặp

- **Chỉ kiểm quyền ở UI** (ẩn nút) mà không test API → IDOR lọt lưới.
- **Không thử input độc hại** → injection/XSS không bị phát hiện tới khi bị khai thác.
- **Bỏ qua stored XSS** (chỉ test nơi nhập, không test nơi hiển thị lại).
- **Coi QA test bảo mật là đủ, bỏ pentest** → lỗ hổng sâu vẫn còn đó.
- **Không kiểm response lộ dữ liệu** → password/token/PII rò qua API mà không ai để ý.
- **Test bảo mật trên prod thật một cách vô ý** → có thể gây hại; luôn dùng môi trường được phép.

## Ghi nhớ

QA là **tuyến phòng thủ bảo mật đầu tiên** — bắt các lỗ hổng **phổ biến**: vượt quyền (IDOR),
injection, XSS, lộ dữ liệu, auth yếu. Test IDOR bằng cách **đổi ID** trên URL/API; test injection/
XSS bằng **input độc hại** ở cả nơi nhập lẫn nơi hiển thị lại. Nhưng biết **giới hạn**: lỗ hổng
sâu, hệ thống nhạy cảm thì chuyển cho **pentester** — QA không thay thế chuyên gia bảo mật.

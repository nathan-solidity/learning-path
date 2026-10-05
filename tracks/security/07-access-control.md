---
level: "sec-webvuln"
order: 7
title: "Broken Access Control & phân quyền"
est: "3-4 giờ"
checklist:
  - "Phân biệt được authentication (là ai) và authorization (được làm gì)"
  - "Nhận ra và phòng IDOR: luôn kiểm chủ sở hữu tài nguyên ở server"
  - "Kiểm quyền ở SERVER cho mọi request, không dựa vào ẩn nút trên UI"
  - "Áp dụng deny by default và least privilege"
  - "Không tin field role/isAdmin gửi từ client; chặn route theo chức năng"
related:
  - "glossary:dev"
---

## Vì sao quan trọng

**Broken Access Control** (phân quyền hỏng) thường đứng **#1 OWASP Top 10** — vừa phổ biến
vừa dễ khai thác. Khác với injection cần "mẹo", lỗi phân quyền thường chỉ là **đổi một con
số trên URL**. Hậu quả: người dùng này xem/sửa được dữ liệu của người khác, user thường làm
được việc của admin.

## Phân biệt authentication vs authorization

- **Authentication** (bài 06): *bạn là ai* — đăng nhập thành công.
- **Authorization** (bài này): *bạn được làm gì* — có quyền với tài nguyên/hành động cụ thể.

Đăng nhập đúng **không có nghĩa** được làm mọi thứ. Sai lầm kinh điển là kiểm được cái đầu
mà quên cái sau.

## IDOR — lỗ hổng phân quyền phổ biến nhất

**IDOR** (Insecure Direct Object Reference): tài nguyên tham chiếu trực tiếp bằng id, mà
server **không kiểm người gọi có quyền** với id đó.

```python
# ❌ Chỉ cần đăng nhập là xem được đơn của BẤT KỲ ai — đổi 123 thành 124...
@app.get("/orders/<id>")
def get_order(id):
    return db.orders.find(id)

# ✅ Kiểm tài nguyên thuộc về người đang gọi
@app.get("/orders/<id>")
def get_order(id):
    order = db.orders.find(id)
    if order.user_id != current_user.id:
        abort(403)
    return order
```

Quy tắc: **mọi truy cập tài nguyên theo id đều phải kiểm quyền sở hữu / vai trò ở server**.

## Kiểm quyền ở SERVER, không dựa vào UI

Ẩn nút "Xóa" trên giao diện **không phải** phân quyền — kẻ tấn công gọi thẳng API, không cần
UI. UI chỉ để trải nghiệm; **quyết định cho phép/từ chối phải ở server**, cho **mọi** endpoint.

```javascript
// ❌ Chỉ ẩn nút phía client
if (user.isAdmin) showDeleteButton();

// ✅ Server chặn route theo vai trò cho MỌI request
router.delete('/users/:id', requireRole('admin'), handler);
```

## Nguyên tắc: deny by default & least privilege

- **Deny by default**: mặc định **từ chối**, chỉ mở khi có quyền rõ ràng. An toàn hơn "mặc
  định cho, chặn vài chỗ" (dễ sót chỗ chưa chặn).
- **Least privilege**: mỗi vai trò chỉ có đúng quyền cần thiết.
- **Function-level access control**: route/API của admin phải chặn user thường **ở phía
  server**, không chỉ giấu link.

## Đừng tin dữ liệu quyền từ client

```javascript
// ❌ Tin field role client gửi lên → ai cũng tự phong admin
const role = req.body.role;
if (role === 'admin') { ... }

// ✅ Lấy quyền từ phiên/DB phía server, không từ input
const role = req.session.user.role;   // do server quản lý
```

Không đặt quyền trong field ẩn, cookie sửa được, hay JWT không verify chữ ký.

## Cạm bẫy hay gặp

- Kiểm authentication nhưng quên authorization → đăng nhập rồi truy cập được của người khác.
- IDOR: quên kiểm chủ sở hữu khi lấy tài nguyên theo id (đơn hàng, file, hồ sơ).
- Chỉ ẩn nút/route trên frontend → gọi thẳng API vẫn qua.
- Tin `role`/`isAdmin` từ body/cookie/JWT chưa verify → leo thang đặc quyền.
- "Mặc định cho phép, chặn vài chỗ nhạy cảm" → luôn sót endpoint mới thêm.

## Ghi nhớ

**Broken Access Control** = đăng nhập rồi nhưng **được làm những gì lẽ ra không được**.
Phân biệt **authentication** (là ai) và **authorization** (được làm gì). Phòng thủ: kiểm
**chủ sở hữu tài nguyên** cho mọi truy cập theo id (chống **IDOR**); quyết định cho phép ở
**server** cho **mọi** endpoint (UI không tính); **deny by default** + **least privilege**;
**không tin** role/isAdmin từ client.

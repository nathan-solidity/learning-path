---
level: "basic"
order: 3
title: "Các loại test & test level"
est: "2-3 giờ"
checklist:
  - "Phân biệt functional vs non-functional testing và cho ví dụ mỗi loại"
  - "Phân biệt black box, white box, gray box theo mức nhìn thấy code"
  - "Xếp đúng 4 test level (unit/integration/system/acceptance) theo phạm vi kiểm tra"
  - "Biết ai thường làm level nào và vì sao"
  - "Giải thích vì sao bug bắt ở level càng cao thì sửa càng đắt"
---

## Sắp xếp bức tranh testing

Có rất nhiều "loại test" nghe dễ rối: unit test, black box, non-functional, integration... Thực
ra chúng thuộc **ba trục phân loại khác nhau**, không chồng lên nhau. Bài này xếp gọn cả ba để
bạn không bị ngợp bởi thuật ngữ.

## Trục 1 — Functional vs Non-functional

Phần mềm **làm đúng gì** (functional) và **làm tốt thế nào** (non-functional):

| Loại | Kiểm tra gì | Ví dụ |
|------|-------------|-------|
| **Functional** | Hệ thống *làm đúng chức năng* không | Login đúng/sai mật khẩu, tính tổng giỏ hàng đúng |
| **Non-functional** | Hệ thống *hoạt động thế nào* | Tốc độ (performance), chịu tải (load), bảo mật, dễ dùng (usability) |

> Người mới thường chỉ nghĩ tới functional ("nó có chạy đúng không"). Nhưng một app tính tiền
> đúng mà mất 30 giây mỗi thao tác, hay để lộ mật khẩu, vẫn là sản phẩm hỏng. Non-functional là
> cả một mảng riêng — bạn sẽ học sâu ở phần nâng cao (performance, security, accessibility...).

## Trục 2 — Black box vs White box

Phân theo **mức bạn nhìn thấy code bên trong**:

- **Black box** — test qua giao diện/API, **không nhìn code**. Dựa trên spec: "nhập cái này,
  phải ra cái kia". Đây là **công việc chính** của tester.
- **White box** — **nhìn code** để test từng nhánh logic (branch/path coverage). Thường **dev**
  làm, vì cần đọc hiểu code.
- **Gray box** — kết hợp: biết **một phần** cấu trúc bên trong. Ví dụ biết cấu trúc DB để verify
  dữ liệu sau khi thao tác trên UI.

> Đừng nhầm black box với "test hời hợt". Black box chỉ nghĩa là bạn đánh giá qua **hành vi bên
> ngoài** theo spec — vẫn cần đủ kỹ thuật (bài thiết kế test case) để chọn input thông minh. Phần
> lớn công việc QA thủ công là black box.

## Trục 3 — 4 test level

Phân theo **phạm vi** từ nhỏ đến lớn — đây là trục quan trọng nhất cần nắm:

![4 test level từ unit (nhỏ, dev làm) đến acceptance (khách xác nhận); bug bắt càng cao càng đắt sửa](/images/qa-test-levels.png)

| Level | Phạm vi | Ai làm |
|-------|---------|--------|
| **Unit** | 1 hàm/class riêng lẻ | Dev |
| **Integration** | Nhiều module ghép lại (API ↔ DB) | Dev / QA |
| **System** (E2E) | Toàn hệ thống end-to-end | QA |
| **Acceptance** (UAT) | Khách/end-user xác nhận đúng nhu cầu | Khách / BrSE |

> Quy luật (đã gặp ở bài 1, giờ cụ thể hơn): **bug tìm ở level càng cao thì sửa càng đắt**. Lỗi
> bắt ở unit sửa trong vài phút; cũng lỗi đó lọt tới UAT thì tốn cả một vòng điều tra + sửa +
> test lại, có khi trước mặt khách. Đó là lý do dev nên viết **unit test**, còn QA đẩy mạnh test
> sớm ở tầng **integration/system** thay vì đợi UAT mới phát hiện.

## Ba trục này chồng lên nhau thế nào

Một bài test thực tế thuộc **cả ba trục cùng lúc**. Ví dụ:

> *"QA kiểm luồng đặt hàng end-to-end qua giao diện, xem tổng tiền có đúng không."*
> → **Functional** (kiểm chức năng) + **Black box** (qua UI, không nhìn code) + **System level**
> (toàn hệ thống). Ba trục là ba **góc nhìn** về cùng một bài test, không phải ba loại tách rời.

## Cạm bẫy hay gặp

- **Chỉ test functional, quên non-functional** → app đúng mà chậm/không an toàn vẫn hỏng.
- **Tưởng black box là test hời hợt** → thực ra vẫn cần kỹ thuật chọn input thông minh.
- **Đợi tới UAT mới test kỹ** → bug bắt muộn, sửa đắt, có khi lộ trước khách.
- **Lẫn "loại test" với "level test"** → chúng là các trục khác nhau; một test thuộc cả ba.
- **QA ôm luôn cả unit test của dev** → sai phân công; unit test là việc dev, QA đẩy integration/system.

## Ghi nhớ

Testing xếp theo **ba trục**: **functional vs non-functional** (làm đúng gì / làm tốt thế nào),
**black/white/gray box** (mức nhìn thấy code — QA chủ yếu black box), và **4 level** theo phạm vi
(**unit → integration → system → acceptance**). Một bài test thuộc **cả ba trục** cùng lúc. Nhớ
quy luật xuyên suốt: **bug bắt ở level càng cao càng đắt sửa** — nên đẩy test về sớm.

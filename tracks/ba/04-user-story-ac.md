---
level: "intermediate"
order: 4
title: "User Story & Acceptance Criteria"
est: "4-5 giờ"
checklist:
  - "Viết được user story theo mẫu 'Là... tôi muốn... để...' đúng chuẩn"
  - "Viết được Acceptance Criteria theo Given-When-Then cho một story"
  - "Áp dụng được tiêu chí INVEST để đánh giá một user story tốt/xấu"
  - "Chỉ ra được AC mơ hồ và viết lại thành AC kiểm chứng được"
  - "Biết khi nào cần tách 1 story lớn thành nhiều story nhỏ"
related:
  - "glossary:us"
  - "glossary:ac"
  - "playbook:ba"
  - "skill:nta-spec-write"
---

## User Story

Mô tả yêu cầu từ góc nhìn người dùng, ngắn gọn:

> **Là** một khách hàng, **tôi muốn** đặt lại mật khẩu qua email, **để** lấy lại quyền
> truy cập khi quên mật khẩu.

3 phần: **ai** (vai trò) — **muốn gì** (hành động) — **để làm gì** (giá trị). Phần "để"
quan trọng: nó giải thích *tại sao*, giúp dev/QA hiểu ý đồ chứ không làm máy móc.

## INVEST — story tốt trông thế nào

| Chữ | Nghĩa | Ý |
|-----|-------|---|
| **I**ndependent | Độc lập | Không phụ thuộc chằng chịt story khác |
| **N**egotiable | Thương lượng được | Là điểm khởi đầu để bàn, không phải hợp đồng cứng |
| **V**aluable | Có giá trị | Mang lại giá trị rõ ràng cho user |
| **E**stimable | Ước lượng được | Đủ rõ để dev estimate |
| **S**mall | Nhỏ | Làm xong trong 1 sprint |
| **T**estable | Kiểm thử được | Có AC rõ để QA verify |

## Acceptance Criteria (AC)

Điều kiện để story được coi là **hoàn thành**. Mẫu phổ biến **Given-When-Then**:

```
Given  người dùng đã nhập email đã đăng ký
When   nhấn "Gửi link đặt lại mật khẩu"
Then   hệ thống gửi email chứa link hết hạn sau 30 phút
And    hiển thị thông báo "Vui lòng kiểm tra email"
```

AC phải bao gồm cả **luồng lỗi**:

```
Given  người dùng nhập email CHƯA đăng ký
When   nhấn gửi
Then   vẫn hiển thị cùng thông báo (không tiết lộ email tồn tại hay không — lý do bảo mật)
```

## AC mơ hồ → rõ ràng

| Mơ hồ ❌ | Rõ ràng ✅ |
|----------|-----------|
| "Xử lý hợp lý khi email sai" | Given email sai định dạng → hiện lỗi "Email không hợp lệ", không gửi request |
| "Làm giống màn hình kia" | Liệt kê cụ thể field, validation, hành vi cần giống |

> AC mơ hồ khi handoff cho dev là lỗi kinh điển — xem playbook BA
> "vague-acceptance-criteria-handoff". Dev sẽ tự đoán, QA không có cơ sở test.

## Khi nào tách story

Nếu story chứa chữ "và/hoặc" nhiều, hoặc estimate quá lớn (không xong trong 1 sprint),
hoặc trộn nhiều vai trò — tách nhỏ. Ví dụ "Quản lý người dùng" → tách thành thêm/sửa/xóa/
phân quyền, mỗi cái 1 story.

Công cụ: `/nta-spec-write` giúp soạn spec/story theo template chuẩn.

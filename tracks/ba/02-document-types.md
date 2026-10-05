---
level: "basic"
order: 2
title: "Các loại tài liệu: BRD, SRS, FR, NFR"
est: "3-4 giờ"
checklist:
  - "Phân biệt được BRD (nghiệp vụ) và SRS (kỹ thuật) dùng khi nào, cho ai đọc"
  - "Phân biệt được Functional Requirement và Non-Functional Requirement, cho ví dụ mỗi loại"
  - "Chỉ ra được một requirement mơ hồ và viết lại cho rõ ràng, đo được"
  - "Biết tài liệu nào là nguồn sự thật (source of truth) khi có mâu thuẫn"
related:
  - "glossary:brd"
  - "glossary:srs"
  - "glossary:fr"
  - "glossary:nfr"
---

## Tại sao cần nhiều loại tài liệu?

Vì mỗi loại trả lời một câu hỏi khác nhau và phục vụ người đọc khác nhau. Nhầm loại tài
liệu = viết sai mức chi tiết cho sai đối tượng.

## BRD vs SRS

| | **BRD** (Business Requirements) | **SRS** (Software Requirements Spec) |
|---|---|---|
| Trả lời | "Doanh nghiệp cần gì, tại sao" | "Phần mềm phải làm gì, thế nào" |
| Người đọc | Stakeholder, quản lý, khách hàng | Dev, QA |
| Mức chi tiết | Cao (mục tiêu, phạm vi) | Thấp (từng chức năng, ràng buộc) |
| Ví dụ | "Cho phép khách chuyển tiền online" | "Màn hình chuyển tiền: input số tiền ≤ số dư, validate OTP 6 số..." |

SRS thường được xây **dựa trên** BRD. BRD sai thì SRS sai theo.

## FR vs NFR

- **Functional Requirement (FR)** — hệ thống **làm gì**: "User đăng nhập bằng email + mật
  khẩu", "Xuất báo cáo PDF".
- **Non-Functional Requirement (NFR)** — hệ thống **tốt đến đâu**: "Trang load < 2 giây",
  "Chịu 1000 user đồng thời", "Mã hóa dữ liệu cá nhân".

> NFR hay bị bỏ quên nhưng lại là nguồn của những sự cố đắt giá nhất (chậm, sập, lộ dữ
> liệu). BA giỏi luôn hỏi thẳng: "hiệu năng/bảo mật/tải mong đợi là bao nhiêu?"

## Requirement mơ hồ vs rõ ràng

| Mơ hồ ❌ | Rõ ràng ✅ |
|----------|-----------|
| "Hệ thống phải nhanh" | "Trang danh sách load < 2 giây với 10.000 bản ghi" |
| "Xử lý hợp lý khi lỗi" | "Nếu API timeout > 30s, hiện thông báo X và cho retry" |
| "Giao diện thân thiện" | "Tuân theo design system Y, hỗ trợ mobile ≥ 375px" |

Nguyên tắc: một requirement tốt phải **kiểm chứng được** — QA đọc xong biết cách test
pass/fail rõ ràng.

## Source of truth

Khi BRD, email khách, và spec mâu thuẫn nhau, phải có quy ước tài liệu nào thắng. Thông
thường: **spec đã được duyệt (signed-off)** là nguồn sự thật. Đừng bao giờ code theo "em
nhớ là khách nói..." — verify lại từ tài liệu chốt.

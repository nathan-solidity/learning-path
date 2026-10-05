---
level: "advanced"
order: 8
title: "Impact Analysis khi thay đổi spec"
est: "4-5 giờ"
checklist:
  - "Liệt kê được các chiều impact cần kiểm tra khi 1 spec thay đổi (DB, API, UI, spec liên quan)"
  - "Truy vết được một thay đổi lan tới đâu trong hệ thống"
  - "Biết kiểm tra quyết định đã chốt trong quá khứ trước khi đổi"
  - "Viết được change summary nêu rõ breaking change"
related:
  - "skill:nta-spec-diff"
  - "skill:nta-clarify"
  - "playbook:ba"
---

## Vì sao impact analysis quan trọng

Một thay đổi nhỏ trong spec có thể phá vỡ nhiều chỗ khác. Đổi mà không phân tích impact
là nguyên nhân số 1 của lỗi hồi quy (regression) và spec conflict.

## Các chiều impact cần soi

Khi một yêu cầu thay đổi, kiểm tra lan tỏa theo mọi chiều:

- **Database**: đổi column/constraint → migration nào? Dữ liệu cũ xử lý sao?
- **API**: đổi request/response → client nào đang gọi? Có breaking không?
- **UI**: màn hình nào hiển thị field này? Còn chỗ nào dùng?
- **Spec liên quan**: tài liệu SCR_* / màn hình khác có mô tả cùng logic không?
- **Test case**: test nào phải cập nhật?
- **Nghiệp vụ downstream**: báo cáo, tích hợp, quy trình phía sau có phụ thuộc không?

## Verify quyết định đã chốt trong quá khứ

**Bắt buộc** trước khi đổi: kiểm tra đã có quyết định design nào về item này chưa. Bài học
thực tế:

- Constraint từng được chốt "xử lý ở application layer" bị hồi sinh thành DB constraint.
- Column được note "không bỏ (Phase 1)" bị đánh dấu deprecated nhầm.

Nguồn phải check: history của spec document, commit/MR history, ticket history, ghi chú
HANDOFF/quyết định cũ. Check một lần ở đầu **rẻ hơn nhiều** so với rollback/hotfix sau.

> Xem playbook BA "reviving-cancelled-past-decision" và "spec-change-missing-impact-analysis".

## Breaking change

Thay đổi **phá vỡ tương thích** với cái đang chạy:
- Đổi/xóa field trong API response mà client đang đọc.
- Đổi kiểu dữ liệu, đổi format (ngày, tiền tệ).
- Bỏ một endpoint / màn hình đang được dùng.

Breaking change phải được **nêu bật rõ** trong change summary, có kế hoạch migration và
thông báo cho các bên bị ảnh hưởng — không âm thầm đổi.

Công cụ: `/nta-spec-diff` so sánh 2 phiên bản spec, tự phát hiện breaking change; `/nta-clarify`
scan impact toàn hệ thống.

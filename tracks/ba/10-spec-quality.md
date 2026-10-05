---
level: "advanced"
order: 10
title: "Đảm bảo chất lượng Spec (review & handoff)"
est: "3-4 giờ"
checklist:
  - "Tự review được spec theo 4 tiêu chí: completeness, consistency, ambiguity, testability"
  - "Chuẩn bị được checklist handoff spec cho dev đầy đủ"
  - "Biết cách phối hợp với QA để AC dùng được cho test case"
  - "Nhận ra spec 'trông đầy đủ' nhưng thiếu edge case / luồng lỗi"
related:
  - "skill:nta-spec-review"
  - "skill:nta-spec-write"
  - "playbook:ba"
  - "playbook:qa"
---

## 4 tiêu chí một spec tốt

| Tiêu chí | Câu hỏi tự soi |
|----------|----------------|
| **Completeness** (đầy đủ) | Có luồng lỗi/edge case chưa? Field nào chưa nêu validation? |
| **Consistency** (nhất quán) | Cùng khái niệm có gọi cùng tên? Có mâu thuẫn giữa các mục? |
| **Ambiguity** (rõ ràng) | Còn từ mơ hồ ("hợp lý", "tương tự") không? |
| **Testability** (kiểm thử được) | QA đọc AC có biết cách test pass/fail rõ ràng không? |

## Handoff spec cho dev — checklist

Trước khi giao dev, đảm bảo:
- [ ] Mọi AC cụ thể, không còn cụm mơ hồ.
- [ ] Đã liệt kê happy path + alternative + exception flow.
- [ ] Validation từng field rõ (bắt buộc? độ dài? định dạng?).
- [ ] Đã nêu impact tới màn hình/spec liên quan.
- [ ] Câu hỏi mở với khách đã được chốt (không còn "chờ trả lời").
- [ ] Xác nhận dev đã hiểu đúng — không chỉ gửi file rồi thôi.

> Lỗi kinh điển: giao spec với AC mơ hồ, dev tự suy đoán. Xem playbook BA
> "vague-acceptance-criteria-handoff".

## Phối hợp với QA

QA dùng AC của bạn để viết test case. Nếu AC thiếu luồng lỗi, QA sẽ bỏ sót case đó. Cách
tốt: **rủ QA review spec sớm** — họ có tư duy "tìm chỗ hỏng" bổ trợ cho BA.

Cũng lưu ý luồng ngược: nếu Q&A với khách chưa đóng mà đã vào UAT, sẽ vỡ trận. Xem
playbook BA "qa-sheet-not-closed-before-uat".

## "Trông đầy đủ" nhưng thiếu

Spec dài không có nghĩa là đầy đủ. Cạm bẫy hay gặp:
- Mô tả kỹ happy path, quên hoàn toàn luồng lỗi.
- Liệt kê field nhưng không nói validation.
- Không nói gì về phân quyền, trạng thái, đồng thời.

Dùng bộ câu hỏi edge case ở topic *Gap Analysis* để soi lại lần cuối.

Công cụ: `/nta-spec-review` review completeness/consistency/ambiguity/edge case tự động;
`/nta-spec-write` soạn spec theo template chuẩn.

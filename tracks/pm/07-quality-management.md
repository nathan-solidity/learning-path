---
level: "intermediate"
order: 7
title: "Quản lý chất lượng dự án"
est: "3 giờ"
checklist:
  - "Phân biệt quality assurance (phòng lỗi) và quality control (tìm lỗi) ở góc PM"
  - "Định nghĩa được Definition of Done cho team và vì sao nó chống rework"
  - "Nắm khái niệm technical debt và cách PM cân bằng tốc độ vs nợ kỹ thuật"
  - "Đọc được các chỉ số chất lượng cơ bản: defect density, escape rate, rework rate"
  - "Xây được vòng phản hồi chất lượng: đo → phân tích nguyên nhân → cải tiến"
related:
  - "skill:nta-checklist"
  - "skill:nta-code-review"
  - "skill:nta-risk-assessment"
---

## Chất lượng là việc của PM, không chỉ của QA

PM không viết test case, nhưng PM **quyết định môi trường** để chất lượng xảy ra hay không: có
thời gian review không, Definition of Done có được tôn trọng không, nợ kỹ thuật có được trả không.
Chất lượng kém không phải lỗi riêng của dev/QA — thường là hệ quả của áp lực tiến độ mà PM đặt ra.

## QA vs QC ở góc nhìn PM

| | Quality Assurance (QA) | Quality Control (QC) |
|---|------------------------|----------------------|
| Bản chất | **Phòng** lỗi bằng quy trình | **Tìm** lỗi trong sản phẩm |
| Ví dụ | Review spec, coding standard, DoD | Test, code review, kiểm thử nghiệm thu |
| PM lo gì | Quy trình có được tuân thủ không | Có đủ thời gian & nguồn lực để test không |

> Chi phí sửa lỗi tăng theo cấp số khi phát hiện muộn (giống bài học của QA track). PM đầu tư vào
> **phòng** (QA) — review spec sớm, chuẩn hóa quy trình — sẽ rẻ hơn nhiều so với chữa cháy ở giai
> đoạn nghiệm thu.

## Definition of Done (DoD)

**DoD** là danh sách điều kiện để một task được coi là "xong" — thống nhất trước, áp dụng cho mọi
task. Ví dụ:

- Code đã review và merge.
- Có unit test, pass CI.
- Đã test theo test case, không còn bug blocker/critical.
- Tài liệu/API doc cập nhật (nếu cần).
- Đã demo/xác nhận với PO hoặc BrSE.

> Không có DoD rõ ràng, "xong" thành từ co giãn: dev nói xong (code chạy), QA nói chưa (còn bug),
> khách nói chưa (thiếu tài liệu). Kết quả là **rework** và cãi nhau. DoD chốt trước là hàng rào
> chống scope creep ngầm và tranh cãi "thế nào là xong".

## Technical debt (nợ kỹ thuật)

Nợ kỹ thuật là **cái giá phải trả về sau** khi chọn giải pháp nhanh/tạm thời thay vì đúng đắn.
Giống nợ tài chính: vay để đi nhanh giờ, nhưng phải trả **lãi** (bảo trì khó, bug nhiều, thêm
feature chậm).

> PM phải cân bằng: đôi khi **cố tình vay nợ** để kịp demo/milestone là hợp lý — nhưng phải **ghi
> nợ lại** và lên lịch trả. Nợ kỹ thuật không được quản lý sẽ tích tụ đến mức mỗi feature mới đều
> chậm và đầy bug, velocity tụt dần mà không rõ vì sao.

## Chỉ số chất lượng cơ bản

| Chỉ số | Nghĩa | Cảnh báo khi |
|--------|-------|--------------|
| **Defect density** | Số bug / đơn vị (KLOC hoặc feature) | Cao bất thường ở một module → cần soi kỹ |
| **Defect escape rate** | % bug lọt ra production (không bắt được khi test) | Cao → quy trình test có lỗ hổng |
| **Rework rate** | % effort dành cho làm lại | Cao → hiểu sai spec hoặc chất lượng đầu vào kém |

> Đừng dùng chỉ số để **đổ lỗi cá nhân** (số bug của dev X). Dùng để **tìm điểm yếu quy trình**:
> escape rate cao là vấn đề của cả hệ thống test, không phải một người. Đo để cải tiến, không phải
> để trừng phạt — nếu không, người ta sẽ giấu bug.

## Vòng phản hồi chất lượng

Chất lượng cải thiện qua vòng lặp, không qua hô hào:

1. **Đo** — thu thập chỉ số (bug, rework, escape).
2. **Phân tích nguyên nhân** — vì sao bug lọt? (spec mờ? thiếu test? áp lực tiến độ?)
3. **Cải tiến** — sửa quy trình (thêm review spec, bổ sung test case, giãn tiến độ).
4. Lặp lại ở sprint/retrospective sau.

## Cạm bẫy hay gặp

- **Ép tiến độ, bỏ review/test** → tiết kiệm giả, rework và bug production đắt hơn nhiều.
- **Không có DoD** → "xong" mỗi người hiểu một kiểu, cãi nhau và rework.
- **Để nợ kỹ thuật tích tụ không ghi nhận** → velocity tụt dần, feature nào cũng chậm.
- **Dùng chỉ số để đổ lỗi cá nhân** → người ta giấu bug, số liệu thành vô dụng.
- **Coi chất lượng là việc riêng của QA** → PM không tạo môi trường thì QA cũng bất lực.

## Ghi nhớ

PM tạo **môi trường** cho chất lượng: đầu tư vào **phòng** lỗi (QA) rẻ hơn chữa; chốt **Definition
of Done** để chống rework và tranh cãi "thế nào là xong". Quản lý **nợ kỹ thuật** như nợ tài chính
— vay được nhưng phải ghi và trả. Đo **defect density / escape rate / rework** để **cải tiến quy
trình**, không để đổ lỗi cá nhân.

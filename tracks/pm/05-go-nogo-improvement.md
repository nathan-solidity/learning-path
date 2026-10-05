---
level: "advanced"
order: 11
title: "Ra quyết định Go/No-Go & cải tiến"
est: "3-4 giờ"
checklist:
  - "Liệt kê được tiêu chí release readiness (chất lượng, ops, business)"
  - "Chạy được một cuộc họp Go/No-Go với tiêu chí rõ và người quyết cuối"
  - "Quyết định được giữa cắt scope và lùi lịch khi dự án trễ, kèm lý do"
  - "Đo được lead time và defect rate để đánh giá sức khỏe quy trình"
  - "Rút ra được action cải tiến cụ thể từ dữ liệu, không chỉ cảm tính"
related:
  - "skill:nta-deploy-checklist"
  - "skill:nta-risk-assessment"
---

## Release readiness

Trước release, đánh giá theo tiêu chí **rõ ràng, đo được** — không phải cảm giác "chắc ổn".
Gom theo 3 nhóm:

| Nhóm | Tiêu chí ví dụ | Ngưỡng |
|------|----------------|--------|
| **Chất lượng** | Test pass rate | ≥ 95% |
| | Bug critical/high còn mở | 0 |
| | Coverage tính năng chính | 100% UAT pass |
| **Ops** | Rollback plan | Có, đã thử |
| | Monitoring/alert | Đã cấu hình |
| | Migration DB | Đã test trên staging |
| **Business** | Khách nghiệm thu (UAT) | Đã ký |
| | Tài liệu bàn giao | Đủ |

## Go/No-Go checklist

Cuộc họp Go/No-Go quy tụ đại diện các bên (PM, Lead, QA, DevOps, PO/khách). Nguyên tắc:

- **Tiêu chí định trước**, không tự bịa lúc họp.
- Mỗi tiêu chí trả lời **rõ**: đạt / chưa đạt / đạt có điều kiện.
- **Một người quyết cuối** (thường PM hoặc PO), không quyết tập thể mập mờ.
- Nếu "No-Go" → ghi rõ **điều kiện gì để Go** và khi nào họp lại.

| Tiêu chí | Trạng thái | Ghi chú |
|----------|-----------|---------|
| Critical bug = 0 | ✅ Go | |
| UAT khách ký | ✅ Go | |
| Rollback đã thử | ⚠️ Điều kiện | Thử lại trước 15h |
| Load test đạt | ❌ No-Go | 20% request timeout ở peak |

> Một tiêu chí **No-Go** đủ để hoãn — đừng để áp lực deadline ép "Go" khi tiêu chí an toàn
> chưa đạt. Sự cố production tốn kém và mất niềm tin hơn nhiều so với lùi vài ngày.

## Khi trễ deadline: cắt scope hay lùi lịch?

Đây là quyết định PM hay gặp nhất. So sánh:

| | Cắt scope | Lùi lịch |
|---|-----------|----------|
| Giữ được | Ngày release | Đầy đủ tính năng |
| Đánh đổi | Ít tính năng hơn ở bản này | Trễ cam kết, có thể phạt hợp đồng |
| Phù hợp khi | Có tính năng hoãn được, deadline cứng | Deadline mềm, tính năng bắt buộc trọn gói |

Cách quyết:
1. Phân loại scope theo **MoSCoW** (Must / Should / Could / Won't). Chỉ **Must** mới bắt buộc
   ở bản này.
2. Nếu cắt được các "Should/Could" mà vẫn đạt Must → **cắt scope**, release đúng hạn, đẩy
   phần cắt sang bản sau.
3. Nếu phần trễ nằm trong "Must" → **lùi lịch** và báo khách sớm với lý do + ngày mới.

> Tuyệt đối tránh phương án thứ ba ngầm định: "giữ cả scope lẫn deadline bằng cách ép team
> OT và bỏ test". Nó đổi nợ kỹ thuật + bug production lấy vài ngày — luôn lỗ.

## Đo lường quy trình

Cải tiến phải dựa trên **số**, không cảm tính. Vài chỉ số cốt lõi:

| Chỉ số | Đo gì | Đọc thế nào |
|--------|-------|-------------|
| **Lead time** | Từ lúc nhận task đến khi Done | Dài & tăng → quy trình có nghẽn |
| **Cycle time** | Từ lúc bắt đầu làm đến Done | Tách được thời gian "chờ" vs "làm" |
| **Defect rate** | Bug/story hoặc bug/1000 dòng | Tăng → chất lượng đang giảm |
| **Escaped defects** | Bug lọt tới production | Cao → QA/UAT chưa đủ |
| **Velocity trend** | Điểm Done theo sprint | Giảm dần → team đang đuối/nợ kỹ thuật |

Ví dụ đọc dữ liệu: lead time trung bình tăng từ 4 → 7 ngày qua 3 sprint, trong khi cycle
time chỉ tăng từ 2 → 2.5 ngày → phần lớn thời gian là **chờ** (chờ review, chờ spec, chờ
môi trường), không phải làm chậm. Action: cải tiến bước review/chuẩn bị, không phải ép dev
làm nhanh hơn.

## Từ dữ liệu tới cải tiến

Trong retrospective, biến quan sát thành **action cụ thể có owner**:

| Quan sát (dữ liệu) | Action | Owner |
|--------------------|--------|-------|
| Escaped defects tăng ở module thanh toán | Thêm test tích hợp cho luồng callback | QA |
| Lead time nghẽn ở bước review | Giới hạn WIP, review trong 24h | Lead |
| Cùng câu hỏi spec lặp lại | Chốt spec với BrSE trước sprint | BA/PM |

> Action mơ hồ ("cẩn thận hơn", "test kỹ hơn") không cải tiến được gì. Action tốt phải
> **đo lại được** ở sprint sau: "escaped defect module thanh toán về 0".

## Cạm bẫy hay gặp

- **Go/No-Go không có tiêu chí định trước** → quyết theo cảm tính/áp lực deadline.
- **Ép "Go" khi tiêu chí an toàn chưa đạt** → sự cố production, tốn hơn nhiều lần.
- **Giữ cả scope lẫn deadline bằng OT + bỏ test** → nợ kỹ thuật + bug, luôn lỗ.
- **Cải tiến bằng khẩu hiệu** ("làm cẩn thận hơn") mà không có số → không đo được, không đổi.
- **Đo chậm dev khi thực ra là chờ** → ép nhầm, bỏ sót nghẽn thật ở review/spec/môi trường.

## Ghi nhớ

Release quyết bằng **tiêu chí đo được** và một người chịu trách nhiệm cuối — một No-Go đủ để
hoãn. Khi trễ, dùng **MoSCoW** để chọn giữa cắt scope và lùi lịch, không ép OT bỏ test. Cải
tiến dựa trên **số** (lead time, defect rate) và biến thành **action có owner, đo lại được**
— đó là vòng lặp giúp dự án sau tốt hơn dự án trước.

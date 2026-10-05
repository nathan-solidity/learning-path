---
track: "qa"
role: "qa"
title: "Quality Assurance (QA)"
icon: "🧪"
summary: "Lộ trình cho QA/Tester: tư duy kiểm thử, thiết kế test case, test data, thực thi & báo cáo, bug report chuẩn, và tự động hóa cơ bản."
levels:
  - key: "basic"
    title: "Cơ bản"
    desc: "Cho người mới: QA là gì & vai trò, tư duy 'phá để bảo vệ' + 7 nguyên tắc, các loại/level test, và cách thiết kế test case bài bản (kèm hình minh họa & glossary)."
  - key: "intermediate"
    title: "Trung cấp"
    desc: "Test design nâng cao (exploratory, risk-based), test data & môi trường, thực thi & bug report, API testing, và non-functional testing."
  - key: "advanced"
    title: "Nâng cao"
    desc: "Tự động hóa, performance/load, security, mobile & cross-browser, accessibility, CI/CD quality gates, test strategy & metrics, và Agile/offshore với BrSE Nhật."
---

## Về lộ trình này

Lộ trình dành cho người làm **QA / Tester** trong dự án phần mềm (đặc biệt môi trường
offshore làm với khách Nhật qua BrSE). Mục tiêu: từ người mới biết "bấm thử app" trở thành
tester tự chủ — biết **tại sao** test, thiết kế test case **có phương pháp**, báo lỗi để dev
sửa được ngay, và bước đầu **tự động hóa** phần lặp lại.

Học tuần tự từ **Cơ bản → Trung cấp → Nâng cao**. Mỗi bài có phần checklist tự đánh giá —
tick khi bạn tự tin đã nắm. Tiến độ tính theo số item đã tick.

### Bản đồ 17 bài

| Cấp | Bài | Vì sao học ở đây |
|-----|-----|------------------|
| Cơ bản | 1. QA là gì & vai trò trong dự án | Điểm khởi đầu cho người mới: QA/QC/Tester, QA đứng ở đâu trong SDLC, glossary thuật ngữ nền tảng. |
| Cơ bản | 2. Tư duy kiểm thử & 7 nguyên tắc | Mindset "phá để bảo vệ", happy path vs edge case, 7 nguyên tắc testing kèm ví dụ. |
| Cơ bản | 3. Các loại test & test level | Xếp gọn 3 trục: functional/non-functional, black/white box, 4 test level — hết ngợp thuật ngữ. |
| Cơ bản | 4. Kỹ thuật thiết kế test case | Chọn ít case mà bắt nhiều lỗi: equivalence, boundary, decision table, state transition. |
| Trung cấp | 5. Test design nâng cao & exploratory | Vượt case viết sẵn: exploratory, risk-based, pairwise — test thông minh hơn, không chỉ nhiều hơn. |
| Trung cấp | 6. Chuẩn bị test data & môi trường | Có test case rồi phải có data & môi trường đúng thì mới chạy được, và chạy lại được. |
| Trung cấp | 7. Thực thi test & bug report | Chạy test thật, ghi kết quả, và báo lỗi để dev tái hiện được — mắt xích quyết định giá trị QA. |
| Trung cấp | 8. API testing chuyên sâu | Test thẳng tầng logic: nhanh, ổn định, bắt bug nghiệp vụ và lỗ hổng mà UI test bỏ sót. |
| Trung cấp | 9. Non-functional testing tổng quan | "Làm đúng" chưa đủ — còn nhanh, an toàn, dễ dùng, chạy đúng nơi; bản đồ cho các bài chuyên đề. |
| Nâng cao | 10. Tự động hóa kiểm thử cơ bản | Khi đã làm tay thành thạo mới automate đúng chỗ — tránh automate sai tầng, tốn công bảo trì. |
| Nâng cao | 11. Performance & load testing | Đúng với 1 người, sập với 1000 — đo p95/p99, tìm điểm gãy và bottleneck. |
| Nâng cao | 12. Security testing cho QA | Tuyến phòng thủ đầu: bắt IDOR, injection, XSS, lộ dữ liệu trước khi bị khai thác. |
| Nâng cao | 13. Mobile & cross-browser testing | "Chạy tốt máy tôi" không đủ — ma trận thiết bị/trình duyệt và đặc thù mobile. |
| Nâng cao | 14. Accessibility testing | Dùng được cho tất cả mọi người, và ở nhiều thị trường (gồm Nhật) là yêu cầu pháp lý. |
| Nâng cao | 15. CI/CD & quality gates | QA từ "bấm test cuối" thành người thiết kế cổng chất lượng tự động trong pipeline. |
| Nâng cao | 16. Test strategy, plan & metrics | Từ tester giỏi thành người dẫn dắt chất lượng: quyết test tới đâu, đo gì, truyền đạt rủi ro. |
| Nâng cao | 17. Agile QA & làm việc với BrSE Nhật | Test liên tục, tham gia sớm, và giao tiếp bug/Q&A qua BrSE không tam sao thất bản. |

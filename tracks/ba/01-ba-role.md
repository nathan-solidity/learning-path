---
level: "basic"
order: 1
title: "Vai trò của BA trong dự án"
est: "2-3 giờ"
checklist:
  - "Phân biệt được BA với PM, PO, và Dev về trách nhiệm chính"
  - "Kể tên được 4 hoạt động cốt lõi của BA (elicitation, analysis, documentation, validation)"
  - "Giải thích được BA tạo giá trị gì cho dự án nếu bỏ vai trò này đi"
  - "Biết BA làm việc với những ai (stakeholder, dev, QA, BrSE/khách) và trao đổi cái gì"
related:
  - "glossary:ba"
  - "glossary:po"
  - "playbook:ba"
---

## BA là ai?

**Business Analyst (BA)** là cầu nối giữa **nhu cầu nghiệp vụ** (khách hàng, người dùng)
và **giải pháp kỹ thuật** (dev, QA). BA không quyết định "xây cái gì trước" (đó là PM/PO),
cũng không viết code — BA đảm bảo **mọi người hiểu đúng và đủ** cái cần xây.

## 4 hoạt động cốt lõi

| Hoạt động | Làm gì | Kết quả |
|-----------|--------|---------|
| **Elicitation** (khai thác) | Phỏng vấn, workshop, đọc tài liệu để lấy yêu cầu | Danh sách yêu cầu thô |
| **Analysis** (phân tích) | Làm rõ, phát hiện mâu thuẫn, gap, đánh giá impact | Yêu cầu đã được làm sạch |
| **Documentation** (tài liệu hóa) | Viết BRD/SRS/user story/spec | Tài liệu cho dev & QA dùng |
| **Validation** (xác nhận) | Review với stakeholder, đảm bảo đúng ý | Spec được duyệt |

## BA khác gì PM/PO/Dev?

- **PM**: quản tiến độ, nguồn lực, rủi ro. Quan tâm "khi nào xong, ai làm".
- **PO**: sở hữu product backlog, quyết định ưu tiên. Quan tâm "làm gì trước".
- **BA**: làm rõ **nội dung** của yêu cầu. Quan tâm "cụ thể nó phải làm gì, tại sao".
- **Dev**: hiện thực hóa. Quan tâm "làm thế nào".

> Trong nhiều dự án nhỏ, 1 người kiêm nhiều vai. Nhưng khi kiêm, đừng để mất góc nhìn BA:
> luôn hỏi "yêu cầu này đã đủ rõ để dev không phải đoán chưa?"

## Làm việc với ai

- **Khách hàng / BrSE**: lấy yêu cầu, xác nhận cách hiểu (đặc biệt quan trọng với khách Nhật).
- **Dev**: giải thích spec, trả lời câu hỏi khi implement.
- **QA**: cung cấp acceptance criteria để họ viết test case.

## Ghi nhớ

BA giỏi không phải người viết tài liệu dài nhất, mà là người khiến **cả team hiểu giống
nhau** về cái cần làm — trước khi tốn công code sai.

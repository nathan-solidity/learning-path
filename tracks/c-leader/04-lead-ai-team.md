---
level: "intermediate"
order: 4
title: "Dẫn dắt team làm việc với AI (AI-assisted)"
est: "3-4 giờ"
checklist:
  - "Xác định được khi nào nên tin và khi nào không nên tin output của AI"
  - "Áp dụng được quy trình review kết quả AI sinh trước khi merge"
  - "Duy trì được AI mistake log để rèn khả năng phán xét cho team"
  - "Nhận diện được các lỗi AI hay mắc (bịa API, version sai, bỏ edge case)"
  - "Đặt được ranh giới: việc nào cho AI làm, việc nào con người phải quyết"
related:
  - "skill:nta-auto-review"
  - "skill:nta-knowledge"
---

## AI là công cụ đòn bẩy, không phải người thay thế phán xét

AI (Claude, Copilot, ChatGPT) giúp team làm nhanh hơn: sinh boilerplate, viết test, giải
thích code, draft tài liệu. Nhưng AI **không chịu trách nhiệm** về đúng/sai — người merge
code mới chịu. Vai trò C-Leader: giúp team dùng AI **tăng tốc mà không tăng rủi ro**.

## Khi nào tin, khi nào không tin AI

| Tin hơn (nhưng vẫn kiểm) | Cẩn trọng cao |
|--------------------------|----------------|
| Boilerplate, code lặp mẫu | Logic nghiệp vụ đặc thù dự án |
| Giải thích khái niệm phổ biến | Số version thư viện, API cụ thể |
| Draft đầu tiên của test/tài liệu | Quyết định kiến trúc, bảo mật |
| Refactor cơ học có test bảo vệ | Migration dữ liệu, thay đổi schema |

Nguyên tắc: **AI mạnh ở cái phổ biến, yếu ở cái đặc thù**. Càng gần nghiệp vụ riêng của
dự án và khách Nhật, càng phải để con người quyết.

> Tình huống: member dùng AI sinh code gọi một hàm `dateUtils.formatJP()`. Nghe hợp lý,
> member copy vào luôn. Build fail — hàm đó **AI bịa ra**, không tồn tại trong lib. Đây là
> "hallucination": AI tự tin bịa API nghe rất thật.

## Lỗi AI hay mắc

- **Bịa API/hàm/tham số** không tồn tại (hallucination) — nghe rất thuyết phục.
- **Version sai**: dùng API cũ đã bỏ, hoặc cú pháp của version khác (ví dụ
  `WebSecurityConfigurerAdapter` đã bị xóa ở Spring Security 6 nhưng AI vẫn gợi ý).
- **Bỏ edge case**: sinh happy path, quên null/rỗng/âm/timeout.
- **Không biết context dự án**: dùng convention chung, phá convention riêng của team.
- **Tự tin sai**: giọng điệu chắc chắn kể cả khi bịa — dễ khiến người non tay tin theo.

## Quy trình review output AI

1. **Không copy mù**: member phải đọc hiểu từng dòng AI sinh, giải thích được nó làm gì.
2. **Verify điểm rủi ro**: check API/version có thật không, edge case có xử lý không.
3. **Chạy test**: code AI sinh phải qua test như code người viết — không ngoại lệ.
4. **Review như PR thường**: dùng `/nta-auto-review` quét lớp đầu, lead đọc phần nghiệp vụ.

Với khách Nhật đặc biệt cần cẩn trọng: đừng để AI dịch/diễn giải yêu cầu nghiệp vụ rồi
gửi thẳng — dễ sai thuật ngữ và sắc thái.

## AI mistake log — rèn phán xét cho team

Lập một log ghi lại **các lỗi AI mà team đã bắt được**: AI nào, sinh gì, sai chỗ nào, hậu
quả nếu lọt. Đây là công cụ đào tạo cực tốt:

| Ngày | AI | Lỗi sinh ra | Ai bắt | Bài học |
|------|-----|-------------|--------|---------|
| 08-10 | Claude | Bịa hàm `formatJP()` | Nam | Verify API tồn tại trước khi dùng |
| 08-12 | Copilot | Query thiếu WHERE tenant_id | Lan | AI không biết multi-tenant của dự án |

Cuối sprint, lead tổng hợp log → thấy pattern lỗi lặp → nhắc cả team. Log này biến "AI hay
sai" từ câu nói mơ hồ thành bài học cụ thể. Có thể lưu chung với knowledge base
(`/nta-knowledge`) để thăng cấp thành shared.

## Đặt ranh giới cho team

- **AI được làm**: draft, boilerplate, giải thích, gợi ý — luôn kèm review của người.
- **Con người phải quyết**: kiến trúc, bảo mật, migration, diễn giải nghiệp vụ khách, mọi
  thứ trước khi gửi ra ngoài team.
- **Người merge chịu trách nhiệm**: không có "tại AI viết thế". Bug là của người merge.

## Cạm bẫy hay gặp

- **Copy mù output AI** không đọc hiểu → bug + không học được gì.
- **Tin giọng tự tin của AI** → tin cả phần nó bịa.
- **Bỏ test cho code AI sinh** vì "nhìn có vẻ đúng" → lọt edge case.
- **Để AI diễn giải nghiệp vụ khách** rồi gửi thẳng → sai thuật ngữ, mất lòng tin khách.
- **Không log lỗi AI** → cả team lặp lại cùng sai lầm, không ai học.

## Ghi nhớ

AI là **đòn bẩy tốc độ, không thay phán xét**. Mạnh ở cái phổ biến, yếu ở cái đặc thù dự
án. Bắt team **không copy mù**, verify điểm rủi ro (API/version/edge case), và test như
code thường. Duy trì **AI mistake log** để biến lỗi thành bài học. Và luôn nhớ: **người
merge chịu trách nhiệm**, không đổ cho AI.

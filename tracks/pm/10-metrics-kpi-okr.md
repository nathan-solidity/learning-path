---
level: "intermediate"
order: 10
title: "Metrics, KPI & OKR"
est: "2-3 giờ"
checklist:
  - "Phân biệt được metric, KPI và OKR — và khi nào dùng cái nào"
  - "Chọn được KPI phù hợp cho dự án phần mềm (không đo cái dễ đo mà vô nghĩa)"
  - "Nhận ra và tránh được vanity metrics và gaming (chạy theo con số)"
  - "Viết được một Objective + Key Results đo được cho một quý"
  - "Hiểu định luật Goodhart và vì sao đo sai còn hại hơn không đo"
related:
  - "skill:nta-sprint-report"
  - "skill:nta-risk-assessment"
---

## Đo để quyết định, không phải để trang trí

"Cái gì đo được thì quản được" — nhưng chỉ đúng khi đo **đúng thứ**. PM ngập trong số liệu:
velocity, bug count, coverage... Bài này giúp bạn phân biệt số liệu **dẫn tới quyết định** với
số liệu chỉ để nhìn cho vui, và tránh cái bẫy lớn nhất: đội ngũ **chạy theo con số** thay vì mục
tiêu thật.

## Metric vs KPI vs OKR

| Khái niệm | Là gì | Ví dụ |
|-----------|-------|-------|
| **Metric** | Bất kỳ số nào đo được | Số commit, số bug, số giờ họp |
| **KPI** (Key Performance Indicator) | Metric **then chốt** phản ánh sức khỏe/hiệu quả | Defect escape rate, on-time delivery rate |
| **OKR** (Objectives & Key Results) | Khung đặt **mục tiêu tham vọng** + kết quả đo được | Objective: "Nâng chất lượng release"; KR: "escape rate < 2%" |

> Không phải metric nào cũng là KPI. KPI là **số ít** (3-5) metric bạn thật sự dùng để lái dự án.
> Nhét 20 chỉ số vào dashboard = không có KPI nào cả, vì không biết nhìn cái nào.

## Chọn KPI cho dự án phần mềm

KPI tốt thường ghép **nhiều góc** để không bị bóp méo một chiều:

| Góc | KPI ví dụ |
|-----|-----------|
| Tiến độ | On-time delivery rate, sprint goal hit rate |
| Chất lượng | Defect escape rate, rework rate |
| Hiệu quả | Velocity (xu hướng, không so team khác), cycle time |
| Con người | Team satisfaction, turnover (giữ người) |

> Đo tiến độ **mà quên chất lượng** → team chạy đua ship và đẩy bug ra prod. Luôn ghép cặp: một
> KPI tốc độ đi kèm một KPI chất lượng, để không tối ưu một chiều thành hại chiều kia.

## Vanity metrics — số liệu phù phiếm

**Vanity metric** là số nhìn oai nhưng không dẫn tới quyết định nào:

- Số dòng code viết (nhiều code hơn không phải tốt hơn).
- Số commit (chia nhỏ commit là ra nhiều).
- Số giờ làm (đo mặt trời chứ không đo kết quả).

> Hỏi kiểm chứng: *"Nếu số này tăng/giảm, tôi sẽ làm gì khác đi?"* Nếu câu trả lời là "không gì
> cả" → đó là vanity metric, bỏ khỏi dashboard.

## Goodhart's Law & gaming

> **Định luật Goodhart: khi một chỉ số trở thành mục tiêu, nó thôi là chỉ số tốt.**

Khi bạn thưởng/phạt theo một con số, người ta sẽ tối ưu **con số** thay vì thứ nó đại diện:

- Đo "số bug tìm được" → QA báo cả bug rác cho đủ số.
- Đo "số bug của dev" → dev giấu bug, không dám báo.
- Đo "velocity phải tăng" → team thổi phồng story point.

> Đây là lý do đo lường **để cải tiến quy trình, không để chấm điểm cá nhân** (nhắc lại từ bài 7).
> Một khi con số gắn với thưởng phạt cá nhân, nó bị gaming và mất giá trị chẩn đoán.

## Viết một OKR đo được

**Objective** — định tính, truyền cảm hứng, hướng đích. **Key Results** — định lượng, đo được,
2-4 cái cho mỗi Objective.

> **Objective:** Nâng độ tin cậy của release trong Q3.
> - **KR1:** Defect escape rate giảm từ 8% xuống dưới 3%.
> - **KR2:** 95% sprint đạt sprint goal (hiện 70%).
> - **KR3:** Thời gian hotfix trung bình < 1 ngày.

KR phải đủ tham vọng để khó chắc chắn đạt 100%, nhưng đo được rạch ròi (đạt/không, không mơ hồ).

## Cạm bẫy hay gặp

- **Nhồi 20 chỉ số vào dashboard** → không có KPI nào thật sự, không ai nhìn.
- **Chỉ đo tốc độ, bỏ chất lượng** → team đua ship, đẩy bug ra prod.
- **Theo dõi vanity metrics** → tưởng đang quản lý, thực ra đo nhầm.
- **Gắn con số với thưởng phạt cá nhân** → Goodhart, người ta game con số.
- **OKR mơ hồ** ("cải thiện chất lượng") → không đo được thì không biết đạt hay chưa.

## Ghi nhớ

**Metric** là mọi số; **KPI** là số ít then chốt để lái dự án; **OKR** là khung mục tiêu tham vọng
+ kết quả đo được. Ghép cặp KPI tốc độ với chất lượng để không tối ưu một chiều. Loại **vanity
metric** bằng câu hỏi "số này đổi thì tôi làm gì khác?". Và luôn nhớ **Goodhart**: đo để **cải
tiến quy trình**, đừng biến con số thành mục tiêu chấm điểm cá nhân — nó sẽ bị game.

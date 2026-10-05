---
level: "basic"
order: 1
title: "Vai trò PM & vòng đời dự án"
est: "2-3 giờ"
checklist:
  - "Phân biệt được PM với PO, BA, và Lead về trách nhiệm chính"
  - "Kể tên được các pha trong vòng đời dự án (initiation → planning → execution → closing)"
  - "Giải thích được triple constraint (scope/time/cost) và tại sao không thể cố định cả ba"
  - "So sánh được khi nào dùng Waterfall, khi nào dùng Agile/Scrum"
  - "Biết PM chịu trách nhiệm gì khi làm việc với khách Nhật qua BrSE"
related:
  - "skill:nta-meeting-notes"
  - "skill:nta-sprint-report"
---

## PM là ai?

**Project Manager (PM)** chịu trách nhiệm đưa dự án **về đích đúng phạm vi, đúng hạn, đúng
chi phí** với chất lượng cam kết. PM không quyết định "xây cái gì" (đó là PO/khách), cũng
không viết code — PM đảm bảo **đúng người làm đúng việc, đúng lúc**, và mọi rủi ro được nhìn
thấy trước khi thành sự cố.

## PM khác gì PO / BA / Lead?

| Vai | Quan tâm chính | Câu hỏi đặc trưng |
|-----|----------------|-------------------|
| **PM** | Tiến độ, nguồn lực, rủi ro, ngân sách | "Khi nào xong? Ai làm? Đang kẹt gì?" |
| **PO** | Giá trị sản phẩm, ưu tiên backlog | "Làm gì trước để đem lại giá trị?" |
| **BA** | Nội dung yêu cầu, làm rõ spec | "Cụ thể nó phải làm gì, tại sao?" |
| **Lead** | Chất lượng kỹ thuật, kiến trúc | "Làm thế nào cho đúng và bền?" |

> Ở dự án offshore nhỏ, một người thường kiêm PM + Lead. Khi kiêm, đừng để góc nhìn quản lý
> bị code lấn át: vẫn phải hỏi "task này ai đang làm, còn bao lâu, có block ai không?".

## Vòng đời dự án

![Vòng đời dự án initiation→closing; chi phí sửa lỗi tăng dần, rất cao nếu lọt tới production](/images/pm-sdlc-cost.png)

| Pha | PM làm gì | Sản phẩm |
|-----|-----------|----------|
| **Initiation** | Xác định mục tiêu, stakeholder, ràng buộc | Project charter |
| **Planning** | WBS, lịch, ước lượng, kế hoạch rủi ro | Project plan |
| **Execution** | Điều phối team, theo dõi tiến độ, gỡ block | Sản phẩm bàn giao |
| **Monitoring** | So kế hoạch vs thực tế, điều chỉnh | Báo cáo tiến độ |
| **Closing** | Bàn giao, retrospective, lưu lesson learned | Post-mortem |

## Triple constraint (scope / time / cost)

Ba yếu tố ràng buộc lẫn nhau như một tam giác — **không thể cố định cả ba** cùng lúc. Chất
lượng nằm ở giữa và chịu ảnh hưởng khi một cạnh bị bóp méo.

![Tam giác scope–time–cost, quality ở giữa; đổi 1 cạnh phải đánh đổi cạnh khác](/images/pm-triple-constraint.png)

| Khách muốn thêm | PM đối thoại |
|-----------------|--------------|
| Thêm scope, giữ deadline | Phải tăng cost (thêm người) hoặc giảm scope khác |
| Rút ngắn deadline | Cắt scope hoặc tăng người (không tuyến tính!) |
| Cắt cost | Giảm scope hoặc chấp nhận trễ |

> Sai lầm kinh điển: khách thêm yêu cầu nhưng deadline giữ nguyên, PM im lặng nhận. Kết quả
> team OT, chất lượng rớt. PM giỏi phải nói rõ đánh đổi **ngay khi** scope đổi.

## Waterfall vs Agile/Scrum

| | Waterfall | Agile/Scrum |
|---|-----------|-------------|
| Yêu cầu | Cố định từ đầu | Tiến hóa theo sprint |
| Bàn giao | Một lần cuối | Từng phần, mỗi sprint |
| Phù hợp | Scope rõ, ít thay đổi (nhiều dự án Nhật kiểu SES) | Scope còn mờ, cần feedback sớm |
| Rủi ro chính | Phát hiện sai muộn | Scope creep nếu không kỷ luật |

> Nhiều khách Nhật quen quy trình gần Waterfall (spec chốt kỹ trước, kiểm thử nghiệm thu cuối).
> Kể cả khi team chạy Scrum nội bộ, PM vẫn phải map các mốc sprint về **milestone khách nhìn thấy**.

## PM offshore với khách Nhật (qua BrSE)

- **BrSE là kênh**, không phải người quyết định thay khách. PM cung cấp cho BrSE dữ liệu rõ
  ràng (tiến độ, rủi ro, câu hỏi) để BrSE truyền đạt chính xác.
- Báo cáo tiến độ **minh bạch và định kỳ** — khách Nhật rất coi trọng "hourensou" (báo cáo /
  liên lạc / bàn bạc). Đừng để khách bất ngờ vì tin xấu đến muộn.
- Vấn đề nhỏ báo sớm còn hơn vấn đề lớn báo trễ.

## Cạm bẫy hay gặp

- **Nhận thêm scope mà không điều chỉnh time/cost** → team OT, chất lượng rớt.
- **Nghĩ thêm người = xong nhanh hơn** → Brooks' Law: thêm người vào dự án trễ có thể làm nó
  trễ hơn (chi phí onboarding + giao tiếp).
- **Báo cáo chỉ toàn màu xanh** → khách mất niềm tin khi sự thật lộ ra.
- **Lẫn lộn vai PM và PO** → PM tự quyết ưu tiên business thay khách, dẫn tới làm sai thứ tự.

## Ghi nhớ

PM giữ cho dự án đi đúng **scope–time–cost**, không tự quyết business (PO) và không thay
Lead về kỹ thuật. Không cố định được cả ba cạnh tam giác — khi một cạnh đổi, phải nói rõ
đánh đổi. Với khách Nhật, **báo cáo sớm và minh bạch** quan trọng hơn báo cáo đẹp.

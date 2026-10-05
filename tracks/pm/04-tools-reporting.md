---
level: "basic"
order: 4
title: "Công cụ PM & báo cáo tiến độ"
est: "2 giờ"
checklist:
  - "Biết dùng issue tracker (Backlog/Jira) để quản lý task, trạng thái, người phụ trách"
  - "Đọc và giải thích được Gantt chart và bảng Kanban"
  - "Viết được một báo cáo tiến độ ngắn theo cấu trúc: tiến độ / rủi ro / cần hỗ trợ"
  - "Áp dụng nguyên tắc hourensou (報連相) khi báo cáo cho khách Nhật"
  - "Chọn được nhịp báo cáo phù hợp (daily/weekly) theo đối tượng nhận"
---

## Công cụ là để nhìn thấy sự thật, không phải để đẹp

PM không quản lý bằng cảm giác. Công cụ tồn tại để trả lời nhanh ba câu: **việc gì đang làm, ai
làm, đang kẹt gì**. Bài này điểm qua các công cụ lõi và — quan trọng hơn — cách **báo cáo** để
khách và team luôn nhìn cùng một sự thật.

## Issue tracker (Backlog / Jira / Redmine)

Trái tim của quản lý task. Mỗi task nên có tối thiểu:

| Trường | Vì sao cần |
|--------|-----------|
| **Người phụ trách** | Không có owner = không ai làm |
| **Trạng thái** | Todo / Doing / Review / Done — biết việc đang ở đâu |
| **Ưu tiên** | Khi thiếu thời gian còn biết cắt cái nào |
| **Hạn (due date)** | Phát hiện trễ trước khi quá muộn |
| **Estimate vs actual** | Học để ước lượng tốt hơn (bài 5) |

> Ở dự án với khách Nhật, issue tracker (thường là **Backlog**) là nơi khách/BrSE nhìn vào để
> nắm tình hình. Task mô tả rõ ràng, trạng thái cập nhật kịp thời chính là **báo cáo tự động** —
> giảm hẳn số câu hỏi "cái này tới đâu rồi?".

## Gantt chart vs Kanban board

Hai cách nhìn khác nhau, dùng cho mục đích khác nhau:

- **Gantt chart** — timeline theo thời gian, thể hiện **dependency và milestone**. Tốt để lập kế
  hoạch và trình bày cho khách "khi nào xong cái gì". Điểm yếu: dễ lỗi thời khi thực tế lệch.
- **Kanban board** — cột trạng thái (Todo/Doing/Done), thể hiện **dòng công việc hiện tại**. Tốt
  để team vận hành hằng ngày và phát hiện tắc nghẽn (cột Doing phình to = quá tải).

> Đừng cố quản mọi thứ bằng một Gantt khổng lồ rồi tô lại mỗi ngày — nó ngốn thời gian và luôn
> sai. Dùng Gantt cho **bức tranh lớn/milestone**, Kanban cho **vận hành ngày**.

## Báo cáo tiến độ: cấu trúc tối giản

Một báo cáo tốt trả lời đúng ba điều, ngắn gọn:

| Phần | Nội dung |
|------|----------|
| **Tiến độ** | Đã xong gì so với kế hoạch (dùng số: X/Y task, % milestone) |
| **Rủi ro / vấn đề** | Cái gì đang hoặc sắp chệch, mức ảnh hưởng |
| **Cần hỗ trợ** | Cần khách/sếp quyết gì, cho gì để đi tiếp |

> Báo cáo **không phải nhật ký**. Khách không cần biết "hôm nay tôi họp 3 tiếng"; họ cần biết
> **có về đích đúng hạn không, và nếu không thì cần làm gì**. Viết cho người đọc bận, không có
> thời gian.

## Hourensou (報連相) — nguyên tắc báo cáo kiểu Nhật

Ba chữ khách Nhật cực coi trọng:

- **報 (Hou / báo cáo)** — báo cáo tiến độ & kết quả định kỳ, chủ động.
- **連 (Ren / liên lạc)** — chia sẻ thông tin, thay đổi kịp thời cho các bên liên quan.
- **相 (Sou / bàn bạc)** — hỏi/bàn **trước** khi quyết việc quan trọng hoặc khi gặp khó, đừng tự
  quyết rồi báo sau.

> Điểm cốt lõi: **tin xấu báo sớm**. Khách Nhật chấp nhận vấn đề được báo sớm hơn nhiều so với
> một bất ngờ tệ đến muộn. "Có lẽ sẽ trễ 3 ngày" nói hôm nay tốt hơn "đã trễ" nói vào deadline.
> Im lặng để "tự lo được" là điều tối kỵ trong văn hóa làm việc Nhật.

## Chọn nhịp báo cáo theo đối tượng

| Đối tượng | Nhịp | Nội dung |
|-----------|------|----------|
| Team nội bộ | Hằng ngày (daily) | Đồng bộ nhanh, gỡ block |
| BrSE / khách | Hằng tuần + khi có việc lớn | Tiến độ milestone, rủi ro, quyết định cần |
| Sếp / stakeholder cấp cao | 2 tuần / theo mốc | Bức tranh lớn, ngân sách, rủi ro nghiêm trọng |

## Cạm bẫy hay gặp

- **Task không có owner hoặc trạng thái cũ** → tracker thành nghĩa địa, không phản ánh thật.
- **Báo cáo toàn màu xanh** → giấu rủi ro, khách mất niềm tin khi sự thật lộ.
- **Báo cáo dài như nhật ký** → người đọc bỏ qua, thông tin quan trọng chìm.
- **Chỉ báo khi được hỏi** → vi phạm hourensou, khách cảm thấy mất kiểm soát.
- **Quản mọi thứ bằng Gantt tô tay mỗi ngày** → tốn công, luôn lỗi thời.

## Ghi nhớ

Công cụ để **nhìn thấy sự thật**: issue tracker (ai/gì/trạng thái/hạn), Gantt cho bức tranh lớn,
Kanban cho dòng việc ngày. Báo cáo theo cấu trúc **tiến độ / rủi ro / cần hỗ trợ** — ngắn, dùng
số, viết cho người bận. Với khách Nhật, sống theo **hourensou**: báo cáo chủ động, liên lạc kịp
thời, bàn trước khi quyết — và **tin xấu luôn báo sớm**.

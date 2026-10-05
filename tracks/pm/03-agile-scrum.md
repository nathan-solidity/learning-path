---
level: "basic"
order: 3
title: "Agile & Scrum cho PM"
est: "2-3 giờ"
checklist:
  - "Giải thích được 4 giá trị cốt lõi của Agile Manifesto bằng ngôn ngữ của mình"
  - "Kể được 3 vai trò Scrum (PO, Scrum Master, Dev team) và ranh giới trách nhiệm"
  - "Nắm 5 sự kiện Scrum và mục đích từng cái (không chỉ tên)"
  - "Phân biệt được product backlog và sprint backlog"
  - "Biết khi nào Scrum không phù hợp và nên chọn Kanban/Waterfall"
---

## Vì sao PM cần hiểu Agile sâu hơn "chạy sprint"

Bài 1 đã so Waterfall vs Agile ở mức tổng quan. Bài này đi sâu vào **cách Scrum vận hành thật**
— vì phần lớn team dev hiện chạy Scrum (hoặc biến thể), và PM không nắm rõ khung này sẽ điều
phối sai nhịp: họp thừa, backlog loạn, hoặc vô tình giẫm chân Scrum Master.

## Agile Manifesto — 4 giá trị

Agile không phải "làm nhanh không cần kế hoạch". Nó là bốn ưu tiên khi phải chọn:

| Ưu tiên | Hơn là | Nghĩa thực dụng cho PM |
|---------|--------|------------------------|
| **Cá nhân & tương tác** | quy trình & công cụ | Đừng để tool/process cản giao tiếp thẳng trong team |
| **Phần mềm chạy được** | tài liệu đầy đủ | Đo tiến độ bằng feature chạy được, không phải trang tài liệu |
| **Hợp tác với khách** | đàm phán hợp đồng | Kéo khách/BrSE vào sớm thay vì cãi nhau về câu chữ hợp đồng |
| **Phản ứng thay đổi** | bám kế hoạch | Kế hoạch là điểm xuất phát, không phải xiềng xích |

> Vế phải **vẫn có giá trị** — Agile chỉ nói vế trái quan trọng hơn *khi phải chọn*. Đừng
> hiểu nhầm thành "không cần tài liệu, không cần kế hoạch". Với khách Nhật, tài liệu và kế hoạch
> vẫn rất quan trọng; PM phải cân bằng chứ không bỏ.

## Ba vai trò trong Scrum

- **Product Owner (PO)** — sở hữu "làm gì" và thứ tự ưu tiên backlog. Là tiếng nói của giá trị
  business. Trong offshore, vai này thường ở phía khách/BrSE.
- **Scrum Master** — bảo vệ quy trình, gỡ vật cản (impediment), coaching team. **Không phải sếp**
  của team, mà là người phục vụ (servant leader).
- **Development team** — tự tổ chức để biến backlog thành sản phẩm. Ai làm task nào là team tự
  quyết trong sprint.

> PM **không** nằm trong ba vai trò Scrum kinh điển. Ở dự án nhỏ, PM hay kiêm Scrum Master hoặc
> một phần PO. Khi kiêm, hãy ý thức mình đang đội mũ nào: đội mũ SM thì phục vụ team, đội mũ PM
> thì lo scope–time–cost với khách. Đừng lẫn hai vai làm team rối.

## Năm sự kiện Scrum

![Luồng Scrum: product backlog → planning → sprint backlog → sprint (daily) → review → retrospective → lặp lại](/images/pm-scrum-flow.png)

| Sự kiện | Khi nào | Mục đích |
|---------|---------|----------|
| **Sprint** | Chu kỳ 1-4 tuần | Khung thời gian cố định để tạo một phần sản phẩm dùng được |
| **Sprint Planning** | Đầu sprint | Chọn item từ backlog vào sprint, cam kết mục tiêu |
| **Daily Scrum** | Mỗi ngày, ≤15 phút | Đồng bộ nhanh: hôm qua/hôm nay/vật cản. Không phải báo cáo cho sếp |
| **Sprint Review** | Cuối sprint | Demo sản phẩm cho stakeholder, lấy feedback |
| **Retrospective** | Cuối sprint | Team tự soi cách làm việc, chọn 1-2 điểm cải tiến |

> Sai lầm phổ biến: biến Daily Scrum thành cuộc họp báo cáo tiến độ cho PM/khách. Daily là để
> **team đồng bộ với nhau** — nếu nó thành nơi từng người báo cáo cho sếp, nó mất tác dụng và
> team sẽ chán. Báo cáo cho khách/BrSE dùng kênh khác (bài 4).

## Backlog: product vs sprint

- **Product backlog** — danh sách **mọi thứ** cần làm cho sản phẩm, PO ưu tiên. Sống, luôn đổi.
- **Sprint backlog** — tập con team **cam kết** làm trong sprint hiện tại. Đóng băng trong sprint
  (thay đổi giữa sprint là dấu hiệu planning kém hoặc scope creep).

## Khi nào KHÔNG nên dùng Scrum

Scrum không phải chân lý cho mọi dự án:

- **Công việc luồng liên tục, ưu tiên đổi xoành xoạch** (vận hành, hỗ trợ) → **Kanban** hợp hơn.
- **Scope chốt cứng, hợp đồng 受託 kiểu Waterfall** → chạy theo pha có kiểm soát, Scrum nội bộ
  chỉ để quản lý công việc, còn mốc bàn giao vẫn theo hợp đồng.
- **Team quá nhỏ (1-2 người)** → nghi thức Scrum đầy đủ thành gánh nặng; lấy phần nhẹ (backlog +
  review) là đủ.

## Cạm bẫy hay gặp

- **"Cargo cult" Scrum** → làm đủ nghi thức nhưng không hiểu mục đích; họp cho có, không cải tiến.
- **PM lấn vai Scrum Master/PO mà không ý thức** → team nhận tín hiệu mâu thuẫn.
- **Daily thành họp báo cáo cho sếp** → mất mục đích đồng bộ, team chán.
- **Đổi sprint backlog giữa chừng liên tục** → team không bao giờ hoàn thành cam kết, velocity vô nghĩa.
- **Áp Scrum cho việc vận hành/hỗ trợ** → nên dùng Kanban.

## Ghi nhớ

Agile là **4 ưu tiên khi phải chọn**, không phải bỏ kế hoạch/tài liệu. Scrum có **3 vai** (PO/SM/
Dev), **5 sự kiện** (Sprint + Planning/Daily/Review/Retro), và **2 backlog** (product do PO ưu tiên,
sprint do team cam kết). PM thường kiêm SM hoặc PO ở dự án nhỏ — phải ý thức đang đội mũ nào. Và
Scrum không phải lúc nào cũng đúng: việc luồng liên tục dùng Kanban, hợp đồng chốt cứng theo pha.

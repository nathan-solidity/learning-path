---
level: "intermediate"
order: 5
title: "Ước lượng effort & quản lý sprint"
est: "3-4 giờ"
checklist:
  - "Giải thích được khác biệt giữa story point (tương đối) và giờ (tuyệt đối)"
  - "Chạy được một buổi planning poker và xử lý khi team lệch điểm nhau"
  - "Tính được velocity của team qua vài sprint và dùng nó để dự báo"
  - "Đọc được burndown chart và nhận ra sprint đang lệch tiến độ"
  - "Tính được năng lực (capacity) sprint sau khi trừ nghỉ/họp/buffer"
  - "Phân biệt vai trò của sprint planning, review, và retrospective"
---

## Story point vs giờ

| | Story point | Giờ |
|---|-------------|-----|
| Đo | Độ **phức tạp/công sức tương đối** | Thời gian tuyệt đối |
| Ổn định | Cao (không đổi theo người) | Thấp (nhanh/chậm khác nhau) |
| Dùng để | Dự báo qua velocity | Lập lịch chi tiết ngắn hạn |
| Thang | Fibonacci: 1, 2, 3, 5, 8, 13 | 4h, 8h, 16h... |

Dùng Fibonacci vì việc càng lớn thì ước lượng càng **kém chính xác** — khoảng cách rộng dần
phản ánh sự bất định đó. Một story **13+ điểm** là dấu hiệu cần **chẻ nhỏ** trước khi vào sprint.

> Story point không quy đổi cứng ra giờ. Cùng "5 điểm" nhưng dev senior làm 1 ngày, junior
> làm 3 ngày — velocity của **team** mới là thứ dùng để dự báo, không phải "1 điểm = X giờ".

## Planning poker

Cả team ước lượng độc lập rồi lật bài cùng lúc, tránh bị "neo" theo người nói trước.

1. BA/PO đọc story + acceptance criteria.
2. Mỗi người chọn 1 lá (1/2/3/5/8/13).
3. Lật cùng lúc. Nếu lệch nhiều → **người cao nhất và thấp nhất giải thích** vì sao.
4. Ước lượng lại tới khi hội tụ.

> Điểm lệch nhau không phải để "ép về giữa" mà là **tín hiệu hiểu khác nhau** về story —
> thường lộ ra edge case hoặc phần spec còn mờ. Đó là giá trị lớn nhất của buổi poker.

## Velocity

**Velocity** = số điểm team **hoàn thành thật** (Done, không phải "gần xong") mỗi sprint.

| Sprint | Điểm cam kết | Điểm Done |
|--------|--------------|-----------|
| 1 | 30 | 22 |
| 2 | 25 | 26 |
| 3 | 28 | 24 |

Velocity trung bình ≈ **(22 + 26 + 24) / 3 = 24 điểm/sprint**. Nếu backlog còn **120 điểm**
→ dự báo cần **120 / 24 = 5 sprint** nữa. Đây là cách trả lời khách "bao giờ xong" bằng
**dữ liệu**, không phải cảm tính.

> Velocity chỉ đáng tin sau **3+ sprint** với team ổn định. Đừng so velocity giữa hai team
> khác nhau — điểm là thang tương đối nội bộ mỗi team.

## Capacity (năng lực sprint)

Trước khi cam kết sprint, tính năng lực thực có:

| Yếu tố | Ví dụ |
|--------|-------|
| Số dev | 4 người |
| Ngày làm/sprint | 10 ngày |
| Trừ nghỉ phép | -3 ngày công (1 người nghỉ 3 ngày) |
| Trừ họp/support | -15% |
| **Năng lực thực** | (4×10 − 3) × 0.85 ≈ **31 ngày công** |

Cam kết vượt capacity là nguyên nhân số 1 khiến sprint fail. Nếu velocity nói 24 điểm nhưng
sprint này có người nghỉ → **cam kết thấp hơn**, đừng bê nguyên trung bình.

## Burndown chart

Đường đo **điểm còn lại** giảm dần theo ngày trong sprint.

| Ngày | Lý tưởng | Thực tế |
|------|----------|---------|
| 1 | 30 | 30 |
| 5 | 15 | 24 |
| 8 | 6 | 20 |
| 10 | 0 | 12 |

Đường thực tế nằm **cao hơn** đường lý tưởng nhiều → sprint đang trễ. Phát hiện ở ngày 5 còn
kịp xử lý (gỡ block, cắt story thừa); phát hiện ngày 10 thì đã muộn. Đường **phẳng ngang**
vài ngày = có blocker cần PM can thiệp ngay.

## Ba nghi thức sprint

| Nghi thức | Khi nào | Mục đích |
|-----------|---------|----------|
| **Planning** | Đầu sprint | Chọn story vừa capacity, làm rõ AC |
| **Review** | Cuối sprint | Demo cái đã Done cho PO/khách |
| **Retrospective** | Cuối sprint | Team tự cải tiến cách làm việc |

> Review nói về **sản phẩm** (khách quan tâm), retro nói về **quy trình** (nội bộ team). Đừng
> gộp — gộp thì retro biến thành báo cáo cho sếp, không ai dám nói thật để cải tiến.

## Cạm bẫy hay gặp

- **Quy đổi cứng "1 điểm = X giờ"** → mất ý nghĩa tương đối của point.
- **Tính velocity gồm cả story "gần xong"** → dự báo lạc quan giả tạo, luôn trễ.
- **Cam kết theo velocity trung bình mà quên trừ nghỉ/họp** → vượt capacity, sprint fail.
- **Chỉ nhìn burndown ngày cuối** → phát hiện trễ khi đã hết cứu.
- **Bỏ retro vì "bận"** → team lặp lại cùng lỗi sprint này qua sprint khác.

## Ghi nhớ

Story point đo **độ phức tạp tương đối**, không phải giờ. **Velocity** (điểm Done thật, sau
3+ sprint) là công cụ dự báo bằng dữ liệu. Trước khi cam kết luôn tính **capacity** trừ
nghỉ/họp. **Burndown** đọc sớm để cứu kịp. Và giữ đủ ba nghi thức — nhất là **retro**, nơi
team tự khá lên.

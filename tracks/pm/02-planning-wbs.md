---
level: "basic"
order: 2
title: "Lập kế hoạch & WBS"
est: "3-4 giờ"
checklist:
  - "Phân rã được một feature thành WBS 2-3 tầng với task ước lượng được"
  - "Phân biệt được milestone với task, và deliverable với activity"
  - "Vẽ được dependency giữa task (finish-to-start) và nhận ra critical path"
  - "Tính được thời lượng dự án tối thiểu dựa trên critical path"
  - "Cộng được buffer rủi ro hợp lý thay vì cam kết theo ước lượng lạc quan nhất"
related:
  - "skill:nta-wbs"
  - "skill:nta-effort-estimate"
---

## WBS là gì

**WBS (Work Breakdown Structure)** là cách phân rã dự án thành các phần nhỏ dần tới mức
**ước lượng và giao được cho một người**. Nguyên tắc: mỗi mức con **cộng lại = đúng cha**,
không thừa không thiếu (100% rule).

Ví dụ phân rã feature "Đăng nhập":

| WBS | Task | Est (giờ) |
|-----|------|-----------|
| 1 | **Đăng nhập** | |
| 1.1 | API login (BE) | 8 |
| 1.2 | Màn hình login (FE) | 6 |
| 1.3 | Validate + error handling | 4 |
| 1.4 | Test case + QA | 5 |
| 1.5 | Tài liệu API | 2 |
| | **Tổng** | **25** |

> Task lá nên ở mức **4–16 giờ**. Nhỏ hơn thì quản lý vụn; lớn hơn thì khó ước lượng đúng và
> khó biết "đang kẹt" cho tới khi quá muộn.

## Milestone vs task

- **Task / activity**: việc cần làm, có thời lượng (`API login: 8h`).
- **Milestone**: một mốc, **thời lượng = 0**, đánh dấu điều gì đó hoàn tất (`Spec chốt`,
  `UAT bắt đầu`, `Release`). Milestone là điểm khách Nhật nhìn vào để biết dự án tới đâu.

## Dependency & critical path

Các task phụ thuộc nhau. Loại phổ biến nhất là **finish-to-start (FS)**: B chỉ bắt đầu khi A
xong (FE gọi API xong mới integrate được).

**Critical path** = chuỗi task dài nhất quyết định thời lượng tối thiểu của dự án. Trễ một
task trên đường này → **trễ cả dự án**.

Ví dụ: 3 luồng chạy song song, mỗi luồng có thời lượng khác nhau

| Luồng | Task | Tổng (ngày) |
|-------|------|-------------|
| A | Spec → BE → Integrate | 3 + 5 + 2 = **10** |
| B | Spec → FE → Integrate | 3 + 4 + 2 = 9 |
| C | Spec → Chuẩn bị hạ tầng | 3 + 2 = 5 |

Critical path là **luồng A = 10 ngày** → dự án không thể xong dưới 10 ngày dù luồng B, C rảnh
sớm. Muốn rút ngắn dự án, phải rút ngắn **task trên critical path**, không phải task rảnh rỗi.

> Đừng dồn nguồn lực vào luồng đang "rảnh" (float lớn). Ưu tiên tăng tốc/gỡ block cho task
> nằm trên critical path — đó mới là thứ đẩy được ngày về đích.

## Buffer rủi ro

Ước lượng luôn có bất định. Cam kết theo con số lạc quan nhất là công thức để trễ. Thêm
**buffer** dựa trên độ không chắc chắn:

| Loại việc | Độ chắc chắn | Buffer đề xuất |
|-----------|--------------|----------------|
| Việc đã làm nhiều lần | Cao | +10% |
| Feature mới, tech quen | Trung bình | +20–30% |
| Tech mới / spec còn mờ | Thấp | +40–50% |

Ví dụ: tổng ước lượng "sạch" của module = 100 ngày công, phần lớn là feature mới → cam kết
với khách **130 ngày** (buffer 30%), không phải 100. Buffer đặt ở **cấp dự án**, không rải
đều vào từng task (tránh định luật Parkinson: việc nở ra cho vừa thời gian được cấp).

## Cạm bẫy hay gặp

- **Task lá quá to** (vài chục giờ) → không biết đang kẹt cho tới khi quá muộn.
- **Bỏ quên task "vô hình"**: QA, code review, fix bug, họp, tài liệu, deploy → kế hoạch thiếu 20–30%.
- **Cam kết theo ước lượng lạc quan** không buffer → trễ hệ thống.
- **Không xác định critical path** → tăng tốc nhầm luồng đang rảnh, ngày về đích không nhúc nhích.
- **Rải buffer vào từng task** → mỗi task nở ra vừa hết buffer (Parkinson), tổng vẫn trễ.

## Ghi nhớ

WBS phân rã tới mức **ước lượng và giao được** (4–16h/task), mỗi mức con cộng lại đúng bằng
cha. Milestone là mốc 0-thời-lượng để khách nhìn tiến độ. **Critical path** quyết định ngày
về đích — muốn nhanh phải tăng tốc đúng luồng đó. Và luôn cam kết kèm **buffer** đặt ở cấp
dự án, không theo con số lạc quan nhất.

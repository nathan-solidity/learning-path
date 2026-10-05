---
level: "advanced"
order: 7
title: "Reliability & incident (SRE)"
est: "5-6 giờ"
checklist:
  - "Giải thích được error budget và cách nó cân bằng giữa tốc độ ra tính năng và độ ổn định"
  - "Mô tả vòng đời một incident: detect → triage → mitigate → resolve → post-mortem"
  - "Phân biệt mitigate (chặn chảy máu) và fix root cause, và vì sao mitigate luôn ưu tiên trước"
  - "Viết được post-mortem blameless tập trung vào hệ thống thay vì đổ lỗi cá nhân"
  - "Giải thích RTO/RPO và vì sao 'có backup' khác với 'đã kiểm chứng restore được'"
---

## SRE nhìn reliability như một bài toán kỹ thuật

**SRE** (Site Reliability Engineering) coi độ tin cậy là thứ **đo được và quản lý được**, không
phải "cố gắng đừng để sập". Nối tiếp bài monitoring (SLI/SLO): khi đã đo được service, câu hỏi
tiếp theo là **dùng số đó để ra quyết định thế nào** — và **xử lý ra sao khi có sự cố**.

## Error budget — ngân sách được phép hỏng

Nếu SLO là **99.9%** uptime, thì **0.1%** còn lại là **error budget** — lượng "được phép hỏng"
trong kỳ (khoảng **43 phút/tháng**).

| Trạng thái budget | Hàm ý |
|-------------------|-------|
| Còn nhiều | Cứ deploy nhanh, thử nghiệm — rủi ro nằm trong ngưỡng chấp nhận |
| Sắp cạn | Chậm lại, siết review, ưu tiên fix ổn định hơn ra tính năng mới |
| Đã cạn | Freeze feature, dồn toàn lực vào reliability cho tới khi hồi budget |

> Error budget biến cuộc tranh cãi "dev muốn ra nhanh vs ops muốn ổn định" thành **một con số
> chung**. Còn budget thì được phép mạo hiểm; hết budget thì cả team đồng thuận phanh lại. Không
> ai phải cãi nhau bằng cảm tính.

## Vòng đời một incident

```
Detect     → alert/monitor phát hiện bất thường (lý tưởng: trước khi user báo)
  ↓
Triage     → đánh giá mức độ ảnh hưởng, cử incident commander, mở kênh liên lạc
  ↓
Mitigate   → CHẶN CHẢY MÁU trước: rollback, tắt feature flag, scale up, failover
  ↓
Resolve    → khôi phục hoàn toàn, xác nhận metric về bình thường
  ↓
Post-mortem→ phân tích root cause, rút action item để không tái diễn
```

> **Mitigate trước, fix root cause sau.** Khi đang sập, mục tiêu số một là **khôi phục dịch vụ**
> cho user — rollback về version cũ ngay còn hơn ngồi debug nguyên nhân trong lúc tiền và uy tín
> đang chảy máu. Tìm root cause là việc của post-mortem, làm sau khi đã cầm máu.

Vai trò **Incident Commander**: một người điều phối (không nhất thiết là người giỏi kỹ thuật
nhất) — quyết định, phân công, giữ liên lạc — để tránh cảnh mọi người cùng gõ lệnh hỗn loạn.

## Post-mortem blameless

Sau incident, viết **post-mortem** — nhưng **blameless** (không đổ lỗi):

- Tập trung vào **hệ thống và quy trình** đã cho phép lỗi xảy ra, không vào "ai bấm nút".
- Có **timeline** (mấy giờ phát hiện, mấy giờ mitigate), **impact** (bao nhiêu user, bao lâu),
  **root cause**, và **action item** có người chịu trách nhiệm + deadline.

> Nếu người ta sợ bị đổ lỗi, họ sẽ giấu lỗi — và bạn mất cơ hội học. Một con người bấm nhầm nút
> deploy không phải root cause; **hệ thống cho phép một cú bấm nhầm gây sập** mới là root cause.
> Sửa hệ thống (thêm guardrail, canary, xác nhận), đừng sửa con người.

## Disaster recovery: RTO & RPO

Khi mất cả vùng/hệ thống, hai con số định nghĩa mục tiêu phục hồi:

- **RTO** (Recovery Time Objective): **bao lâu** để khôi phục dịch vụ. RTO 1 giờ = phải sống lại
  trong vòng 1 giờ.
- **RPO** (Recovery Point Objective): **mất bao nhiêu dữ liệu** là chấp nhận được. RPO 5 phút =
  backup phải đủ dày để không mất quá 5 phút dữ liệu.

> "Chúng ta có backup" là câu nói nguy hiểm nếu chưa ai **thử restore**. Backup không kiểm chứng
> thường xuyên = backup hỏng mà không biết. **Diễn tập restore định kỳ** — mới là có DR thật.

## Cạm bẫy hay gặp

- **Ngồi tìm root cause trong lúc đang sập** thay vì rollback/mitigate ngay → kéo dài downtime.
- **Post-mortem đổ lỗi cá nhân** → team giấu lỗi, không ai học được gì, sự cố tái diễn.
- **Có backup nhưng chưa từng test restore** → tới lúc cần thì phát hiện backup hỏng/thiếu.
- **Alert fatigue** (quá nhiều alert nhiễu) → alert thật bị bỏ qua giữa hàng trăm cái vô nghĩa.
- **Không có incident commander** → hỗn loạn, nhiều người sửa cùng lúc gây thêm sự cố.
- **Đốt sạch error budget mà vẫn ra tính năng** → tích lũy nợ ổn định, sớm muộn sập lớn.

## Ghi nhớ

SRE quản reliability bằng số: **error budget** cân giữa tốc độ và ổn định — còn budget thì mạo
hiểm được, hết thì phanh. Khi có sự cố: **detect → triage → mitigate → resolve → post-mortem**, và
luôn **mitigate (cầm máu) trước, fix root cause sau**. Viết **post-mortem blameless** sửa hệ thống
chứ không sửa người. Và DR thật nằm ở **RTO/RPO** cùng việc **diễn tập restore** — chứ không phải
chỉ "có backup".

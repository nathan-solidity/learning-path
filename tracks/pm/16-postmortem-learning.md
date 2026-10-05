---
level: "advanced"
order: 16
title: "Postmortem & tổ chức học hỏi"
est: "2-3 giờ"
checklist:
  - "Chạy được một retrospective/postmortem tập trung vào hệ thống, không đổ lỗi cá nhân"
  - "Áp dụng được 5 Whys để tìm nguyên nhân gốc thay vì triệu chứng"
  - "Viết được một postmortem blameless có action item cụ thể, có người phụ trách"
  - "Biến lesson learned thành thay đổi quy trình thật, không để thành tài liệu chết"
  - "Xây được vòng cải tiến liên tục (kaizen) cho team"
related:
  - "skill:nta-incident"
  - "skill:nta-meeting-notes"
  - "skill:nta-sprint-report"
---

## Học từ dự án là thứ phân biệt team giỏi lên theo thời gian

Mọi dự án đều tạo ra bài học — nhưng phần lớn **bị lãng phí**. Team lặp lại cùng sai lầm sprint này
qua sprint khác vì không có cơ chế học có kỷ luật. Bài cuối này biến trải nghiệm (kể cả thất bại)
thành **cải tiến quy trình thật** — đây là đòn bẩy dài hạn lớn nhất của một Lead.

## Retrospective vs Postmortem

| | Retrospective | Postmortem |
|---|---------------|------------|
| Khi nào | Định kỳ, cuối mỗi sprint | Sau một sự cố lớn hoặc kết thúc dự án |
| Quy mô | Nhẹ, cải tiến liên tục | Sâu, điều tra nguyên nhân gốc |
| Đầu ra | 1-2 điểm cải tiến cho sprint sau | Báo cáo + action item + thay đổi quy trình |

## Nguyên tắc số một: blameless (không đổ lỗi)

Postmortem/retro chỉ có giá trị khi mọi người **nói thật**. Điều đó chỉ xảy ra khi không ai bị
trừng phạt vì đã trung thực về sai lầm.

> Nếu postmortem biến thành phiên tòa tìm "ai gây ra", lần sau người ta sẽ **giấu**, và bạn mất
> luôn khả năng học. Giả định nền tảng (Prime Directive của retro): *ai cũng đã làm tốt nhất có
> thể với thông tin và nguồn lực họ có lúc đó.* Câu hỏi đúng không phải "**ai** sai" mà "**hệ thống**
> nào đã cho phép sai lầm này xảy ra, và ta sửa hệ thống thế nào".

## 5 Whys — đào tới nguyên nhân gốc

Hỏi "tại sao" liên tiếp để vượt qua triệu chứng, chạm nguyên nhân gốc:

![Chuỗi 5 Whys từ "release trễ" đào tới gốc "quy trình ước lượng không dùng velocity", không mắng dev](/images/pm-5whys.png)

> **Sự cố:** Release trễ 3 ngày.
> - Tại sao? → Bug critical phát hiện muộn, phải sửa gấp.
> - Tại sao muộn? → Không có thời gian test kỹ trước release.
> - Tại sao không có thời gian? → Sprint nhồi quá nhiều việc.
> - Tại sao nhồi quá? → Ước lượng lạc quan, không trừ buffer.
> - Tại sao ước lượng lạc quan? → **Không dùng velocity lịch sử để hiệu chỉnh** (← gốc).

> Nguyên nhân gốc là **quy trình ước lượng**, không phải "dev X viết bug". Sửa gốc (dùng velocity
> hiệu chỉnh ước lượng — bài 5) ngăn cả một lớp sự cố tương lai; sửa triệu chứng (mắng dev) không
> ngăn được gì. Đừng dừng ở "tại sao" đầu tiên.

## Postmortem blameless có hành động

Một postmortem tốt không dừng ở phân tích — nó ra **action item thực thi được**:

| Thành phần | Yêu cầu |
|------------|---------|
| **Tóm tắt sự cố** | Chuyện gì, ảnh hưởng gì, timeline |
| **Nguyên nhân gốc** | Từ 5 Whys, ở mức hệ thống/quy trình |
| **Action item** | Cụ thể, **có người phụ trách**, **có hạn** |
| **Theo dõi** | Kiểm tra action đã làm chưa ở retro sau |

> Action item không có owner + deadline = **không bao giờ xảy ra**. "Cả team chú ý test kỹ hơn"
> là ước nguyện, không phải action. "An bổ sung checklist pre-release vào DoD trước sprint sau" mới
> là action.

## Từ lesson learned tới thay đổi thật (kaizen)

Cạm bẫy lớn nhất: viết lesson learned đẹp đẽ rồi cất vào tài liệu chết, sprint sau lặp lại y sai
lầm cũ. Đóng vòng lặp:

1. Retro/postmortem ra **1-2 cải tiến** (ít mà làm được, hơn nhiều mà bỏ).
2. Biến nó thành **thay đổi quy trình cụ thể** (cập nhật DoD, thêm bước review, đổi cách ước lượng).
3. **Kiểm tra ở retro sau**: cải tiến kỳ trước có thực sự áp dụng và có hiệu quả không?

> **Kaizen** (cải tiến liên tục) không phải cải tổ lớn từng năm — mà là **những cải thiện nhỏ đều
> đặn** được theo dõi tới cùng. Một team cải thiện 1% mỗi sprint sẽ vượt xa team "để cuối dự án rút
> kinh nghiệm" (mà thường không bao giờ rút).

## Cạm bẫy hay gặp

- **Postmortem thành phiên tòa đổ lỗi** → người ta giấu sự thật, mất khả năng học.
- **Dừng ở "tại sao" đầu tiên** → sửa triệu chứng, sự cố tái diễn.
- **Action item không owner/deadline** → không bao giờ được làm.
- **Ra 15 cải tiến một lúc** → không cái nào được thực thi tới nơi.
- **Lesson learned thành tài liệu chết** → sprint sau lặp lại sai lầm cũ.

## Ghi nhớ

Học từ dự án là đòn bẩy dài hạn lớn nhất của Lead. Giữ retro/postmortem **blameless** — hỏi "**hệ
thống** nào cho phép sai", không "**ai** sai". Dùng **5 Whys** chạm nguyên nhân gốc (thường là quy
trình). Mỗi bài học phải thành **action item có owner + deadline**, rồi **kiểm tra ở kỳ sau**. Đó là
**kaizen**: cải thiện nhỏ, đều, theo tới cùng — thứ làm team giỏi lên theo thời gian.

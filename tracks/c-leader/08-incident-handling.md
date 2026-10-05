---
level: "advanced"
order: 8
title: "Xử lý sự cố ở tầm lead"
est: "2-3 giờ"
checklist:
  - "Giữ được bình tĩnh và điều phối khi có sự cố production, không hoảng loạn cùng team"
  - "Ưu tiên đúng thứ tự khi sự cố: cầm máu (mitigate) trước, tìm nguyên nhân gốc sau"
  - "Phân vai rõ trong lúc sự cố: ai điều tra, ai liên lạc khách, ai ghi timeline"
  - "Giao tiếp với khách/BrSE trong sự cố một cách trung thực, kịp thời, không hứa suông"
  - "Dẫn được một postmortem blameless để sự cố không lặp lại"
---

## Sự cố là lúc vai trò lead lộ rõ nhất

Khi production sập hoặc bug nghiêm trọng nổ ra, cả team căng thẳng và nhìn về lead. Cách lead
phản ứng trong 30 phút đầu quyết định sự cố được kiểm soát gọn hay biến thành hỗn loạn. Đây là
kỹ năng ít khi được dạy nhưng phân biệt rõ lead vững với lead non.

## Bình tĩnh và điều phối, đừng nhảy vào code cùng

Bản năng của lead xuất thân kỹ thuật là **lao vào debug cùng team**. Thường đó là sai lầm:

> Nếu lead cũng cắm đầu vào code, **không còn ai điều phối** — không ai phân vai, không ai liên lạc
> khách, không ai giữ bức tranh tổng thể. Trong sự cố, giá trị lớn nhất của lead thường là **giữ
> cái đầu lạnh và điều phối**, không phải là người gõ phím sửa lỗi. Để người giỏi nhất về vùng đó
> debug, lead lo phần còn lại.

## Thứ tự ưu tiên: cầm máu trước, nguyên nhân gốc sau

Trong lúc sự cố đang diễn ra, thứ tự đúng là:

![Luồng xử lý sự cố: đánh giá tác động → cầm máu → ổn định → nguyên nhân gốc → postmortem; song song có người liên lạc khách](/images/cl-incident-flow.png)

1. **Đánh giá tác động** — ảnh hưởng ai, mức nào, đang mất gì (tiền/dữ liệu/uy tín).
2. **Cầm máu (mitigate)** — khôi phục dịch vụ nhanh nhất: rollback, tắt feature lỗi, chuyển
   traffic. Giải pháp tạm cũng được, miễn dừng chảy máu.
3. **Ổn định & xác nhận** — chắc chắn đã hết ảnh hưởng.
4. **Tìm nguyên nhân gốc** — làm **sau**, khi đã bình tĩnh, trong postmortem.

> Sai lầm phổ biến: cố tìm cho ra **vì sao** ngay giữa lúc đang cháy, trong khi khách vẫn đang chịu
> ảnh hưởng. Ưu tiên số một là **dừng thiệt hại** — rollback trước, hiểu sau. Điều tra nguyên nhân
> gốc trong khủng hoảng vừa chậm vừa dễ sai.

## Phân vai trong sự cố

Sự cố lớn cần vai rõ để không giẫm chân:

| Vai | Việc |
|-----|------|
| **Điều phối (thường là lead)** | Giữ bức tranh tổng thể, ra quyết định, phân việc |
| **Người điều tra/sửa** | Tập trung debug & mitigate, không bị ngắt |
| **Người liên lạc** | Cập nhật khách/BrSE và nội bộ, để người sửa yên tâm làm |
| **Người ghi timeline** | Ghi lại mốc thời gian & hành động — vô giá cho postmortem |

> Ghi timeline **ngay lúc đang xử lý**, không để "nhớ lại sau". Trí nhớ trong khủng hoảng rất
> không đáng tin, mà timeline chính xác là nguyên liệu cho postmortem có giá trị.

## Giao tiếp với khách trong sự cố

Khách Nhật đặc biệt coi trọng cách xử lý sự cố (hourensou lúc khủng hoảng):

- **Báo sớm, kể cả khi chưa có giải pháp** — "Đang có sự cố X, ảnh hưởng Y, chúng tôi đang xử lý,
  sẽ cập nhật sau N phút." Im lặng làm khách hoảng hơn cả tin xấu.
- **Trung thực về phạm vi** — đừng giảm nhẹ; nếu mất dữ liệu thì nói mất dữ liệu.
- **Đừng hứa mốc chưa chắc** — "sẽ xong trong 1 tiếng" mà không giữ được làm mất niềm tin kép.
- **Cập nhật đều** — ngay cả "chưa có tiến triển mới" cũng nên báo đúng hẹn.

> Một sự cố được **xử lý và giao tiếp tốt** có thể **tăng** niềm tin của khách — cho thấy team
> chuyên nghiệp khi có chuyện. Một sự cố bị giấu hoặc giao tiếp lộn xộn thì phá niềm tin nặng hơn
> chính sự cố.

## Postmortem blameless

Sau khi ổn định, chạy postmortem **không đổ lỗi cá nhân**:

- Hỏi "**hệ thống** nào cho phép sự cố xảy ra", không "**ai** gây ra".
- Dùng 5 Whys chạm nguyên nhân gốc (thường là quy trình, không phải một người).
- Ra **action item có người phụ trách + hạn**, theo dõi tới khi làm xong.

> Nếu postmortem thành phiên tòa tìm thủ phạm, lần sau người ta **giấu sự cố** — mất luôn khả năng
> học. Giả định nền: ai cũng đã làm tốt nhất có thể với thông tin lúc đó. Mục tiêu là sửa hệ thống
> để sự cố **không lặp lại**, không phải trừng phạt.

## Cạm bẫy hay gặp

- **Lead nhảy vào code, bỏ điều phối** → không ai giữ bức tranh tổng thể, hỗn loạn.
- **Tìm nguyên nhân gốc khi đang cháy** → chậm cầm máu, khách chịu ảnh hưởng lâu hơn.
- **Không phân vai** → giẫm chân nhau, ngắt người đang sửa.
- **Giấu hoặc giảm nhẹ sự cố với khách** → phá niềm tin nặng hơn sự cố.
- **Hứa mốc phục hồi chưa chắc** → mất niềm tin kép khi trễ.
- **Postmortem đổ lỗi cá nhân** → lần sau người ta giấu sự cố.

## Ghi nhớ

Sự cố là lúc lead cần **cái đầu lạnh và điều phối**, đừng nhảy vào code bỏ vai điều phối. Thứ tự:
**cầm máu trước** (rollback/tắt feature), tìm nguyên nhân gốc **sau**. Phân vai (điều phối / sửa /
liên lạc / ghi timeline). Với khách: **báo sớm, trung thực, đừng hứa suông, cập nhật đều** — xử lý
tốt có thể tăng niềm tin. Sau đó **postmortem blameless** để sự cố không lặp lại.

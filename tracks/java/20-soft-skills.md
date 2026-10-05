---
level: "advanced"
order: 20
title: "Kỹ năng đi cùng"
est: "4-6 giờ"
checklist:
  - "Tự đọc tài liệu & source code thư viện để hiểu lỗi lạ thay vì đoán"
  - "Viết design doc ngắn trước khi code tính năng lớn"
  - "Estimate & chia task và báo cáo tiến độ minh bạch"
  - "Điều tra sự cố production có phương pháp: reproduce → root cause → fix → post-mortem"
  - "Onboarding, mentor và review cho junior một cách xây dựng"
---

## Vì sao kỹ năng "mềm" quyết định level

Ở Advanced, khác biệt giữa dev giỏi kỹ thuật và **senior** không nằm ở việc biết thêm
framework, mà ở cách **làm việc**: đọc được thư viện khi bí, thiết kế trước khi code, xử lý
sự cố bình tĩnh, và giúp cả team mạnh lên. Bài này là những kỹ năng đó.

## Đọc tài liệu & source code thư viện

Gặp lỗi lạ từ Spring/Hibernate, đừng chỉ copy stack trace lên Google. Kỹ năng senior:

- **Đọc stack trace từ trên xuống**, tìm dòng đầu tiên thuộc **code của bạn** (bỏ qua khung
  framework) — thường đó là điểm gọi sai.
- **Nhảy vào source thư viện** (IDE cho phép): xem method đó thực sự làm gì, ném exception
  khi nào. Hiểu hơn 10 lần đọc blog.
- **Đọc Javadoc & official docs** trước khi tin Stack Overflow — câu trả lời cũ có thể sai
  với version hiện tại.

> Kỹ năng "đọc code người khác" quan trọng hơn "viết code mới". Phần lớn thời gian dev là
> đọc, không phải viết.

## Design doc trước khi code tính năng lớn

Với tính năng lớn/nhiều rủi ro, viết **design doc ngắn (1-2 trang)** trước khi code:

- **Vấn đề & mục tiêu**: giải quyết gì, thành công đo bằng gì.
- **Giải pháp đề xuất**: kiến trúc, thay đổi DB/API chính.
- **Phương án thay thế** đã cân nhắc & lý do loại.
- **Rủi ro & migration**: ảnh hưởng gì, rollback thế nào.

> Design doc rẻ hơn code sai nhiều lần. Nó buộc bạn nghĩ trước, và cho team review **thiết
> kế** trước khi bạn đổ công sức code. Với đội offshore/khách Nhật, doc còn là công cụ thống
> nhất hiểu biết trước khi làm.

## Estimate, chia task, báo cáo

- **Chia nhỏ** task tới mức ≤ 1-2 ngày; task to → estimate luôn sai và khó theo dõi.
- **Estimate kèm độ chắc chắn**: "2 ngày nếu API bên thứ 3 như tài liệu; +1 ngày nếu phải
  xử lý edge case X". Nêu **giả định & rủi ro**, đừng đưa 1 con số trần trụi.
- **Báo cáo tiến độ trung thực & sớm**: chậm thì báo ngay khi biết, không giấu tới deadline.
  "Đang chậm vì Y, cần hỗ trợ Z" hữu ích hơn im lặng rồi vỡ.

> Đừng "chạy trước, xin lỗi sau". Với dev tốt, **minh bạch** quý hơn tỏ ra luôn đúng hẹn.

## Điều tra sự cố production

Khi production lỗi, làm theo phương pháp, đừng hoảng sửa lung tung:

1. **Ổn định trước** — nếu đang cháy, ưu tiên khôi phục dịch vụ (rollback, scale, tắt tính
   năng lỗi) trước khi tìm root cause.
2. **Reproduce** — dựng lại lỗi (log, request mẫu, dữ liệu). Không tái hiện được thì khó
   sửa chắc.
3. **Isolate** — thu hẹp: tầng nào? service nào? bắt đầu từ khi nào (liên quan deploy/thay
   đổi gần nhất — kiểm git log/deploy history)?
4. **Root cause** — tìm nguyên nhân **gốc**, không chỉ triệu chứng. "Restart hết lỗi" không
   phải root cause.
5. **Fix & verify** — sửa, thêm test chặn tái diễn, xác nhận trên staging.
6. **Post-mortem** — viết lại: timeline, nguyên nhân, tác động, hành động phòng ngừa.
   **Blameless** (tập trung vào hệ thống/quy trình, không đổ lỗi cá nhân).

> Sự cố là cơ hội để hệ thống mạnh lên. Một post-mortem tốt biến 1 lần đau thành bài học cho
> cả team và ngăn lỗi lặp lại.

## Onboarding, mentor & review junior

- **Onboarding**: giúp người mới chạy được dự án local **trong ngày đầu**; tài liệu setup +
  một task nhỏ có người kèm. (Xem thêm cách viết ONBOARDING của team.)
- **Mentor**: giải thích **vì sao**, không chỉ **làm gì**. Để junior tự thử, gợi ý hướng
  thay vì đưa đáp án.
- **Review có tính xây dựng**:
  - Khen phần tốt, không chỉ soi lỗi.
  - Phân biệt "**phải sửa**" (bug, bảo mật) và "gợi ý" (style, sở thích) — đừng chặn PR vì
    sở thích cá nhân.
  - Góp ý về **code**, không về **người**: "hàm này nên tách" thay vì "bạn viết rối".
  - Hỏi thay vì phán: "chỗ này xử lý null chưa?" mời thảo luận hơn là "sai rồi".

## Cạm bẫy hay gặp

- **Đoán mò khi debug** thay vì đọc stack trace & source → mất thời gian, sửa nhầm.
- **Code thẳng tính năng lớn** không design doc → làm lại nhiều lần.
- **Estimate 1 con số** không nêu giả định → luôn "trễ" trong mắt PM.
- **Giấu chậm tiến độ** tới phút chót → mất niềm tin.
- **Chỉ restart cho hết lỗi** → bỏ qua root cause, lỗi quay lại.
- **Review soi mói / công kích cá nhân** → team sợ PR, chất lượng giảm.

## Ghi nhớ

Senior khác junior ở **cách làm việc**, không chỉ kiến thức: tự đọc source khi bí, thiết kế
trước khi code, **minh bạch** về tiến độ, xử lý sự cố có phương pháp và **blameless
post-mortem**, và nâng cả team qua mentor & review xây dựng. Kỹ thuật đưa bạn tới mid-level;
những kỹ năng này đưa bạn tới senior.

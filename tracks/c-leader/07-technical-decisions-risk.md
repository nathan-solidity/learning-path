---
level: "advanced"
order: 7
title: "Ra quyết định & quản lý rủi ro kỹ thuật"
est: "3 giờ"
checklist:
  - "Ra được quyết định kỹ thuật có căn cứ thay vì theo cảm tính hoặc 'công nghệ mới'"
  - "Ghi lại quyết định quan trọng cùng lý do (lightweight ADR) để về sau truy được"
  - "Nhận diện và theo dõi rủi ro kỹ thuật (nợ kỹ thuật, phụ thuộc, điểm mù kiến thức)"
  - "Cân bằng giải pháp 'đủ tốt để ship' với giải pháp 'đúng chuẩn' theo bối cảnh"
  - "Biết khi nào quyết nhanh, khi nào cần thử nghiệm (spike) trước khi cam kết"
related:
  - "skill:nta-risk-assessment"
  - "skill:nta-consistency"
  - "skill:nta-code-review"
---

## Lead là người chốt khi team không tự thống nhất được

Nhiều quyết định kỹ thuật không có đáp án đúng tuyệt đối — chỉ có đánh đổi. Khi team tranh luận
không dứt, lead phải **chốt** dựa trên bối cảnh và chịu trách nhiệm về lựa chọn đó. Quyết định
kỹ thuật tốt không phải là chọn công nghệ "xịn nhất", mà là chọn cái **phù hợp nhất** với ràng
buộc thực tế (thời gian, năng lực team, khách, bảo trì lâu dài).

## Ra quyết định có căn cứ

Khung đơn giản khi phải chọn giữa các phương án:

1. **Làm rõ vấn đề thật** — đang giải quyết đúng vấn đề gì? (nhiều tranh luận sai vì mỗi người
   hiểu vấn đề khác nhau)
2. **Liệt kê phương án** — ít nhất 2-3, kể cả "không làm gì".
3. **Đánh giá theo tiêu chí** — thời gian làm, độ phức tạp, chi phí bảo trì, năng lực team, rủi ro.
4. **Chốt và ghi lý do** — chọn cái nào, **vì sao**, đánh đổi gì.

> Cạm bẫy lớn nhất: chọn công nghệ vì **mới/thú vị** thay vì phù hợp. Framework hot nhất mà cả
> team chưa ai biết, tài liệu mỏng, cộng đồng nhỏ — thường là lựa chọn tồi cho dự án có deadline.
> "Nhàm chán mà đáng tin" thường thắng "mới mà rủi ro".

## Ghi lại quyết định (lightweight ADR)

**ADR (Architecture Decision Record)** nhẹ: mỗi quyết định quan trọng ghi vài dòng —

- **Bối cảnh**: tình huống, ràng buộc lúc quyết.
- **Quyết định**: chọn gì.
- **Lý do & đánh đổi**: vì sao, hy sinh gì.

> Vì sao phải ghi: sáu tháng sau, ai đó (kể cả chính bạn) sẽ hỏi "tại sao hồi đó lại làm thế này?".
> Không có ghi chép, team dễ **hồi sinh một quyết định đã bị bác** hoặc phá một thứ đang có lý do
> tồn tại. ADR biến quyết định thành tài sản truy vết được, không phải trí nhớ cá nhân.

## Quản lý rủi ro kỹ thuật

Rủi ro kỹ thuật hay tích tụ âm thầm rồi nổ ra như sự cố. Theo dõi chủ động:

| Loại rủi ro | Ví dụ | Cách giảm |
|-------------|-------|-----------|
| **Nợ kỹ thuật** | Code tạm, thiếu test, kiến trúc chắp vá | Ghi nợ lại, lên lịch trả, không để tích tụ |
| **Phụ thuộc** | Thư viện bỏ bê, API bên thứ ba, một service quan trọng | Có phương án dự phòng, theo dõi vòng đời |
| **Điểm mù kiến thức** | Chỉ 1 người hiểu module quan trọng (bus factor = 1) | Chia sẻ kiến thức, pair, viết doc |

> Rủi ro nguy hiểm nhất thường là **bus factor = 1**: một module mà chỉ một người hiểu. Người đó
> nghỉ/ốm là team tê liệt. Lead phải chủ động **phá thế độc quyền kiến thức** bằng pairing, review
> chéo, và tài liệu — đây cũng là lý do quản lý knowledge (bài 3) quan trọng.

## Đủ tốt vs đúng chuẩn

Không phải mọi thứ đều xứng đáng làm hoàn hảo:

- **Đủ tốt (good enough)** — cho phần ít rủi ro, ít thay đổi, hoặc để kịp validate ý tưởng.
- **Đúng chuẩn** — cho phần lõi, nhiều người dùng, khó sửa về sau (thanh toán, bảo mật, dữ liệu).

> Cân bằng theo **rủi ro và tuổi thọ** của code. Đánh bóng một tính năng phụ tới hoàn hảo trong
> khi phần lõi còn chắp vá là phân bổ công sức sai. Ngược lại, làm ẩu phần lõi để lại nợ đắt đỏ.

## Khi nào spike trước

Khi độ bất định cao (công nghệ mới, yêu cầu mơ hồ), đừng cam kết mù — làm **spike**: một thử
nghiệm nhỏ, giới hạn thời gian, để **giảm bất định** trước khi quyết chính thức.

> Spike là cách mua thông tin rẻ. Bỏ 1 ngày thử nghiệm để tránh cam kết sai một hướng tốn 2 tuần
> là khoản đầu tư đáng giá. Nhưng phải **giới hạn thời gian** — spike không kiểm soát dễ thành dự
> án con vô tận.

## Cạm bẫy hay gặp

- **Chọn công nghệ vì mới/thú vị** thay vì phù hợp → rủi ro cao, cả team phải học từ đầu.
- **Không ghi lý do quyết định** → team hồi sinh quyết định đã bác hoặc phá thứ có lý do tồn tại.
- **Để bus factor = 1** → mất một người là tê liệt.
- **Làm hoàn hảo phần phụ, chắp vá phần lõi** → phân bổ công sức sai.
- **Cam kết mù khi bất định cao** → nên spike giới hạn thời gian trước.

## Ghi nhớ

Lead **chốt** khi team không tự thống nhất, chọn cái **phù hợp** chứ không "xịn nhất" ("nhàm chán
mà đáng tin" thường thắng). Ghi quyết định quan trọng bằng **ADR nhẹ** (bối cảnh/quyết định/lý do)
để truy được về sau. Theo dõi rủi ro kỹ thuật — nguy nhất là **bus factor = 1**. Cân bằng **đủ tốt
vs đúng chuẩn** theo rủi ro/tuổi thọ code, và **spike giới hạn thời gian** khi độ bất định cao.

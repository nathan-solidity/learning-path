---
level: "advanced"
order: 9
title: "Điều phối & giao tiếp kỹ thuật với khách"
est: "4-5 giờ"
checklist:
  - "Giải thích được một trade-off kỹ thuật cho khách/BrSE bằng ngôn ngữ không kỹ thuật"
  - "Quản lý được kỳ vọng khách: nói 'không' kèm phương án thay thế"
  - "Xử lý được bất đồng kỹ thuật trong team mà không phá tinh thần"
  - "Xác định được đúng thời điểm và cách escalate lên PM/BrSE"
  - "Giữ được tinh thần team khi dự án áp lực (deadline, khách khó)"
related:
  - "skill:nta-orchestrate"
  - "skill:nta-auto-review"
---

## C-Leader là phiên dịch trade-off, không chỉ phiên dịch ngôn ngữ

Ở tầng nâng cao, việc khó nhất của C-Leader không phải kỹ thuật — mà là **giao tiếp kỹ
thuật với người không kỹ thuật**. Khách và BrSE quan tâm kết quả nghiệp vụ, không quan tâm
"chúng ta dùng index hay cache". Việc của bạn: dịch quyết định kỹ thuật thành **đánh đổi
mà khách hiểu được**.

> Tình huống: khách muốn tính năng export toàn bộ dữ liệu 5 năm trong 1 click. Kỹ thuật:
> sẽ timeout, tốn tài nguyên. Đừng nói "cái này không optimize được vì query nặng". Hãy
> nói: **"Làm ngay được, nhưng với dữ liệu lớn sẽ mất ~3 phút và có thể lỗi. Em đề xuất
> export nền rồi gửi file qua email — chậm hơn vài phút nhưng chắc chắn xong. Anh chọn
> phương án nào?"** — đó là dịch trade-off thành lựa chọn nghiệp vụ.

## Quản lý kỳ vọng: nói "không" đúng cách

Gật đầu với mọi yêu cầu khách là con đường ngắn nhất tới nợ kỹ thuật và team kiệt sức.
Nhưng nói "không" cụt lủn làm mất lòng khách. Công thức an toàn:

**Xác nhận hiểu đúng → nêu ràng buộc thật → đề xuất phương án → để khách quyết.**

| Cách nói kém | Cách nói tốt |
|--------------|--------------|
| "Không làm được" | "Làm được, nhưng đánh đổi là X. Có phương án Y ít rủi ro hơn." |
| "Cái này ngoài scope" | "Việc này nằm ngoài phần đã chốt; em ước tính thêm N ngày, anh confirm để em xếp lịch nhé." |
| Im lặng rồi cố làm | "Em cần làm rõ điểm này trước khi bắt đầu, nếu không dễ làm sai." |

Với khách Nhật: dữ liệu và phương án cụ thể có sức thuyết phục hơn cảm tính. Đưa con số
(thời gian, rủi ro), đưa lựa chọn rõ ràng, để họ ra quyết định.

## Xử lý bất đồng kỹ thuật trong team

Hai dev tranh cãi kiến trúc là chuyện tốt — nhưng kéo dài thì hại. Vai trò C-Leader:

1. **Tách sự thật khỏi ý kiến**: yêu cầu mỗi bên nêu trade-off cụ thể, không cãi cảm tính.
2. **Đưa tiêu chí quyết**: chọn theo cái nào ít rủi ro/dễ bảo trì/hợp deadline hơn.
3. **Quyết và ghi lý do**: khi chưa ngã ngũ, lead chốt và ghi vào MEMORY vì sao chọn — để
   sau này không bàn lại.
4. **Tôn trọng bên không được chọn**: giải thích rõ, không để họ thấy bị gạt.

> Nguyên tắc "disagree and commit": khi đã quyết, cả team làm theo một hướng — kể cả người
> phản đối. Nhưng lead phải quyết **có lý do**, không quyết bằng chức vụ.

## Escalate đúng lúc

Escalate lên PM/BrSE khi: rủi ro trễ deadline không cứu được bằng nội lực, yêu cầu khách
mâu thuẫn spec đã ký, quyết định ảnh hưởng chi phí/hợp đồng, xung đột nhân sự vượt tầm.
Escalate **sớm và kèm đề xuất**, không phải sát deadline mới báo "toang rồi". Escalate
kém = báo vấn đề trần trụi; escalate tốt = "có vấn đề X, em đề xuất A hoặc B, anh quyết."

## Giữ tinh thần team khi áp lực

Deadline gấp, khách khó, bug production — đây là lúc lead thể hiện. Vài nguyên tắc:

- **Chắn áp lực, không truyền nguyên si**: lọc bớt lo lắng của khách/PM, đừng đổ hết lên team.
- **Minh bạch có kiểm soát**: nói thật tình hình, nhưng kèm kế hoạch để team không hoảng.
- **Ghi nhận nỗ lực cụ thể**: "cảm ơn Lan đã ở lại fix con bug login" hơn lời khen chung chung.
- **Không đổ lỗi cá nhân khi có sự cố**: hỏi "quy trình nào để lỗi lọt?" thay vì "ai làm?".
- **Bảo vệ team trước khách khi cần**: lỗi là của team với khách, không chỉ mặt một người.

## Cạm bẫy hay gặp

- **Giải thích kỹ thuật bằng jargon** cho khách → khách không hiểu, mất niềm tin.
- **Nói "không" mà không kèm phương án** → khách thấy team bất hợp tác.
- **Quyết bất đồng bằng chức vụ** không lý do → team bằng mặt không bằng lòng.
- **Escalate muộn** sát deadline → PM/BrSE trở tay không kịp.
- **Truyền nguyên áp lực xuống team** → team hoảng, chất lượng tụt, người giỏi nghỉ.
- **Đổ lỗi cá nhân khi sự cố** → không ai dám báo lỗi sớm nữa.

## Ghi nhớ

Ở tầng nâng cao, C-Leader là **người dịch trade-off** cho khách và **giảm xóc áp lực** cho
team. Nói "không" luôn kèm **phương án và con số**. Bất đồng thì quyết **có lý do và ghi
lại**, rồi disagree-and-commit. Escalate **sớm, kèm đề xuất**. Khi áp lực: chắn cho team,
ghi nhận cụ thể, hỏi quy trình chứ đừng chỉ mặt người.

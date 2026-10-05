---
level: "advanced"
order: 17
title: "Agile QA & làm việc với BrSE Nhật"
est: "3-4 giờ"
checklist:
  - "Giải thích QA thay đổi thế nào trong Agile: test liên tục, tham gia sớm, cả team lo chất lượng"
  - "Viết acceptance criteria testable và tham gia refinement để bắt lỗi từ lúc yêu cầu"
  - "Hiểu vai trò BrSE và bug report/Q&A qua trung gian ngôn ngữ khác biệt thế nào"
  - "Viết bug report và câu hỏi rõ ràng để dịch qua BrSE không tam sao thất bản"
  - "Ý thức khác biệt kỳ vọng chất lượng của khách Nhật (tỉ mỉ, spec chặt, form/số/ngày)"
---

## QA trong Agile và trong mô hình offshore Nhật

Hai bối cảnh thực tế của công ty định hình lại cách QA làm việc: **Agile** (test liên tục, tham
gia sớm) và **offshore với khách Nhật qua BrSE** (giao tiếp qua trung gian ngôn ngữ, kỳ vọng
chất lượng cao). Bài này gộp cả hai vì trong thực tế chúng chồng lên nhau mỗi ngày.

## QA trong Agile

Mô hình cũ (waterfall): dev làm xong hết → QA test ở cuối. Agile phá vỡ điều đó:

| Waterfall QA | Agile QA |
|--------------|----------|
| Test ở cuối, sau khi code xong | Test **liên tục** trong từng sprint |
| QA nhận việc đã hoàn thành | QA tham gia **từ refinement/planning** |
| "Chất lượng là việc của QA" | **Cả team** lo chất lượng, QA dẫn dắt |
| Phát hiện lỗi muộn | Bắt lỗi từ lúc yêu cầu còn mơ hồ |

> Thay đổi lớn nhất: QA không còn là **cổng cuối** mà là **người đồng hành xuyên suốt**. Bạn ngồi
> trong buổi refinement, đọc user story trước khi dev code, và hỏi "cái này khi lỗi thì sao, biên
> ở đâu, khách kỳ vọng gì" — bắt lỗi ở tầng **yêu cầu**, nơi sửa rẻ nhất. Đây chính là shift-left
> ở cấp con người, không chỉ ở cấp pipeline.

## Acceptance criteria testable

Trong Agile, mỗi user story có **acceptance criteria** (AC) — điều kiện để coi là "done". QA
tham gia viết AC **testable**:

```
Mơ hồ   : "User đăng nhập được."
Testable: "GIVEN user đã đăng ký, WHEN nhập đúng email + mật khẩu, THEN vào dashboard.
           AND sai mật khẩu 5 lần THEN khóa 15 phút.
           AND email chưa xác thực THEN chặn + hiện thông báo xác thực."
```

> AC mơ hồ là nguồn của "tưởng xong mà chưa xong". Nếu AC không nói gì về nhập sai, về biên, về
> lỗi — thì "done" của dev và "done" của QA khác nhau, và cãi nhau lúc test. Viết AC dạng
> GIVEN/WHEN/THEN, phủ cả nhánh lỗi, biến AC thành **test case sẵn có** ngay từ đầu sprint.

## Làm việc qua BrSE — giao tiếp gián tiếp

**BrSE** (Bridge SE) là cầu nối ngôn ngữ/văn hóa giữa team dev VN và khách Nhật. Điều này đổi
cách bug report và câu hỏi phải viết: chúng bị **dịch qua một người trung gian** trước khi tới
khách.

> Mỗi lần thông tin qua BrSE là một lần có thể **tam sao thất bản** — không phải vì BrSE kém, mà
> vì dịch thuật vốn mất mát, nhất là thuật ngữ kỹ thuật và ngữ cảnh. Nguyên tắc vàng: viết sao
> cho BrSE **dịch mà không phải đoán ý bạn**. Câu mơ hồ với bạn sẽ mơ hồ gấp đôi sau khi dịch.

Cách viết để dịch tốt qua BrSE:
- **Một ý một câu**, tránh câu ghép nhiều mệnh đề lồng nhau.
- **Số liệu và bằng chứng cụ thể** thay vì mô tả cảm tính ("chậm" → "mất 8 giây", kèm ảnh/video).
- **Step to reproduce đánh số rõ**, screenshot có khoanh vùng — hình ảnh vượt qua rào ngôn ngữ.
- **Tránh tiếng lóng, thành ngữ, chữ viết tắt** khó dịch.

Đây là lý do bug report chuẩn (bài Execution & bug report) càng quan trọng ở môi trường này.

## Kỳ vọng chất lượng của khách Nhật

> Khách Nhật nổi tiếng **tỉ mỉ và spec chặt**. Những thứ nơi khác coi là "lỗi nhỏ" — lệch pixel,
> sai định dạng ngày, thiếu một dấu chấm câu trong message tiếng Nhật, họ tên hiển thị sai thứ tự
> — với khách Nhật có thể là lỗi phải sửa. Đừng tự phán "cái này không quan trọng"; những điểm
> hay bị bỏ sót:

- **Định dạng ngày/giờ**: Nhật hay dùng `年月日`, lịch niên hiệu (令和), thứ tự khác VN.
- **Số & tiền**: dấu phân cách, đơn vị (yên không có phần thập phân), làm tròn.
- **Họ tên**: thứ tự họ-tên, furigana, ký tự full-width vs half-width.
- **Bản dịch giao diện**: message tiếng Nhật đúng ngữ cảnh và kính ngữ, không dịch máy thô.
- **Bám spec**: khách Nhật kỳ vọng đúng **y hệt** spec; lệch dù có vẻ hợp lý hơn vẫn nên hỏi
  trước, không tự quyết (khớp với nguyên tắc verify trước khi đổi, không suy đoán về spec).

## Cạm bẫy hay gặp

- **QA chỉ vào cuối sprint** → mất cơ hội bắt lỗi ở tầng yêu cầu, dồn việc cuối.
- **AC mơ hồ, không phủ nhánh lỗi** → "done" của dev khác "done" của QA.
- **Bug report viết câu ghép/cảm tính** → dịch qua BrSE sai lệch, khách hiểu nhầm.
- **Tự phán "lỗi nhỏ không cần báo"** với khách Nhật → bỏ sót thứ khách coi là lỗi.
- **Bỏ qua định dạng ngày/số/tên kiểu Nhật** → lỗi localization rất hay lọt.
- **Tự sửa cho "hợp lý hơn" thay vì bám spec** → lệch kỳ vọng khách, phải làm lại.

## Ghi nhớ

Trong **Agile**, QA test **liên tục** và tham gia **từ refinement** — bắt lỗi ở tầng yêu cầu qua
**acceptance criteria testable** (GIVEN/WHEN/THEN, phủ cả nhánh lỗi). Trong mô hình **offshore
Nhật**, mọi bug report/câu hỏi bị **dịch qua BrSE** — viết một-ý-một-câu, số liệu cụ thể, hình
ảnh rõ để không tam sao thất bản. Và tôn trọng **kỳ vọng chất lượng cao** của khách Nhật: định
dạng ngày/số/tên, bản dịch đúng ngữ cảnh, và **bám spec** — lệch thì hỏi, không tự quyết.

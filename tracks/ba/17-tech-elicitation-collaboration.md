---
level: "techniques"
order: 17
title: "Techniques: Elicitation & Collaboration"
est: "3-4 giờ"
checklist:
  - "Chọn đúng technique elicitation cho từng tình huống (thời gian, số người, độ nhạy cảm)"
  - "Chuẩn bị và điều phối được một Workshop có agenda và kết quả rõ ràng"
  - "Biết khi nào Observation hiệu quả hơn hỏi trực tiếp"
  - "Thiết kế được một Survey/Questionnaire tránh câu hỏi dẫn dắt"
  - "Dùng Document Analysis để rút yêu cầu từ tài liệu cũ, phát hiện mâu thuẫn"
  - "Dùng Prototyping/Mind Mapping để làm rõ yêu cầu mơ hồ với khách qua BrSE"
related:
  - "glossary:prototype"
  - "skill:nta-clarify"
  - "skill:nta-stakeholder-sim"
  - "playbook:ba"
---

## Nhóm technique để khai thác yêu cầu & phối hợp

Đây là các kỹ thuật BABOK v3 trong knowledge area **Elicitation & Collaboration** — trọng
tâm là **lấy thông tin ra khỏi đầu stakeholder** và **giữ mọi người hiểu giống nhau**. Bài
*Khai thác yêu cầu* ở cấp Cơ bản đã giới thiệu tư duy chung; bài này đi vào từng technique
cụ thể và **khi nào chọn cái nào**.

Nguyên tắc chọn: cân nhắc **thời gian**, **số người**, **độ nhạy cảm của thông tin**, và
**khách ở xa/khác ngôn ngữ** (rất quan trọng với dự án Nhật qua BrSE — mọi technique đều
cộng thêm chi phí dịch và độ trễ).

### Workshops
- **Là gì**: buổi làm việc nhóm có điều phối, nhiều stakeholder cùng bàn để ra kết quả chung.
- **Khi nào dùng**: cần thống nhất nhanh giữa nhiều bên, hoặc làm rõ luồng phức tạp.
- **Ví dụ**: workshop online với khách + BrSE để chốt luồng duyệt đơn nhiều cấp — chuẩn bị
  sẵn diagram nháp để mọi người chỉnh trực tiếp.
- **Cạm bẫy**: không có agenda → lan man; không chốt action + người phụ trách cuối buổi.

### Focus Groups
- **Là gì**: nhóm nhỏ người dùng đại diện thảo luận về nhu cầu/phản ứng với ý tưởng.
- **Khi nào dùng**: muốn hiểu cảm nhận/ưu tiên của nhóm người dùng, không phải chốt spec.
- **Cạm bẫy**: 1 người áp đảo làm lệch ý kiến cả nhóm; nhầm focus group (khám phá) với
  workshop (ra quyết định).

### Observation
- **Là gì**: quan sát người dùng làm việc thật để hiểu quy trình thực tế.
- **Khi nào dùng**: khi người dùng khó diễn đạt việc họ làm, hoặc nghi ngờ "quy trình khai
  báo" khác "quy trình thực tế".
- **Ví dụ**: quan sát nhân viên kho thao tác để hiểu vì sao họ hay bỏ qua bước nhập liệu.
- **Cạm bẫy**: hiệu ứng "bị quan sát nên làm khác"; với khách ở xa thường không khả thi —
  thay bằng video thao tác.

### Survey or Questionnaire
- **Là gì**: bộ câu hỏi gửi cho nhiều người để thu thập ý kiến ở quy mô lớn.
- **Khi nào dùng**: cần dữ liệu từ nhiều người mà không đủ thời gian phỏng vấn từng người.
- **Cạm bẫy**: câu hỏi **dẫn dắt** ("Bạn có đồng ý tính năng X rất hữu ích không?"); trộn
  2 câu hỏi trong 1; thang đo không nhất quán.

### Document Analysis
- **Là gì**: rút yêu cầu từ tài liệu có sẵn (spec cũ, quy định, hệ thống hiện tại).
- **Khi nào dùng**: dự án nâng cấp/thay thế hệ thống cũ; khi có nhiều tài liệu nghiệp vụ.
- **Ví dụ**: đọc spec bản cũ + manual vận hành để dựng As-Is trước khi bàn To-Be.
- **Cạm bẫy**: tin tài liệu cũ là đúng hiện trạng — thực tế nó có thể đã lỗi thời; luôn
  đối chiếu với người dùng.

### Prototyping
- **Là gì**: dựng mô hình sơ bộ (wireframe, mockup, bản chạy được tối giản) để làm rõ yêu cầu.
- **Khi nào dùng**: yêu cầu về UI/luồng còn mơ hồ, khách khó hình dung qua chữ.
- **Ví dụ**: gửi mockup màn hình cho khách Nhật xác nhận layout trước khi code — "một hình
  bằng nghìn dòng mô tả", đặc biệt khi qua BrSE dễ tam sao thất bản.
- **Cạm bẫy**: khách tưởng prototype là sản phẩm gần xong → kỳ vọng sai về tiến độ.

### Collaborative Games
- **Là gì**: hoạt động có cấu trúc (product box, affinity map...) giúp nhóm khám phá và
  thống nhất góc nhìn một cách chủ động.
- **Khi nào dùng**: phá băng, khai thác ý tưởng ẩn, ưu tiên chung khi nhóm bế tắc.
- **Cạm bẫy**: khó áp dụng khi rào cản ngôn ngữ/văn hóa cao — cần đơn giản hóa luật chơi.

### Mind Mapping
- **Là gì**: sơ đồ tỏa nhánh để tổ chức và liên kết ý tưởng quanh một chủ đề trung tâm.
- **Khi nào dùng**: ghi chú buổi elicitation, phân rã một khái niệm lớn thành nhánh con.
- **Ví dụ**: mind map "Đơn hàng" → nhánh trạng thái, nhánh vai trò, nhánh thông báo — để
  không sót khía cạnh nào.

### Concept Modelling
- **Là gì**: mô hình các khái niệm nghiệp vụ và quan hệ giữa chúng (bằng ngôn ngữ nghiệp vụ,
  chưa phải DB).
- **Khi nào dùng**: cần thống nhất **thuật ngữ** giữa các bên trước khi thiết kế dữ liệu.
- **Ví dụ**: làm rõ "Khách hàng" và "Người đặt hàng" có phải cùng một khái niệm không —
  tránh hiểu nhầm khi khách và team dùng cùng từ cho 2 nghĩa khác nhau.
- **Cạm bẫy**: nhảy thẳng sang ERD/bảng DB mà chưa thống nhất khái niệm nghiệp vụ.


![Sơ đồ chọn technique elicitation theo tình huống (số người, định tính/định lượng, tài liệu sẵn có)](/images/ba-elicitation-decision.png)

## Bảng chọn nhanh

| Tình huống | Technique nên chọn |
|-----------|--------------------|
| Nhiều bên cần thống nhất nhanh | Workshops |
| Hiểu cảm nhận nhóm người dùng | Focus Groups |
| Quy trình thực tế khác lời khai | Observation |
| Cần ý kiến số đông, ít thời gian | Survey/Questionnaire |
| Có hệ thống/tài liệu cũ | Document Analysis |
| Yêu cầu UI/luồng còn mơ hồ | Prototyping |
| Nhóm bế tắc, cần khai thác ý tưởng | Collaborative Games |
| Tổ chức ý tưởng/ghi chú | Mind Mapping |
| Thống nhất thuật ngữ nghiệp vụ | Concept Modelling |

## Template: chuẩn bị một buổi Workshop/Interview

```
1. Mục tiêu buổi họp (1 câu): ______
2. Người tham gia + vai trò: ______ (khách? BrSE? dev?)
3. Câu hỏi/agenda (mở → đóng): ______
4. Tài liệu gửi trước (để BrSE kịp dịch): ______
5. Kết quả cần có cuối buổi: ______ (quyết định gì? action gì?)
6. Ai ghi MoM, gửi cho ai xác nhận: ______
```

## Ghi nhớ

Không có technique "tốt nhất" — chỉ có technique **phù hợp tình huống**. Với dự án Nhật qua
BrSE, ưu tiên các technique **giảm phụ thuộc vào lời nói tức thời**: Prototyping, Document
Analysis, câu hỏi gửi trước. Luôn xác nhận lại cách hiểu bằng văn bản, đừng tin trí nhớ.
Công cụ hỗ trợ: `/nta-clarify` (làm rõ + scan impact), `/nta-stakeholder-sim` (tập phỏng
vấn trước khi họp thật).

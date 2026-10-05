---
level: "basic"
order: 2
title: "Tư duy kiểm thử & 7 nguyên tắc"
est: "2-3 giờ"
checklist:
  - "Giải thích được mindset 'phá để bảo vệ' và tại sao 'chạy được' chưa đủ"
  - "Phân biệt happy path và edge case, và tự đặt được câu hỏi 'nếu... thì sao?'"
  - "Kể được 7 nguyên tắc testing và cho ví dụ cho ít nhất 3 nguyên tắc"
  - "Nhận ra 'test pass' không chứng minh 'hết lỗi'"
  - "Hiểu vì sao test sớm và đúng-yêu-cầu quan trọng hơn chỉ 'không có bug'"
related:
  - "skill:nta-test-case"
---

## Mindset "phá để bảo vệ"

Bài trước cho biết QA là ai. Bài này về **cách nghĩ** — thứ phân biệt người test giỏi với người
chỉ "bấm thử cho có".

Dev viết code với tâm thế **"làm cho nó chạy"**. Tester phải có tâm thế ngược lại: **"tìm cách
làm nó hỏng"** — nhưng mục đích là **bảo vệ người dùng và dự án**, không phải bắt lỗi dev.

> Đây không phải chuyện tiêu cực hay bới móc. Bạn phá phần mềm **trong phòng thí nghiệm** để nó
> không tự phá **trước mặt khách hàng**. Mỗi bug bạn tìm ra là một sự cố production không xảy ra.
> Tâm thế "phá để bảo vệ" là tài sản lớn nhất của một tester.

## "Chạy được" chỉ mới là happy path

"Chạy được" nghĩa là **happy path** — luồng đẹp nhất, người dùng làm đúng mọi thứ. Nhưng giá trị
của QA nằm ở những câu hỏi **"nếu... thì sao?"**:

![Một chức năng thanh toán: happy path chỉ là 1 nhánh; đa số bug nằm ở các nhánh edge case](/images/qa-happy-vs-edge.png)

- Nhập **số âm** vào ô "số lượng" thì sao?
- Bấm "Submit" **2 lần liên tiếp** thì tạo 2 đơn hàng?
- **Mất mạng** giữa chừng thanh toán thì tiền có bị trừ mà đơn không tạo?
- Thẻ **hết hạn / sai số** thì thông báo có rõ ràng?

> Một feature "demo chạy ngon" **không** có nghĩa là "đã test xong". Đa số bug thật nằm ở **edge
> case**, không phải happy path. Kỹ năng cốt lõi của tester là phản xạ tự hỏi "còn trường hợp
> nào nữa?" cho mọi thứ mình gặp — bài thiết kế test case sẽ biến phản xạ này thành phương pháp.

## 7 nguyên tắc testing

Bảy nguyên tắc kinh điển (ISTQB) — nền lý thuyết cho mọi thứ về sau. Mỗi nguyên tắc kèm một ý
thực dụng:

| # | Nguyên tắc | Nghĩa thực dụng |
|---|-----------|-----------------|
| 1 | **Testing cho thấy CÓ lỗi, không chứng minh HẾT lỗi** | Test pass = "chưa tìm ra lỗi", không phải "hết lỗi". Đừng tạo cảm giác an toàn giả. |
| 2 | **Exhaustive testing là bất khả thi** | Không thể test mọi input. Phải chọn có phương pháp (bài thiết kế test case). |
| 3 | **Test sớm** (early testing) | Review spec/design ngay từ đầu. Bug bắt ở spec rẻ hơn bắt ở prod hàng chục lần. |
| 4 | **Defect clustering** | Lỗi tụ vào vài module (~80% bug ở ~20% module — Pareto). Ưu tiên test chỗ hay hỏng. |
| 5 | **Pesticide paradox** | Chạy mãi một bộ test cũ sẽ không bắt thêm lỗi mới. Phải cập nhật, bổ sung case. |
| 6 | **Testing phụ thuộc ngữ cảnh** | App ngân hàng test khác app tin tức. Không có một công thức chung cho mọi dự án. |
| 7 | **Absence-of-errors fallacy** | Hết bug nhưng làm **sai yêu cầu** thì vẫn vô dụng. Đúng spec quan trọng hơn "không có bug". |

> Ba nguyên tắc đáng khắc cốt nhất cho người mới: **số 1** (test pass ≠ hết lỗi — giữ bạn khiêm
> tốn), **số 3** (test sớm — rẻ nhất), và **số 7** (đúng yêu cầu quan trọng hơn không-có-bug —
> giữ bạn tập trung vào thứ khách thật sự cần). Ba cái này quay lại liên tục ở các bài sau.

## Cạm bẫy hay gặp

- **Chỉ test happy path** rồi báo "OK" → bug thật nằm ở edge case.
- **Coi test pass = hết lỗi** → vi phạm nguyên tắc 1, tạo cảm giác an toàn giả.
- **Dùng mãi bộ test cũ** → pesticide paradox, không bắt được lỗi mới.
- **Test kỹ chức năng nhưng làm sai yêu cầu** → absence-of-errors fallacy, công cốc.
- **Đợi code xong mới bắt đầu nghĩ về test** → mất cơ hội bắt lỗi sớm ở spec.

## Ghi nhớ

Tester giỏi mang tâm thế **"phá để bảo vệ"** — phá trong phòng thí nghiệm để phần mềm không tự
phá trước khách. **"Chạy được" chỉ là happy path**; giá trị nằm ở phản xạ hỏi "nếu... thì sao?"
để lôi ra **edge case**. Nhớ ba nguyên tắc lõi: **test pass không chứng minh hết lỗi** (số 1),
**test sớm luôn rẻ hơn** (số 3), và **đúng yêu cầu quan trọng hơn không-có-bug** (số 7).

---
level: "basic"
order: 2
title: "Review chất lượng spec/code/test ở tầm lead"
est: "3-4 giờ"
checklist:
  - "Phân biệt được review của lead (nhìn hệ thống) với review của reviewer thường (nhìn dòng)"
  - "Áp dụng được nguyên tắc ưu tiên rủi ro cao khi thời gian review có hạn"
  - "Viết được feedback mang tính xây dựng, gắn lý do thay vì mệnh lệnh"
  - "Dùng checklist review cho spec, code và test thay vì review theo cảm tính"
  - "Cân bằng được tốc độ và chất lượng: biết chỗ nào chặt, chỗ nào cho qua"
---

## Review của lead khác reviewer thường thế nào

Reviewer thường soi **từng dòng**: syntax, naming, bug nhỏ. Lead review ở **tầm hệ thống**:
thay đổi này ảnh hưởng gì tới phần khác? Có phá kiến trúc/convention không? Rủi ro cao nhất
nằm ở đâu?

| Góc nhìn | Reviewer thường | Lead |
|----------|-----------------|------|
| Phạm vi | Dòng code, hàm | Ảnh hưởng hệ thống, dữ liệu, tương thích ngược |
| Ưu tiên | Bắt được lỗi nào hay lỗi đó | Rủi ro cao trước, cosmetic sau |
| Câu hỏi | "Dòng này đúng chưa?" | "Chỗ này sai thì hậu quả tới đâu?" |
| Đầu ra | Comment sửa | Comment sửa + nâng chuẩn team |

> Tình huống: một PR đổi logic tính phí. Reviewer thường sửa vài naming. Lead hỏi thêm:
> "Có migration dữ liệu cũ chưa? API cũ còn ai gọi không? Test cho case phí = 0 và âm
> đâu?" — đó là review nhìn hệ thống.

## Ưu tiên rủi ro cao khi thời gian có hạn

Lead không đủ giờ soi mọi dòng của mọi PR. Phân bổ sự chú ý theo **rủi ro**:

![Cây ưu tiên review: rủi ro cao → review sâu; phần phụ ổn định → review nhẹ + spot check](/images/cl-review-priority.png)

| Vùng | Mức chú ý |
|------|-----------|
| Logic tiền/quyền/dữ liệu quan trọng | Rất cao — đọc kỹ, đòi test |
| Thay đổi schema DB / migration | Rất cao — kiểm tra tương thích, rollback |
| Code hạ tầng dùng chung | Cao — ảnh hưởng lan rộng |
| CRUD đơn giản, đã có pattern | Thấp — lướt nhanh, tin convention |

Dùng công cụ review tự động để quét lớp đầu (bug, security, style),
lead dồn thời gian vào phần rủi ro cao mà máy khó bắt: đúng nghiệp vụ, đúng kiến trúc.

## Checklist review nhanh

**Spec**: đủ acceptance criteria chưa? Edge case (null, rỗng, âm, quá hạn) có nói không?
Mâu thuẫn với spec đã chốt trước đó không? Có điểm nào dev sẽ phải đoán?

**Code**: đúng nghiệp vụ không? Có phá convention/kiến trúc không? Error handling đủ chưa?
Có lỗ hổng bảo mật rõ ràng (SQLi, IDOR, log lộ dữ liệu) không? Có test kèm không?

**Test**: có test happy path + edge case + error case không? Test có đúng behavior chứ
không test implementation? Data test có thật/hợp lý không?

## Feedback mang tính xây dựng

Feedback tốt **gắn lý do và gợi mở**, không ra mệnh lệnh cụt lủn:

- ❌ "Sửa lại đoạn này." → member không biết vì sao, dễ ức chế.
- ✅ "Đoạn này nối chuỗi vào query → dính SQLi. Dùng parameterized query như ở `UserRepo`
  nhé." → có lý do, có ví dụ tham chiếu.

Nguyên tắc: **khen cụ thể, chê cụ thể**. Phân biệt "must fix" (chặn merge) và "nit"
(tùy chọn) để member biết ưu tiên. Với member yếu, đặt câu hỏi để họ tự nhận ra thay vì
đưa đáp án sẵn — vừa dạy vừa review.

## Cân bằng tốc độ và chất lượng

Review quá chặt mọi thứ → nghẽn tiến độ, team ức chế. Cho qua hết → nợ kỹ thuật chồng.
Nguyên tắc: **chặt ở vùng rủi ro cao, nới ở vùng an toàn**. Cosmetic thì gợi ý chứ không
chặn merge. Nếu cùng lỗi lặp nhiều lần → đừng review lại từng cái, hãy chuẩn hóa thành
lint/convention/checklist.

## Cạm bẫy hay gặp

- **Bikeshedding**: sa đà tranh cãi naming/format mà bỏ qua bug nghiệp vụ nghiêm trọng.
- **Review theo cảm tính** thay vì checklist → bỏ sót edge case, mỗi lần một kiểu.
- **Feedback dạng mệnh lệnh** không lý do → member làm cho xong, không học được.
- **Chặn merge vì nit** → nghẽn tiến độ, mất thiện chí.
- **Tin máy 100%** → công cụ review tự động bắt bug kỹ thuật nhưng không hiểu nghiệp vụ; phần
  đúng/sai nghiệp vụ vẫn cần lead đọc.

## Ghi nhớ

Lead review nhìn **hệ thống và rủi ro**, không nhìn từng dòng. Dồn thời gian vào vùng rủi
ro cao, để máy quét lớp đầu. Feedback phải **có lý do và phân mức** (must fix vs nit). Lỗi
lặp thì **chuẩn hóa** thay vì review lại. Mục tiêu: chất lượng ổn định mà không nghẽn team.

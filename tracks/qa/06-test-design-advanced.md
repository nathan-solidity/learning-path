---
level: "intermediate"
order: 5
title: "Test design nâng cao & exploratory"
est: "3-4 giờ"
checklist:
  - "Giải thích exploratory testing và khác biệt với scripted testing"
  - "Áp dụng session-based testing: charter, timebox, ghi note để exploratory không thành 'bấm bừa'"
  - "Dùng risk-based testing để dồn công vào chỗ rủi ro cao thay vì test đều tay"
  - "Áp dụng pairwise/combinatorial để cắt bùng nổ tổ hợp mà vẫn phủ tương tác từng cặp"
  - "Kết hợp scripted + exploratory đúng lúc thay vì chọn một bên"
---

## Test case viết sẵn không bắt được mọi lỗi

Bài thiết kế test case cho bạn cách viết case **có phương pháp** — nhưng case viết sẵn chỉ
kiểm những gì bạn **đã nghĩ ra trước**. Lỗi thật hay nằm ở chỗ không ai ngờ tới. Bài này thêm
ba kỹ thuật để test **thông minh hơn**, không chỉ **nhiều hơn**.

> Scripted testing hỏi "phần mềm có làm đúng thứ tôi đã viết ra không". Exploratory testing hỏi
> "còn gì tôi chưa nghĩ tới mà nó làm sai không". Hai câu hỏi khác nhau, và bạn cần cả hai — bộ
> case viết sẵn không bao giờ phủ hết được không gian lỗi thật.

## Exploratory testing

Exploratory = **thiết kế và thực thi test đồng thời**, dùng kết quả vừa thấy để quyết định thử
tiếp cái gì. Không phải "bấm bừa" — nó có kỷ luật riêng.

| Scripted | Exploratory |
|----------|-------------|
| Viết case trước, chạy sau | Vừa khám phá vừa test |
| Lặp lại chính xác, dễ automate | Bám theo linh cảm, khó lặp y hệt |
| Phủ cái đã biết | Phát hiện cái chưa biết |
| Tốt cho regression | Tốt cho feature mới, tìm lỗi lạ |

## Session-based testing — kỷ luật cho exploratory

Để exploratory không thành hỗn loạn, đóng khung nó thành **session có mục tiêu**:

- **Charter**: một câu nêu rõ session này khám phá gì. Ví dụ: *"Khám phá luồng thanh toán với
  thẻ hết hạn / sai số / mất mạng giữa chừng."*
- **Timebox**: giới hạn thời gian (ví dụ 60-90 phút) để tập trung.
- **Note**: ghi lại đã thử gì, thấy gì, nghi ngờ gì — để tái hiện và báo cáo được.

> Khác biệt giữa exploratory testing và "bấm loạn" nằm ở charter và note. Có charter, bạn biết
> mình đang săn gì. Có note, phát hiện của bạn **tái hiện được** và trở thành bug report — thay
> vì "hình như lúc nãy tôi thấy nó lỗi mà giờ không nhớ làm sao".

## Risk-based testing

Không có thời gian test mọi thứ đều tay. **Risk-based** dồn công vào nơi **rủi ro cao nhất**:

```
Rủi ro = Xác suất lỗi  ×  Hậu quả nếu lỗi
```

| Vùng | Ví dụ | Ưu tiên test |
|------|-------|--------------|
| Xác suất cao + hậu quả nặng | Thanh toán, tính tiền, phân quyền | Cao nhất — test kỹ |
| Hậu quả nặng, ít đổi | Đăng nhập, bảo mật dữ liệu | Cao |
| Xác suất cao, hậu quả nhẹ | Lỗi hiển thị nhỏ | Trung bình |
| Ít dùng, hậu quả nhẹ | Trang cấu hình hiếm dùng | Thấp — test nhẹ |

> Test đều tay nghe công bằng nhưng lãng phí: bạn tiêu thời gian như nhau cho nút "Đổi màu
> giao diện" và luồng "Trừ tiền tài khoản". Risk-based nói thẳng: chỗ nào hỏng thì đau nhất,
> đổ công vào đó. Với dự án khách Nhật, hỏi BrSE điểm nào khách coi trọng để xếp rủi ro đúng.

## Pairwise / combinatorial

Khi một tính năng có nhiều tham số, tổ hợp bùng nổ. 4 tham số × 3 giá trị = 81 tổ hợp — không
ai test hết. **Pairwise** dựa trên quan sát: phần lớn lỗi tương tác chỉ cần **từng cặp** giá
trị gặp nhau, không cần mọi tổ hợp.

```
Tham số: OS (Win/Mac) × Browser (Chrome/Safari) × Ngôn ngữ (VN/JP/EN)
Đầy đủ  : 2 × 2 × 3 = 12 tổ hợp
Pairwise: ~6 tổ hợp — vẫn đảm bảo mọi CẶP giá trị (Win+Safari, Mac+JP...) đều xuất hiện ít nhất 1 lần
```

> Pairwise cắt số case xuống mạnh mà giữ được phần lớn khả năng bắt lỗi, vì lỗi do **ba tham
> số cùng lúc** mới sai thì hiếm. Không phải liều thuốc vạn năng — luồng rủi ro cực cao vẫn nên
> test đầy đủ — nhưng cho ma trận cấu hình/thiết bị thì nó tiết kiệm khổng lồ.

## Kết hợp, không chọn một bên

Scripted và exploratory **bổ sung** nhau: scripted cho regression ổn định và automate được;
exploratory cho feature mới và săn lỗi lạ; risk-based quyết **đổ công vào đâu**; pairwise quyết
**cắt tổ hợp thế nào**. Một QA giỏi dùng đúng công cụ cho đúng lúc.

## Cạm bẫy hay gặp

- **Exploratory không charter/note** → thành bấm bừa, phát hiện không tái hiện được.
- **Chỉ scripted, bỏ exploratory** → chỉ bắt được lỗi đã nghĩ ra, bỏ sót lỗi lạ.
- **Test đều tay, bỏ qua rủi ro** → tốn công chỗ ít quan trọng, hụt chỗ nguy hiểm.
- **Cố test đầy đủ mọi tổ hợp** → bùng nổ tổ hợp, không bao giờ xong; dùng pairwise.
- **Dùng pairwise cho luồng rủi ro cực cao** → bỏ sót tổ hợp nguy hiểm cần phủ đầy đủ.

## Ghi nhớ

**Exploratory testing** săn lỗi bạn chưa nghĩ tới — nhưng cần **charter + timebox + note** để
không thành bấm bừa. **Risk-based** dồn công vào nơi *xác suất × hậu quả* cao nhất, thay vì test
đều tay. **Pairwise** cắt bùng nổ tổ hợp mà vẫn phủ tương tác từng cặp. Ba kỹ thuật này **bổ
sung** cho test case viết sẵn, không thay thế — dùng đúng công cụ cho đúng lúc.

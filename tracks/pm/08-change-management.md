---
level: "intermediate"
order: 8
title: "Quản lý thay đổi & scope creep"
est: "2-3 giờ"
checklist:
  - "Nhận diện được scope creep và phân biệt với thay đổi hợp lệ"
  - "Vận hành được một quy trình change request đơn giản (đề xuất → đánh giá → duyệt)"
  - "Đánh giá được tác động của một thay đổi lên scope/time/cost/quality"
  - "Biết cách nói 'không' hoặc 'có nhưng...' với yêu cầu thêm mà không làm hỏng quan hệ"
  - "Ghi nhận và truy vết thay đổi để tránh tranh cãi 'ai đồng ý cái này'"
---

## Thay đổi là chắc chắn — không kiểm soát mới là vấn đề

Không dự án nào chạy đúng y kế hoạch ban đầu. Yêu cầu sẽ đổi, khách sẽ nghĩ ra thứ mới. Vấn đề
không phải "làm sao không có thay đổi" — mà là **thay đổi có đi qua một cửa có kiểm soát hay lọt
vào âm thầm**. Thay đổi lọt âm thầm chính là **scope creep** — kẻ giết dự án phổ biến nhất.

## Scope creep là gì

Scope creep = phạm vi phình dần bằng **nhiều thay đổi nhỏ không ai chính thức duyệt**. Mỗi cái
"chỉ thêm tí thôi" nghe vô hại, nhưng cộng lại làm vỡ tiến độ và ngân sách.

| Thay đổi hợp lệ | Scope creep |
|-----------------|-------------|
| Đi qua quy trình, có đánh giá tác động | Lọt vào qua chat/miệng, không đánh giá |
| Được duyệt và điều chỉnh time/cost | Nhận làm luôn, không đổi deadline |
| Có ghi nhận, truy vết được | Không ai nhớ ai đồng ý |

> Câu nguy hiểm nhất với PM: *"Cái này nhỏ mà, làm luôn giúp anh nhé."* Từng cái nhỏ thì thật,
> nhưng mười cái nhỏ = một milestone trễ. Đặc biệt ở hợp đồng 受託, mỗi cái "làm luôn" là làm
> **free** và ăn thẳng vào margin (bài 6).

## Quy trình change request tối giản

Không cần cồng kềnh, chỉ cần **có một cửa**:

![Quy trình change request: đề xuất → đánh giá tác động → người có thẩm quyền duyệt → cập nhật & lưu dấu vết](/images/pm-change-flow.png)

1. **Đề xuất** — yêu cầu thay đổi được ghi lại (ai, cái gì, vì sao).
2. **Đánh giá tác động** — ảnh hưởng scope/time/cost/quality thế nào? (xem dưới)
3. **Quyết định** — duyệt / từ chối / hoãn, bởi người có thẩm quyền (khách/PO qua BrSE).
4. **Ghi nhận** — cập nhật kế hoạch, thông báo team, lưu quyết định.

> Điểm mấu chốt là bước 2 và 4: **luôn đánh giá tác động trước khi nhận**, và **luôn ghi lại ai
> đã đồng ý gì**. Hai bước này cứu bạn khỏi vô số tranh cãi "nhưng tôi tưởng cái này đã bao gồm rồi".

## Đánh giá tác động của thay đổi

Mọi thay đổi chạm ít nhất một cạnh tam giác. Trả lời rõ:

| Câu hỏi | Ví dụ |
|---------|-------|
| Thêm bao nhiêu effort? | +3 ngày công |
| Ảnh hưởng deadline? | Milestone lùi 2 ngày, hoặc phải cắt việc khác |
| Ảnh hưởng chi phí? | +X, cần phụ lục hợp đồng nếu 受託 |
| Rủi ro chất lượng? | Sửa gấp module A có thể phát sinh regression |

## Nghệ thuật nói "không" (hoặc "có, nhưng...")

PM giỏi hiếm khi nói "không" thẳng — mà làm rõ **đánh đổi**:

- ❌ "Không làm được đâu." (đóng cửa, hỏng quan hệ)
- ✅ "Làm được. Nhưng thêm cái này thì milestone X lùi 3 ngày, hoặc mình đổi ưu tiên bỏ Y. Anh
  muốn hướng nào?"

> Cách này chuyển quyết định đánh đổi về đúng người có thẩm quyền (khách), thay vì PM âm thầm gánh.
> Nó cũng cho khách thấy PM **kiểm soát được** dự án — tăng niềm tin, không giảm. Với khách Nhật,
> trình bày rõ đánh đổi và để họ quyết còn được coi trọng hơn là "cố hết sức chiều" rồi trễ.

## Truy vết thay đổi

Mọi thay đổi được duyệt phải để lại dấu vết: trong issue tracker, biên bản họp, hoặc
phụ lục. So sánh phiên bản spec khi cần chứng minh
"scope đã đổi so với lúc ký".

## Cạm bẫy hay gặp

- **Nhận "làm luôn" qua chat/miệng** → scope creep, không ai chịu trách nhiệm.
- **Không đánh giá tác động** → nhận thay đổi rồi mới phát hiện vỡ tiến độ.
- **Nói "không" cụt lủn** → hỏng quan hệ; nên nói rõ đánh đổi để khách chọn.
- **Không ghi lại ai đồng ý gì** → tranh cãi vô tận, thường phần thua về phía offshore.
- **Ở 受託 mà làm thêm không phụ lục** → làm free, lỗ trực tiếp.

## Ghi nhớ

Thay đổi là **tất yếu**; nguy hiểm là để nó **lọt âm thầm** = scope creep. Cho thay đổi đi qua
**một cửa**: đề xuất → **đánh giá tác động** (scope/time/cost/quality) → người có thẩm quyền duyệt →
**ghi nhận**. Đừng nói "không" cụt — nói **"có, nhưng đánh đổi là..."** và để khách chọn. Và luôn
**lưu dấu vết ai đồng ý gì** — đặc biệt sống còn với hợp đồng 受託.

---
level: "advanced"
order: 7
title: "Lập kế hoạch & theo dõi công việc BA"
est: "3-4 giờ"
checklist:
  - "Giải thích được BA Planning là gì và vì sao cần trước khi lao vào lấy yêu cầu"
  - "Xác định được stakeholder và mức độ ảnh hưởng/quan tâm của từng người"
  - "Chọn được cách tiếp cận phù hợp (waterfall vs agile) cho một dự án cụ thể"
  - "Lập được kế hoạch quản lý yêu cầu: lưu ở đâu, ai duyệt, cách theo dõi thay đổi"
  - "Biết cách theo dõi tiến độ công việc BA và phát hiện khi bị chậm/thiếu"
related:
  - "glossary:ba"
  - "playbook:ba"
---

## Vì sao cần lập kế hoạch trước

Đây là knowledge area **đầu tiên** của BABOK — nhưng hay bị người mới bỏ qua vì tưởng "cứ
đi hỏi yêu cầu là xong". Không có kế hoạch, BA dễ: hỏi nhầm người, bỏ sót stakeholder, lấy
yêu cầu xong không biết lưu/duyệt ở đâu, và không phát hiện được khi mình đang chậm.

## Stakeholder analysis

Không phải ai cũng ảnh hưởng như nhau. Phân loại theo 2 trục **quyền lực** và **mức quan
tâm**:

| | Quan tâm thấp | Quan tâm cao |
|---|---|---|
| **Quyền lực cao** | Giữ hài lòng (thông báo định kỳ) | Quản lý sát (họp, xác nhận kỹ) |
| **Quyền lực thấp** | Theo dõi (ít tốn công) | Cập nhật thường xuyên |

Với mỗi stakeholder, ghi rõ: họ **cần gì**, họ **cung cấp thông tin gì**, kênh liên lạc,
tần suất. Trong dự án offshore, khách Nhật + BrSE + PO nội bộ thường ở ô "quản lý sát".

## Chọn cách tiếp cận

- **Predictive / Waterfall**: yêu cầu chốt sớm, tài liệu đầy đủ trước khi code. Hợp khi
  phạm vi rõ, thay đổi ít, hợp đồng cứng.
- **Adaptive / Agile**: yêu cầu tinh chỉnh dần theo sprint. Hợp khi phạm vi còn mơ hồ, cần
  giao sớm và học từ feedback.

Nhiều dự án là **lai** (hybrid): spec tổng chốt theo waterfall, chi tiết làm rõ dần theo
sprint. BA cần biết mình đang ở mô hình nào để chọn mức tài liệu phù hợp.

## Kế hoạch quản lý yêu cầu

Trả lời trước các câu hỏi vận hành, tránh hỗn loạn về sau:
- Yêu cầu **lưu ở đâu**? (Backlog, spec document, Google Sheet Q&A...)
- Ai có quyền **duyệt/chốt** một yêu cầu? Chốt bằng hình thức nào (sign-off)?
- Thay đổi yêu cầu đi qua **quy trình nào**? (xem bài *Impact Analysis*)
- Cách đánh **version** và truy vết (traceability) từ yêu cầu → spec → test case.

## Theo dõi & phát hiện chậm trễ

- Danh sách câu hỏi mở với khách có đang "treo" quá lâu không?
- Có yêu cầu nào chưa được làm rõ mà dev sắp cần không?
- Ước lượng effort ban đầu so với thực tế lệch bao nhiêu?

> BA giỏi không đợi bị hỏi "sao chậm vậy" — mà chủ động báo sớm khi thấy rủi ro về yêu cầu.

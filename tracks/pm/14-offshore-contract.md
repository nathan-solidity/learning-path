---
level: "advanced"
order: 14
title: "Mô hình hợp đồng offshore (ラボ / 受託)"
est: "2-3 giờ"
checklist:
  - "Phân biệt được hợp đồng ラボ (lab/dispatch) và 受託 (fixed-price) về trách nhiệm và rủi ro"
  - "Biết ai chịu rủi ro khi effort vượt ước lượng trong mỗi mô hình"
  - "Hiểu ranh giới pháp lý về 偽装請負 (giả trang thầu phụ) và vì sao PM cần né"
  - "Xác định được các mốc nghiệm thu (検収) và điều kiện thanh toán trong 受託"
  - "Chọn được mô hình phù hợp theo độ rõ của scope"
related:
  - "skill:nta-effort-estimate"
  - "skill:nta-risk-assessment"
---

## Vì sao PM offshore phải hiểu mô hình hợp đồng

PM thường nghĩ hợp đồng là việc của sales/sếp. Nhưng loại hợp đồng **quyết định toàn bộ cách bạn
quản lý**: ai chịu rủi ro khi vượt effort, đo thành công bằng gì, ai được chỉ đạo công việc. Quản
một dự án 受託 như ラボ (hoặc ngược lại) là sai lầm tốn kém — thậm chí phạm luật lao động Nhật.

## Hai mô hình chính

| | ラボ (Lab / 派遣型) | 受託 (Fixed-price / 請負) |
|---|---------------------|---------------------------|
| Bán cái gì | **Năng lực** — team theo thời gian | **Kết quả** — sản phẩm bàn giao |
| Trả tiền theo | Số người × tháng | Giá chốt cho scope chốt |
| Ai chỉ đạo công việc hằng ngày | Phía khách (về nguyên tắc) | **Bên nhận** (mình tự quản) |
| Ai chịu rủi ro vượt effort | **Khách** | **Bên nhận (mình)** |
| Scope phù hợp | Còn mờ, đổi thường xuyên | Rõ ràng, chốt được |

> Điểm mấu chốt PM phải khắc: **ở 受託, ước lượng sai là mình chịu lỗ**; ở ラボ, khách trả theo
> thời gian nên rủi ro effort thuộc khách — nhưng đổi lại khách canh **utilization** (team có làm
> việc hiệu quả không). Mỗi mô hình đổi hoàn toàn thứ PM phải bảo vệ.

## ラボ: quản gì

- **Utilization / hiệu suất** — khách trả theo người-tháng, nên quan tâm team có được dùng đúng
  và hiệu quả không. Người rảnh = khách trả tiền vô ích.
- **Tính liên tục** — team ổn định, ít thay người, tích lũy hiểu biết dự án theo thời gian.
- **Minh bạch** — khách nhìn thấy team làm gì; báo cáo thường xuyên để duy trì niềm tin.

## 受託: quản gì

- **Không để effort thực vượt ước lượng** — mỗi giờ vượt ăn thẳng vào margin (bài 6).
- **Kiểm soát scope tuyệt đối** — mọi thay đổi phải qua change request + phụ lục (bài 8). "Làm
  luôn giúp" ở 受託 = làm free.
- **Mốc nghiệm thu (検収 / kensa)** — sản phẩm được khách kiểm tra và **chấp nhận chính thức** theo
  tiêu chí đã thỏa thuận; thanh toán thường gắn với nghiệm thu. Định nghĩa tiêu chí nghiệm thu rõ
  từ đầu, nếu không sẽ mắc kẹt sửa vô hạn.

## 偽装請負 — ranh giới pháp lý phải né

**偽装請負 (giả trang thầu phụ)** là khi hợp đồng ký là 請負/受託 (bán kết quả) nhưng thực tế khách
**chỉ đạo trực tiếp** từng nhân sự như nhân viên của họ. Đây là **vi phạm luật lao động Nhật**.

> Ý nghĩa thực dụng cho PM: ở hợp đồng 受託, **khách không được chỉ đạo trực tiếp từng dev** — mọi
> chỉ đạo phải đi **qua PM/bên nhận**. Nếu khách nhắn thẳng dev giao việc hằng ngày, đó là dấu hiệu
> 偽装請負 và PM phải điều hướng lại đúng kênh. Đây không chỉ là quy trình — là rủi ro pháp lý cho
> cả hai công ty.

## Chọn mô hình theo độ rõ của scope

| Tình huống | Mô hình hợp hơn |
|------------|-----------------|
| Scope chốt kỹ, ít đổi, muốn giá cố định | 受託 |
| Scope còn mờ, sản phẩm sẽ tiến hóa, cần linh hoạt | ラボ |
| Cần team dài hạn, quan hệ đối tác lâu dài | ラボ |
| Việc rời rạc, có deliverable rõ từng phần | 受託 theo từng phần |

> Ép 受託 lên một dự án scope còn mờ là công thức thảm họa: khách đổi liên tục, mỗi lần đổi là tranh
> cãi phụ lục, quan hệ rạn. Khi scope chưa rõ, ラボ (hoặc chia pha nhỏ) an toàn hơn cho cả hai.

## Cạm bẫy hay gặp

- **Quản 受託 như ラボ** → nhận thay đổi thoải mái, effort vượt, lỗ.
- **Quản ラボ như 受託** → ôm hết rủi ro không cần thiết, hoặc bỏ lơ utilization.
- **Để khách chỉ đạo trực tiếp dev ở 受託** → rủi ro 偽装請負, sai kênh trách nhiệm.
- **Không định nghĩa tiêu chí nghiệm thu (検収)** → sửa vô hạn, không được thanh toán.
- **Ép 受託 lên scope còn mờ** → tranh cãi phụ lục liên miên, rạn quan hệ.

## Ghi nhớ

**ラボ** bán năng lực (khách chịu rủi ro effort, mình canh utilization); **受託** bán kết quả (mình
chịu rủi ro effort, phải kiểm soát scope và effort tuyệt đối). Ở 受託, mọi chỉ đạo đi **qua PM** —
khách chỉ đạo thẳng dev là dấu hiệu **偽装請負**, rủi ro pháp lý. Định nghĩa **検収** (nghiệm thu) rõ
từ đầu. Chọn mô hình theo **độ rõ của scope**: scope mờ thì đừng ép 受託.

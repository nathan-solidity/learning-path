---
level: "intermediate"
order: 6
title: "Quản lý chi phí & ngân sách"
est: "3 giờ"
checklist:
  - "Tính được chi phí dự án từ effort (man-month) và đơn giá"
  - "Phân biệt fixed cost và variable cost trong dự án phần mềm"
  - "Theo dõi được ngân sách thực tế vs kế hoạch (budget burn) và phát hiện vượt sớm"
  - "Giải thích được khái niệm margin (biên lợi nhuận) và vì sao PM phải quan tâm"
  - "Nắm khác biệt chi phí giữa hợp đồng ラボ (lab) và 受託 (fixed-price)"
---

## Vì sao PM phải nghĩ về tiền

Nhiều PM kỹ thuật xuất thân né phần tài chính, nghĩ "đó là việc sếp/sales". Sai. Một dự án về
đúng scope–time nhưng **lỗ** vẫn là thất bại. PM là người duy nhất nhìn thấy effort thực tế
hằng ngày — nên cũng là người phát hiện **vượt ngân sách** sớm nhất. Không hiểu tiền = quản lý
mù một cạnh của tam giác (cost).

## Từ effort ra chi phí

Công thức nền tảng:

> **Chi phí nhân sự = Effort (man-month) × Đơn giá/người/tháng**

Ví dụ: dự án ước lượng **20 man-month**, đơn giá trung bình **2.500 USD/người/tháng** →
chi phí nhân sự ≈ **50.000 USD**. Đây là phần lớn nhất của dự án phần mềm.

Nhưng đừng quên các chi phí khác:

| Loại | Ví dụ |
|------|-------|
| **Nhân sự** | Lương/đơn giá dev, QA, PM, BrSE |
| **Hạ tầng** | Server, cloud, license công cụ (Backlog, Figma, CI) |
| **Overhead** | Quản lý, tuyển dụng, văn phòng (thường tính theo % lương) |
| **Dự phòng (contingency)** | Buffer cho rủi ro — thường 10-20% |

## Fixed cost vs variable cost

- **Fixed cost** — không đổi theo khối lượng công việc trong kỳ: lương cứng, thuê văn phòng,
  license theo năm.
- **Variable cost** — thay đổi theo khối lượng: cloud tính theo dùng, OT, thuê ngoài theo giờ.

> Ý nghĩa cho PM: khi cắt scope để tiết kiệm, **fixed cost không giảm ngay** (người vẫn phải trả
> lương tháng này). Tiết kiệm thật đến từ variable cost hoặc điều chuyển người sang dự án khác.

## Theo dõi ngân sách: budget burn

Giống burndown chart nhưng cho tiền. So sánh **đã tiêu** vs **kế hoạch tiêu** theo thời gian:

![So % ngân sách đã tiêu vs % việc đã xong; tiêu 70% mà mới xong 50% là cảnh báo đỏ](/images/pm-budget-burn.png)

- Tiêu nhanh hơn kế hoạch mà tiến độ không tương xứng → **cảnh báo đỏ**, sẽ vượt ngân sách.
- Tiêu chậm hơn nhưng vì việc bị block/chưa làm → cũng là rủi ro (dồn cục về sau).

> Chỉ số quan trọng: **% ngân sách đã tiêu vs % công việc đã hoàn thành**. Tiêu 70% tiền mà mới
> xong 50% việc là dấu hiệu sắp lỗ — phát hiện ở tuần thứ 6 còn cứu được, phát hiện ở tuần cuối
> thì không.

## Margin — biên lợi nhuận

**Margin = (Doanh thu − Chi phí) / Doanh thu.** Đây là thứ quyết định dự án có lời không.

> PM không cần định giá bán (việc của sales), nhưng phải hiểu: mỗi giờ OT không được tính thêm,
> mỗi lần rework do hiểu sai spec, mỗi tuần trễ — đều **ăn vào margin**. Kiểm soát scope creep và
> chất lượng chính là bảo vệ lợi nhuận, không chỉ là "làm cho tốt".

## Chi phí theo loại hợp đồng: ラボ vs 受託

Hai mô hình chính với khách Nhật (học sâu ở bài 14) khác nhau căn bản về ai chịu rủi ro chi phí:

| | ラボ (Lab / thuê team) | 受託 (Fixed-price / trọn gói) |
|---|------------------------|-------------------------------|
| Trả tiền theo | Số người × thời gian | Sản phẩm bàn giao, giá chốt |
| Ai chịu rủi ro vượt effort | **Khách** | **Bên nhận (mình)** |
| PM cần canh gì nhất | Hiệu suất sử dụng người (utilization) | Không để effort thực vượt ước lượng |

> Ở hợp đồng 受託, ước lượng sai = **mình chịu lỗ**. Đó là lý do bài ước lượng (5) và kiểm soát
> scope creep (bài 8) đặc biệt sống còn với hợp đồng trọn gói.

## Cạm bẫy hay gặp

- **Không theo dõi budget burn** → phát hiện vượt ngân sách vào phút chót, không kịp cứu.
- **Quên contingency** → rủi ro xảy ra là vỡ ngân sách ngay.
- **Nghĩ OT là "miễn phí"** → OT ăn vào margin và đốt sức team, lỗ kép.
- **Nhận scope thêm ở hợp đồng 受託 mà không đàm phán phụ lục** → làm free, lỗ trực tiếp.
- **Chỉ nhìn tiến độ, không nhìn chi phí** → về đích đúng hạn nhưng lỗ vẫn là thất bại.

## Ghi nhớ

Chi phí = **effort × đơn giá** cộng hạ tầng, overhead, dự phòng. Phân biệt fixed vs variable để
biết cắt gì mới tiết kiệm thật. Theo dõi **budget burn** — so **% tiền tiêu vs % việc xong** để
bắt vượt ngân sách sớm. Mọi OT/rework/trễ đều ăn vào **margin**. Và nhớ: hợp đồng **受託 thì rủi
ro ước lượng thuộc về mình** — kiểm soát scope và chất lượng chính là bảo vệ lợi nhuận.

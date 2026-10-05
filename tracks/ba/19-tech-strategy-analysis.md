---
level: "techniques"
order: 19
title: "Techniques: Strategy Analysis"
est: "4-5 giờ"
checklist:
  - "Giải thích được Strategy Analysis trả lời câu hỏi gì: vì sao làm, làm gì để đạt mục tiêu"
  - "Lập được bảng SWOT cho một sản phẩm/dự án với đủ 4 ô có nội dung cụ thể"
  - "Dùng được 5 Whys hoặc Fishbone để truy về root cause thay vì chữa triệu chứng"
  - "Vẽ được Scope Model phân định rõ cái gì trong/ngoài phạm vi để tránh scope creep"
  - "Lập được bảng Decision Analysis chấm điểm nhiều phương án theo tiêu chí có trọng số"
  - "Biết khi nào cần Financial Analysis (ROI/payback) để thuyết phục quyết định đầu tư"
related:
  - "glossary:scope"
  - "glossary:rca"
  - "skill:nta-risk-assessment"
---

## Strategy Analysis là gì?

Strategy Analysis trả lời hai câu hỏi gốc: **vì sao** tổ chức cần thay đổi, và **làm gì**
để đi từ hiện trạng (as-is) tới trạng thái mong muốn (to-be). Đây là nhóm technique BA
dùng ở **đầu dự án** hoặc khi định hướng lại — trước khi lao vào chi tiết yêu cầu.

Với BA offshore, phần Strategy Analysis thường do phía khách/BrSE nắm chính, nhưng BA
hiểu các technique này sẽ **đặt được câu hỏi đúng**: dự án này giải quyết vấn đề gì, phạm
vi tới đâu, và phương án nào đáng làm nhất. Hiểu "vì sao" giúp BA không làm sai thứ khách
thực sự cần.

### SWOT Analysis

**Là gì**: Đánh giá **S**trengths / **W**eaknesses (nội tại) và **O**pportunities /
**T**hreats (bên ngoài) của một sản phẩm, dự án hay tổ chức.

**Khi nào dùng**: Đầu dự án để hiểu bối cảnh, hoặc khi cân nhắc một hướng đi lớn.

**Ví dụ thực tế** — SWOT cho quyết định "có nên tự build hệ thống thay vì mua SaaS":

| | Tích cực | Tiêu cực |
|--|----------|----------|
| **Nội tại** | **S**: Team có kinh nghiệm Rails, kiểm soát được dữ liệu | **W**: Thiếu người DevOps, bảo trì lâu dài tốn |
| **Bên ngoài** | **O**: Có thể tùy biến sâu theo nghiệp vụ khách Nhật | **T**: SaaS đối thủ ra tính năng nhanh hơn |

> **Cạm bẫy**: SWOT dễ thành liệt kê chung chung. Mỗi ô phải cụ thể tới mức **hành động
> được** (vd "thiếu DevOps" → cần thuê/đào tạo trước khi cam kết).

### Business Model Canvas

**Là gì**: Một khung 9 ô mô tả cách tổ chức tạo, phân phối và thu giá trị (khách hàng,
kênh, nguồn thu, chi phí, hoạt động chính...).

**Khi nào dùng**: Khi cần hiểu mô hình kinh doanh của khách để biết tính năng nào thực sự
tạo giá trị.

**Ví dụ thực tế**: Trước khi build hệ thống bán hàng cho khách, BA phác Canvas để hiểu
nguồn thu chính của họ là hoa hồng theo đơn — từ đó biết tính năng "theo dõi hoa hồng"
quan trọng hơn "gợi ý sản phẩm", dù khách chưa nói rõ.

### Business Capability Analysis

**Là gì**: Xác định tổ chức **có khả năng làm được gì** (capability) và đánh giá mức
trưởng thành / khoảng trống của từng khả năng.

**Khi nào dùng**: Khi định hướng đầu tư — nên nâng cấp năng lực nào trước.

**Ví dụ thực tế**: Khách có capability "xử lý đơn hàng" nhưng còn thủ công. Phân tích cho
thấy đây là điểm nghẽn tăng trưởng → ưu tiên tự động hóa mảng này trước mảng marketing.

### Root Cause Analysis (5 Whys, Fishbone)

**Là gì**: Truy về **nguyên nhân gốc** của một vấn đề thay vì chữa triệu chứng. Hai công
cụ phổ biến: **5 Whys** (hỏi "tại sao" liên tiếp) và **Fishbone/Ishikawa** (sơ đồ xương
cá nhóm nguyên nhân theo hạng mục).

**Khi nào dùng**: Khi có sự cố, khiếu nại, hoặc yêu cầu mơ hồ kiểu "hệ thống chậm" — cần
đào tới gốc.

**Ví dụ thực tế** — 5 Whys cho "khách phàn nàn đặt hàng hay lỗi":

1. Vì sao lỗi? → Đơn không lưu được.
2. Vì sao không lưu? → Timeout khi gọi API tính phí.
3. Vì sao timeout? → API tính phí query DB chậm.
4. Vì sao chậm? → Thiếu index trên bảng phí.
5. Vì sao thiếu index? → Không có bước review DB khi thêm bảng.

→ **Root cause**: quy trình thiếu bước review DB, không phải "khách thao tác sai".

> **Cạm bẫy**: Dừng quá sớm ở triệu chứng (sửa timeout mà không thêm index). Hỏi tiếp
> tới khi ra nguyên nhân **có thể phòng ngừa lần sau**.


![Fishbone (Ishikawa): gom nguyên nhân theo nhóm để truy về root cause, không dừng ở triệu chứng](/images/ba-fishbone.png)

### Scope Modelling

**Là gì**: Mô hình hóa **ranh giới** của giải pháp — cái gì trong phạm vi, cái gì ngoài.

**Khi nào dùng**: Đầu dự án và mỗi khi có yêu cầu phát sinh, để chống **scope creep**.

**Ví dụ thực tế**: BA lập bảng In/Out scope rõ ràng và cho khách ký xác nhận:

| Trong phạm vi | Ngoài phạm vi (phase sau) |
|---------------|---------------------------|
| Đặt hàng, thanh toán qua thẻ | Thanh toán trả góp |
| Quản lý đơn của 1 chi nhánh | Đa chi nhánh |

Khi khách yêu cầu "thêm trả góp", BA chỉ vào bảng: đây là ngoài scope → cần CR (change
request) và ước lượng lại.

### Financial Analysis

**Là gì**: Đánh giá giá trị tài chính của một phương án — chi phí, lợi ích, ROI, thời gian
hoàn vốn (payback period).

**Khi nào dùng**: Khi cần thuyết phục quyết định đầu tư hoặc so sánh phương án về mặt tiền.

**Ví dụ thực tế**: Đề xuất tự động hóa quy trình tốn 200 giờ dev nhưng tiết kiệm 40
giờ/tháng nhân sự → payback ~5 tháng. Con số này thuyết phục hơn "nên tự động cho hiện
đại".

### Balanced Scorecard

**Là gì**: Khung đo hiệu quả tổ chức trên 4 khía cạnh: Tài chính, Khách hàng, Quy trình
nội bộ, Học hỏi & phát triển — để không chỉ nhìn tiền.

**Khi nào dùng**: Khi định nghĩa mục tiêu và KPI cân bằng cho một sáng kiến.

**Ví dụ thực tế**: Dự án cải tiến hệ thống không chỉ đo "giảm chi phí" (tài chính) mà còn
đo "thời gian xử lý đơn giảm" (quy trình) và "điểm hài lòng khách tăng" (khách hàng).

### Benchmarking and Market Analysis

**Là gì**: So sánh với đối thủ / chuẩn ngành để tìm khoảng cách và cơ hội cải tiến.

**Khi nào dùng**: Khi cần biết "đối thủ làm thế nào" trước khi quyết định tính năng.

**Ví dụ thực tế**: Trước khi thiết kế màn checkout, BA khảo sát 3 sản phẩm cùng ngành,
thấy tất cả đều cho thanh toán 1 chạm → đề xuất khách bổ sung để không tụt hậu.

### Vendor Assessment

**Là gì**: Đánh giá nhà cung cấp/đối tác (dịch vụ, thư viện, SaaS) theo tiêu chí trước khi
chọn.

**Khi nào dùng**: Khi phải chọn bên thứ ba (cổng thanh toán, dịch vụ gửi email, thư viện).

**Ví dụ thực tế**: Chọn cổng thanh toán, BA chấm các nhà cung cấp theo phí giao dịch, độ
ổn định, tài liệu API, hỗ trợ tiếng Nhật → ra quyết định có căn cứ, không cảm tính.

### Decision Analysis

**Là gì**: So sánh nhiều phương án một cách có cấu trúc — chấm điểm theo **tiêu chí có
trọng số** để chọn khách quan.

**Khi nào dùng**: Khi có nhiều lựa chọn và cần quyết định minh bạch, giải trình được.

**Ví dụ thực tế** — chọn giữa 3 thư viện upload file (thang điểm 1-5):

| Tiêu chí | Trọng số | Lib A | Lib B | Lib C |
|----------|:--------:|:-----:|:-----:|:-----:|
| Dễ tích hợp | 3 | 5 | 3 | 4 |
| Tài liệu tốt | 2 | 4 | 5 | 3 |
| Cộng đồng lớn | 1 | 3 | 5 | 4 |
| **Tổng có trọng số** | | **26** | **24** | **22** |

→ Chọn Lib A, và **có bảng để giải thích** cho khách/leader vì sao.

> **Cạm bẫy**: Chọn tiêu chí và trọng số theo cảm tính để "ra kết quả mình muốn". Thống
> nhất tiêu chí + trọng số **trước** khi chấm điểm.

## Bảng tổng hợp — dùng technique nào khi nào

| Câu hỏi cần trả lời | Technique |
|---------------------|-----------|
| Bối cảnh nội tại/bên ngoài ra sao? | SWOT |
| Khách kiếm tiền bằng cách nào? | Business Model Canvas |
| Nên đầu tư nâng năng lực nào? | Business Capability Analysis |
| Vì sao vấn đề này xảy ra? | Root Cause Analysis |
| Cái gì trong/ngoài phạm vi? | Scope Modelling |
| Phương án này có đáng tiền? | Financial Analysis |
| Mục tiêu có cân bằng không? | Balanced Scorecard |
| Đối thủ làm thế nào? | Benchmarking |
| Chọn nhà cung cấp nào? | Vendor Assessment |
| Chọn phương án nào cho khách quan? | Decision Analysis |

## Template áp dụng ngay — khung 5 Whys

```
Vấn đề: ______________________________________
Why 1: _______________________________________
Why 2: _______________________________________
Why 3: _______________________________________
Why 4: _______________________________________
Why 5: _______________________________________
→ Root cause: ________________________________
→ Hành động phòng ngừa: ______________________
```

## Ghi nhớ

Strategy Analysis giúp BA luôn trả lời được **"vì sao làm cái này"** trước khi chìm vào
chi tiết. Một BA biết SWOT, Scope Modelling và Decision Analysis sẽ đặt câu hỏi sắc hơn,
chống scope creep tốt hơn, và bảo vệ được đề xuất bằng con số thay vì cảm tính — điều đặc
biệt giá trị khi làm việc với khách Nhật vốn coi trọng lập luận có căn cứ.

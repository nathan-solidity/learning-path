---
level: "techniques"
order: 21
title: "Techniques: Solution Evaluation"
est: "4-5 giờ"
checklist:
  - "Phân biệt được đo 'giải pháp chạy đúng' với đo 'giải pháp tạo ra giá trị nghiệp vụ'"
  - "Đề xuất được bộ metric/KPI đo giá trị thực tế cho một tính năng sau release"
  - "Lập được bảng Cost-Benefit / ROI đơn giản để đánh giá một giải pháp"
  - "Chọn đúng technique thu thập phản hồi sau release (survey / observation / focus group)"
  - "Dùng Process Analysis để tìm điểm nghẽn trong quy trình đang chạy thật"
related:
  - "glossary:kpi"
---

## Về nhóm technique này

**Solution Evaluation** là knowledge area đánh giá **giải pháp đã triển khai có thực sự tạo
giá trị không** — không phải "phần mềm có chạy không" (đó là việc của QA), mà "phần mềm có
giải quyết được vấn đề nghiệp vụ ban đầu không". Đây là mảng BA hay bỏ quên: release xong
là coi như hết việc, trong khi giá trị thật chỉ đo được **sau khi người dùng thật dùng**.

Bài này bổ sung phần technique cụ thể cho bài *Đánh giá giải pháp sau release* (09) — trỏ
sang đó để xem khung tổng quát; ở đây đi vào từng technique.

### Bảng chọn technique

| Muốn biết điều gì | Technique |
|-------------------|-----------|
| Giải pháp có đạt mục tiêu số không | Metrics & KPIs |
| Lợi ích có xứng chi phí không | Financial Analysis (ROI, cost-benefit) |
| Quy trình thật đang nghẽn ở đâu | Process Analysis |
| Người dùng thật nghĩ gì | Survey, Focus Groups, Observation |
| Có pattern ẩn trong dữ liệu vận hành | Data Mining |
| Rủi ro còn lại sau release | Risk Analysis |
| Nên tiếp tục / sửa / bỏ giải pháp | Decision Analysis |
| Năng lực nghiệp vụ nào còn thiếu | Business Capability Analysis |

---

## Metrics and KPIs — góc độ đo giá trị

### Là gì
KPI đã giới thiệu ở bài *Đánh giá giải pháp sau release* (09). Ở đây nhấn mạnh sự khác biệt
giữa **output metric** (phần mềm chạy) và **outcome metric** (giá trị nghiệp vụ).

### Ví dụ thực tế
Tính năng "đặt lại mật khẩu qua email":
- **Output** (dev/QA quan tâm): email gửi thành công 99.9%, response < 500ms.
- **Outcome** (BA quan tâm): tỉ lệ ticket "quên mật khẩu" gửi lên support **giảm 60%** sau
  1 tháng. → *Đây* mới là giá trị thực tế cần đo.

| Loại | Câu hỏi | Ví dụ |
|------|---------|-------|
| Output | Phần mềm có chạy đúng không? | Uptime, error rate, response time |
| Outcome | Có tạo ra giá trị không? | Giảm thời gian xử lý, tăng conversion, giảm ticket |

> **Cạm bẫy**: chỉ báo cáo output ("tính năng chạy ổn định") mà không đo outcome. Khách hàng
> trả tiền cho outcome, không phải uptime.


![Output metric ('phần mềm chạy đúng') vs outcome metric ('tạo ra giá trị nghiệp vụ')](/images/ba-output-outcome.png)

## Financial Analysis (ROI, Cost-Benefit)

### Là gì
Ước tính **chi phí** (phát triển, vận hành, đào tạo) so với **lợi ích** (tiết kiệm, doanh
thu tăng) để quyết định giải pháp có đáng làm/giữ không.

### Khi nào dùng
Trước khi đề xuất tính năng lớn, và sau release để xác nhận lợi ích dự kiến có thành hiện
thực.

### Template — Cost-Benefit đơn giản
| Hạng mục | Loại | Ước tính (năm) |
|----------|------|----------------|
| Chi phí phát triển | Cost | 200 man-hour |
| Chi phí vận hành/năm | Cost | 20 man-hour |
| Tiết kiệm nhân sự nhập liệu | Benefit | 500 man-hour |
| **Net** | | **+280 man-hour/năm** |

ROI = (Lợi ích − Chi phí) / Chi phí. Với BA offshore, quy về **man-hour** dễ thuyết phục
hơn tiền tệ vì tránh tranh cãi tỉ giá.

> **Cạm bẫy**: chỉ tính chi phí phát triển, quên chi phí vận hành/bảo trì dài hạn.

## Process Analysis

### Là gì
Phân tích quy trình **đang chạy thật** để tìm điểm nghẽn, bước thừa, bước thủ công có thể
tự động hóa. Khác Process Modelling (vẽ quy trình nên có) — Process Analysis mổ xẻ quy
trình *thực tế* để cải tiến.

### Ví dụ thực tế
Sau khi release hệ thống duyệt đơn, BA đo thời gian mỗi bước từ log: phát hiện bước "chờ
manager duyệt" trung bình mất 2 ngày trong tổng 2.5 ngày. → Điểm nghẽn rõ ràng, đề xuất
auto-approve đơn nhỏ. Không phân tích thì cứ tưởng hệ thống chậm.

> **Cạm bẫy**: phân tích quy trình theo cảm tính thay vì số liệu thật (log, timestamp).

## Thu thập phản hồi: Survey / Focus Groups / Observation

Các technique này đã xuất hiện ở nhóm Elicitation, nhưng ở Solution Evaluation dùng để đo
**phản ứng của người dùng thật với giải pháp đã có**:

- **Survey/Questionnaire**: đo diện rộng, định lượng ("bạn hài lòng mức mấy /5"). Nhanh,
  nhiều người, nhưng nông.
- **Focus Groups**: nhóm nhỏ thảo luận sâu, hiểu *vì sao* người dùng thích/ghét.
- **Observation**: quan sát người dùng thao tác thật — phát hiện chỗ họ lúng túng mà chính
  họ không nói ra trong survey.

### Ví dụ thực tế
Survey cho điểm 3/5 cho màn hình mới nhưng không rõ vì sao. Observation phát hiện: người
dùng phải cuộn xuống tìm nút "Lưu" bị khuất — vấn đề UX cụ thể mà survey không lộ ra.

> **Cạm bẫy**: chỉ dựa survey. Số điểm cho biết *có vấn đề*, không cho biết *vấn đề gì* —
> cần observation/focus group để đào sâu.

## Data Mining

### Là gì
Khai thác **pattern ẩn** trong dữ liệu vận hành: nhóm khách hay bỏ giỏ hàng ở bước nào,
sản phẩm nào hay bị trả, thời điểm nào tải cao.

### Khi nào dùng
Khi đã có đủ dữ liệu thật sau release và muốn tìm insight không thấy bằng mắt thường.

### Ví dụ thực tế
Phân tích log đặt hàng phát hiện 40% khách bỏ giỏ ngay ở bước nhập địa chỉ → giả thuyết:
form địa chỉ quá dài. Đề xuất rút gọn, rồi đo lại tỉ lệ bỏ giỏ.

> **Cạm bẫy**: nhầm tương quan với nhân quả. Data mining cho *giả thuyết*, phải verify thêm
> trước khi kết luận.

## Risk & Decision Analysis (sau release)

- **Risk Analysis**: rủi ro còn lại sau khi giải pháp chạy (dữ liệu sai, tải tăng đột biến,
  phụ thuộc bên thứ ba). Đã giới thiệu ở bài *Impact Analysis* (08) — ở đây áp cho giai đoạn
  vận hành.
- **Decision Analysis**: khi có nhiều lựa chọn (tiếp tục / sửa / thay / bỏ giải pháp), lập
  bảng tiêu chí có trọng số để chọn khách quan thay vì cảm tính.
- **Business Capability Analysis**: đối chiếu "năng lực nghiệp vụ tổ chức cần" với "giải
  pháp hiện có đáp ứng được bao nhiêu" — tìm khoảng trống năng lực còn thiếu.

## Ghi nhớ

Solution Evaluation là lúc BA **đóng vòng lặp**: yêu cầu ban đầu sinh ra để giải quyết vấn
đề gì, giờ đo xem vấn đề đó đã được giải quyết chưa. Luôn tách **output** (chạy đúng) khỏi
**outcome** (tạo giá trị) — và đo outcome bằng số thật, không bằng cảm giác "chắc là ổn".

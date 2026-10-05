---
level: "techniques"
order: 16
title: "Techniques: BA Planning & Monitoring"
est: "3-4 giờ"
checklist:
  - "Vẽ được stakeholder map theo 2 trục quyền lực/quan tâm cho một dự án cụ thể"
  - "Chọn đúng technique để ước lượng (Estimation) và biết khi nào dùng loại nào"
  - "Lập được Roles and Permissions Matrix cho một tính năng có nhiều vai trò"
  - "Chạy được một buổi Brainstorming có luật rõ ràng, không lạc đề"
  - "Xác định được top rủi ro yêu cầu và cách theo dõi (Item Tracking) đến khi đóng"
  - "Chọn đúng loại Review cho từng loại tài liệu và biết ai cần tham gia"
related:
  - "glossary:ba"
  - "playbook:ba"
---

## Nhóm technique cho việc lập kế hoạch & theo dõi

Đây là các kỹ thuật BABOK v3 xếp trong knowledge area **BA Planning & Monitoring** — dùng
ở giai đoạn *trước và trong suốt* việc lấy yêu cầu, để BA biết **làm việc với ai, ước
lượng bao nhiêu, theo dõi thế nào, rủi ro gì**. Đây là mảng người mới hay bỏ qua nhất:
nhảy thẳng vào hỏi yêu cầu mà không có kế hoạch thì dễ hỏi nhầm người, sót việc, và không
phát hiện được khi mình đang chậm.

Một technique không "thuộc độc quyền" một knowledge area — Interviews chẳng hạn dùng khắp
nơi. Ở đây ta xét chúng dưới góc **lập kế hoạch & theo dõi**.

### Stakeholder List, Map, or Personas
- **Là gì**: cách liệt kê và trực quan hóa các bên liên quan cùng mức ảnh hưởng của họ.
- **Khi nào dùng**: ngay đầu dự án, và cập nhật mỗi khi có người mới tham gia.
- **Ví dụ**: dự án offshore điển hình có khách Nhật (quyết định cuối), BrSE (cầu nối ngôn
  ngữ), PO nội bộ, dev lead, QA lead — vẽ map để biết ai phải "quản lý sát", ai chỉ "thông
  báo định kỳ".
- **Cạm bẫy**: quên stakeholder gián tiếp (bộ phận vận hành, kế toán) — đến cuối dự án mới
  lòi ra yêu cầu của họ.

```
Stakeholder Map (2 trục):
                 Quan tâm THẤP        Quan tâm CAO
Quyền lực CAO    Giữ hài lòng         Quản lý sát  ← khách Nhật, PO
Quyền lực THẤP   Theo dõi             Cập nhật thường xuyên
```


![Stakeholder Map theo trục Power × Interest — quyết định mức độ tương tác với từng nhóm](/images/ba-stakeholder-map.png)

### Brainstorming
- **Là gì**: kỹ thuật sinh nhiều ý tưởng nhanh trong nhóm, không phán xét ở giai đoạn đầu.
- **Khi nào dùng**: cần khám phá giải pháp/rủi ro/edge case mà chưa biết trước câu trả lời.
- **Ví dụ**: brainstorm các trường hợp lỗi khi thanh toán trước khi viết spec.
- **Cạm bẫy**: không có luật → 1-2 người nói át; trộn "sinh ý tưởng" với "đánh giá ý tưởng"
  làm mọi người ngại nói. Tách rõ 2 pha.

### Interviews
- **Là gì**: hỏi trực tiếp 1-1 để lấy thông tin sâu.
- **Khi nào dùng**: cần hiểu chi tiết một nghiệp vụ, hoặc thông tin nhạy cảm không tiện hỏi
  trong nhóm đông.
- **Ví dụ**: qua BrSE phỏng vấn người phụ trách nghiệp vụ phía khách để làm rõ luồng duyệt
  đơn — chuẩn bị câu hỏi trước, gửi trước cho họ dịch.
- **Cạm bẫy**: câu hỏi đóng liên tục (chỉ yes/no) → không khai thác được cái ẩn.

### Estimation
- **Là gì**: ước lượng effort/thời gian/chi phí bằng các phương pháp có cơ sở.
- **Khi nào dùng**: lập kế hoạch, cam kết tiến độ, đánh giá thay đổi phạm vi.
- **Cách**: analogous (so với việc tương tự đã làm), bottom-up (chia nhỏ rồi cộng),
  three-point (lạc quan/bi quan/khả dĩ → trung bình có trọng số).
- **Cạm bẫy**: đưa 1 con số đơn thay vì khoảng; không ghi giả định kèm theo.

### Item Tracking
- **Là gì**: theo dõi các vấn đề/câu hỏi mở (issue, action, risk) đến khi đóng.
- **Khi nào dùng**: suốt dự án — mọi câu hỏi treo với khách phải có người chịu trách nhiệm
  và hạn.
- **Ví dụ**: bảng Q&A với khách Nhật, mỗi dòng có trạng thái Open/Answered/Closed và ngày.
- **Cạm bẫy**: câu hỏi "treo" quá lâu không ai đẩy → dev đoán bừa để kịp code.

### Metrics and Key Performance Indicators (KPIs)
- **Là gì**: chỉ số đo lường tiến độ và hiệu quả.
- **Khi nào dùng**: theo dõi sức khỏe công việc BA và giá trị giải pháp.
- **Ví dụ**: số yêu cầu thay đổi/sprint, tỉ lệ câu hỏi được trả lời đúng hạn, số defect do
  spec mơ hồ.
- **Cạm bẫy**: đo cái dễ đo thay vì cái quan trọng.

### Risk Analysis and Management
- **Là gì**: nhận diện, đánh giá và lập kế hoạch xử lý rủi ro.
- **Khi nào dùng**: đầu dự án và định kỳ; đặc biệt trước các mốc lớn.
- **Ví dụ**: rủi ro "yêu cầu chốt muộn do chờ BrSE dịch" → giảm bằng cách gửi câu hỏi sớm,
  gộp batch.
- **Cạm bẫy**: liệt kê rủi ro rồi để đó, không gán chủ + hành động.

### Lessons Learned
- **Là gì**: buổi/tài liệu rút kinh nghiệm sau một giai đoạn hoặc dự án.
- **Khi nào dùng**: cuối sprint/phase/dự án.
- **Cạm bẫy**: đổ lỗi cá nhân thay vì cải tiến quy trình → lần sau không ai nói thật.

### Roles and Permissions Matrix
- **Là gì**: bảng vai trò × chức năng, đánh dấu ai được làm gì (xem/tạo/sửa/xóa/duyệt).
- **Khi nào dùng**: khi hệ thống có nhiều vai trò và phân quyền.
- **Ví dụ**:

```
Chức năng \ Vai trò   Nhân viên  Trưởng nhóm  Admin
Tạo đơn               ✓          ✓            ✓
Duyệt đơn             –          ✓            ✓
Xóa đơn               –          –            ✓
```
- **Cạm bẫy**: bỏ sót trạng thái "chỉ đọc" hoặc quyền theo điều kiện (chỉ đơn của mình).

### Reviews
- **Là gì**: rà soát có cấu trúc một sản phẩm công việc (spec, test case) để tìm lỗi/thiếu.
- **Khi nào dùng**: trước khi bàn giao tài liệu cho dev/QA/khách.
- **Cạm bẫy**: mời sai người review (thiếu người hiểu nghiệp vụ), hoặc review lấy lệ.

## Bảng chọn nhanh

| Cần làm gì | Technique |
|------------|-----------|
| Biết làm việc với ai, ai quan trọng | Stakeholder List/Map/Personas |
| Sinh nhiều ý tưởng/edge case nhanh | Brainstorming |
| Hiểu sâu một nghiệp vụ | Interviews |
| Ước lượng effort/thời gian | Estimation |
| Theo dõi câu hỏi/vấn đề mở | Item Tracking |
| Đo tiến độ & giá trị | Metrics & KPIs |
| Lường trước cái có thể hỏng | Risk Analysis and Management |
| Rút kinh nghiệm | Lessons Learned |
| Xác định ai được làm gì | Roles and Permissions Matrix |
| Kiểm tra chất lượng tài liệu | Reviews |

## Ghi nhớ

Nhóm technique này trả lời câu hỏi **"trước khi lao vào lấy yêu cầu, tôi đã chuẩn bị đủ
chưa?"**. Một BA lập kế hoạch tốt hiếm khi bị động — luôn biết ai quan trọng, việc gì đang
treo, và rủi ro nào cần đẩy sớm.

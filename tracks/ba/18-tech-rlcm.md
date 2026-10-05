---
level: "techniques"
order: 18
title: "Techniques: Requirements Life Cycle Management"
est: "4-5 giờ"
checklist:
  - "Giải thích được RLCM lo việc gì: trace, prioritize, approve, maintain yêu cầu xuyên vòng đời"
  - "Áp dụng được MoSCoW để phân loại một backlog thành Must/Should/Could/Won't với lý do rõ ràng"
  - "Tách được business rule ra khỏi requirement và viết rule theo dạng kiểm chứng được"
  - "Phân rã được một tính năng lớn bằng Functional Decomposition để truy vết (traceability)"
  - "Viết được Acceptance Criteria đo được cho một user story, phân biệt với Evaluation Criteria"
  - "Thiết lập được cách theo dõi trạng thái từng requirement (Item Tracking) trong dự án offshore"
related:
  - "glossary:backlog"
  - "glossary:ac"
  - "skill:nta-clarify"
---

## Requirements Life Cycle Management là gì?

Nhóm technique này lo **vòng đời của yêu cầu** — từ lúc phát sinh đến khi retire. Không
phải "lấy yêu cầu" (đó là Elicitation), mà là **quản lý** yêu cầu sau khi đã có: cái nào
làm trước, cái nào phụ thuộc cái nào, ai duyệt, thay đổi thì trace ở đâu, tính năng đã
giao có đạt tiêu chí nghiệm thu chưa.

Với dự án offshore làm qua BrSE, RLCM đặc biệt quan trọng: yêu cầu đi qua nhiều tay
(khách → BrSE → BA → dev), rất dễ rơi rớt hoặc hiểu lệch. Technique bên dưới giúp giữ
mọi yêu cầu **có trạng thái rõ ràng, truy vết được, và được ưu tiên đúng**.

### Backlog Management

**Là gì**: Duy trì danh sách yêu cầu chưa hoàn thành (backlog), giữ nó luôn được sắp xếp,
làm mịn (refine) và cập nhật trạng thái.

**Khi nào dùng**: Xuyên suốt dự án, đặc biệt môi trường agile. Backlog là nguồn sự thật
duy nhất về "còn gì phải làm".

**Ví dụ thực tế**: Dự án offshore chạy sprint 2 tuần. Trước mỗi sprint, BA cùng BrSE
grooming backlog: gỡ item đã lỗi thời, tách item quá lớn, bổ sung item khách vừa yêu cầu
qua chat. Item nào chưa đủ rõ để dev ước lượng thì đánh cờ "cần làm rõ" và đưa vào buổi
Q&A với khách.

> **Cạm bẫy**: Backlog phình to vô tận vì "cứ thêm cho chắc". Item để quá lâu không đụng
> tới thường đã lỗi thời — mạnh dạn đóng hoặc archive, đừng để nhiễu.

### Prioritization (bao gồm MoSCoW)

**Là gì**: Xếp thứ tự yêu cầu theo độ quan trọng để biết làm gì trước khi nguồn lực và
thời gian có hạn. **MoSCoW** là một cách prioritize phổ biến: **M**ust / **S**hould /
**C**ould / **W**on't (this time).

**Khi nào dùng**: Khi backlog nhiều hơn khả năng làm — tức là luôn luôn. Đặc biệt trước
mỗi release để chốt phạm vi.

**Ví dụ thực tế**: Khách Nhật gửi 40 yêu cầu cho phase 1, deadline cố định. BA cùng BrSE
phân loại:

| Nhóm | Ý nghĩa | Ví dụ |
|------|---------|-------|
| **Must** | Không có thì release vô nghĩa | Đăng nhập, tạo đơn hàng |
| **Should** | Quan trọng nhưng có workaround | Export Excel (tạm dùng copy tay) |
| **Could** | Có thì tốt, thiếu vẫn ổn | Dark mode |
| **Won't** | Lần này không làm (ghi rõ để không quên) | Multi-currency |

> **Cạm bẫy**: Ai cũng khai yêu cầu của mình là "Must". Phải hỏi ngược: "Nếu thiếu cái
> này, release có còn dùng được không?" — nếu còn, nó không phải Must.

### Business Rules Analysis

**Là gì**: Nhận diện, tách bạch và diễn đạt các **quy tắc nghiệp vụ** — điều kiện/ràng
buộc mà hệ thống phải tuân theo, tách khỏi requirement chức năng.

**Khi nào dùng**: Khi nghiệp vụ có nhiều điều kiện logic (tính phí, duyệt đơn, phân
quyền). Tách rule ra giúp thay đổi rule mà không đụng toàn bộ spec.

**Ví dụ thực tế**: Thay vì viết trong spec "khi đơn trên 10 triệu và khách hạng VIP thì
giảm 5%, còn khách thường giảm 2%...", tách thành bảng rule:

| Điều kiện | Kết quả |
|-----------|---------|
| Đơn ≥ 10tr AND hạng VIP | Giảm 5% |
| Đơn ≥ 10tr AND hạng thường | Giảm 2% |
| Đơn < 10tr | Không giảm |

Khi khách đổi con số, chỉ sửa bảng rule, không phải lục lại cả spec.

> **Cạm bẫy**: Trộn business rule vào mô tả chức năng làm cả hai khó bảo trì. Rule phải
> viết ở dạng **kiểm chứng được** (đúng/sai với dữ liệu cụ thể).

### Item Tracking

**Là gì**: Theo dõi trạng thái từng requirement/issue xuyên suốt vòng đời (mở → đang làm
rõ → đã chốt → đang code → done → verified).

**Khi nào dùng**: Mọi dự án. Đặc biệt cần khi yêu cầu đi qua nhiều bên và dễ thất lạc.

**Ví dụ thực tế**: BA duy trì một bảng tracking mỗi requirement có cột: ID, mô tả ngắn,
trạng thái, người phụ trách, câu hỏi tồn đọng, ngày cập nhật. Khi khách hỏi "yêu cầu X
tới đâu rồi?", BA trả lời trong 30 giây thay vì lục chat.

### Functional Decomposition (cho traceability)

**Là gì**: Phân rã một thứ lớn (mục tiêu, tính năng, phạm vi) thành các phần nhỏ hơn,
quản lý được — tạo cây phân cấp giúp **truy vết** (traceability) từ mục tiêu xuống tận
requirement chi tiết.

**Khi nào dùng**: Khi tính năng lớn, cần chia nhỏ để ước lượng, giao việc, và đảm bảo
không sót phần nào.

**Ví dụ thực tế**: Tính năng "Quản lý đơn hàng" phân rã:

```
Quản lý đơn hàng
├── Tạo đơn
│   ├── Chọn sản phẩm
│   ├── Tính tiền (áp dụng business rule giảm giá)
│   └── Xác nhận & lưu
├── Sửa đơn
└── Hủy đơn (chỉ khi trạng thái = pending)
```

Mỗi lá của cây map tới một hoặc nhiều requirement → khi khách hỏi "yêu cầu giảm giá nằm
ở đâu", trace ngược lên đúng nhánh.

> **Cạm bẫy**: Phân rã quá sâu thành hàng trăm mảnh vụn khiến mất bức tranh tổng thể. Dừng
> ở mức đủ để ước lượng và giao việc.

### Acceptance and Evaluation Criteria

**Là gì**:
- **Acceptance Criteria (AC)**: điều kiện cụ thể, đo được để nghiệm thu một requirement là
  "xong đúng". Thường dạng pass/fail.
- **Evaluation Criteria**: tiêu chí so sánh/xếp hạng nhiều lựa chọn giải pháp (không phải
  pass/fail mà là cho điểm).

**Khi nào dùng**: AC dùng cho mọi user story trước khi dev bắt đầu. Evaluation Criteria
dùng khi cần chọn giữa nhiều phương án (vd chọn thư viện, chọn cách thiết kế).

**Ví dụ thực tế** — AC cho story "Người dùng đặt lại mật khẩu":

- **Given** người dùng nhập email đã đăng ký, **when** bấm "Gửi link", **then** hệ thống
  gửi email chứa link đặt lại trong vòng 1 phút.
- Link hết hạn sau 30 phút.
- Nhập email chưa đăng ký → vẫn hiện thông báo chung "Nếu email tồn tại, link đã được
  gửi" (không tiết lộ email nào có trong hệ thống).

> **Cạm bẫy**: AC viết mơ hồ ("hoạt động tốt", "nhanh") thì QA không test được và khách
> có thể bắt bẻ. AC phải **đo được**: bao nhiêu giây, đúng thông báo gì, trường hợp lỗi ra
> sao.


![Vòng đời một yêu cầu: đề xuất → phân tích → ưu tiên → chốt → triển khai → verify → duy trì](/images/ba-req-lifecycle.png)

## Bảng tổng hợp — dùng technique nào khi nào

| Tình huống | Technique |
|------------|-----------|
| Backlog rối, không biết làm gì trước | Prioritization / MoSCoW |
| Danh sách việc chưa làm cần giữ gọn | Backlog Management |
| Logic nghiệp vụ phức tạp, hay đổi | Business Rules Analysis |
| Không biết yêu cầu nào tới đâu | Item Tracking |
| Tính năng lớn cần chia & truy vết | Functional Decomposition |
| Chốt "thế nào là xong" với dev/QA | Acceptance Criteria |
| Chọn giữa nhiều phương án | Evaluation Criteria |

## Template áp dụng ngay — bảng MoSCoW

Copy và điền cho release sắp tới:

| ID | Yêu cầu | Nhóm (M/S/C/W) | Lý do | Trạng thái |
|----|---------|----------------|-------|------------|
| R01 | Đăng nhập | Must | Không có thì không dùng được | Đã chốt |
| R02 | Export Excel | Should | Có workaround copy tay | Đang làm rõ |
| R03 | Dark mode | Could | Chỉ là tiện nghi | Backlog |
| R04 | Multi-currency | Won't | Ngoài scope phase 1 | Ghi nhận |

## Ghi nhớ

RLCM không tạo ra yêu cầu mới — nó **giữ cho mọi yêu cầu có trật tự**: được ưu tiên đúng,
truy vết được, có tiêu chí nghiệm thu rõ, và luôn biết đang ở trạng thái nào. Trong offshore
qua BrSE, đây chính là mảng chống thất lạc và hiểu lệch yêu cầu tốt nhất.
